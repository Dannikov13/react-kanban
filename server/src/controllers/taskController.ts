import { NextFunction, Request, Response } from 'express';
import { TaskRepository } from '../repositories/taskRepository.js';
import { TaskService } from '../services/taskService.js';

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

export const getTasks = async (_req: Request, res: Response) => {
  const tasks = await taskService.getTasks();

  res.json(tasks);
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await taskService.createTask(req.body);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await taskService.updateTask(
      req.params.id as string,
      req.body,
    );

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await taskService.deleteTask(req.params.id as string);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
