import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './logger';
import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';
import tasksRoutes from './routes/tasks';
import { metricsHandler } from './metrics';
import { errorHandler } from './middleware/error';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger, customLogLevel: (res: any, err: any) => (err || res.statusCode >= 500 ? 'error' : 'info') }));

app.get('/health', (_: any, res: any) => res.json({ status: 'OK' }));
app.get('/metrics', metricsHandler);
app.use('/auth', authRoutes);
app.use('/projects', projectsRoutes);
app.use('/tasks', tasksRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  logger.info({ msg: 'server:start', port: PORT });
});

export default app;
