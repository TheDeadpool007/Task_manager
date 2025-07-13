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

## 🚀 Quick Start

### 1. Clone the Repository
The project is already set up in your current directory.

### 2. Dependencies Already Installed
All dependencies have been installed with npm.

### 3. Environment Setup
A `.env` file has been created with default settings. For production, update these values:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/taskmanager
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager

# JWT Configuration (CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# External API Keys (Optional - for AI features)
OPENROUTER_API_KEY=your-openrouter-api-key
TOGETHER_API_KEY=your-together-api-key
```

### 4. Database Setup

**Option A: Local MongoDB**
1. Install and start MongoDB locally
2. The app will connect to `mongodb://localhost:27017/taskmanager`

**Option B: MongoDB Atlas (Recommended)**
1. Create a free MongoDB Atlas account
2. Create a cluster and get the connection string
3. Update `MONGODB_URI` in `.env` file

**Option C: Docker (Easiest)**
```bash
docker-compose up -d mongo
```

### 5. Create Admin User
```bash
npm run setup
```
This creates an admin user:
- Email: `admin@taskmanager.com`
- Password: `AdminPass123`

### 6. Start the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### 7. Test the API
Open your browser and visit:
- `http://localhost:5000` - API info
- `http://localhost:5000/health` - Health check
- `http://localhost:5000/api/quotes/random` - Get a random quote

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/users` | Get all users (admin) | Yes |

### Task Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get tasks with filtering | Yes |
| GET | `/api/tasks/stats` | Get task statistics | Yes |
| GET | `/api/tasks/:id` | Get specific task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| POST | `/api/tasks/:id/comments` | Add comment | Yes |
| POST | `/api/tasks/:id/assign` | Assign user | Yes |

### Quote Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/quotes/random` | Get random quote | No |
| GET | `/api/quotes/daily` | Get daily quote | No |
| GET | `/api/quotes/category/:category` | Get quotes by category | No |
| GET | `/api/quotes/multiple` | Get multiple quotes | No |

### AI Productivity Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/tip` | Generate productivity tip | Yes |
| POST | `/api/ai/tip/comprehensive` | Get comprehensive tips | Yes |
| POST | `/api/ai/tasks/:id/tip` | Get tip for specific task | Yes |
| GET | `/api/ai/insights/daily` | Get daily insights | Yes |
| GET | `/api/ai/usage` | Get AI usage stats | Yes |

## 🏗️ Project Structure

```
task-manager/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── quoteController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── quotes.js
│   │   └── ai.js
│   └── services/
│       ├── aiService.js
│       └── quoteService.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For support, email your-email@example.com or create an issue in the repository.

## 🚧 Roadmap

- [ ] Email notifications
- [ ] File attachments
- [ ] Task templates
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Integrations (Slack, Teams)
- [ ] Recurring tasks
- [ ] Time tracking

---

Built with ❤️ using Node.js and modern web technologies.
