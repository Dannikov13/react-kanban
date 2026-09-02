import express, { ErrorRequestHandler } from 'express';
import taskRoutes from './routes/taskRoutes.js';
import { AppError } from './errors/AppError.js';

const app = express();

app.use(express.json());

app.use('/api', taskRoutes);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
    });

    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
  });
};

app.use(errorHandler);

export default app;
