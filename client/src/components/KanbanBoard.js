import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

const KanbanBoard = ({ board, tasks, onTasksChange }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const getTasksByColumn = (columnTitle) => {
    return tasks
      .filter((task) => task.column === columnTitle)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    const overColumn = over.data.current?.column;
    const overTask = tasks.find((t) => t._id === over.id);

    if (!activeTask) return;

    let newColumn = activeTask.column;
    let newOrder = activeTask.order;

    // Moving to a column
    if (overColumn) {
      newColumn = overColumn;
      const columnTasks = getTasksByColumn(newColumn);
      newOrder = columnTasks.length;
    }
    // Moving over another task
    else if (overTask) {
      newColumn = overTask.column;
      newOrder = overTask.order;
    }

    // If nothing changed, return
    if (newColumn === activeTask.column && newOrder === activeTask.order) {
      return;
    }

    // Update tasks locally
    const updatedTasks = [...tasks];
    const movedTaskIndex = updatedTasks.findIndex((t) => t._id === activeTask._id);
    
    // Remove from old position
    updatedTasks.splice(movedTaskIndex, 1);

    // Update task
    const movedTask = { ...activeTask, column: newColumn, order: newOrder };

    // Insert at new position
    const columnTasks = updatedTasks.filter((t) => t.column === newColumn);
    const insertIndex = updatedTasks.indexOf(columnTasks[newOrder]) || updatedTasks.length;
    updatedTasks.splice(insertIndex >= 0 ? insertIndex : updatedTasks.length, 0, movedTask);

    // Reorder tasks in the column
    const reorderedTasks = updatedTasks.map((task) => {
      if (task.column === newColumn) {
        const columnTasksOrdered = updatedTasks.filter((t) => t.column === newColumn);
        const index = columnTasksOrdered.indexOf(task);
        return { ...task, order: index };
      }
      return task;
    });

    onTasksChange(reorderedTasks);

    // Send to server
    try {
      const tasksToUpdate = reorderedTasks
        .filter((t) => t.column === newColumn)
        .map((t) => ({
          id: t._id,
          column: t.column,
          order: t.order,
        }));

      await api.patch('/tasks/reorder', { tasks: tasksToUpdate });
    } catch (error) {
      toast.error('Error al mover la tarea');
      // Revert changes
      onTasksChange(tasks);
    }
  };

  const handleCreateTask = (columnTitle) => {
    setSelectedColumn(columnTitle);
    setShowCreateTask(true);
  };

  const handleTaskCreated = async (taskData) => {
    try {
      await api.post('/tasks', {
        ...taskData,
        board: board._id,
        column: selectedColumn,
      });
      setShowCreateTask(false);
    } catch (error) {
      toast.error('Error al crear la tarea');
      throw error;
    }
  };

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.title}
              column={column}
              tasks={getTasksByColumn(column.title)}
              onAddTask={handleCreateTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showCreateTask && (
        <CreateTaskModal
          board={board}
          column={selectedColumn}
          onClose={() => setShowCreateTask(false)}
          onCreate={handleTaskCreated}
        />
      )}
    </>
  );
};

export default KanbanBoard;