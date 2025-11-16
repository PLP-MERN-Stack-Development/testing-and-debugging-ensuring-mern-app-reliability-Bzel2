# MERN Bug Tracker

A comprehensive bug tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js) focusing on testing and debugging best practices.

## 🎯 Project Overview

This application demonstrates professional-level testing and debugging practices in a full-stack MERN application. It includes comprehensive unit tests, integration tests, component tests, error handling, and debugging tools.

## ✨ Features

### Core Functionality
- 🐛 **Bug Management**: Create, read, update, and delete bugs
- 📊 **Dashboard**: Real-time statistics and bug status overview
- 🔍 **Filtering & Search**: Filter bugs by status, priority, assignee, and reporter
- 📱 **Responsive Design**: Mobile-friendly interface with Material-UI
- 🔄 **Real-time Updates**: Automatic data refresh and optimistic updates

### Testing & Debugging Features
- ✅ **Comprehensive Testing**: Unit, integration, and component tests
- 🛡️ **Error Boundaries**: Graceful error handling in React
- 📝 **Structured Logging**: Winston logger with different log levels
- 🔧 **Debugging Tools**: Console logging, error tracking, and development helpers
- 📊 **Test Coverage**: Detailed test coverage reports
- 🚨 **Error Handling**: Custom error classes and middleware

## 🏗️ Architecture

```
mern-bug-tracker/
├── backend/                 # Express.js API Server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware (error handling, etc.)
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions (validation, logging)
│   ├── tests/             # Backend tests
│   │   ├── unit/          # Unit tests
│   │   └── integration/   # Integration tests
│   └── server.js          # Main server file
├── frontend/               # React Application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── __tests__/     # Component tests
│   │   └── App.js         # Main App component
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd mern-bug-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bugtracker
   LOG_LEVEL=debug
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running locally or update the `MONGODB_URI` in your `.env` file to point to your MongoDB Atlas cluster.

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The API server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   The React app will start on `http://localhost:3000`

3. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure

#### Backend Testing
- **Unit Tests**: Test individual functions and utilities
  - Validation functions
  - Error handling classes
  - Helper utilities

- **Integration Tests**: Test API endpoints
  - CRUD operations for bugs
  - Authentication middleware
  - Database interactions

#### Frontend Testing
- **Component Tests**: Test React components
  - User interactions
  - Form validation
  - Error states
  - Loading states

- **Integration Tests**: Test component interactions
  - API calls
  - State management
  - Navigation

### Test Coverage Goals
- **Backend**: 80%+ coverage for critical paths
- **Frontend**: 70%+ coverage for components and utilities

## 🐛 Debugging Features

### Backend Debugging

1. **Structured Logging**
   ```javascript
   // Different log levels available
   logger.error('Error message', { context: 'additional data' });
   logger.warn('Warning message');
   logger.info('Info message');
   logger.debug('Debug message');
   ```

2. **Error Handling Middleware**
   ```javascript
   // Custom AppError class for operational errors
   throw new AppError('User not found', 404);
   ```

3. **Request/Response Logging**
   - All API requests are logged with method, URL, and IP
   - Response times and status codes are tracked

4. **Debug Mode**
   ```bash
   # Start server in debug mode
   npm run debug
   ```

### Frontend Debugging

1. **Error Boundaries**
   - Catches JavaScript errors in components
   - Shows error details in development mode
   - Provides fallback UI in production

2. **API Debugging**
   - Request/response interceptors log all API calls
   - Error responses are displayed as toast notifications

3. **React DevTools**
   - Component state inspection
   - Performance profiling
   - Hook debugging

4. **Console Debugging**
   ```javascript
   // Structured logging in components
   console.log('Component rendered', { props, state });
   ```

### Chrome DevTools Integration

1. **Network Tab**: Monitor API requests and responses
2. **Console Tab**: View structured logs and errors
3. **Components Tab**: Inspect React component state
4. **Performance Tab**: Profile application performance

## 🛡️ Error Handling

### Backend Error Handling

1. **Custom Error Classes**
   ```javascript
   class AppError extends Error {
     constructor(message, statusCode) {
       super(message);
       this.statusCode = statusCode;
       this.isOperational = true;
     }
   }
   ```

2. **Global Error Middleware**
   - Handles all unhandled errors
   - Logs errors with context
   - Returns appropriate error responses

3. **Validation Errors**
   - Joi validation with detailed error messages
   - MongoDB validation errors
   - Custom business logic validation

### Frontend Error Handling

1. **Error Boundaries**
   - Wrap components to catch rendering errors
   - Display fallback UI when errors occur
   - Log errors for debugging

2. **API Error Handling**
   - Axios interceptors for global error handling
   - Toast notifications for user feedback
   - Retry mechanisms for failed requests

3. **Form Validation**
   - Real-time validation with React Hook Form
   - User-friendly error messages
   - Accessibility-compliant error states

## 📊 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Endpoints

#### Bugs
```
GET    /bugs           # Get all bugs (with filtering and pagination)
GET    /bugs/:id       # Get bug by ID
POST   /bugs           # Create new bug
PATCH  /bugs/:id       # Update bug
DELETE /bugs/:id       # Delete bug
GET    /bugs/stats     # Get bug statistics
```

#### Health Check
```
GET    /health         # Server health status
```

### Query Parameters for GET /bugs
- `status`: Filter by status (open, in-progress, resolved, closed)
- `priority`: Filter by priority (low, medium, high, critical)
- `assignee`: Filter by assignee name
- `reporter`: Filter by reporter name
- `page`: Page number for pagination
- `limit`: Number of items per page
- `sortBy`: Field to sort by
- `sortOrder`: Sort order (asc, desc)

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://your-atlas-connection
   LOG_LEVEL=info
   ```

2. **Build and Start**
   ```bash
   npm install --production
   npm start
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   - Deploy the `build` folder to your hosting service
   - Configure API URL in environment variables

## 🔧 Development Tools

### Recommended VSCode Extensions
- ES7+ React/Redux/React-Native snippets
- Jest Runner
- REST Client
- MongoDB for VS Code
- Error Lens

### Debugging Configuration

1. **Backend Debugging (VSCode)**
   ```json
   {
     "name": "Debug Backend",
     "type": "node",
     "request": "launch",
     "program": "${workspaceFolder}/backend/server.js",
     "env": {
       "NODE_ENV": "development"
     }
   }
   ```

2. **Frontend Debugging (Chrome)**
   - Use React Developer Tools extension
   - Enable source maps for debugging

## 📈 Performance Optimization

### Backend
- Database indexing for frequently queried fields
- Request rate limiting
- Compression middleware
- Efficient MongoDB queries

### Frontend
- React Query for caching and background updates
- Lazy loading for components
- Memoization for expensive computations
- Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the component library
- React Query for state management
- Winston for logging
- Jest and React Testing Library for testing frameworks

## 📞 Support

If you have any questions or need help getting started:

1. Check the [Issues](../../issues) for common problems
2. Review the debugging section in this README
3. Create a new issue with detailed information about your problem

---

**Happy Bug Tracking! 🐛**
