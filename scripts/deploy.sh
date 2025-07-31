#!/bin/bash

# Serverless Task Manager - Deployment Script
# This script handles the complete deployment process to AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
STACK_NAME_PREFIX="serverless-task-manager"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install it first."
        exit 1
    fi
    
    log_success "All prerequisites are met!"
}

# Build applications
build_applications() {
    log_info "Building applications..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Build backend
    log_info "Building backend..."
    npm run build --workspace=apps/backend
    if [ $? -ne 0 ]; then
        log_error "Backend build failed!"
        exit 1
    fi
    
    # Build frontend
    log_info "Building frontend..."
    npm run build --workspace=apps/frontend
    if [ $? -ne 0 ]; then
        log_error "Frontend build failed!"
        exit 1
    fi
    
    # Build infrastructure
    log_info "Building infrastructure..."
    npm run build --workspace=infra
    if [ $? -ne 0 ]; then
        log_error "Infrastructure build failed!"
        exit 1
    fi
    
    log_success "All applications built successfully!"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run backend tests
    log_info "Running backend tests..."
    npm run test --workspace=apps/backend
    if [ $? -ne 0 ]; then
        log_error "Backend tests failed!"
        exit 1
    fi
    
    # Run frontend tests
    log_info "Running frontend tests..."
    npm run test --workspace=apps/frontend
    if [ $? -ne 0 ]; then
        log_error "Frontend tests failed!"
        exit 1
    fi
    
    log_success "All tests passed!"
}

# Bootstrap CDK (if needed)
bootstrap_cdk() {
    log_info "Checking CDK bootstrap status..."
    
    # Check if CDK is already bootstrapped
    if aws cloudformation describe-stacks --stack-name CDKToolkit --region $AWS_REGION &> /dev/null; then
        log_info "CDK is already bootstrapped."
    else
        log_info "Bootstrapping CDK..."
        cd infra
        npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/$AWS_REGION
        cd ..
        log_success "CDK bootstrapped successfully!"
    fi
}

# Deploy backend
deploy_backend() {
    log_info "Deploying backend infrastructure..."
    
    cd infra
    
    # Deploy backend stack
    log_info "Deploying backend stack..."
    npx cdk deploy BackendStack --require-approval never
    if [ $? -ne 0 ]; then
        log_error "Backend deployment failed!"
        exit 1
    fi
    
    # Get API Gateway URL
    API_URL=$(npx cdk deploy --outputs-file cdk-outputs.json --require-approval never 2>/dev/null | grep -o 'https://[^"]*\.execute-api\.us-east-1\.amazonaws\.com' | head -1)
    
    cd ..
    
    if [ -n "$API_URL" ]; then
        log_success "Backend deployed successfully!"
        log_info "API Gateway URL: $API_URL"
        
        # Test the deployed API
        log_info "Testing deployed API..."
        sleep 10  # Wait for deployment to stabilize
        
        if curl -f "$API_URL/health" &> /dev/null; then
            log_success "API health check passed!"
        else
            log_warning "API health check failed. The API might still be initializing."
        fi
    else
        log_error "Failed to get API Gateway URL!"
        exit 1
    fi
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend infrastructure..."
    
    cd infra
    
    # Deploy frontend stack
    log_info "Deploying frontend stack..."
    npx cdk deploy FrontendStack --require-approval never
    if [ $? -ne 0 ]; then
        log_error "Frontend deployment failed!"
        exit 1
    fi
    
    # Get CloudFront URL
    FRONTEND_URL=$(npx cdk deploy --outputs-file cdk-outputs.json --require-approval never 2>/dev/null | grep -o 'https://[^"]*\.cloudfront\.net' | head -1)
    
    cd ..
    
    if [ -n "$FRONTEND_URL" ]; then
        log_success "Frontend deployed successfully!"
        log_info "Frontend URL: $FRONTEND_URL"
        
        # Test the deployed frontend
        log_info "Testing deployed frontend..."
        sleep 30  # Wait for CloudFront distribution to be ready
        
        if curl -f "$FRONTEND_URL" &> /dev/null; then
            log_success "Frontend connectivity test passed!"
        else
            log_warning "Frontend connectivity test failed. The distribution might still be initializing."
        fi
    else
        log_error "Failed to get CloudFront URL!"
        exit 1
    fi
}

