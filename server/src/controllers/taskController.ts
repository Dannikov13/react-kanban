import { NextFunction, Request, Response } from 'express';
import { TaskRepository } from '../repositories/taskRepository.js';
import { TaskService } from '../services/taskService.js';

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

export const getTasks = (_req: Request, res: Response) => {
  const tasks = taskService.getTasks();

  res.json(tasks);
};

export const createTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = taskService.createTask(req.body);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};
