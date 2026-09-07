import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskPositions,
} from '../controllers/taskController.js';

const router = Router();

router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/positions', updateTaskPositions);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
