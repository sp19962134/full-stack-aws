import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class ProductionStack extends cdk.Stack {
  public readonly apiUrl: string;
  public readonly frontendUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // WAF Web ACL for API Gateway protection
    const webAcl = new wafv2.CfnWebACL(this, 'ProductionWebACL', {
      defaultAction: { allow: {} },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'ProductionWebACLMetric',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'RateLimitRule',
          priority: 1,
          statement: {
            rateBasedStatement: {
              limit: 2000,
              aggregateKeyType: 'IP',
            },
          },
          action: { block: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitRuleMetric',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'SQLInjectionRule',
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesSQLiRuleSet',
            },
          },
          action: { block: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'SQLInjectionRuleMetric',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'XSSRule',
          priority: 3,
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          action: { block: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'XSSRuleMetric',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    // DynamoDB Tables with enhanced security
    const tasksTable = new dynamodb.Table(this, 'ProductionTasksTable', {
      tableName: 'production-task-manager-tasks',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect production data
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      // backup: dynamodb.Backup.ENABLED, // Not available in this CDK version
    });

    const usersTable = new dynamodb.Table(this, 'ProductionUsersTable', {
      tableName: 'production-task-manager-users',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 3,
      writeCapacity: 3,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      // backup: dynamodb.Backup.ENABLED, // Not available in this CDK version
    });

    // Global Secondary Indexes for optimized querying
    tasksTable.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 5,
      writeCapacity: 5,
    });

    tasksTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 3,
      writeCapacity: 3,
    });

    usersTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 3,
      writeCapacity: 3,
    });

    // Enhanced Lambda function with production settings
    const lambdaRole = new iam.Role(this, 'ProductionLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant DynamoDB permissions
    tasksTable.grantReadWriteData(lambdaRole);
    usersTable.grantReadWriteData(lambdaRole);

    // Add CloudWatch Logs permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    const backendFunction = new lambda.Function(this, 'ProductionBackendFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../apps/backend/dist'),
      role: lambdaRole,
      environment: {
        NODE_ENV: 'production',
        TASKS_TABLE_NAME: tasksTable.tableName,
        USERS_TABLE_NAME: usersTable.tableName,
        AWS_REGION: this.region,
        LOG_LEVEL: 'info',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024, // Increased for production
      reservedConcurrentExecutions: 100, // Prevent throttling
      logRetention: logs.RetentionDays.ONE_MONTH,
      tracing: lambda.Tracing.ACTIVE, // Enable X-Ray tracing
    });

    // API Gateway with enhanced security
    const api = new apigateway.RestApi(this, 'ProductionTaskManagerApi', {
      restApiName: 'Production Task Manager API',
      description: 'Production API for the Serverless Task Manager',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        maxAge: cdk.Duration.days(1),
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
    });

    // Associate WAF with API Gateway
    new wafv2.CfnWebACLAssociation(this, 'ProductionWebACLAssociation', {
      resourceArn: api.deploymentStage.stageArn,
      webAclArn: webAcl.attrArn,
    });

    // API Gateway resources and methods
    const integration = new apigateway.LambdaIntegration(backendFunction);
    
    const apiResource = api.root.addResource('api');
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

    // Add methods with request validation
    const requestValidator = new apigateway.RequestValidator(this, 'ProductionRequestValidator', {
      restApi: api,
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // Basic CRUD methods
    tasks.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    tasks.addMethod('POST', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    taskById.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    taskById.addMethod('PUT', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    taskById.addMethod('DELETE', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    // Advanced features
    taskComments.addMethod('POST', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    // Filtering and search
    tasksByStatus.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    tasksByPriority.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    tasksSearch.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    tasksOverdue.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });
    
    tasksStatistics.addMethod('GET', integration, {
      requestValidator,
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    // Health check
    health.addMethod('GET', integration);

    // S3 Bucket for frontend with enhanced security
    const frontendBucket = new s3.Bucket(this, 'ProductionFrontendBucket', {
      bucketName: `production-task-manager-frontend-${this.account}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });

    // CloudFront Distribution with enhanced security
    const distribution = new cloudfront.Distribution(this, 'ProductionFrontendDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultRootObject: 'index.html',
      enableLogging: true,
      logBucket: new s3.Bucket(this, 'ProductionCloudFrontLogs', {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        lifecycleRules: [
          {
            id: 'DeleteOldLogs',
            expiration: cdk.Duration.days(90),
          },
        ],
      }),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
    });

    // Auto Scaling for DynamoDB
    const readScaling = tasksTable.autoScaleReadCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });

    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
    });

    const writeScaling = tasksTable.autoScaleWriteCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });

    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
    });

    // Outputs
    this.apiUrl = api.url;
    this.frontendUrl = `https://${distribution.distributionDomainName}`;

    new cdk.CfnOutput(this, 'ProductionApiUrl', {
      value: api.url,
      description: 'Production API Gateway URL',
      exportName: 'ProductionApiUrl',
    });

    new cdk.CfnOutput(this, 'ProductionFrontendUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Production Frontend URL',
      exportName: 'ProductionFrontendUrl',
    });

    new cdk.CfnOutput(this, 'ProductionTasksTableName', {
      value: tasksTable.tableName,
      description: 'Production Tasks DynamoDB Table Name',
      exportName: 'ProductionTasksTableName',
    });

    new cdk.CfnOutput(this, 'ProductionUsersTableName', {
      value: usersTable.tableName,
      description: 'Production Users DynamoDB Table Name',
      exportName: 'ProductionUsersTableName',
    });

    new cdk.CfnOutput(this, 'ProductionCloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'Production CloudFront Distribution ID',
      exportName: 'ProductionCloudFrontDistributionId',
    });
  }
} 