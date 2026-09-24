import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/feedants',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  seedOnBoot: process.env.SEED_ON_BOOT === 'true',
};
