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
const { JSONPath } = require('jsonpath-plus');
const EC2 = require('@aws-sdk/client-ec2');

class AWSEc2Plugin extends TablePlugin {
  constructor(name, command, schema, client) {
    super(name, eval(`EC2Schema.${schema}`));
    this.client = client;
    this.command = `EC2.Describe${command}Command`;
    this.jsonpath = '$..' + command;
  }

  async generate() {
    const data = await this.client.send(eval(`new ${this.command}({})`));
    const objects = JSONPath(this.jsonpath, data);

    const results = [];
    if (objects && objects.length) {
      for (const o of objects) {
        if (o) {
          if (Array.isArray(o)) {
            for (const i of o) {
              results.push(convertRow(i));
            }
          } else {
            results.push(convertRow(o));
          }
        }
      }
    }
    return results;
  }
}

process.on('SIGINT', function () {
  stop();
  process.exit();
});

(async function () {
  const client = new EC2.EC2Client('us-east-1'); // TODO FIXME XXX

  // prettier-ignore
  addPlugins(
    new AWSEc2Plugin('aws_ec2_account_attributes', 'AccountAttributes', 'AccountAttribute', client),
    new AWSEc2Plugin('aws_ec2_addresses', 'Addresses', 'Address', client),
    new AWSEc2Plugin('aws_ec2_aggregate_id_format', 'AggregateIdFormat', 'DescribeAggregateIdFormatResult', client),
    new AWSEc2Plugin('aws_ec2_availability_zones', 'AvailabilityZones', 'AvailabilityZone', client),
    new AWSEc2Plugin('aws_ec2_bundle_tasks', 'BundleTasks', 'BundleTask', client),
    new AWSEc2Plugin('aws_ec2_byoip_cidrs', 'ByoipCidrs', 'ByoipCidr', client),
    new AWSEc2Plugin('aws_ec2_capacity_reservations', 'CapacityReservations', 'CapacityReservation', client),
    new AWSEc2Plugin('aws_ec2_carrier_gateways', 'CarrierGateways', 'CarrierGateway', client),
    new AWSEc2Plugin('aws_ec2_classic_link_instances', 'ClassicLinkInstances', 'ClassicLinkInstance', client),
    new AWSEc2Plugin('aws_ec2_client_vpn_authorization_rules', 'ClientVpnAuthorizationRules', 'AuthorizationRule', client),
    new AWSEc2Plugin('aws_ec2_client_vpn_connections', 'ClientVpnConnections', 'ClientVpnConnection', client),
    new AWSEc2Plugin('aws_ec2_client_vpn_endpoints', 'ClientVpnEndpoints', 'ClientVpnEndpoint', client),
    new AWSEc2Plugin('aws_ec2_client_vpn_routes', 'ClientVpnRoutes', 'ClientVpnRoute', client),
    new AWSEc2Plugin('aws_ec2_client_vpn_target_networks', 'ClientVpnTargetNetworks', 'TargetNetwork', client),
    new AWSEc2Plugin('aws_ec2_coip_pools', 'CoipPools', 'CoipPool', client),
    new AWSEc2Plugin('aws_ec2_conversion_tasks', 'ConversionTasks', 'ConversionTask', client),
    new AWSEc2Plugin('aws_ec2_customer_gateways', 'CustomerGateways', 'CustomerGateway', client),
    new AWSEc2Plugin('aws_ec2_dhcp_options', 'DhcpOptions', 'DhcpOptions', client),
    new AWSEc2Plugin('aws_ec2_egress_only_internet_gateways', 'EgressOnlyInternetGateways', 'EgressOnlyInternetGateway', client),
    new AWSEc2Plugin('aws_ec2_elastic_gpus', 'ElasticGpus', 'ElasticGpus', client),
    new AWSEc2Plugin('aws_ec2_export_image_tasks', 'ExportImageTasks', 'ExportImageTask', client),
    new AWSEc2Plugin('aws_ec2_export_tasks', 'ExportTasks', 'ExportTask', client),
    new AWSEc2Plugin('aws_ec2_fast_snapshot_restores', 'FastSnapshotRestores', 'DescribeFastSnapshotRestoreSuccessItem', client),
    new AWSEc2Plugin('aws_ec2_fleet_history', 'FleetHistory', 'HistoryRecordEntry', client),
    new AWSEc2Plugin('aws_ec2_fleet_instances', 'FleetInstances', 'ActiveInstance', client),
    new AWSEc2Plugin('aws_ec2_fleets', 'Fleets', 'FleetData', client),
    new AWSEc2Plugin('aws_ec2_flow_logs', 'FlowLogs', 'FlowLog', client),
    new AWSEc2Plugin('aws_ec2_fpga_image_attribute', 'FpgaImageAttribute', 'FpgaImageAttribute', client),
    new AWSEc2Plugin('aws_ec2_fpga_images', 'FpgaImages', 'FpgaImage', client),
    new AWSEc2Plugin('aws_ec2_host_reservation_offerings', 'HostReservationOfferings', 'HostOffering', client),
    new AWSEc2Plugin('aws_ec2_host_reservations', 'HostReservations', 'HostReservation', client),
    new AWSEc2Plugin('aws_ec2_hosts', 'Hosts', 'Host', client),
    new AWSEc2Plugin('aws_ec2_iam_instance_profile_associations', 'IamInstanceProfileAssociations', 'IamInstanceProfileAssociation', client),
    new AWSEc2Plugin('aws_ec2_id_format', 'IdFormat', 'IdFormat', client),
    new AWSEc2Plugin('aws_ec2_identity_id_format', 'IdentityIdFormat', 'IdFormat', client),
    new AWSEc2Plugin('aws_ec2_image_attribute', 'ImageAttribute', 'ImageAttribute', client),
    new AWSEc2Plugin('aws_ec2_images', 'Images', 'Image', client),
    new AWSEc2Plugin('aws_ec2_import_image_tasks', 'ImportImageTasks', 'ImportImageTask', client),
    new AWSEc2Plugin('aws_ec2_import_snapshot_tasks', 'ImportSnapshotTasks', 'ImportSnapshotTask', client),
    new AWSEc2Plugin('aws_ec2_instance_attribute', 'InstanceAttribute', 'InstanceAttribute', client),
    new AWSEc2Plugin('aws_ec2_instance_credit_specifications', 'InstanceCreditSpecifications', 'InstanceCreditSpecification', client),
    new AWSEc2Plugin('aws_ec2_instance_event_notification_attributes', 'InstanceEventNotificationAttributes', 'InstanceTagNotificationAttribute', client),
    new AWSEc2Plugin('aws_ec2_instance_status', 'InstanceStatus', 'InstanceStatus', client),
    new AWSEc2Plugin('aws_ec2_instance_type_offerings', 'InstanceTypeOfferings', 'InstanceTypeOffering', client),
    new AWSEc2Plugin('aws_ec2_instance_types', 'InstanceTypes', 'InstanceTypeInfo', client),
    new AWSEc2Plugin('aws_ec2_instances', 'Instances', 'Instance', client),
    new AWSEc2Plugin('aws_ec2_internet_gateways', 'InternetGateways', 'InternetGateway', client),
    new AWSEc2Plugin('aws_ec2_ipv6_pools', 'Ipv6Pools', 'Ipv6Pool', client),
    new AWSEc2Plugin('aws_ec2_key_pairs', 'KeyPairs', 'KeyPair', client),
    new AWSEc2Plugin('aws_ec2_launch_template_versions', 'LaunchTemplateVersions', 'LaunchTemplateVersion', client),
    new AWSEc2Plugin('aws_ec2_launch_templates', 'LaunchTemplates', 'LaunchTemplate', client),
    new AWSEc2Plugin('aws_ec2_local_gateway_route_table_virtual_interface_group_associations', 'LocalGatewayRouteTableVirtualInterfaceGroupAssociations', 'LocalGatewayRouteTableVirtualInterfaceGroupAssociation', client),
    new AWSEc2Plugin('aws_ec2_local_gateway_route_table_vpc_associations', 'LocalGatewayRouteTableVpcAssociations', 'LocalGatewayRouteTableVpcAssociation', client),
    new AWSEc2Plugin('aws_ec2_local_gateway_route_tables', 'LocalGatewayRouteTables', 'LocalGatewayRouteTable', client),
    new AWSEc2Plugin('aws_ec2_local_gateway_virtual_interface_groups', 'LocalGatewayVirtualInterfaceGroups', 'LocalGatewayVirtualInterfaceGroup', client),
    new AWSEc2Plugin('aws_ec2_local_gateway_virtual_interfaces', 'LocalGatewayVirtualInterfaces', 'LocalGatewayVirtualInterface', client),
    new AWSEc2Plugin('aws_ec2_local_gateways', 'LocalGateways', 'LocalGateway', client),
    new AWSEc2Plugin('aws_ec2_managed_prefix_lists', 'ManagedPrefixLists', 'ManagedPrefixList', client),
    new AWSEc2Plugin('aws_ec2_moving_addresses', 'MovingAddresses', 'MovingAddressStatus', client),
    new AWSEc2Plugin('aws_ec2_nat_gateways', 'NatGateways', 'NatGateway', client),
    new AWSEc2Plugin('aws_ec2_network_acls', 'NetworkAcls', 'NetworkAcl', client),
    new AWSEc2Plugin('aws_ec2_network_interface_attribute', 'NetworkInterfaceAttribute', 'DescribeNetworkInterfaceAttributeResult', client),
    new AWSEc2Plugin('aws_ec2_network_interface_permissions', 'NetworkInterfacePermissions', 'NetworkInterfacePermission', client),
    new AWSEc2Plugin('aws_ec2_network_interfaces', 'NetworkInterfaces', 'NetworkInterface', client),
    new AWSEc2Plugin('aws_ec2_placement_groups', 'PlacementGroups', 'PlacementGroup', client),
    new AWSEc2Plugin('aws_ec2_prefix_lists', 'PrefixLists', 'PrefixList', client),
    new AWSEc2Plugin('aws_ec2_principal_id_format', 'PrincipalIdFormat', 'PrincipalIdFormat', client),
    new AWSEc2Plugin('aws_ec2_public_ipv4_pools', 'PublicIpv4Pools', 'PublicIpv4Pool', client),
    new AWSEc2Plugin('aws_ec2_regions', 'Regions', 'Region', client),
    new AWSEc2Plugin('aws_ec2_reserved_instances', 'ReservedInstances', 'ReservedInstances', client),
    new AWSEc2Plugin('aws_ec2_reserved_instances_listings', 'ReservedInstancesListings', 'ReservedInstancesListing', client),
    new AWSEc2Plugin('aws_ec2_reserved_instances_modifications', 'ReservedInstancesModifications', 'ReservedInstancesModification', client),
    new AWSEc2Plugin('aws_ec2_reserved_instances_offerings', 'ReservedInstancesOfferings', 'ReservedInstancesOffering', client),
    new AWSEc2Plugin('aws_ec2_route_tables', 'RouteTables', 'RouteTable', client),
    new AWSEc2Plugin('aws_ec2_scheduled_instance_availability', 'ScheduledInstanceAvailability', 'ScheduledInstanceAvailability', client),
    new AWSEc2Plugin('aws_ec2_scheduled_instances', 'ScheduledInstances', 'ScheduledInstance', client),
    new AWSEc2Plugin('aws_ec2_security_group_references', 'SecurityGroupReferences', 'SecurityGroupReference', client),
    new AWSEc2Plugin('aws_ec2_security_groups', 'SecurityGroups', 'SecurityGroup', client),
    new AWSEc2Plugin('aws_ec2_snapshot_attribute', 'SnapshotAttribute', 'DescribeSnapshotAttributeResult', client),
    new AWSEc2Plugin('aws_ec2_snapshots', 'Snapshots', 'Snapshot', client),
    new AWSEc2Plugin('aws_ec2_spot_datafeed_subscription', 'SpotDatafeedSubscription', 'SpotDatafeedSubscription', client),
    new AWSEc2Plugin('aws_ec2_spot_fleet_instances', 'SpotFleetInstances', 'ActiveInstance', client),
    new AWSEc2Plugin('aws_ec2_spot_fleet_request_history', 'SpotFleetRequestHistory', 'HistoryRecord', client),
    new AWSEc2Plugin('aws_ec2_spot_fleet_requests', 'SpotFleetRequests', 'SpotFleetRequestConfig', client),
    new AWSEc2Plugin('aws_ec2_spot_instance_requests', 'SpotInstanceRequests', 'SpotInstanceRequest', client),
    new AWSEc2Plugin('aws_ec2_spot_price_history', 'SpotPriceHistory', 'SpotPrice', client),
    new AWSEc2Plugin('aws_ec2_stale_security_groups', 'StaleSecurityGroups', 'StaleSecurityGroup', client),
    new AWSEc2Plugin('aws_ec2_subnets', 'Subnets', 'Subnet', client),
    new AWSEc2Plugin('aws_ec2_tags', 'Tags', 'Tag', client),
    new AWSEc2Plugin('aws_ec2_traffic_mirror_filters', 'TrafficMirrorFilters', 'TrafficMirrorFilter', client),
    new AWSEc2Plugin('aws_ec2_traffic_mirror_sessions', 'TrafficMirrorSessions', 'TrafficMirrorSession', client),
    new AWSEc2Plugin('aws_ec2_traffic_mirror_targets', 'TrafficMirrorTargets', 'TrafficMirrorTarget', client),
    new AWSEc2Plugin('aws_ec2_transit_gateway_attachments', 'TransitGatewayAttachments', 'TransitGatewayAttachment', client),
    new AWSEc2Plugin('aws_ec2_transit_gateway_multicast_domains', 'TransitGatewayMulticastDomains', 'TransitGatewayMulticastDomain', client),
    new AWSEc2Plugin('aws_ec2_transit_gateway_peering_attachments', 'TransitGatewayPeeringAttachments', 'TransitGatewayPeeringAttachment', client),
    new AWSEc2Plugin('aws_ec2_transit_gateway_route_tables', 'TransitGatewayRouteTables', 'TransitGatewayRouteTable', client),
    new AWSEc2Plugin('aws_ec2_transit_gateway_vpc_attachments', 'TransitGatewayVpcAttachments', 'TransitGatewayVpcAttachment', client),
    new AWSEc2Plugin('aws_ec2_transit_gateways', 'TransitGateways', 'TransitGateway', client),
    new AWSEc2Plugin('aws_ec2_volume_attribute', 'VolumeAttribute', 'DescribeVolumeAttributeResult', client),
    new AWSEc2Plugin('aws_ec2_volume_status', 'VolumeStatus', 'VolumeStatusItem', client),
    new AWSEc2Plugin('aws_ec2_volumes', 'Volumes', 'Volume', client),
    new AWSEc2Plugin('aws_ec2_volumes_modifications', 'VolumesModifications', 'VolumeModification', client),
    new AWSEc2Plugin('aws_ec2_vpc_attribute', 'VpcAttribute', 'DescribeVpcAttributeResult', client),
    new AWSEc2Plugin('aws_ec2_vpc_classic_link', 'VpcClassicLink', 'VpcClassicLink', client),
    new AWSEc2Plugin('aws_ec2_vpc_classic_link_dns_support', 'VpcClassicLinkDnsSupport', 'ClassicLinkDnsSupport', client),
    new AWSEc2Plugin('aws_ec2_vpc_endpoint_connection_notifications', 'VpcEndpointConnectionNotifications', 'ConnectionNotification', client),
    new AWSEc2Plugin('aws_ec2_vpc_endpoint_connections', 'VpcEndpointConnections', 'VpcEndpointConnection', client),
    new AWSEc2Plugin('aws_ec2_vpc_endpoint_service_configurations', 'VpcEndpointServiceConfigurations', 'ServiceConfiguration', client),
    new AWSEc2Plugin('aws_ec2_vpc_endpoint_service_permissions', 'VpcEndpointServicePermissions', 'AllowedPrincipal', client),
    new AWSEc2Plugin('aws_ec2_vpc_endpoint_services', 'VpcEndpointServices', 'ServiceDetail', client),
    new AWSEc2Plugin('aws_ec2_vpc_endpoints', 'VpcEndpoints', 'VpcEndpoint', client),
    new AWSEc2Plugin('aws_ec2_vpc_peering_connections', 'VpcPeeringConnections', 'VpcPeeringConnection', client),
    new AWSEc2Plugin('aws_ec2_vpn_connections', 'VpnConnections', 'VpnConnection', client),
    new AWSEc2Plugin('aws_ec2_vpn_gateways', 'VpnGateways', 'VpnGateway', client),
    new AWSEc2Plugin('aws_ec2_vpcs', 'Vpcs', 'Vpc', client)
  );

  await start();
})();
