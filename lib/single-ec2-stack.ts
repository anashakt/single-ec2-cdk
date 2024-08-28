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

import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_iam as iam,aws_cloudwatch as cloudwatch, aws_events as events, aws_events_targets as targets  } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as r53 from "@aws-sdk/client-route-53";
import * as fs from 'fs';
import { InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Tags } from 'aws-cdk-lib';
import * as os from 'os';
import { GetHostedZoneCommand, GetHostedZoneCommandInput } from '@aws-sdk/client-route-53';
// import { SelfDestruct } from 'cdk-time-bomb'; // Assuming cdk-time-bomb is compatible with CDK v2
import { SelfDestructLambda } from '../lib/self-destruct-stack';

interface Config {
  stackName: string,
  ec2Name: string,
  nickName: string,
  ec2Class: string,
  ec2Size: string,
  keyName: string,
  keyFile: string,
  hostedZoneID: string,
  domainName: string,
  userDataFile: string
  cdkOut: string,
  timeBomb: number
  vpcId: string,
  sshPublicKey: string
}


const config: Config = require('../configs/.config.json'); //TODO Update this to your env file
const defaultUserData: string = "./userdata/user_script.sh";
config.userDataFile = config.userDataFile.replace(/^~/, os.homedir());
console.log("using configuration: ", config);

export class SingleEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log("keyName: ", config.keyName);
    console.log("ec2Name: ", config.ec2Name);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', {vpcId: config.vpcId });

    // OPTIONAL self destruct - disabled if config.timeBomb is 0, otherwise in minutes
    if (config.timeBomb !== 0) {
      const selfDestructLambda = new lambda.Function(this, 'SelfDestructLambda', {
        runtime: lambda.Runtime.PYTHON_3_9,
        code: lambda.Code.fromInline(`
import boto3
def handler(event, context):
    cloudformation = boto3.client('cloudformation')
    cloudformation.delete_stack(StackName='${this.stackName}')
        `),
        handler: 'index.handler',
        environment: {
          STACK_NAME: this.stackName,
        },
      });

      const rule = new events.Rule(this, 'SelfDestructRule', {
        schedule: events.Schedule.rate(cdk.Duration.minutes(config.timeBomb)),
      });
      rule.addTarget(new targets.LambdaFunction(selfDestructLambda));

    //   const selfDestruct = new SelfDestruct(this, "selfDestructor", {
    //     timeToLive: cdk.Duration.minutes(60)
    //   });

    //   defaultVpc.node.addDependency(selfDestruct);
    // }
  }

    const role = new iam.Role(
      this,
      config.ec2Name + '-role',
      { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
    )
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"));
    const dnsPolicyDoc = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["route53:GetChange"], // needed by the set-dns script we install
          resources: ["arn:aws:route53:::hostedzone/" + config.hostedZoneID],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["route53:ChangeResourceRecordSets"], // needed by the set-dns script we install
          resources: ["arn:aws:route53:::hostedzone/" + config.hostedZoneID],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["route53:GetHostedZone"], // needed to validate the zone at creation time
          resources: ["arn:aws:route53:::hostedzone/" + config.hostedZoneID],
        }),
      ],
    });
    const dnsPolicy = new iam.Policy(this, 'dnsPolicy', {
      document: dnsPolicyDoc
    });
    role.attachInlinePolicy(dnsPolicy);

    const ssmPolicyDoc = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ssm:UpdateInstanceInformation",
            "ssmmessages:CreateControlChannel",
            "ssmmessages:CreateDataChannel",
            "ssmmessages:OpenControlChannel",
            "ssmmessages:OpenDataChannel"],
          resources: ["*"],
        }),
      ],
    });
    const ssmPolicy = new iam.Policy(this, 'ssmPolicy', {
      document: ssmPolicyDoc
    });
    role.attachInlinePolicy(ssmPolicy);

    const securityGroup = new ec2.SecurityGroup(this, config.ec2Name + 'sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true, // will let your instance send outboud traffic
        securityGroupName: config.ec2Name + '-sg',
      }
    )

    // open the SSH port
    // securityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(22),
    // )
    /* Uncomment this block if you plan on exposing any standard web server
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8080),
    )
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
    )
    */
    const instance = new ec2.Instance(this, config.ec2Name as string, {
      vpc: defaultVpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: config.ec2Name,
      instanceType: ec2.InstanceType.of(
        config.ec2Class as InstanceClass,
        config.ec2Size as InstanceSize,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      // keyName: config.keyName,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(100),
        },
      ],
    });

    const arn: string = "arn:aws:ec2:" + process.env.CDK_DEFAULT_REGION + ":" + process.env.CDK_DEFAULT_ACCOUNT + ":instance/" + instance.instanceId;
    const tagPolicyDoc = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ec2:DescribeTags"], // needed by the set-dns script we install
          resources: [arn],
        }),
      ],
    });
    const tagPolicy = new iam.Policy(this, 'tagPollicy', {
      document: tagPolicyDoc
    });
    role.attachInlinePolicy(tagPolicy);



    // add all our configs as tags
    Tags.of(instance).add('ec2Name', config.ec2Name);
    Tags.of(instance).add('nickName', config.nickName);
    Tags.of(instance).add('keyName', config.keyName);
    Tags.of(instance).add('keyFile', config.keyFile);
    Tags.of(instance).add('hostedZoneID', config.hostedZoneID);
    Tags.of(instance).add('domainName', config.domainName);
    // Tags.of(instance).add('timeBomb', config.timeBomb);
    Tags.of(instance).add('ec2Name', config.ec2Name);

    // new cdk.CfnOutput(this, 'ec2-instance-ip-address', {
    //   value: instance.instancePublicIp
    // })
    new cdk.CfnOutput(this, 'ec2-instance-id', {
      value: instance.instanceId
    })
    new cdk.CfnOutput(this, 'ec2-instance-public-dnsname', {
      value: instance.instancePublicDnsName
    })

    let localUserData: string = fs.readFileSync(defaultUserData, 'utf8');
    const sshPublicKeyCommand = `mkdir -p  /home/ssm-user/.ssh; echo "${config.sshPublicKey}" >> /home/ssm-user/.ssh/authorized_keys`;
    localUserData += `\n${sshPublicKeyCommand}\n`;

    // handle DNS, if and only if the config file specifies a zone
    // if (config.hostedZoneID) {
    //   const zoneName = verifyHostedZone(config.hostedZoneID, config.ec2Name);
    //   if (zoneName) {
    //     localUserData = localUserData.replace("ZONE_ID", config.hostedZoneID);
    //     localUserData = localUserData.replace("ZONE_NAME", config.ec2Name + zoneName);
    //   } else {
    //     console.log("DNS name not set due to error obtaining hosted zone information");
    //   }
    // } else {
    //   console.log("DNS name not set");
    // }
    var userData: string = "";
    if (config.userDataFile) {
      userData = fs.readFileSync(config.userDataFile, 'utf8');
    }
    const totalUserData: string = localUserData + userData;
    console.log("creating userdata script: ");
    console.log(totalUserData);
    instance.addUserData(totalUserData);

  }
}

async function verifyHostedZone(hostedZoneID: string, ec2Name: string) {
  const config = '{}';
  const client = new r53.Route53Client(config);
  const input: GetHostedZoneCommandInput = { Id: hostedZoneID };
  const command = new r53.GetHostedZoneCommand(input);
  try {
    const response = await client.send(command);
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}
