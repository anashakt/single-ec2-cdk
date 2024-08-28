import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as custom_resources from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

interface SelfDestructLambdaProps extends cdk.StackProps {
  deleteTime: number; // Time in seconds before self-destruction
}

export class SelfDestructLambda extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SelfDestructLambdaProps) {
    super(scope, id, props);

    const deleteStackLambda = new lambda.Function(this, 'DeleteStackFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
import boto3
import time

def handler(event, context):
    stack_name = event['StackName']
    delete_time = event['DeleteTime']

    print(f'Deleting stack: {stack_name} in {delete_time} seconds')
    
    time.sleep(delete_time)
    
    cloudformation = boto3.client('cloudformation')
    cloudformation.delete_stack(StackName=stack_name)
      `),
    });

    const customResource = new custom_resources.AwsCustomResource(this, 'SelfDestructResource', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: deleteStackLambda.functionName,
          InvocationType: 'Event',
          Payload: JSON.stringify({
            StackName: this.stackName,
            DeleteTime: props.deleteTime,
          }),
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of(this.stackId),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
        resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    customResource.node.addDependency(deleteStackLambda);
  }
}
