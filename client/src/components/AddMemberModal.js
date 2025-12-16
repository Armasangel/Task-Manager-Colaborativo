import React, { useState } from 'react';
import { X, UserPlus, Trash2, Crown, User } from 'lucide-react';

const AddMemberModal = ({ board, onClose, onAdd, onRemove }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd(email, role);
      setEmail('');
      setRole('member');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este miembro?')) {
      await onRemove(userId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Miembros del Tablero</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Member Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-gray-900">Agregar Miembro</h3>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field flex-1"
                placeholder="correo@ejemplo.com"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field w-32"
              >
                <option value="member">Miembro</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </form>

          {/* Members List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Miembros ({board.members.length})
            </h3>
            <div className="space-y-2">
              {board.members.map((member) => {
                const isOwner = member.user._id === board.owner._id;
                
                return (
                  <div
                    key={member.user._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {member.user.name}
                          {isOwner && (
                            <Crown className="w-4 h-4 text-yellow-500" title="Propietario" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        member.role === 'admin'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : 'Miembro'}
                      </span>

                      {!isOwner && (
                        <button
                          onClick={() => handleRemove(member.user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar miembro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Roles:</strong> Los admins pueden editar el tablero y gestionar miembros. 
              Los miembros solo pueden crear y editar tareas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;