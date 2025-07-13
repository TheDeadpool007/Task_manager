# Task Manager Frontend

A modern, responsive web interface for the Task Manager application built with vanilla HTML, CSS, and JavaScript.

## Features

🎨 **Modern Design**
- Clean, professional interface with light/dark theme support
- Responsive design that works on desktop, tablet, and mobile
- Smooth animations and transitions

📊 **Dashboard**
- Real-time task statistics
- Recent tasks overview
- Daily motivational quotes
- Quick task creation

✅ **Task Management**
- Kanban-style board with drag & drop
- Create, edit, and delete tasks
- Priority levels and status tracking
- Tags and due dates
- Real-time updates via Socket.io

👤 **User Management**
- Secure authentication (login/register)
- User profile management
- Role-based access control

💡 **Motivation Center**
- Inspirational quotes from external APIs
- AI-powered productivity tips
- Refresh functionality for new content

## Getting Started

### Method 1: Integrated with Backend (Recommended)

The frontend is automatically served by the backend server:

1. Start the backend server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

### Method 2: Standalone Development Server

For frontend development with live reloading:

1. Start the backend API server:
   ```bash
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   npm run frontend
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Configuration

The frontend automatically connects to the backend API at `http://localhost:3001/api`.

To change the API endpoint, modify the `CONFIG` object in `app.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://your-backend-url/api',
    SOCKET_URL: 'http://your-backend-url'
};
```

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and CSS Custom Properties
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Socket.io Client** - Real-time communication
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Inter)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # Complete CSS styles
├── app.js             # Main JavaScript application
└── README.md          # This file
```

## Key Features

### Authentication
- JWT-based authentication
- Persistent login state
- Secure token storage

### Real-time Updates
- Live task updates across all connected clients
- Instant notifications for task changes
- WebSocket connection with automatic reconnection

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface

### Dark/Light Theme
- System preference detection
- Manual theme toggle
- Persistent theme selection

### Drag & Drop
- Intuitive task status updates
- Visual feedback during drag operations
- Touch support for mobile devices

## API Integration

The frontend integrates with these backend endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - User profile
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/quotes/daily` - Daily quote
- `GET /api/quotes/random` - Random quote
- `GET /api/ai/tip` - AI productivity tip

## Contributing

1. Make sure the backend is running
2. Test your changes across different screen sizes
3. Verify dark/light theme compatibility
4. Check real-time functionality with multiple browser tabs
5. Ensure accessibility standards are met

## Troubleshooting

**Frontend not loading:**
- Check that the backend server is running on port 3001
- Verify CORS settings in server.js
- Check browser console for errors

**Real-time updates not working:**
- Ensure Socket.io connection is established
- Check network connectivity
- Verify authentication token is valid

**Styling issues:**
- Clear browser cache and reload
- Check for CSS custom property support
- Verify viewport meta tag is present
