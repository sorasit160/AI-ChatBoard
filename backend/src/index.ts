import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/init';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import boardRoutes from './routes/board';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend running at http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here' ? '✅ Real AI' : '⚠️  Mock mode'}\n`);
  });
}

start().catch(console.error);

export default app;
