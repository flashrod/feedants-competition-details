import { Schema, model, type InferSchemaType } from 'mongoose';

const participationSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['registered', 'withdrawn'],
      default: 'registered',
      required: true,
    },
    teamName: { type: String, trim: true, maxlength: 40, default: null },
    // Idempotency key supplied by the client to safely retry joins.
    idempotencyKey: { type: String, default: null, index: true },
  },
  { timestamps: { createdAt: 'joinedAt', updatedAt: true } },
);

// One row per (competition, user). Re-join reactivates the row instead of
// inserting a duplicate, which keeps the counter logic exact.
participationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
participationSchema.index({ competitionId: 1, status: 1, joinedAt: 1 });

export type ParticipationDoc = InferSchemaType<typeof participationSchema> & {
  _id: unknown;
};
export const Participation = model('Participation', participationSchema);
