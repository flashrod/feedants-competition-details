import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { competitionsRouter } from './routes/competitions.js';
import { errorHandler } from './middleware/errors.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
  app.use(express.json({ limit: '256kb' }));
  app.use(morgan('tiny'));

  // Generous read-path limiter (browsing + countdown polling must never 429
  // humans). Writes have their own stricter limiter inside the router.
  const passThrough = (_req: Request, _res: Response, next: NextFunction) => next();
  const readLimiter =
    process.env.NODE_ENV === 'test'
      ? passThrough
      : rateLimit({
          windowMs: 60_000,
          max: env.rateLimitReadMax,
          standardHeaders: 'draft-7',
          legacyHeaders: false,
        });

  app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
  // Demo helper so the mobile app can pick a user id without hardcoding.
  // Production: replace with real auth (JWT) and remove this endpoint.
  app.get('/api/users', async (_req, res, next) => {
    try {
      const { User } = await import('./models/User.js');
      const users = await User.find({}).limit(20).lean();
      res.json({
        data: users.map((u: any) => ({
          id: String(u._id),
          name: u.name,
          walletBalance: u.walletBalance,
        })),
      });
    } catch (e) {
      next(e);
    }
  });
  app.use('/api/competitions', readLimiter, competitionsRouter);

  app.use((_req, res) => res.status(404).json({ error: { message: 'Not found', status: 404 } }));
  app.use(errorHandler);
  return app;
}
