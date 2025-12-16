import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ column, tasks, onAddTask }) => {
  const { setNodeRef } = useDroppable({
    id: `column-${column.title}`,
    data: { column: column.title },
  });

  const taskIds = tasks.map((task) => task._id);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(column.title)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar tarea
          </button>
        </div>

        {/* Tasks List */}
        <div
          ref={setNodeRef}
          className="p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No hay tareas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;