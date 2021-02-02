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

const { TablePlugin, addPlugins, start, stop, streamEvents } = require('..');

class SampleTablePlugin extends TablePlugin {
  constructor() {
    super('sample', { foo: 'TEXT', bar: 'INTEGER' });
  }

  async generate() {
    return [
      { foo: 'Hello', bar: '1' },
      { foo: 'World', bar: '2' }
    ];
  }
}

class SampleEventsTablePlugin extends TablePlugin {
  constructor() {
    super('sample_events', { time: 'BIGINT', foo: 'TEXT', bar: 'INTEGER' });

    let counter = 1;
    setInterval(async function() {
      // Return ignored
      await streamEvents('sample_events', [
        { foo: 'Hello', bar: '' + counter++ },
        { foo: 'World', bar: '' + counter++ }
      ]);
    }, 2000);
  }

  async generate() {
    return [];
  }
}

process.on('SIGINT', function() {
  stop();
  process.exit();
});

(async function() {
  addPlugins(new SampleTablePlugin());
  addPlugins(new SampleEventsTablePlugin());
  await start();
})();
