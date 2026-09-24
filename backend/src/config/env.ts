import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/feedants',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  seedOnBoot: process.env.SEED_ON_BOOT === 'true',
  // Burst-tolerant: the atomic spot-claim already prevents abuse; the limiter
  // is anti-bot only. Writes are stricter than reads; both cover thousands of
  // concurrent users behind shared IPs (campus/corporate NAT).
  rateLimitWriteMax: Number(process.env.RATE_LIMIT_WRITE_MAX ?? 300),
  rateLimitReadMax: Number(process.env.RATE_LIMIT_READ_MAX ?? 1000),
};
