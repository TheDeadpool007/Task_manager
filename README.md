# Task Manager Application

A comprehensive task management application built with Node.js, Express.js, MongoDB, and Socket.io. Features JWT authentication, role-based access control, real-time updates, AI productivity tips, and motivational quotes.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based registration and login
- **Role-Based Access Control**: Admin, Manager, and User roles
- **Task Management**: Full CRUD operations with advanced filtering
- **Real-Time Updates**: Socket.io for live task updates
- **Comments System**: Task discussions with real-time notifications
- **User Assignment**: Assign tasks to team members

### Advanced Features
- **AI Productivity Tips**: OpenRouter.ai/Together.ai integration for task-specific advice
- **Motivational Quotes**: Daily quotes from ZenQuotes.io and Quotable.io
- **Task Statistics**: Comprehensive analytics and insights
- **Advanced Filtering**: Filter by status, priority, category, due date
- **Search Functionality**: Full-text search across tasks
- **Rate Limiting**: API protection and AI usage quotas

### Security & Performance
- **Secure Authentication**: bcrypt password hashing
- **Input Validation**: express-validator middleware
- **Security Headers**: Helmet.js protection
- **CORS Configuration**: Cross-origin resource sharing
- **Error Handling**: Centralized error management
- **Caching**: In-memory caching for improved performance

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Security**: Helmet, bcrypt, express-validator
- **External APIs**: OpenRouter.ai, Together.ai, ZenQuotes.io, Quotable.io
- **Development**: Nodemon, Jest (testing)

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Git



## 🔒 User Roles & Permissions

### User (Default)
- Manage own tasks
- View assigned tasks
- Add comments to accessible tasks
- Get AI productivity tips
- Access quotes

### Manager
- All User permissions
- Assign tasks to other users
- View team tasks
- Manage team task assignments

### Admin
- All Manager permissions
- User management (view, update roles, deactivate)
- Access to all tasks
- System-wide statistics

## 🔄 Real-Time Features

The application uses Socket.io for real-time updates:

- **Task Creation**: Notify relevant users
- **Task Updates**: Broadcast changes to task participants
- **Task Deletion**: Notify affected users
- **Comments**: Real-time comment notifications
- **Task Assignment**: Instant assignment notifications

## 🤖 AI Integration

### Supported Providers
- **OpenRouter.ai**: Multiple LLM models
- **Together.ai**: Open-source models

### AI Features
- Task-specific productivity tips
- Comprehensive task analysis
- Daily productivity insights
- Rate limiting and caching
- Fallback to predefined tips

## 📊 MongoDB Schema

### User Schema
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (admin/manager/user),
  isActive: Boolean,
  preferences: Object,
  timestamps: true
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  status: String (pending/in-progress/completed/cancelled),
  priority: String (low/medium/high/urgent),
  category: String,
  dueDate: Date,
  owner: ObjectId (User),
  assignedTo: Array,
  tags: Array,
  comments: Array,
  metadata: Object,
  timestamps: true
}
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Configure proper CORS origins
4. Set secure JWT secrets
5. Add real API keys

### Supported Platforms
- **Vercel**: Serverless deployment
- **Railway**: Container deployment
- **Render**: Full-stack hosting
- **Heroku**: Platform as a Service

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] API keys added
- [ ] CORS origins updated
- [ ] SSL/HTTPS enabled
- [ ] Monitoring setup

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🛡️ Security Features

- JWT token authentication
- bcrypt password hashing
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers (Helmet.js)
- Environment variable protection
- Error message sanitization

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Build project
npm run build
```

## 📝 API Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project proposal",
    "description": "Finish the Q4 project proposal document",
    "priority": "high",
    "category": "work",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

### Get AI Productivity Tip
```bash
curl -X POST http://localhost:5000/api/ai/tip \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "taskDescription": "Write a comprehensive report on market analysis",
    "priority": "high",
    "category": "work"
  }'
```

---

Built with ❤️ using Node.js and modern web technologies.
