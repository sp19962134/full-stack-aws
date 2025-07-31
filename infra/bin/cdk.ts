#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { DatabaseStack } from '../lib/database-stack';

const app = new cdk.App();

// Get environment variables
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Database Stack - DynamoDB Tables
const databaseStack = new DatabaseStack(app, 'DatabaseStack', {
  env: { account, region },
});

// Backend Stack - Lambda + API Gateway (depends on database)
const backendStack = new BackendStack(app, 'BackendStack', databaseStack, {
  env: { account, region },
});

// Add dependency
backendStack.addDependency(databaseStack);

// Frontend Stack - S3 Static Hosting
new FrontendStack(app, 'FrontendStack', {
  env: { account, region },
}); 