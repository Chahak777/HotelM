const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all staff members (Admin)
router.get('/members', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const staff = await User.find({ role: 'Staff' }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET tasks (Admin: all, Staff: assigned or all)
router.get('/tasks', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const filter = req.user.role === 'Staff' ? { assignedTo: req.user.id } : {};
    const tasks = await Task.find(filter).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE task (Admin)
router.post('/tasks', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { title, description, assignedTo, priority } = req.body;
    const task = new Task({ title, description, assignedTo, priority });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE task status
router.patch('/tasks/:id', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
