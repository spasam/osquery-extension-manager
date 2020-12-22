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
const path = require('path');
const { snakeCase } = require('change-case');

const ec2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ec2.2016-11-15.json'), 'utf8'));
for (let [key, value] of Object.entries(ec2.shapes)) {
  if (!value.members) {
    continue;
  }

  const schema = {};
  key = key.replace('com.amazonaws.ec2#', '');
  for (let [k, v] of Object.entries(value.members)) {
    k = snakeCase(k);
    switch (v.target) {
      case 'com.amazonaws.ec2#Boolean':
      case 'com.amazonaws.ec2#Integer':
        schema[k] = 'INTEGER';
        break;
      case 'com.amazonaws.ec2#Double':
        schema[k] = 'DOUBLE';
        break;
      case 'com.amazonaws.ec2#Long':
        schema[k] = 'BIGINT';
        break;
      default:
        schema[k] = 'TEXT';
        break;
    }
  }

  module.exports[key] = schema;
}
