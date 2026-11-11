import express, { ErrorRequestHandler } from 'express';
import taskRoutes from './routes/taskRoutes.js';
import { AppError } from './errors/AppError.js';
import { askOpenRouter } from './services/aiService.js';
import { isChatMessage } from './types/ai.js';

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

app.post('/api/ai/chat', async (req, res) => {
  const message = req.body?.message;
  const history = req.body?.history ?? [];

  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'Введите текст вопроса' });
    return;
  }

  if (!Array.isArray(history)) {
    res.status(400).json({ error: 'History must be an array' });
    return;
  }

  if (!history.every(isChatMessage)) {
    res.status(400).json({ error: 'Invalid chat history' });
    return;
  }

  const answer = await askOpenRouter(message, history);

  res.json({ answer });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;
  console.error(error);
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
