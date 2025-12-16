import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Settings, UserPlus, Users } from 'lucide-react';
import api from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard';
import AddMemberModal from '../components/AddMemberModal';
import BoardSettingsModal from '../components/BoardSettingsModal';

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchBoard();
    fetchTasks();

    // Connect socket
    socketService.connect();
    socketService.joinBoard(id);

    // Socket listeners
    socketService.on('task-created', handleTaskCreated);
    socketService.on('task-updated', handleTaskUpdated);
    socketService.on('task-deleted', handleTaskDeleted);
    socketService.on('tasks-reordered', handleTasksReordered);
    socketService.on('board-updated', handleBoardUpdated);
    socketService.on('member-added', handleMemberAdded);
    socketService.on('member-removed', handleMemberRemoved);

    return () => {
      socketService.leaveBoard(id);
      socketService.off('task-created', handleTaskCreated);
      socketService.off('task-updated', handleTaskUpdated);
      socketService.off('task-deleted', handleTaskDeleted);
      socketService.off('tasks-reordered', handleTasksReordered);
      socketService.off('board-updated', handleBoardUpdated);
      socketService.off('member-added', handleMemberAdded);
      socketService.off('member-removed', handleMemberRemoved);
    };
  }, [id]);

  const fetchBoard = async () => {
    try {
      const response = await api.get(`/boards/${id}`);
      setBoard(response.data);
    } catch (error) {
      toast.error('Error al cargar el tablero');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/board/${id}`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Error al cargar las tareas');
    }
  };

  // Socket handlers
  const handleTaskCreated = (task) => {
    if (task.board === id) {
      setTasks((prev) => [...prev, task]);
      toast.success('Nueva tarea creada');
    }
  };

  const handleTaskUpdated = (task) => {
    if (task.board === id) {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    toast.success('Tarea eliminada');
  };

  const handleTasksReordered = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  const handleBoardUpdated = (updatedBoard) => {
    if (updatedBoard._id === id) {
      setBoard(updatedBoard);
      toast.success('Tablero actualizado');
    }
  };

  const handleMemberAdded = ({ boardId, member }) => {
    if (boardId === id) {
      setBoard((prev) => ({
        ...prev,
        members: [...prev.members, member],
      }));
      toast.success('Miembro agregado');
    }
  };

  const handleMemberRemoved = ({ boardId, userId }) => {
    if (boardId === id) {
      setBoard((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.user._id !== userId),
      }));
      toast.success('Miembro eliminado');
    }
  };

  const handleAddMember = async (email, role) => {
    try {
      await api.post(`/boards/${id}/members`, { email, role });
      setShowAddMember(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al agregar miembro');
      throw error;
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/boards/${id}/members/${userId}`);
    } catch (error) {
      toast.error('Error al eliminar miembro');
    }
  };

  const handleUpdateBoard = async (data) => {
    try {
      await api.put(`/boards/${id}`, data);
      setShowSettings(false);
    } catch (error) {
      toast.error('Error al actualizar tablero');
      throw error;
    }
  };

  const handleDeleteBoard = async () => {
    try {
      await api.delete(`/boards/${id}`);
      toast.success('Tablero eliminado');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar tablero');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: board.background }}
    >
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{board.title}</h1>
                {board.description && (
                  <p className="text-sm text-white/70">{board.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Members */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {board.members.slice(0, 3).map((member) => (
                    <div
                      key={member.user._id}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-white/20 text-sm font-medium text-primary-600"
                      title={member.user.name}
                    >
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {board.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/20 text-xs font-medium text-white">
                      +{board.members.length - 3}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Agregar miembro"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="p-4 sm:p-6 lg:p-8">
        <KanbanBoard
          board={board}
          tasks={tasks}
          onTasksChange={setTasks}
        />
      </main>

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          board={board}
          onClose={() => setShowAddMember(false)}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
        />
      )}

      {showSettings && (
        <BoardSettingsModal
          board={board}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdateBoard}
          onDelete={handleDeleteBoard}
        />
      )}
    </div>
  );
};

export default Board;