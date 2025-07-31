# Day 3: AWS Infrastructure Setup Guide

## 🎯 Day 3 Goals

1. **AWS CDK Infrastructure Setup**
   - Deploy backend to AWS Lambda
   - Set up API Gateway
   - Configure CloudWatch logging

2. **Infrastructure as Code**
   - Create CDK stacks
   - Deploy to AWS
   - Set up monitoring

3. **Production Readiness**
   - Environment configuration
   - Security groups
   - IAM roles and permissions

## 🔧 Prerequisites

### 1. AWS Account Setup
You'll need an AWS account with appropriate permissions. For this demo, we'll use:
- AWS Lambda
- API Gateway
- CloudWatch
- IAM

### 2. AWS CLI Configuration
```bash
# Configure AWS credentials
aws configure

# Enter your AWS credentials:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

### 3. CDK Bootstrap (First Time Only)
```bash
# Bootstrap CDK in your AWS account
npx cdk bootstrap
```

## 🚀 Deployment Steps

### Step 1: Build the Backend
```bash
cd apps/backend
npm run build
```

### Step 2: Deploy Infrastructure
```bash
cd ../../infra
npm run build
npm run deploy
```

### Step 3: Test Deployed API
```bash
# Get the API Gateway URL from CDK output
npx cdk deploy --outputs-file cdk-outputs.json

# Test the deployed API
curl https://your-api-gateway-url.amazonaws.com/health
```

## 📁 CDK Infrastructure Structure

```
infra/
├── bin/cdk.ts              # CDK app entry point
├── lib/
│   ├── backend-stack.ts    # Lambda + API Gateway
│   └── frontend-stack.ts   # S3 + CloudFront
└── cdk.json               # CDK configuration
```

## 🔍 What Gets Deployed

### Backend Stack (Lambda + API Gateway)
- **Lambda Function**: Your Express.js backend
- **API Gateway**: REST API endpoints
- **CloudWatch**: Logging and monitoring
- **IAM Roles**: Security permissions

### Frontend Stack (S3 + CloudFront)
- **S3 Bucket**: Static website hosting
- **CloudFront**: CDN for global distribution
- **IAM Policies**: Access permissions

## 🧪 Testing the Deployment

### 1. Health Check
```bash
curl https://your-api-gateway-url.amazonaws.com/health
```

### 2. API Endpoints
```bash
# Get all tasks
curl https://your-api-gateway-url.amazonaws.com/api/tasks

# Create a task
curl -X POST https://your-api-gateway-url.amazonaws.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test","status":"pending","priority":"medium"}'
```

## 📊 Monitoring

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- Error tracking

### Metrics
- Request count
- Response time
- Error rate
- Lambda duration

## 🔧 Development Commands

```bash
# Deploy all stacks
npm run deploy

# Deploy specific stack
npm run deploy:backend
npm run deploy:frontend

# View stack differences
npm run diff

# Destroy all resources
npm run destroy
```

## 🛡️ Security Features

- **CORS**: Configured for frontend access
- **IAM Roles**: Least privilege access
- **API Gateway**: Request validation
- **CloudWatch**: Security monitoring

## 💰 Cost Optimization

- **Lambda**: Pay per request
- **API Gateway**: Pay per API call
- **CloudWatch**: Free tier available
- **S3**: Low cost storage

## 🚨 Troubleshooting

### Common Issues
1. **CDK Bootstrap**: Run `npx cdk bootstrap` first
2. **AWS Credentials**: Verify with `aws sts get-caller-identity`
3. **Permissions**: Ensure IAM roles have required permissions
4. **Region**: Check AWS region configuration

### Debug Commands
```bash
# Check AWS identity
aws sts get-caller-identity

# View CDK diff
npx cdk diff

# Check CloudWatch logs
aws logs describe-log-groups
```

## 📈 Next Steps

After successful deployment:
1. **Update Frontend**: Point to deployed API
2. **Set up CI/CD**: GitHub Actions deployment
3. **Add Monitoring**: CloudWatch alarms
4. **Optimize Performance**: Lambda configuration

---

**Ready to deploy to AWS! 🚀** 