# Run integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    
    # Get deployment URLs from CDK outputs
    cd infra
    API_URL=$(npx cdk deploy --outputs-file cdk-outputs.json --require-approval never 2>/dev/null | grep -o 'https://[^"]*\.execute-api\.us-east-1\.amazonaws\.com' | head -1)
    FRONTEND_URL=$(npx cdk deploy --outputs-file cdk-outputs.json --require-approval never 2>/dev/null | grep -o 'https://[^"]*\.cloudfront\.net' | head -1)
    cd ..
    
    if [ -n "$API_URL" ]; then
        log_info "Testing API endpoints..."
        
        # Test health endpoint
        if curl -f "$API_URL/health" &> /dev/null; then
            log_success "API health endpoint working!"
        else
            log_error "API health endpoint failed!"
            exit 1
        fi
        
        # Test tasks endpoint
        if curl -f "$API_URL/api/tasks" &> /dev/null; then
            log_success "API tasks endpoint working!"
        else
            log_error "API tasks endpoint failed!"
            exit 1
        fi
    fi
    
    if [ -n "$FRONTEND_URL" ]; then
        log_info "Testing frontend connectivity..."
        
        if curl -f "$FRONTEND_URL" &> /dev/null; then
            log_success "Frontend connectivity working!"
        else
            log_error "Frontend connectivity failed!"
            exit 1
        fi
    fi
    
    log_success "Integration tests passed!"
}

# Performance tests
run_performance_tests() {
    log_info "Running performance tests..."
    
    cd infra
    API_URL=$(npx cdk deploy --outputs-file cdk-outputs.json --require-approval never 2>/dev/null | grep -o 'https://[^"]*\.execute-api\.us-east-1\.amazonaws\.com' | head -1)
    cd ..
    
    if [ -n "$API_URL" ]; then
        log_info "Testing API response time..."
        
        # Test response time
        start_time=$(date +%s%N)
        curl -s "$API_URL/health" > /dev/null
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))
        
        log_info "API response time: ${response_time}ms"
        
        # Fail if response time is too high
        if [ $response_time -gt 5000 ]; then
            log_error "Response time too high: ${response_time}ms"
            exit 1
        else
            log_success "Performance test passed!"
        fi
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "AWS Region: $AWS_REGION"
    
    # Check prerequisites
    check_prerequisites
    
    # Build applications
    build_applications
    
    # Run tests
    run_tests
    
    # Bootstrap CDK
    bootstrap_cdk
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Run integration tests
    run_integration_tests
    
    # Run performance tests
    run_performance_tests
    
    log_success "Deployment completed successfully!"
    log_info "Your application is now live on AWS!"
    
    # Display deployment summary
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Environment: $ENVIRONMENT"
    echo "AWS Region: $AWS_REGION"
    echo "Backend: API Gateway + Lambda"
    echo "Frontend: S3 + CloudFront"
    echo "=========================="
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "test")
        check_prerequisites
        build_applications
        run_tests
        ;;
    "build")
        check_prerequisites
        build_applications
        ;;
    "backend")
        check_prerequisites
        build_applications
        bootstrap_cdk
        deploy_backend
        ;;
    "frontend")
        check_prerequisites
        build_applications
        bootstrap_cdk
        deploy_frontend
        ;;
    "cleanup")
        log_info "Cleaning up AWS resources..."
        cd infra
        npx cdk destroy --force
        cd ..
        log_success "Cleanup completed!"
        ;;
    *)
        echo "Usage: $0 {deploy|test|build|backend|frontend|cleanup}"
        echo "  deploy   - Full deployment (default)"
        echo "  test     - Run tests only"
        echo "  build    - Build applications only"
        echo "  backend  - Deploy backend only"
        echo "  frontend - Deploy frontend only"
        echo "  cleanup  - Destroy all AWS resources"
        exit 1
        ;;
esac 