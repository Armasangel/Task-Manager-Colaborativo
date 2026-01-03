const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Board = require('../models/Board');
const auth = require('../middleware/auth');

// Get all tasks for a board
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Check access
    const hasAccess = board.owner.equals(req.user._id) ||
                      board.members.some(m => m.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'No tienes acceso a este tablero' });
    }

    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { board: boardId, column, title, description, priority, assignedTo, dueDate, tags } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Check access
    const hasAccess = board.owner.equals(req.user._id) ||
                      board.members.some(m => m.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'No tienes acceso a este tablero' });
    }

    // Get max order for column
    const maxOrder = await Task.findOne({ board: boardId, column }).sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const task = new Task({
      board: boardId,
      column,
      title,
      description,
      priority,
      assignedTo,
      dueDate,
      tags,
      order,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    io.to(boardId).emit('task-created', task);

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const board = await Board.findById(task.board);

    // Check access
    const hasAccess = board.owner.equals(req.user._id) ||
                      board.members.some(m => m.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'No tienes acceso a esta tarea' });
    }

    const { title, description, priority, assignedTo, dueDate, tags, column } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;
    if (column) task.column = column;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    io.to(task.board.toString()).emit('task-updated', task);

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const board = await Board.findById(task.board);

    // Check access
    const hasAccess = board.owner.equals(req.user._id) ||
                      board.members.some(m => m.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'No tienes acceso a esta tarea' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    io.to(task.board.toString()).emit('task-deleted', req.params.id);

    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reorder tasks (drag & drop)
router.patch('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Se requiere un array de tareas' });
    }

    // Update all tasks
    const updatePromises = tasks.map(({ id, column, order }) =>
      Task.findByIdAndUpdate(id, { column, order }, { new: true })
    );

    const updatedTasks = await Promise.all(updatePromises);

    // Get board ID from first task
    if (updatedTasks.length > 0 && updatedTasks[0]) {
      const allTasks = await Task.find({ board: updatedTasks[0].board })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ order: 1 });

      // Emit socket event
      const io = req.app.get('io');
      io.to(updatedTasks[0].board.toString()).emit('tasks-reordered', allTasks);
    }

    res.json({ message: 'Tareas reordenadas' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;