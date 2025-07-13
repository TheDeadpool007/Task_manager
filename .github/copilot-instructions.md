<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Task Manager Application - Copilot Instructions

This is a comprehensive Task Manager application built with Node.js, Express.js, MongoDB, and Socket.io. The application includes JWT authentication, role-based access control, real-time updates, AI integration, and external API integration.

## Project Structure

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for WebSocket communication
- **External APIs**: ZenQuotes.io/Quotable.io for quotes, OpenRouter.ai/Together.ai for AI tips
- **Security**: Helmet, CORS, rate limiting, input validation

## Key Technologies & Patterns

1. **Architecture**: RESTful API with MVC pattern
2. **Authentication**: JWT-based stateless authentication
3. **Authorization**: Role-based access control (admin, manager, user)
4. **Real-time**: Socket.io for task updates and notifications
5. **Validation**: express-validator for input validation
6. **Error Handling**: Centralized error handling middleware
7. **Caching**: In-memory caching for AI responses and quotes
8. **Rate Limiting**: API rate limiting to prevent abuse

## Coding Standards

- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Follow RESTful API conventions for routing
- Use middleware for authentication, validation, and error handling
- Implement proper security measures (helmet, CORS, input sanitization)
- Use environment variables for configuration
- Write clear, descriptive variable and function names
- Add JSDoc comments for complex functions

## Database Models

- **User**: Authentication, profile, preferences, role-based permissions
- **Task**: CRUD operations with ownership, assignment, comments, and metadata

## API Endpoints Structure

- `/api/auth/*` - Authentication routes (register, login, profile)
- `/api/tasks/*` - Task CRUD operations with role-based access
- `/api/quotes/*` - External quote API integration (public)
- `/api/ai/*` - AI productivity tips with rate limiting

## Socket.io Events

- `taskCreated` - Broadcast new task creation
- `taskUpdated` - Broadcast task updates
- `taskDeleted` - Broadcast task deletion
- `commentAdded` - Broadcast new comments
- `taskAssigned` - Notify user assignment

## Environment Variables

Always use environment variables for:
- Database connections
- JWT secrets
- API keys
- Port configuration
- External service URLs

## Security Considerations

- Never expose sensitive data in API responses
- Always validate and sanitize input data
- Use proper HTTP status codes
- Implement rate limiting for AI endpoints
- Use HTTPS in production
- Hash passwords with bcrypt
- Implement proper CORS policies
