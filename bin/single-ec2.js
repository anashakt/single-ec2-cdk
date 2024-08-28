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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const aws_cdk_lib_1 = require("aws-cdk-lib");
// import * as cdk from '@aws-cdk/core';
const single_ec2_stack_1 = require("../lib/single-ec2-stack");
const app = new aws_cdk_lib_1.App();
new single_ec2_stack_1.SingleEc2Stack(app, 'SingleEc2Stack', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlLWVjMi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpbmdsZS1lYzIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQXFDO0FBSXJDLDZDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsOERBQXlEO0FBRXpELE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQUksaUNBQWMsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLEVBQUU7SUFDeEMsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1FBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtLQUN2QztJQUNELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7Q0FDakMsQ0FBQyxDQUFDO0FBQ0gseUNBQXlDO0FBQ3pDLHFHQUFxRztBQUNyRyxnREFBZ0Q7QUFDaEQscUVBQXFFO0FBQ3JFLDJEQUEyRDtBQUMzRCxZQUFZO0FBQ1osdURBQXVEO0FBQ3ZELGlDQUFpQztBQUNqQyxvREFBb0Q7QUFDcEQsd0JBQXdCO0FBQ3hCLGdFQUFnRTtBQUNoRSx1QkFBdUI7QUFDdkIsUUFBUTtBQUNSLElBQUk7QUFFSiwwQ0FBMEM7QUFDMUMsMEJBQTBCO0FBQzFCLHVGQUF1RjtBQUN2RixpQ0FBaUM7QUFDakMsK0RBQStEO0FBQy9ELG1CQUFtQjtBQUNuQixJQUFJO0FBRUosVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyByNTMgZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1yb3V0ZS01M1wiOyBcbmltcG9ydCB7IEdldEhvc3RlZFpvbmVDb21tYW5kLCBHZXRIb3N0ZWRab25lQ29tbWFuZElucHV0IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LXJvdXRlLTUzJztcbmltcG9ydCB7IEFwcCwgVGFncyB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuLy8gaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgU2luZ2xlRWMyU3RhY2sgfSBmcm9tICcuLi9saWIvc2luZ2xlLWVjMi1zdGFjayc7XG5cbmNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcbm5ldyBTaW5nbGVFYzJTdGFjayhhcHAsICdTaW5nbGVFYzJTdGFjaycsIHtcbiAgZW52OiB7XG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTlxuICB9LFxuICBzdGFja05hbWU6IHByb2Nlc3MuZW52LlNUQUNLTkFNRVxufSk7XG4vLyBSdW4gdGhpcyBiZWZvcmUgY3JlYXRpbmcgdGhlIENESyBzdGFja1xuLy8gYXN5bmMgZnVuY3Rpb24gdmVyaWZ5SG9zdGVkWm9uZUJlZm9yZVN0YWNrQ3JlYXRpb24oaG9zdGVkWm9uZUlEOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbi8vICAgICBjb25zdCBjbGllbnQgPSBuZXcgcjUzLlJvdXRlNTNDbGllbnQoe30pO1xuLy8gICAgIGNvbnN0IGlucHV0OiBHZXRIb3N0ZWRab25lQ29tbWFuZElucHV0ID0geyBJZDogaG9zdGVkWm9uZUlEIH07XG4vLyAgICAgY29uc3QgY29tbWFuZCA9IG5ldyByNTMuR2V0SG9zdGVkWm9uZUNvbW1hbmQoaW5wdXQpO1xuLy8gICAgIHRyeSB7XG4vLyAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4vLyAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbi8vICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLkhvc3RlZFpvbmU/Lk5hbWUgfHwgbnVsbDtcbi8vICAgICB9IGNhdGNoIChlcnJvcikge1xuLy8gICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgdmVyaWZ5aW5nIGhvc3RlZCB6b25lOlwiLCBlcnJvcik7XG4vLyAgICAgICAgIHJldHVybiBudWxsO1xuLy8gICAgIH1cbi8vIH1cblxuLy8gLy8gVXNlIHRoZSByZXN1bHQgaW4gdGhlIHN0YWNrIGNyZWF0aW9uXG4vLyBhc3luYyBmdW5jdGlvbiBtYWluKCkge1xuLy8gICAgIGNvbnN0IHpvbmVOYW1lID0gYXdhaXQgdmVyaWZ5SG9zdGVkWm9uZUJlZm9yZVN0YWNrQ3JlYXRpb24oY29uZmlnLmhvc3RlZFpvbmVJRCk7XG4vLyAgICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbi8vICAgICBuZXcgU2luZ2xlRWMyU3RhY2soYXBwLCAnU2luZ2xlRWMyU3RhY2snLCB7IHpvbmVOYW1lIH0pO1xuLy8gICAgIGFwcC5zeW50aCgpO1xuLy8gfVxuXG4vLyBtYWluKCk7Il19
