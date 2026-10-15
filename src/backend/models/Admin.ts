import { Schema, models, model, Model } from "mongoose";

export type AdminRole = "admin";

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  refreshTokenHash: string | null;
  resetTokenHash: string | null;
  resetTokenExpires: Date | null;
  loginOtpHash: string | null;
  loginOtpExpires: Date | null;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
  refreshTokenHash: { type: String, default: null },
  resetTokenHash: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  loginOtpHash: { type: String, default: null },
  loginOtpExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Delete cached model so schema changes (new fields) are always picked up
// Without this, Mongoose serves the old schema from cache and new fields silently fail to save
delete (models as Record<string, Model<IAdmin>>)["Admin"];
export const Admin = model<IAdmin>("Admin", AdminSchema);

