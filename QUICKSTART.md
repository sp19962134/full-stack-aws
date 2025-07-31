# 🚀 Quick Start Guide

Get your Serverless Task Manager running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
cd serverless-task-manager
npm install
```

## Step 2: Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

## Step 3: Access the Application

1. **Frontend**: Open http://localhost:3000
2. **Backend API**: Test at http://localhost:3001/api/tasks
3. **Health Check**: http://localhost:3001/health

## Step 4: Test the API

Use the Postman collection in `postman/api_collection.json` or test with curl:

```bash
# Get all tasks
curl http://localhost:3001/api/tasks

# Create a task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test description","status":"pending","priority":"medium"}'
```

## 🎯 What You'll See

### Frontend (Day 1 Ready)
- ✅ Modern React UI with TypeScript
- ✅ Redux state management
- ✅ Task creation, editing, and deletion
- ✅ Mock authentication
- ✅ Responsive design

### Backend (Day 2 Ready)
- ✅ Express.js with TypeScript
- ✅ CRUD API endpoints
- ✅ CORS and security middleware
- ✅ Lambda-compatible code
- ✅ Mock data storage

### Infrastructure (Day 3 Ready)
- ✅ AWS CDK setup
- ✅ Lambda + API Gateway stack
- ✅ S3 + CloudFront stack
- ✅ Deployment scripts

## 📚 Next Steps

1. **Day 1**: Explore the frontend components and Redux store
2. **Day 2**: Test the backend API endpoints
3. **Day 3**: Deploy to AWS using CDK
4. **Day 4**: Connect frontend to real backend
5. **Day 5**: Set up CI/CD pipeline
6. **Day 6**: Add monitoring and optimization
7. **Day 7**: Finalize and document

## 🛠️ Development Commands

```bash
# Testing
npm test                    # Run all tests
npm run test:frontend      # Frontend tests only
npm run test:backend       # Backend tests only

# Building
npm run build              # Build all applications
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Linting
npm run lint               # Lint all code
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## 📖 Documentation

- [README.md](./README.md) - Complete project documentation
- [postman/api_collection.json](./postman/api_collection.json) - API testing collection
- [.github/workflows/ci-cd.yml](./.github/workflows/ci-cd.yml) - CI/CD pipeline

---

**Happy Coding! 🎉** 