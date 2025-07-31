import { Request, Response } from 'express';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

// Mock data for Day 2 (will be replaced with database in Day 6)
let tasks: Task[] = [
  {
    id: '1',
    title: 'Complete project setup',
    description: 'Set up the development environment and install dependencies',
    status: 'completed',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    title: 'Design user interface',
    description: 'Create wireframes and mockups for the task management app',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
  {
    id: '3',
    title: 'Implement authentication',
    description: 'Add user login and registration functionality',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
];

export class TaskController {
  // GET /api/tasks
  getAllTasks = (req: Request, res: Response) => {
    try {
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  };

  // GET /api/tasks/:id
  getTaskById = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const task = tasks.find(t => t.id === id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch task' });
    }
  };

  // POST /api/tasks
  createTask = (req: Request, res: Response) => {
    try {
      const { title, description, status, priority, assignedTo } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        assignedTo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tasks.push(newTask);
      return res.status(201).json(newTask);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create task' });
    }
  };

  // PUT /api/tasks/:id
  updateTask = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const taskIndex = tasks.findIndex(t => t.id === id);
      
      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedTask: Task = {
        ...tasks[taskIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      tasks[taskIndex] = updatedTask;
      return res.json(updatedTask);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update task' });
    }
  };

  // DELETE /api/tasks/:id
  deleteTask = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const taskIndex = tasks.findIndex(t => t.id === id);
      
      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }

      tasks = tasks.filter(t => t.id !== id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  };
} 