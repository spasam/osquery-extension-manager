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

const types = require('./gen-nodejs/osquery_types');

class TablePlugin {
  constructor(name, columns) {
    this.name = name;
    this.columns = columns;
  }

  getName() {
    return this.name;
  }

  getRegistry() {
    return 'table';
  }

  call(request) {
    if (!request.hasOwnProperty('action')) {
      return new types.ExtensionResponse({
        status: new types.ExtensionStatus({
          code: 1,
          message: "Missing table request 'action'",
        }),
      });
    } else if (request.action === 'generate') {
      return new types.ExtensionResponse({
        status: new types.ExtensionStatus({ code: 0 }),
        response: this.generate(),
      });
    } else if (request.action === 'columns') {
      return new types.ExtensionResponse({
        status: new types.ExtensionStatus({ code: 0 }),
        response: this.columns,
      });
    }

    return new types.ExtensionResponse({
      status: new types.ExtensionStatus({
        code: 1,
        message: "Unknown table request 'action': " + request.action,
      }),
    });
  }

  routes() {
    const result = [];
    for (const [key, value] of Object.entries(this.columns)) {
      result.push({ id: 'column', name: key, type: value, op: '0' });
    }
    return result;
  }

  generate() {
    throw new Error("Missing 'generate' method implementation");
  }
};

module.exports = {
  TablePlugin
};
