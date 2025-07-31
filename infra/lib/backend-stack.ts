import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { DatabaseStack } from './database-stack';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, databaseStack: DatabaseStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create IAM role for Lambda with DynamoDB permissions
    const lambdaRole = new iam.Role(this, 'BackendLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant DynamoDB permissions
    databaseStack.tasksTable.grantReadWriteData(lambdaRole);
    databaseStack.usersTable.grantReadWriteData(lambdaRole);

    // Lambda function for the backend API
    const backendFunction = new lambda.Function(this, 'BackendFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../apps/backend/dist'),
      role: lambdaRole,
      environment: {
        NODE_ENV: 'production',
        TASKS_TABLE_NAME: databaseStack.tasksTable.tableName,
        USERS_TABLE_NAME: databaseStack.usersTable.tableName,
        AWS_REGION: this.region,
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
    const apiResource = api.root.addResource('api');
    
    // Tasks endpoints
    const tasks = apiResource.addResource('tasks');
    const taskById = tasks.addResource('{id}');
    const taskComments = taskById.addResource('comments');
    
    // Advanced endpoints
    const tasksByStatus = apiResource.addResource('tasks').addResource('status').addResource('{status}');
    const tasksByPriority = apiResource.addResource('tasks').addResource('priority').addResource('{priority}');
    const tasksSearch = apiResource.addResource('tasks').addResource('search');
    const tasksOverdue = apiResource.addResource('tasks').addResource('overdue');
    const tasksStatistics = apiResource.addResource('tasks').addResource('statistics');

    // Health check endpoint
    const health = api.root.addResource('health');

    // Basic CRUD methods
    tasks.addMethod('GET', integration);
    tasks.addMethod('POST', integration);
    taskById.addMethod('GET', integration);
    taskById.addMethod('PUT', integration);
    taskById.addMethod('DELETE', integration);

    // Advanced features
    taskComments.addMethod('POST', integration);

    // Filtering and search
    tasksByStatus.addMethod('GET', integration);
    tasksByPriority.addMethod('GET', integration);
    tasksSearch.addMethod('GET', integration);
    tasksOverdue.addMethod('GET', integration);
    tasksStatistics.addMethod('GET', integration);

    // Health check
    health.addMethod('GET', integration);

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: 'TaskManagerApiUrl',
    });

    new cdk.CfnOutput(this, 'TasksTableName', {
      value: databaseStack.tasksTable.tableName,
      description: 'Tasks DynamoDB Table Name',
    });
  }
} 