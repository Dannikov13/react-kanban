import express, { ErrorRequestHandler } from 'express';
import taskRoutes from './routes/taskRoutes.js';
import { AppError } from './errors/AppError.js';

const app = express();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(origin && !allowedOrigins.has(origin) ? 403 : 204);
    return;
  }

  next();
});

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
