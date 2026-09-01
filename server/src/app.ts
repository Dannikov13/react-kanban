import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(express.json());

app.use('/api', taskRoutes);

const errorHandler: ErrorRequestHandler = (error, _req, res) => {
  res.status(400).json({
    error: error.message,
  });
};

app.use(errorHandler);

export default app;
