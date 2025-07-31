import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

// Basic CRUD operations
router.get('/tasks', taskController.getAllTasks.bind(taskController));
router.get('/tasks/:id', taskController.getTaskById.bind(taskController));
router.post('/tasks', taskController.createTask.bind(taskController));
router.put('/tasks/:id', taskController.updateTask.bind(taskController));
router.delete('/tasks/:id', taskController.deleteTask.bind(taskController));

// Advanced features
router.post('/tasks/:id/comments', taskController.addComment.bind(taskController));

// Filtering and search
router.get('/tasks/status/:status', taskController.getTasksByStatus.bind(taskController));
router.get('/tasks/priority/:priority', taskController.getTasksByPriority.bind(taskController));
router.get('/tasks/search', taskController.searchTasks.bind(taskController));
router.get('/tasks/overdue', taskController.getOverdueTasks.bind(taskController));

// Analytics and statistics
router.get('/tasks/statistics', taskController.getTaskStatistics.bind(taskController));

export default router; 