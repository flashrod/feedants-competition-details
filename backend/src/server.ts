import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { Competition } from './models/Competition.js';

async function main() {
  await connectDb(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected (${mongoose.connection.host})`);
  if (env.seedOnBoot) {
    const count = await Competition.estimatedDocumentCount();
    if (count === 0) {
      const { seed } = await import('../scripts/seed.js');
      const { demoUserId } = await seed();
      // eslint-disable-next-line no-console
      console.log(`Seeded demo data. Demo user: ${demoUserId}`);
    } else {
      // eslint-disable-next-line no-console
      console.log('SEED_ON_BOOT set but competitions exist; skipping seed.');
    }
  }
  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Competition API listening on http://localhost:${env.port}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
