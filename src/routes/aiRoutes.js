const express = require('express');
const router = express.Router();
const { getProductivityTip } = require('../services/aiService');
const auth = require('../middleware/auth');

// @route   POST api/ai/tip
// @desc    Get a productivity tip for a task
// @access  Private
router.post('/tip', auth, async (req, res) => {
    const { taskTitle } = req.body;

    if (!taskTitle) {
        return res.status(400).json({ msg: 'Task title is required' });
    }

    try {
        const tip = await getProductivityTip(taskTitle);
        res.json({ tip });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
