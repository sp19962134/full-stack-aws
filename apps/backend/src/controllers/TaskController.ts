import { Request, Response } from 'express';
import { TaskModel, Task, TaskFilters } from '../models/Task';

export class TaskController {
  private taskModel: TaskModel;

  constructor() {
    this.taskModel = new TaskModel();
  }

  async getAllTasks(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id || 'default-user'; // Get from auth middleware
      const filters: TaskFilters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        search: req.query.search as string,
        dueDate: req.query.dueDate as string
      };

      const tasks = await this.taskModel.getAllTasks(userId, filters);
      return res.json(tasks);
    } catch (error: any) {
      console.error('Error getting tasks:', error);
      return res.status(500).json({ 
        message: 'Failed to get tasks',
        error: error.message 
      });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';

      if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
      }

      const task = await this.taskModel.getTaskById(id, userId);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.json(task);
    } catch (error: any) {
      console.error('Error getting task:', error);
      return res.status(500).json({ 
        message: 'Failed to get task',
        error: error.message 
      });
    }
  }

  async createTask(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id || 'default-user';
      const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

      // Validation
      if (!title || !description || !status || !priority) {
        return res.status(400).json({ 
          message: 'Title, description, status, and priority are required' 
        });
      }

      if (!['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({ 
          message: 'Status must be pending, in-progress, or completed' 
        });
      }

      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ 
          message: 'Priority must be low, medium, or high' 
        });
      }

      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        description,
        status,
        priority,
        userId,
        assignedTo,
        dueDate,
        tags,
        attachments: [],
        comments: []
      };

      const newTask = await this.taskModel.createTask(taskData);
      return res.status(201).json(newTask);
    } catch (error: any) {
      console.error('Error creating task:', error);
      return res.status(500).json({ 
        message: 'Failed to create task',
        error: error.message 
      });
    }
  }

  async updateTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
      }

      // Remove fields that shouldn't be updated
      delete updates.id;
      delete updates.userId;
      delete updates.createdAt;

      // Validate status and priority if provided
      if (updates.status && !['pending', 'in-progress', 'completed'].includes(updates.status)) {
        return res.status(400).json({ 
          message: 'Status must be pending, in-progress, or completed' 
        });
      }

      if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
        return res.status(400).json({ 
          message: 'Priority must be low, medium, or high' 
        });
      }

      const updatedTask = await this.taskModel.updateTask(id, userId, updates);
      return res.json(updatedTask);
    } catch (error: any) {
      console.error('Error updating task:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ 
        message: 'Failed to update task',
        error: error.message 
      });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';

      if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
      }

      await this.taskModel.deleteTask(id, userId);
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ 
        message: 'Failed to delete task',
        error: error.message 
      });
    }
  }

  async addComment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const { text, userName } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Task ID is required' });
      }

      if (!text || !userName) {
        return res.status(400).json({ message: 'Text and userName are required' });
      }

      const comment = { text, userId, userName };
      const updatedTask = await this.taskModel.addComment(id, userId, comment);
      return res.json(updatedTask);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ 
        message: 'Failed to add comment',
        error: error.message 
      });
    }
  }

  async getTasksByStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { status } = req.params;
      const userId = req.user?.id || 'default-user';

      if (!['pending', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({ 
          message: 'Status must be pending, in-progress, or completed' 
        });
      }

      const tasks = await this.taskModel.getTasksByStatus(userId, status);
      return res.json(tasks);
    } catch (error: any) {
      console.error('Error getting tasks by status:', error);
      return res.status(500).json({ 
        message: 'Failed to get tasks by status',
        error: error.message 
      });
    }
  }

  async getTasksByPriority(req: Request, res: Response): Promise<Response> {
    try {
      const { priority } = req.params;
      const userId = req.user?.id || 'default-user';

      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ 
          message: 'Priority must be low, medium, or high' 
        });
      }

      const tasks = await this.taskModel.getTasksByPriority(userId, priority);
      return res.json(tasks);
    } catch (error: any) {
      console.error('Error getting tasks by priority:', error);
      return res.status(500).json({ 
        message: 'Failed to get tasks by priority',
        error: error.message 
      });
    }
  }

  async searchTasks(req: Request, res: Response): Promise<Response> {
    try {
      const { q } = req.query;
      const userId = req.user?.id || 'default-user';

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const tasks = await this.taskModel.searchTasks(userId, q);
      return res.json(tasks);
    } catch (error: any) {
      console.error('Error searching tasks:', error);
      return res.status(500).json({ 
        message: 'Failed to search tasks',
        error: error.message 
      });
    }
  }

  async getOverdueTasks(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id || 'default-user';
      const tasks = await this.taskModel.getOverdueTasks(userId);
      return res.json(tasks);
    } catch (error: any) {
      console.error('Error getting overdue tasks:', error);
      return res.status(500).json({ 
        message: 'Failed to get overdue tasks',
        error: error.message 
      });
    }
  }

  async getTaskStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id || 'default-user';
      const statistics = await this.taskModel.getTaskStatistics(userId);
      return res.json(statistics);
    } catch (error: any) {
      console.error('Error getting task statistics:', error);
      return res.status(500).json({ 
        message: 'Failed to get task statistics',
        error: error.message 
      });
    }
  }
} 