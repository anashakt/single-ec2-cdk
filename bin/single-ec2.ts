#!/usr/bin/env node
/*
 * Copyright [first edit year]-[latest edit year] Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
 * except in compliance with the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under the License.
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as r53 from "@aws-sdk/client-route-53";
import { GetHostedZoneCommand, GetHostedZoneCommandInput } from '@aws-sdk/client-route-53';
import { App, Tags } from "aws-cdk-lib";
// import * as cdk from '@aws-cdk/core';
import { SingleEc2Stack } from '../lib/single-ec2-stack';

const app = new App();
new SingleEc2Stack(app, 'SingleEc2Stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stackName: process.env.STACKNAME
});
// Run this before creating the CDK stack
// async function verifyHostedZoneBeforeStackCreation(hostedZoneID: string): Promise<string | null> {
//     const client = new r53.Route53Client({});
//     const input: GetHostedZoneCommandInput = { Id: hostedZoneID };
//     const command = new r53.GetHostedZoneCommand(input);
//     try {
//         const response = await client.send(command);
//         console.log(response);
//         return response.HostedZone?.Name || null;
//     } catch (error) {
//         console.error("Error verifying hosted zone:", error);
//         return null;
//     }
// }

// // Use the result in the stack creation
// async function main() {
//     const zoneName = await verifyHostedZoneBeforeStackCreation(config.hostedZoneID);
//     const app = new cdk.App();
//     new SingleEc2Stack(app, 'SingleEc2Stack', { zoneName });
//     app.synth();
// }

// main();
