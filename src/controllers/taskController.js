const Task = require('../models/Task');
const User = require('../models/User');

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      category, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search,
      dueDate
    } = req.query;

    // Build query
    let query = {};
    
    // For non-admin users, only show their own tasks or tasks assigned to them
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { owner: req.user._id },
          { 'assignedTo.user': req.user._id }
        ]
      };
    }

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    // Date filtering
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      query.dueDate = { $gte: date, $lt: nextDay };
    }

    query.isArchived = false;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('owner', 'firstName lastName email')
      .populate('assignedTo.user', 'firstName lastName email')
      .populate('assignedTo.assignedBy', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('owner', 'firstName lastName email')
      .populate('assignedTo.user', 'firstName lastName email')
      .populate('assignedTo.assignedBy', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName email')
      .populate('metadata.createdBy', 'firstName lastName email')
      .populate('metadata.lastModifiedBy', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' || 
                     task.owner._id.toString() === req.user._id.toString() ||
                     task.assignedTo.some(assignment => 
                       assignment.user._id.toString() === req.user._id.toString()
                     );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this task'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task'
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      owner: req.user._id,
      metadata: {
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      }
    };

    const task = new Task(taskData);
    await task.save();

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('owner', 'firstName lastName email')
      .populate('assignedTo.user', 'firstName lastName email')
      .populate('metadata.createdBy', 'firstName lastName email');

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    io.to(`user_${req.user._id}`).emit('taskCreated', populatedTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the task first
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'manager' ||
                   task.owner.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit this task'
      });
    }

    // Add metadata
    updates.metadata = {
      ...task.metadata,
      lastModifiedBy: req.user._id
    };

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email')
     .populate('assignedTo.user', 'firstName lastName email')
     .populate('metadata.lastModifiedBy', 'firstName lastName email');

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    
    // Notify task owner
    io.to(`user_${task.owner}`).emit('taskUpdated', updatedTask);
    
    // Notify assigned users
    task.assignedTo.forEach(assignment => {
      io.to(`user_${assignment.user}`).emit('taskUpdated', updatedTask);
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    const canDelete = req.user.role === 'admin' || 
                     task.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this task'
      });
    }

    await Task.findByIdAndDelete(id);

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    
    // Notify task owner
    io.to(`user_${task.owner}`).emit('taskDeleted', { taskId: id });
    
    // Notify assigned users
    task.assignedTo.forEach(assignment => {
      io.to(`user_${assignment.user}`).emit('taskDeleted', { taskId: id });
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
};

// Add comment to task
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const task = await Task.findById(id);
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

    await task.addComment(content, req.user._id);

    const updatedTask = await Task.findById(id)
      .populate('comments.author', 'firstName lastName email');

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    const newComment = updatedTask.comments[updatedTask.comments.length - 1];
    
    // Notify task owner
    io.to(`user_${task.owner}`).emit('commentAdded', { taskId: id, comment: newComment });
    
    // Notify assigned users
    task.assignedTo.forEach(assignment => {
      io.to(`user_${assignment.user}`).emit('commentAdded', { taskId: id, comment: newComment });
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
};

// Assign user to task
const assignUserToTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    const canAssign = req.user.role === 'admin' || 
                     req.user.role === 'manager' ||
                     task.owner.toString() === req.user._id.toString();

    if (!canAssign) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to assign users to this task'
      });
    }

    // Check if user exists
    const userToAssign = await User.findById(userId);
    if (!userToAssign) {
      return res.status(404).json({
        success: false,
        error: 'User to assign not found'
      });
    }

    await task.assignUser(userId, req.user._id);

    const updatedTask = await Task.findById(id)
      .populate('assignedTo.user', 'firstName lastName email')
      .populate('assignedTo.assignedBy', 'firstName lastName email');

    // Emit socket event for real-time updates
    const io = req.app.get('socketio');
    io.to(`user_${userId}`).emit('taskAssigned', updatedTask);

    res.json({
      success: true,
      message: 'User assigned to task successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Assign user to task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign user to task'
    });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    let matchQuery = { isArchived: false };
    
    // For non-admin users, only show stats for their tasks
    if (req.user.role !== 'admin') {
      matchQuery = {
        ...matchQuery,
        $or: [
          { owner: req.user._id },
          { 'assignedTo.user': req.user._id }
        ]
      };
    }

    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          overdue: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $nin: ['$status', ['completed', 'cancelled']] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task statistics'
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  assignUserToTask,
  getTaskStats
};
