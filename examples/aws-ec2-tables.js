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

const { TablePlugin, addPlugins, start, stop } = require('..');
const EC2Schema = require('./schema/ec2');
const convertRow = require('./row-util');
const {
  EC2Client,
  DescribeInstancesCommand,
  DescribeSubnetsCommand,
  DescribeVolumesCommand,
  DescribeVpcsCommand
} = require('@aws-sdk/client-ec2');

class AWSPlugin extends TablePlugin {
  constructor(name, columns, client) {
    super(name, columns);
    this.client = client;
  }

  async generate(command, name) {
    const data = await this.client.send(command);
    const results = [];
    if (data && data[name] && data[name].length) {
      for (const r of data[name]) {
        results.push(convertRow(r));
      }
    }
    return results;
  }
}

class AWSEc2InstancesPlugin extends AWSPlugin {
  constructor(client) {
    super('aws_ec2_instances', EC2Schema.Instances, client);
  }

  async generate() {
    const data = await this.client.send(new DescribeInstancesCommand({}));
    const results = [];
    if (data && data.Reservations && data.Reservations.length) {
      for (const r of data.Reservations) {
        if (r && r.Instances && r.Instances.length) {
          for (const i of r.Instances) {
            const row = Object.assign(convertRow(i), { owner_id: r.OwnerId, reservation_id: r.ReservationId });
            results.push(row);
          }
        }
      }
    }
    return results;
  }
}

class AWSEc2SubnetsPlugin extends AWSPlugin {
  constructor(client) {
    super('aws_ec2_subnets', EC2Schema.Subnets, client);
  }

  async generate() {
    return await super.generate(new DescribeSubnetsCommand({}), 'Subnets');
  }
}

class AWSEc2VolumesPlugin extends AWSPlugin {
  constructor(client) {
    super('aws_ec2_volumes', EC2Schema.Volumes, client);
  }

  async generate() {
    return await super.generate(new DescribeVolumesCommand({}), 'Volumes');
  }
}

class AWSEc2VpcsPlugin extends AWSPlugin {
  constructor(client) {
    super('aws_ec2_vpcs', EC2Schema.Vpcs, client);
  }

  async generate() {
    return await super.generate(new DescribeVpcsCommand({}), 'Vpcs');
  }
}

process.on('SIGINT', function() {
  stop();
  process.exit();
});

(async function() {
  const client = new EC2Client('us-east-1'); // TODO FIXME XXX
  addPlugins(
    new AWSEc2InstancesPlugin(client),
    new AWSEc2SubnetsPlugin(client),
    new AWSEc2VolumesPlugin(client),
    new AWSEc2VpcsPlugin(client)
  );
  await start();
})();
