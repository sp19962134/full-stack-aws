import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../redux/slices/tasksSlice';
import authReducer from '../redux/slices/authSlice';
import TaskList from '../components/TaskList';

// Mock data
const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test Description 1',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test Description 2',
    status: 'completed',
    priority: 'high',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
      auth: authReducer
    },
    preloadedState: {
      tasks: {
        tasks: mockTasks,
        loading: false,
        error: null,
        selectedTask: null,
        ...initialState.tasks
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth
      }
    }
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialState?: any }> = ({ 
  children, 
  initialState 
}) => {
  const store = createTestStore(initialState);
  return <Provider store={store}>{children}</Provider>;
};

describe('TaskList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task list with tasks', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={[]}
          loading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays empty state when no tasks', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={[]}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('displays task status correctly', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('displays task priority correctly', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const editButtons = screen.getAllByText(/edit/i);
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTasks[0].id);
  });

  it('applies correct CSS classes for different statuses', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const pendingTask = screen.getByText('pending').closest('.task-item');
    const completedTask = screen.getByText('completed').closest('.task-item');

    expect(pendingTask).toHaveClass('status-pending');
    expect(completedTask).toHaveClass('status-completed');
  });

  it('applies correct CSS classes for different priorities', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const mediumPriority = screen.getByText('medium').closest('.task-item');
    const highPriority = screen.getByText('high').closest('.task-item');

    expect(mediumPriority).toHaveClass('priority-medium');
    expect(highPriority).toHaveClass('priority-high');
  });

  it('displays task creation date', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    // Check if dates are displayed (formatted)
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-02/)).toBeInTheDocument();
  });

  it('handles tasks with missing optional fields', () => {
    const incompleteTask = {
      id: '3',
      title: 'Incomplete Task',
      description: '',
      status: 'pending' as const,
      priority: 'low' as const,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    };

    render(
      <TestWrapper>
        <TaskList
          tasks={[incompleteTask]}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Incomplete Task')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('renders multiple edit and delete buttons for multiple tasks', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const editButtons = screen.getAllByText(/edit/i);
    const deleteButtons = screen.getAllByText(/delete/i);

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('maintains accessibility with proper ARIA labels', () => {
    render(
      <TestWrapper>
        <TaskList
          tasks={mockTasks}
          loading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });
}); 