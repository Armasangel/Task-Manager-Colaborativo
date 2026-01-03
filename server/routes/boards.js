const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all boards for user
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ updatedAt: -1 });

    res.json(boards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single board
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Check if user has access
    const hasAccess = board.owner._id.equals(req.user._id) || 
                      board.members.some(m => m.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'No tienes acceso a este tablero' });
    }

    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create board
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, background } = req.body;

    const board = new Board({
      title,
      description,
      background,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await board.save();
    await board.populate('owner', 'name email');
    await board.populate('members.user', 'name email');

    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Check if user is admin
    const isAdmin = board.owner.equals(req.user._id) ||
                    board.members.some(m => m.user.equals(req.user._id) && m.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para editar este tablero' });
    }

    const { title, description, background } = req.body;

    if (title) board.title = title;
    if (description !== undefined) board.description = description;
    if (background) board.background = background;

    await board.save();
    await board.populate('owner', 'name email');
    await board.populate('members.user', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    io.to(board._id.toString()).emit('board-updated', board);

    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Only owner can delete
    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Solo el propietario puede eliminar el tablero' });
    }

    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tablero eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Check if user is admin
    const isAdmin = board.owner.equals(req.user._id) ||
                    board.members.some(m => m.user.equals(req.user._id) && m.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para agregar miembros' });
    }

    // Find user
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if already a member
    if (board.members.some(m => m.user.equals(userToAdd._id))) {
      return res.status(400).json({ error: 'El usuario ya es miembro' });
    }

    board.members.push({ user: userToAdd._id, role });
    await board.save();
    await board.populate('members.user', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    const newMember = board.members[board.members.length - 1];
    io.to(board._id.toString()).emit('member-added', {
      boardId: board._id,
      member: newMember
    });

    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    // Check if user is admin
    const isAdmin = board.owner.equals(req.user._id) ||
                    board.members.some(m => m.user.equals(req.user._id) && m.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar miembros' });
    }

    // Can't remove owner
    if (board.owner.equals(req.params.userId)) {
      return res.status(400).json({ error: 'No se puede eliminar al propietario' });
    }

    board.members = board.members.filter(m => !m.user.equals(req.params.userId));
    await board.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(board._id.toString()).emit('member-removed', {
      boardId: board._id,
      userId: req.params.userId
    });

    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;