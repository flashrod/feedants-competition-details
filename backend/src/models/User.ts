import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    avatarUrl: { type: String, default: null },
    // Mock wallet in major currency units. Production: separate ledger service.
    walletBalance: { type: Number, required: true, default: 100, min: 0 },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: unknown };
export const User = model('User', userSchema);
