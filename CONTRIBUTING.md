# Contributing to Task Manager

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/task-manager.git
   cd task-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongo mongo:6
   
   # Or start your local MongoDB service
   ```

5. **Create admin user:**
   ```bash
   npm run setup
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Code Style

### JavaScript Style Guide
- Use ES6+ features
- Use `const` and `let` instead of `var`
- Use arrow functions where appropriate
- Use async/await instead of callbacks
- Use meaningful variable and function names
- Follow the existing code style

### File Structure
- Controllers: Handle HTTP requests and responses
- Services: Business logic and external API calls
- Models: Database schemas and methods
- Middleware: Authentication, validation, error handling
- Routes: API endpoint definitions

### Naming Conventions
- Files: camelCase (e.g., `userController.js`)
- Functions: camelCase (e.g., `getUserById`)
- Variables: camelCase (e.g., `userName`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- MongoDB Models: PascalCase (e.g., `User`, `Task`)

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for all new functions
- Write integration tests for API endpoints
- Use descriptive test names
- Mock external dependencies
- Test both success and error cases

### Test Structure
```javascript
describe('Feature/Component', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  test('should do something specific', async () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedOutput);
  });
});
```

## Commit Messages

Use descriptive commit messages following this format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (white-space, formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

### Examples
```
feat(auth): add JWT token refresh functionality

fix(tasks): resolve issue with task assignment notifications

docs(api): update authentication endpoint documentation

test(auth): add unit tests for password validation
```

## Issue Reporting

### Bug Reports
When filing an issue, make sure to answer these questions:

1. What version of Node.js are you using?
2. What operating system are you using?
3. What did you do?
4. What did you expect to see?
5. What did you see instead?

### Feature Requests
We welcome feature requests! Please provide:

1. A clear description of the feature
2. Why you think it would be useful
3. Any implementation ideas you might have

## API Guidelines

### RESTful Principles
- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Use proper HTTP status codes
- Use consistent URL patterns
- Return JSON responses

### Error Handling
- Always return consistent error format
- Use appropriate HTTP status codes
- Include helpful error messages
- Log errors for debugging

### Authentication & Authorization
- All protected routes must use authentication middleware
- Check user permissions before allowing actions
- Don't expose sensitive data in responses

## Database Guidelines

### Schema Design
- Use appropriate data types
- Add proper indexes for query performance
- Include validation rules
- Use virtual fields for computed values

### Migrations
- Always backup before schema changes
- Test migrations on development data
- Make migrations reversible when possible

## Security Guidelines

### Input Validation
- Validate all user input
- Sanitize data before database operations
- Use parameterized queries to prevent injection

### Authentication
- Hash passwords with bcrypt
- Use secure JWT secrets
- Implement proper session management

### Environment Variables
- Never commit sensitive data
- Use environment variables for configuration
- Provide example configuration files

## Performance Guidelines

### Database Queries
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries

### Caching
- Cache expensive operations
- Use appropriate cache expiration
- Clear cache when data changes

### Rate Limiting
- Implement rate limiting for all public endpoints
- Use stricter limits for expensive operations
- Provide clear error messages when limits are exceeded

## Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document API endpoints thoroughly
- Keep README.md up to date

### API Documentation
- Update API_DOCUMENTATION.md for any API changes
- Include example requests and responses
- Document all query parameters and request bodies

## Deployment

### Environment Setup
- Use environment variables for configuration
- Ensure all dependencies are listed in package.json
- Test deployment on staging environment

### Database
- Use connection pooling
- Implement proper error handling
- Set up monitoring and alerts

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Questions?

Don't hesitate to ask questions by creating an issue or reaching out to the maintainers.

Thank you for contributing! 🎉
