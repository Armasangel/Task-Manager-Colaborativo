import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Trello, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import CreateBoardModal from '../components/CreateBoardModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
    } catch (error) {
      toast.error('Error al cargar tableros');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (boardData) => {
    try {
      const response = await api.post('/boards', boardData);
      setBoards([response.data, ...boards]);
      setShowCreateModal(false);
      toast.success('Tablero creado');
    } catch (error) {
      toast.error('Error al crear tablero');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Trello className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Create Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mis Tableros</h2>
            <p className="text-gray-600 mt-1">
              {boards.length} {boards.length === 1 ? 'tablero' : 'tableros'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Tablero
          </button>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16">
            <Trello className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay tableros todavía
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer tablero para empezar a organizar tus tareas
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Tablero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="group"
              >
                <div
                  className="rounded-xl p-6 h-32 flex flex-col justify-between transition-all hover:shadow-lg hover:scale-105"
                  style={{ backgroundColor: board.background }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {board.title}
                    </h3>
                    {board.description && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{board.members.length} miembros</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </div>
  );
};

export default Dashboard;