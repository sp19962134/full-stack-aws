# Serverless Task Manager

A full-stack serverless application built with React, Node.js, and AWS services. This project demonstrates modern web development practices including TypeScript, Redux, AWS CDK, and CI/CD pipelines.

## 🏗️ Project Structure

```
serverless-task-manager/
├── .github/workflows/          # GitHub Actions CI/CD
├── apps/
│   ├── frontend/              # React + Redux + TypeScript
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── pages/         # Page components
│   │   │   ├── redux/         # Redux store and slices
│   │   │   ├── services/      # API calls
│   │   │   └── hooks/         # Custom React hooks
│   │   └── public/            # Static assets
│   └── backend/               # Express.js + TypeScript
│       ├── src/
│       │   ├── controllers/   # Route controllers
│       │   ├── middlewares/   # Express middlewares
│       │   ├── models/        # Data models
│       │   ├── routes/        # API routes
│       │   └── services/      # Business logic
│       └── tests/             # Backend tests
├── infra/                     # AWS CDK Infrastructure
│   ├── bin/                   # CDK entry point
│   └── lib/                   # CDK stack definitions
└── postman/                   # API documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Vite** for build tooling
- **Axios** for API calls

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **serverless-http** for Lambda compatibility
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Infrastructure
- **AWS CDK** for Infrastructure as Code
- **AWS Lambda** for serverless backend
- **API Gateway** for REST API
- **S3** for static frontend hosting
- **CloudFront** for CDN

### DevOps
- **GitHub Actions** for CI/CD
- **AWS CLI** for deployments
- **Jest** for testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured
- AWS CDK installed globally

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serverless-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env files for each app
   cp apps/frontend/.env.example apps/frontend/.env
   cp apps/backend/.env.example apps/backend/.env
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Runs on http://localhost:3000
   npm run dev:backend   # Runs on http://localhost:3001
   ```

### Deployment

1. **Deploy infrastructure**
   ```bash
   cd infra
   npm install
   npm run build
   npm run deploy
   ```

2. **Deploy applications**
   ```bash
   # Build and deploy frontend
   npm run build:frontend
   npm run deploy:frontend
   
   # Build and deploy backend
   npm run build:backend
   npm run deploy:backend
   ```

## 📚 7-Day Course Plan

### Day 1: Project Setup & UI Foundation
- ✅ Set up monorepo with TypeScript
- ✅ Initialize React with Vite
- ✅ Add Redux Toolkit for state management
- ✅ Set up routing and layout
- ✅ Create reusable UI components

### Day 2: Backend Setup with Express + Lambda-ready APIs
- ✅ Initialize backend with Express + TypeScript
- ✅ Add serverless-http for Lambda compatibility
- ✅ Set up CRUD routes for tasks
- ✅ Implement middleware and error handling

### Day 3: AWS Infrastructure with CDK
- ✅ Create CDK project using TypeScript
- ✅ Deploy backend to Lambda with API Gateway
- ✅ Add S3 bucket for frontend hosting
- ✅ Set up CloudFront distribution

### Day 4: Frontend Integration + Auth
- ✅ Integrate Redux with API calls
- ✅ Implement task management features
- ✅ Add basic authentication simulation
- ✅ Connect frontend to backend APIs

### Day 5: CI/CD with GitHub Actions
- ✅ Create GitHub Actions workflows
- ✅ Set up automated testing
- ✅ Configure deployment pipelines
- ✅ Add build and lint stages

### Day 6: Monitoring & Optimization
- ✅ Set up CloudWatch logging
- ✅ Add performance monitoring
- ✅ Implement error tracking
- ✅ Optimize Lambda functions

### Day 7: Finalization + Advanced Practices
- ✅ Add comprehensive testing
- ✅ Implement security best practices
- ✅ Optimize for production
- ✅ Document the application

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test --workspace=apps/frontend

# Run backend tests
npm run test --workspace=apps/backend

# Run infrastructure tests
npm run test --workspace=infra
```

## 📖 API Documentation

The API documentation is available in the `postman/` directory:
- `api_collection.json` - Postman collection with all endpoints
- `env.json` - Environment variables for testing

### API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /health` - Health check endpoint

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build all applications
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Testing
npm test                 # Run all tests
npm run lint             # Run linting

# Deployment
npm run deploy           # Deploy all infrastructure
npm run deploy:frontend  # Deploy frontend
npm run deploy:backend   # Deploy backend
```

## 🌟 Features

- **Serverless Architecture**: Built on AWS Lambda and API Gateway
- **Modern Frontend**: React with TypeScript and Redux
- **Infrastructure as Code**: AWS CDK for reproducible deployments
- **CI/CD Pipeline**: Automated testing and deployment
- **Type Safety**: Full TypeScript implementation
- **Security**: Helmet, CORS, and best practices
- **Monitoring**: CloudWatch integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API documentation in `postman/`

---

**Happy Coding! 🚀** 