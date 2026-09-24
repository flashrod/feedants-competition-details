import { Schema, model, type InferSchemaType } from 'mongoose';

const prizeSchema = new Schema(
  {
    position: { type: String, required: true }, // e.g. "1st", "2nd", "3rd-5th"
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

/**
 * Canonical competition document.
 *
 * participantCount is a denormalized counter guarded by atomic conditional
 * updates so thousands of concurrent joins can never oversell spots.
 * The source of truth for "is user X in?" is the Participation collection
 * with a unique (competitionId, userId) index.
 */
const competitionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, maxlength: 4000 },
    rules: { type: [String], default: [] },
    coverImageUrl: { type: String, default: null },
    gameType: {
      type: String,
      enum: ['fantasy', 'prediction', 'quiz', 'meme-league'],
      default: 'fantasy',
    },
    entryFee: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, required: true, default: 'USD' },
    prizePool: { type: Number, required: true, min: 0 },
    prizeBreakdown: { type: [prizeSchema], default: [] },

    maxParticipants: { type: Number, required: true, min: 2, max: 1_000_000 },
    participantCount: { type: Number, required: true, default: 0, min: 0 },

    registrationOpensAt: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },

    isCancelled: { type: Boolean, default: false },
    cancelledReason: { type: String, default: null },

    organizerName: { type: String, default: 'Feedants' },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true, optimisticConcurrency: true },
);

competitionSchema.index({ startsAt: 1 });
competitionSchema.index({ isFeatured: 1, startsAt: 1 });

// Prevent negative counters / over-capacity at the schema level as a backstop.
competitionSchema.pre('save', function (next) {
  if (this.participantCount > this.maxParticipants) {
    next(new Error('participantCount exceeds maxParticipants'));
    return;
  }
  if (this.registrationOpensAt >= this.registrationDeadline) {
    next(new Error('registrationOpensAt must be before registrationDeadline'));
    return;
  }
  if (this.registrationDeadline > this.startsAt) {
    next(new Error('registrationDeadline must be <= startsAt'));
    return;
  }
  if (this.startsAt >= this.endsAt) {
    next(new Error('startsAt must be before endsAt'));
    return;
  }
  next();
});

export type CompetitionDoc = InferSchemaType<typeof competitionSchema> & {
  _id: unknown;
};
export const Competition = model('Competition', competitionSchema);
