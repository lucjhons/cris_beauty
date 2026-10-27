import express, { Request, Response } from 'express';
import { apiRouter } from './routes.ts';
import { seedDatabase } from '../db/seed.ts';

export const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database seeding asynchronously
seedDatabase().catch((err) => {
  console.error('Failed to seed database:', err);
});

// API Routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', salon: 'Cris_Beauty', timestamp: new Date().toISOString() });
});

export default app;
