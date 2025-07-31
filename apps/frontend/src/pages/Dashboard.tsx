import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { fetchTasks, createTask, deleteTask, updateTask } from '../redux/slices/tasksSlice';
import { getCurrentUser, logout } from '../redux/slices/authSlice';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Task } from '../redux/slices/tasksSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(getCurrentUser() as any);
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    // Fetch tasks if authenticated
    if (isAuthenticated) {
      dispatch(fetchTasks() as any);
    }
  }, [dispatch, isAuthenticated]);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch(createTask(taskData) as any);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (id: string, taskData: Partial<Task>) => {
    dispatch(updateTask({ id, taskData }) as any);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id) as any);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <Header onAddTask={() => setShowTaskForm(true)} />
        
        <div className="container">
          {error && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}
          
          {showTaskForm && (
            <TaskForm
              task={editingTask}
              onSubmit={(taskData) => {
                if (editingTask) {
                  handleUpdateTask(editingTask.id, taskData);
                } else {
                  handleCreateTask(taskData);
                }
              }}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
            />
          )}
          
          <TaskList
            tasks={tasks}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 