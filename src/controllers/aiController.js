const aiService = require('../services/aiService');
const Task = require('../models/Task');

// Generate productivity tip for a task
const generateProductivityTip = async (req, res) => {
  try {
    const { taskDescription, priority = 'medium', category = 'general' } = req.body;

    if (!taskDescription || taskDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Task description must be at least 10 characters long'
      });
    }

    const tip = await aiService.generateProductivityTip(
      taskDescription,
      req.user._id.toString(),
      priority,
      category
    );

    res.json({
      success: true,
      data: { 
        tip,
        usage: aiService.getUserUsage(req.user._id.toString())
      }
    });
  } catch (error) {
    console.error('Generate productivity tip error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate productivity tip'
    });
  }
};

// Generate productivity tip for an existing task
const generateTipForTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' || 
                     task.owner.toString() === req.user._id.toString() ||
                     task.assignedTo.some(assignment => 
                       assignment.user.toString() === req.user._id.toString()
                     );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this task'
      });
    }

    const taskDescription = `${task.title}: ${task.description}`;
    const tip = await aiService.generateProductivityTip(
      taskDescription,
      req.user._id.toString(),
      task.priority,
      task.category
    );

    res.json({
      success: true,
      data: { 
        tip,
        task: {
          id: task._id,
          title: task.title,
          priority: task.priority,
          category: task.category
        },
        usage: aiService.getUserUsage(req.user._id.toString())
      }
    });
  } catch (error) {
    console.error('Generate tip for task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate productivity tip for task'
    });
  }
};

// Get AI usage statistics for the user
const getUsageStats = async (req, res) => {
  try {
    const usage = aiService.getUserUsage(req.user._id.toString());
    
    res.json({
      success: true,
      data: { usage }
    });
  } catch (error) {
    console.error('Get AI usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI usage statistics'
    });
  }
};

// Generate multiple tips for different aspects of a task
const generateComprehensiveTips = async (req, res) => {
  try {
    const { taskDescription, priority = 'medium', category = 'general' } = req.body;

    if (!taskDescription || taskDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Task description must be at least 10 characters long'
      });
    }

    const userId = req.user._id.toString();
    const usage = aiService.getUserUsage(userId);

    // Check if user has enough quota for multiple tips (requires 3 API calls)
    if (usage.remaining < 3) {
      return res.status(429).json({
        success: false,
        error: 'Insufficient AI quota for comprehensive tips',
        usage
      });
    }

    // Generate tips for different aspects
    const tips = await Promise.allSettled([
      aiService.generateProductivityTip(
        `Planning approach for: ${taskDescription}`,
        userId,
        priority,
        category
      ),
      aiService.generateProductivityTip(
        `Time management for: ${taskDescription}`,
        userId,
        priority,
        category
      ),
      aiService.generateProductivityTip(
        `Focus strategies for: ${taskDescription}`,
        userId,
        priority,
        category
      )
    ]);

    const comprehensiveTips = {
      planning: tips[0].status === 'fulfilled' ? tips[0].value : null,
      timeManagement: tips[1].status === 'fulfilled' ? tips[1].value : null,
      focus: tips[2].status === 'fulfilled' ? tips[2].value : null
    };

    res.json({
      success: true,
      data: { 
        tips: comprehensiveTips,
        usage: aiService.getUserUsage(userId)
      }
    });
  } catch (error) {
    console.error('Generate comprehensive tips error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive productivity tips'
    });
  }
};

// Generate daily productivity insights based on user's tasks
const generateDailyInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's tasks for today and upcoming
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysTasks = await Task.find({
      $or: [
        { owner: userId },
        { 'assignedTo.user': userId }
      ],
      dueDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['completed', 'cancelled'] },
      isArchived: false
    }).sort({ priority: -1, dueDate: 1 });

    if (todaysTasks.length === 0) {
      return res.json({
        success: true,
        data: {
          insight: {
            tip: "Great! You have no urgent tasks due today. Consider using this time to work on future tasks or plan ahead for upcoming deadlines.",
            source: 'Daily Insights',
            type: 'no-urgent-tasks'
          },
          tasksCount: 0
        }
      });
    }

    // Create a summary of today's tasks
    const taskSummary = todaysTasks.map(task => 
      `${task.priority} priority ${task.category} task: ${task.title}`
    ).join('. ');

    const tip = await aiService.generateProductivityTip(
      `Daily planning for multiple tasks: ${taskSummary}`,
      userId.toString(),
      'high',
      'planning'
    );

    res.json({
      success: true,
      data: { 
        insight: tip,
        tasksCount: todaysTasks.length,
        taskBreakdown: {
          urgent: todaysTasks.filter(t => t.priority === 'urgent').length,
          high: todaysTasks.filter(t => t.priority === 'high').length,
          medium: todaysTasks.filter(t => t.priority === 'medium').length,
          low: todaysTasks.filter(t => t.priority === 'low').length
        },
        usage: aiService.getUserUsage(userId.toString())
      }
    });
  } catch (error) {
    console.error('Generate daily insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily productivity insights'
    });
  }
};

module.exports = {
  generateProductivityTip,
  generateTipForTask,
  getUsageStats,
  generateComprehensiveTips,
  generateDailyInsights
};
