import request from 'supertest';
import express from 'express';
import { TaskController } from '../controllers/TaskController';
import taskRoutes from '../routes/taskRoutes';

// Mock the TaskModel
jest.mock('../models/Task', () => ({
  TaskModel: jest.fn().mockImplementation(() => ({
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    addComment: jest.fn(),
    getTasksByStatus: jest.fn(),
    getTasksByPriority: jest.fn(),
    searchTasks: jest.fn(),
    getOverdueTasks: jest.fn(),
    getTaskStatistics: jest.fn(),
  })),
}));

const app = express();
app.use(express.json());
app.use('/api', taskRoutes);

// Mock user for testing
app.use((req, res, next) => {
  req.user = { id: 'test-user', email: 'test@example.com', name: 'Test User' };
  next();
});

describe('TaskController', () => {
  let taskController: TaskController;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new TaskController instance
    taskController = new TaskController();
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task 1',
          description: 'Test Description 1',
          status: 'pending',
          priority: 'medium',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          userId: 'test-user',
        },
        {
          id: '2',
          title: 'Test Task 2',
          description: 'Test Description 2',
          status: 'completed',
          priority: 'high',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          userId: 'test-user',
        },
      ];

      mockTaskModel.getAllTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual(mockTasks);
      expect(mockTaskModel.getAllTasks).toHaveBeenCalledWith('test-user', {});
    });

    it('should return empty array when no tasks exist', async () => {
      mockTaskModel.getAllTasks.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a specific task by ID', async () => {
      const mockTask = {
        id: '1',
        title: 'Test Task 1',
        description: 'Test Description 1',
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'test-user',
      };

      mockTaskModel.getTaskById.mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/tasks/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Test Task 1');
      expect(mockTaskModel.getTaskById).toHaveBeenCalledWith('1', 'test-user');
    });

    it('should return 404 for non-existent task', async () => {
      mockTaskModel.getTaskById.mockResolvedValue(null);

      await request(app)
        .get('/api/tasks/999')
        .expect(404);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'medium',
      };

      const createdTask = {
        id: '3',
        ...newTask,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        userId: 'test-user',
      };

      mockTaskModel.createTask.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Task');
      expect(mockTaskModel.createTask).toHaveBeenCalledWith({
        ...newTask,
        userId: 'test-user',
        attachments: [],
        comments: [],
      });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTask = {
        title: 'Incomplete Task',
        // Missing description, status, priority
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('required');
    });

    it('should return 400 for invalid status', async () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'invalid-status',
        priority: 'medium',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Status must be');
    });

    it('should return 400 for invalid priority', async () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'invalid-priority',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Priority must be');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in-progress',
      };

      const updatedTask = {
        id: '1',
        title: 'Updated Task',
        description: 'Test Description 1',
        status: 'in-progress',
        priority: 'medium',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        userId: 'test-user',
      };

      mockTaskModel.updateTask.mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Updated Task');
      expect(response.body).toHaveProperty('status', 'in-progress');
      expect(mockTaskModel.updateTask).toHaveBeenCalledWith('1', 'test-user', updateData);
    });

    it('should return 404 for non-existent task', async () => {
      const updateData = { title: 'Updated Task' };
      
      mockTaskModel.updateTask.mockRejectedValue(new Error('Task not found or access denied'));

      await request(app)
        .put('/api/tasks/999')
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        status: 'invalid-status',
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(invalidUpdate)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Status must be');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      mockTaskModel.deleteTask.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/tasks/1')
        .expect(200);

      expect(mockTaskModel.deleteTask).toHaveBeenCalledWith('1', 'test-user');
    });

    it('should return 404 for non-existent task', async () => {
      mockTaskModel.deleteTask.mockRejectedValue(new Error('Task not found or access denied'));

      await request(app)
        .delete('/api/tasks/999')
        .expect(404);
    });
  });

  describe('Error handling', () => {
    it('should return proper error messages', async () => {
      mockTaskModel.getTaskById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Task not found');
    });

    it('should handle database errors gracefully', async () => {
      mockTaskModel.getAllTasks.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/tasks')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });
  });
}); 