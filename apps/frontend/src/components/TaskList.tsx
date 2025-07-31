import React from 'react';
import { Task } from '../redux/slices/tasksSlice';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
          No tasks found
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
          Tasks ({tasks.length})
        </h2>
      </div>

      <div>
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="task-title">{task.title}</div>
                <div className="task-description">{task.description}</div>
                
                <div className="task-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`task-status ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <span style={{ 
                      color: getPriorityColor(task.priority),
                      fontWeight: '500'
                    }}>
                      {task.priority} priority
                    </span>
                    <span>Created: {formatDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => onEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList; 