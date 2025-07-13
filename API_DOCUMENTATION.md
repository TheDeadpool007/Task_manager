# Task Manager API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": "string (optional)",
  "data": object,
  "error": "string (only on errors)"
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user" // optional: admin, manager, user
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token",
    "expiresIn": "30d"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

## Task Endpoints

### Get Tasks
```http
GET /api/tasks?page=1&limit=10&status=pending&priority=high&category=work&search=keyword
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `status` (string): pending, in-progress, completed, cancelled
- `priority` (string): low, medium, high, urgent
- `category` (string): work, personal, study, health, finance, other
- `search` (string): Search in title, description, and tags
- `sortBy` (string): Field to sort by (default: createdAt)
- `sortOrder` (string): asc or desc (default: desc)
- `dueDate` (string): Filter by due date (YYYY-MM-DD)

### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Finish the Q4 project proposal document",
  "priority": "high",
  "category": "work",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "estimatedHours": 8,
  "tags": ["urgent", "q4", "proposal"]
}
```

### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "in-progress",
  "actualHours": 4
}
```

### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Add Comment
```http
POST /api/tasks/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a comment on the task"
}
```

### Assign User to Task
```http
POST /api/tasks/:id/assign
Authorization: Bearer <token> (manager/admin only)
Content-Type: application/json

{
  "userId": "user_id_to_assign"
}
```

### Get Task Statistics
```http
GET /api/tasks/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 25,
      "pending": 10,
      "inProgress": 8,
      "completed": 6,
      "cancelled": 1,
      "overdue": 3
    }
  }
}
```

## Quote Endpoints (Public)

### Get Random Quote
```http
GET /api/quotes/random
```

### Get Daily Quote
```http
GET /api/quotes/daily
```

### Get Quotes by Category
```http
GET /api/quotes/category/:category
```

**Categories:** motivational, inspirational, success, wisdom, leadership, perseverance

### Get Multiple Quotes
```http
GET /api/quotes/multiple?count=5
```

## AI Productivity Endpoints

### Generate Productivity Tip
```http
POST /api/ai/tip
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskDescription": "Write a comprehensive report on market analysis",
  "priority": "high",
  "category": "work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tip": {
      "tip": "Break this high-priority task into smaller sections: data collection, analysis, and writing. Use the Pomodoro Technique with 25-minute focused sessions.",
      "source": "OpenRouter AI",
      "model": "WizardLM-2",
      "category": "work",
      "priority": "high"
    },
    "usage": {
      "dailyUsage": 5,
      "dailyLimit": 50,
      "remaining": 45
    }
  }
}
```

### Generate Tip for Existing Task
```http
POST /api/ai/tasks/:taskId/tip
Authorization: Bearer <token>
```

### Generate Comprehensive Tips
```http
POST /api/ai/tip/comprehensive
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskDescription": "Write a comprehensive report",
  "priority": "high",
  "category": "work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tips": {
      "planning": { "tip": "...", "source": "..." },
      "timeManagement": { "tip": "...", "source": "..." },
      "focus": { "tip": "...", "source": "..." }
    },
    "usage": { ... }
  }
}
```

### Get Daily Insights
```http
GET /api/ai/insights/daily
Authorization: Bearer <token>
```

### Get AI Usage Statistics
```http
GET /api/ai/usage
Authorization: Bearer <token>
```

## Admin Endpoints

### Get All Users
```http
GET /api/auth/users?page=1&limit=10&role=user&isActive=true
Authorization: Bearer <token> (admin only)
```

### Update User Role
```http
PUT /api/auth/users/:userId/role
Authorization: Bearer <token> (admin only)
Content-Type: application/json

{
  "role": "manager"
}
```

### Deactivate User
```http
PUT /api/auth/users/:userId/deactivate
Authorization: Bearer <token> (admin only)
```

## WebSocket Events

The application uses Socket.io for real-time updates. Connect to the server with authentication:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events Emitted by Server

- `taskCreated` - New task created
- `taskUpdated` - Task updated
- `taskDeleted` - Task deleted
- `commentAdded` - New comment added
- `taskAssigned` - User assigned to task

### Example Event Data
```javascript
socket.on('taskCreated', (task) => {
  console.log('New task created:', task);
});

socket.on('taskUpdated', (task) => {
  console.log('Task updated:', task);
});

socket.on('commentAdded', ({ taskId, comment }) => {
  console.log('New comment on task:', taskId, comment);
});
```

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- AI endpoints: 10 requests per 15 minutes per IP
- AI daily quota: 50 requests per user per day

## Data Models

### User
```javascript
{
  "_id": "ObjectId",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "admin|manager|user",
  "isActive": "boolean",
  "lastLogin": "Date",
  "preferences": {
    "theme": "light|dark|auto",
    "notifications": {
      "email": "boolean",
      "push": "boolean",
      "sms": "boolean"
    },
    "language": "string"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Task
```javascript
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "status": "pending|in-progress|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "category": "work|personal|study|health|finance|other",
  "dueDate": "Date",
  "owner": "ObjectId (User)",
  "assignedTo": [{
    "user": "ObjectId (User)",
    "assignedAt": "Date",
    "assignedBy": "ObjectId (User)"
  }],
  "tags": ["string"],
  "comments": [{
    "content": "string",
    "author": "ObjectId (User)",
    "createdAt": "Date",
    "updatedAt": "Date"
  }],
  "completedAt": "Date",
  "estimatedHours": "number",
  "actualHours": "number",
  "isArchived": "boolean",
  "metadata": {
    "createdBy": "ObjectId (User)",
    "lastModifiedBy": "ObjectId (User)"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
