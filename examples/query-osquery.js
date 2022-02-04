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

const { start, stop, listExtensions, getFlags, query, getQueryColumns } = require('..');

(async function () {
  await start();

  console.log('Extensions: ' + JSON.stringify(await listExtensions(), 0, 2));
  console.log('Flags: ' + JSON.stringify(await getFlags(), 0, 2));
  console.log('Query: ' + JSON.stringify(await query('SELECT * FROM uptime'), 0, 2));
  console.log('Table columns: ' + JSON.stringify(await getQueryColumns('SELECT * FROM uptime'), 0, 2));

  stop();
  process.exit(0);
})();
