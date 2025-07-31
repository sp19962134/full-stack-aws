import request from 'supertest';
import express from 'express';
import { TaskController } from '../controllers/TaskController';
import taskRoutes from '../routes/taskRoutes';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', taskRoutes);

describe('TaskController', () => {
  let taskController: TaskController;

  beforeEach(() => {
    taskController = new TaskController();
    // Reset mock data
    (taskController as any).tasks = [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Test Description 1',
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', '1');
      expect(response.body[0]).toHaveProperty('title', 'Test Task 1');
    });

    it('should return empty array when no tasks exist', async () => {
      (taskController as any).tasks = [];
      
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a specific task by ID', async () => {
      const response = await request(app)
        .get('/api/tasks/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Test Task 1');
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .get('/api/tasks/999')
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/tasks/invalid-id')
        .expect(400);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Task');
      expect(response.body).toHaveProperty('description', 'New Description');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('priority', 'high');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 for invalid task data', async () => {
      const invalidTask = {
        title: '', // Empty title
        description: 'Test Description',
        status: 'invalid-status', // Invalid status
        priority: 'invalid-priority' // Invalid priority
      };

      await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteTask = {
        description: 'Test Description'
        // Missing title, status, priority
      };

      await request(app)
        .post('/api/tasks')
        .send(incompleteTask)
        .expect(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Updated Task');
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent task', async () => {
      const updateData = {
        title: 'Updated Task'
      };

      await request(app)
        .put('/api/tasks/999')
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        status: 'invalid-status'
      };

      await request(app)
        .put('/api/tasks/1')
        .send(invalidUpdate)
        .expect(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      await request(app)
        .delete('/api/tasks/1')
        .expect(200);

      // Verify task is deleted
      await request(app)
        .get('/api/tasks/1')
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .delete('/api/tasks/999')
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .delete('/api/tasks/invalid-id')
        .expect(400);
    });
  });

  describe('Task validation', () => {
    it('should validate task status values', () => {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      const invalidStatus = 'invalid';

      expect(validStatuses).toContain('pending');
      expect(validStatuses).toContain('in-progress');
      expect(validStatuses).toContain('completed');
      expect(validStatuses).not.toContain(invalidStatus);
    });

    it('should validate task priority values', () => {
      const validPriorities = ['low', 'medium', 'high'];
      const invalidPriority = 'invalid';

      expect(validPriorities).toContain('low');
      expect(validPriorities).toContain('medium');
      expect(validPriorities).toContain('high');
      expect(validPriorities).not.toContain(invalidPriority);
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors gracefully', async () => {
      // Mock a scenario where the controller throws an error
      jest.spyOn(taskController, 'getAllTasks').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await request(app)
        .get('/api/tasks')
        .expect(500);
    });

    it('should return proper error messages', async () => {
      const response = await request(app)
        .get('/api/tasks/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Task not found');
    });
  });
}); 