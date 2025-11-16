<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MERN Bug Tracker - Copilot Instructions

This is a comprehensive MERN (MongoDB, Express.js, React, Node.js) Bug Tracker application with a focus on testing and debugging best practices.

## Project Structure
- `/backend` - Express.js API server with comprehensive error handling and logging
- `/frontend` - React application with Material-UI components
- Testing frameworks: Jest, Supertest, React Testing Library

## Key Technologies & Patterns

### Backend
- **Express.js** with comprehensive middleware (error handling, logging, validation)
- **MongoDB** with Mongoose ODM and proper schema validation
- **Testing**: Jest for unit tests, Supertest for integration tests
- **Error Handling**: Custom AppError class with proper HTTP status codes
- **Logging**: Winston for structured logging with different levels
- **Validation**: Joi for request validation with detailed error messages

### Frontend
- **React** with functional components and hooks
- **Material-UI** for consistent UI components and theming
- **React Query** for API state management and caching
- **React Hook Form** for form validation and handling
- **Error Boundaries** for graceful error handling
- **Testing**: Jest and React Testing Library for component testing

## Coding Standards

### General
- Use TypeScript-style JSDoc comments for better code documentation
- Implement proper error handling with meaningful error messages
- Use data-testid attributes for testing selectors
- Follow RESTful API conventions
- Implement proper loading states and error boundaries

### Testing
- Write unit tests for utility functions and business logic
- Create integration tests for API endpoints
- Test React components with user interactions
- Mock external dependencies appropriately
- Achieve meaningful test coverage (aim for 70%+)

### Error Handling
- Use try-catch blocks with proper error logging
- Implement custom error classes for different error types
- Provide user-friendly error messages in the UI
- Log errors with contextual information for debugging

### Security
- Validate all user inputs
- Use proper HTTP status codes
- Implement rate limiting
- Sanitize data before database operations

## Debugging Features
- Console logging with structured data
- Error boundaries with detailed error information in development
- API request/response interceptors for debugging
- Development vs production error handling

When generating code for this project:
1. Follow the established patterns for error handling and validation
2. Include appropriate tests for new functionality
3. Use Material-UI components consistently
4. Implement proper loading and error states
5. Add data-testid attributes for testing
6. Include JSDoc comments for complex functions
7. Use React Query for API calls and state management
