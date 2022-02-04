/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const thrift = require('thrift');

const { TablePlugin } = require('./plugin');
const types = require('./gen-nodejs/osquery_types');
const Extension = require('./gen-nodejs/Extension');
const ExtensionManager = require('./gen-nodejs/ExtensionManager');

// TODO FIXME XXX: Platforms
const DAEMON_SOCKET_PATH = '/var/run/osquery.em';
const SHELL_SOCKET_PATH = os.homedir() + '/.osquery/shell.em';

const routes = {}; // registry -> name -> routes
const extensions = {}; // registry -> name -> extension

let uuid = null,
  extensionManager = null,
  thriftServer = null;

function addPlugins(...plugins) {
  if (extensionManager) {
    throw new Error('Extension manager already started');
  }
  if (!plugins || !plugins.length) {
    throw new Error('Invalid plugin');
  }

  plugins.forEach(plugin => {
    if (!(plugin instanceof TablePlugin)) {
      throw new Error('Unknown plugin type');
    }

    const registry = plugin.getRegistry();
    if (!registry || registry !== 'table') {
      throw new Error('Unknown plugin registry type: ' + registry);
    }

    let existingRoute = routes[registry];
    let existingExtension = extensions[registry];
    if (!existingRoute) {
      existingRoute = {};
      existingExtension = {};
      routes[registry] = existingRoute;
      extensions[registry] = existingExtension;
    }

    const name = plugin.getName();
    if (!name) {
      throw new Error('Invalid extension name');
    }

    for (const [key, value] of Object.entries(existingRoute)) {
      if (key === name) {
        throw new Error('Extension with name ' + name + ' already exists in registry: ' + registry);
      }
    }

    existingRoute[name] = plugin.routes();
    existingExtension[name] = plugin;
  });
}

async function start(name = 'js-osquery-extensions', version = '1.0.0', sdk_version = '2.0.0', socketPath = null) {
  if (!socketPath) {
    if (fs.existsSync(DAEMON_SOCKET_PATH)) {
      socketPath = DAEMON_SOCKET_PATH;
    } else if (fs.existsSync(SHELL_SOCKET_PATH)) {
      socketPath = SHELL_SOCKET_PATH;
    } else {
      throw new Error('Unable to find UNIX domain socket to connect to');
    }
  }

  const connection = thrift.createUDSConnection(socketPath, {
    transport: thrift.TBufferedTransport,
    protocol: thrift.TBinaryProtocol
  });
  connection.on('error', err => {
    throw new Error('Error connecting to UNIX domain socket: ' + socketPath, err);
  });

  extensionManager = thrift.createClient(ExtensionManager, connection);
  const status = await extensionManager.registerExtension(
    new types.InternalExtensionInfo({ name, version, sdk_version }),
    routes
  );
  if (status.code !== 0) {
    throw new Error('Error registering extensions. Code: ' + status.code + '. Message: ' + status.message);
  }

  uuid = status.uuid;
  thriftServer = thrift.createServer(Extension, {
    ping: function () {
      return new types.ExtensionStatus({ code: 0 });
    },
    call: async function (registry, name, request) {
      return await extensions[registry][name].call(request);
    }
  });
  thriftServer.listen(socketPath + '.' + uuid);
}

async function stop() {
  if (thriftServer) {
    thriftServer.close();
  }
  if (extensionManager) {
    await extensionManager.deregisterExtension(uuid);
    await extensionManager.shutdown();
  }
  extensionManager = thriftServer = uuid = null;
}

function checkExtensionManager() {
  if (!extensionManager) {
    throw new Error('Extension manager is not started');
  }
}

async function listExtensions() {
  checkExtensionManager();
  const response = await extensionManager.extensions();
  const result = {};
  for (const [key, value] of Object.entries(response)) {
    result[key] = {
      name: value.name,
      version: value.version,
      sdk_version: value.sdk_version,
      min_sdk_version: value.min_sdk_version
    };
  }

  return result;
}

async function getFlags() {
  checkExtensionManager();
  const response = await extensionManager.options();
  const result = {};
  for (const [key, value] of Object.entries(response)) {
    result[key] = { default_value: value.default_value, type: value.type, value: value.value };
  }

  return result;
}

async function query(sql) {
  checkExtensionManager();
  const response = await extensionManager.query(sql);
  if (!response || !response.status) {
    throw new Error('Failed to execute query: ' + sql);
  }
  if (response.status.code !== 0) {
    throw new Error(
      'Failed to execute query: ' + sql + '. Code: ' + response.status.code + '. Message: ' + response.status.message
    );
  }

  return response.response;
}

async function getQueryColumns(sql) {
  checkExtensionManager();
  const response = await extensionManager.getQueryColumns(sql);
  if (!response || !response.status) {
    throw new Error('Failed to get query columns: ' + sql);
  }
  if (response.status.code !== 0) {
    throw new Error(
      'Failed to get query columns: ' +
        sql +
        '. Code: ' +
        response.status.code +
        '. Message: ' +
        response.status.message
    );
  }

  return response.response;
}

async function streamEvents(name, events) {
  checkExtensionManager();
  const response = await extensionManager.streamEvents(name, events);
  if (!response || !response.status) {
    throw new Error('Failed to stream events for table: ' + name);
  }
  if (response.status.code !== 0) {
    throw new Error(
      'Failed to stream events for table: ' +
        name +
        '. Code: ' +
        response.status.code +
        '. Message: ' +
        response.status.message
    );
  }

  return response.response;
}

async function getNodeKey() {
  checkExtensionManager();
  return extensionManager.getNodeKey();
}

module.exports = {
  addPlugins,
  start,
  stop,
  listExtensions,
  getFlags,
  query,
  getQueryColumns,
  streamEvents,
  getNodeKey
};
