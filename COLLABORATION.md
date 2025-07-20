# Team Collaboration Guide

## 🚀 Getting Started

### For New Team Members

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TheDeadpool007/Task_manager.git
   cd Task_manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   node server-memory.js
   ```

4. **Open the application:**
   - Server runs on: http://localhost:3000
   - Frontend available at: http://localhost:3000

## 🔄 Git Workflow

### Daily Development Process

1. **Always start with latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # Examples:
   # git checkout -b feature/user-notifications
   # git checkout -b feature/task-comments
   # git checkout -b bugfix/login-issue
   ```

3. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add user notifications feature"
   ```

4. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request:**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Add description of changes
   - Request review from team members

6. **After PR is approved and merged:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature-name
   ```

## 📝 Commit Message Convention

Use clear, descriptive commit messages:

- `feat: add new feature`
- `fix: resolve bug in authentication`
- `docs: update README documentation`
- `style: improve CSS styling`
- `refactor: reorganize task management code`
- `test: add unit tests for user service`

## 🏗️ Project Structure

```
Task_manager/
├── frontend/           # Frontend files
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles
│   └── app-simple.js  # JavaScript logic
├── server-memory.js   # Backend server
├── package.json       # Dependencies
├── README.md          # Documentation
└── .gitignore        # Git ignore rules
```

## 🔧 Development Guidelines

### Before Starting Work:
1. Check existing issues/tasks
2. Communicate with team about what you're working on
3. Pull latest changes from main branch

### Code Quality:
1. Test your changes thoroughly
2. Follow existing code style
3. Add comments for complex logic
4. Update documentation if needed

### Before Submitting PR:
1. Test the entire application
2. Ensure no console errors
3. Check responsive design works
4. Verify all features still function

## 🐛 Issue Reporting

When reporting bugs or requesting features:

1. **Create GitHub Issues:**
   - Go to repository → Issues → New Issue
   - Use descriptive titles
   - Include steps to reproduce (for bugs)
   - Add screenshots if helpful

2. **Label your issues:**
   - `bug` - Something isn't working
   - `enhancement` - New feature request
   - `documentation` - Documentation needs
   - `good first issue` - Good for newcomers

## 📋 Task Assignment

### Using GitHub Projects (Recommended):
1. Create project board in GitHub
2. Add columns: To Do, In Progress, Review, Done
3. Convert issues to cards
4. Assign team members to cards

### Alternative - Simple Issue Assignment:
1. Create issues for each task
2. Assign team members to issues
3. Use labels to categorize work
4. Close issues when work is complete

## 🔒 Environment Setup

### Required Environment Variables:
```bash
# Create .env file (not tracked in Git)
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development

# Optional API Keys
OPENROUTER_API_KEY=your-openrouter-key
TOGETHER_API_KEY=your-together-key
```

### Database Setup:
- Currently using in-memory storage
- For production: Set up MongoDB
- Update connection string in server file

## 🚀 Deployment

### Production Deployment:
1. Set up hosting (Heroku, Vercel, Railway, etc.)
2. Configure environment variables
3. Set up MongoDB database
4. Update API endpoints
5. Test production build

## 📞 Communication

### Recommended Tools:
- **GitHub Issues** - For bug reports and feature requests
- **Pull Request Comments** - For code review discussions
- **Slack/Discord** - For real-time team communication
- **GitHub Discussions** - For general project discussions

## 🆘 Getting Help

### Common Issues:
1. **Server won't start:** Check if port 3000 is available
2. **Dependencies missing:** Run `npm install`
3. **Git conflicts:** Ask team member for help with merge
4. **Feature not working:** Check browser console for errors

### Getting Support:
1. Check existing GitHub issues
2. Ask in team chat
3. Create new issue if problem persists
4. Include error messages and screenshots

## 🎯 Best Practices

### Code Organization:
- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic
- Separate concerns (HTML, CSS, JS)

### Git Best Practices:
- Commit often with small changes
- Write clear commit messages
- Don't commit sensitive data
- Always test before pushing

### Collaboration:
- Communicate early and often
- Review others' code constructively
- Ask questions if unsure
- Share knowledge with team

---

Happy coding! 🎉
