import React, { useState } from 'react';
import { X } from 'lucide-react';

const BACKGROUND_COLORS = [
  '#4c6ef5',
  '#f06595',
  '#20c997',
  '#fab005',
  '#ff6b6b',
  '#7950f2',
  '#1098ad',
  '#fd7e14',
];

const CreateBoardModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState(BACKGROUND_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreate({ title, description, background });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Tablero</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Tablero *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Ej: Proyecto Marketing"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Describe de qué trata este tablero..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color de Fondo
            </label>
            <div className="grid grid-cols-4 gap-3">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBackground(color)}
                  className={`h-12 rounded-lg transition-all ${
                    background === color
                      ? 'ring-4 ring-primary-300 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Previa
            </label>
            <div
              className="rounded-xl p-6 h-32"
              style={{ backgroundColor: background }}
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {title || 'Título del Tablero'}
              </h3>
              {description && (
                <p className="text-white/80 text-sm line-clamp-2">{description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Tablero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;