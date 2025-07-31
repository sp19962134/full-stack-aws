import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for the backend API
    const backendFunction = new lambda.Function(this, 'BackendFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../apps/backend/dist'),
      environment: {
        NODE_ENV: 'production',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'TaskManagerApi', {
      restApiName: 'Task Manager API',
      description: 'API for the Serverless Task Manager',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda integration
    const integration = new apigateway.LambdaIntegration(backendFunction);

    // API Gateway resources and methods
    const tasks = api.root.addResource('tasks');
    const task = tasks.addResource('{id}');

    // GET /tasks
    tasks.addMethod('GET', integration);
    
    // POST /tasks
    tasks.addMethod('POST', integration);
    
    // PUT /tasks/{id}
    task.addMethod('PUT', integration);
    
    // DELETE /tasks/{id}
    task.addMethod('DELETE', integration);

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: 'TaskManagerApiUrl',
    });
  }
} 