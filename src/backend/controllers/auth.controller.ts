import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/backend/config/db";
import { Admin } from "@/backend/models/Admin";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/backend/lib/auth";
import { hashToken } from "@/backend/lib/token-hash";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

async function issueTokenPair(admin: { _id: unknown; email: string; role: string }) {
  const payload = { sub: String(admin._id), email: admin.email, role: admin.role };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);
  return { accessToken, refreshToken };
}

// Step 1: Verify email + password. If valid, store OTP hash and return the OTP to be emailed.
export async function verifyCredentialsAndSendLoginOtp(email: string, password: string) {
  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) throw new AuthError("Invalid email or password");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new AuthError("Invalid email or password");

  const otp = generateOtp();
  admin.loginOtpHash = hashToken(otp);
  admin.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  await admin.save();

  return { email: admin.email, otp };
}

// Step 2: Verify OTP and issue session tokens.
export async function verifyLoginOtpAndIssueTokens(email: string, otp: string) {
  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) throw new AuthError("Invalid session, please log in again");

  if (!admin.loginOtpHash || !admin.loginOtpExpires || admin.loginOtpExpires < new Date()) {
    throw new AuthError("Verification code has expired. Please log in again.", 400);
  }
  if (admin.loginOtpHash !== hashToken(otp)) {
    throw new AuthError("Invalid verification code. Please check and try again.", 400);
  }

  // Clear OTP after successful verification
  admin.loginOtpHash = null;
  admin.loginOtpExpires = null;

  const { accessToken, refreshToken } = await issueTokenPair(admin);
  admin.refreshTokenHash = hashToken(refreshToken);
  await admin.save();

  return {
    accessToken,
    refreshToken,
    admin: { id: String(admin._id), name: admin.name, email: admin.email, role: admin.role },
  };
}

// Legacy export kept for compatibility (no longer used by the login route)
export async function loginAdmin(email: string, password: string) {
  return verifyCredentialsAndSendLoginOtp(email, password);
}

export async function refreshAdminSession(refreshToken: string) {
  await connectDB();

  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError("Session expired, please log in again");
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || admin.refreshTokenHash !== hashToken(refreshToken)) {
    throw new AuthError("Session expired, please log in again");
  }

  const { accessToken, refreshToken: nextRefreshToken } = await issueTokenPair(admin);
  admin.refreshTokenHash = hashToken(nextRefreshToken);
  await admin.save();

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    admin: { id: String(admin._id), name: admin.name, email: admin.email, role: admin.role },
  };
}

export async function logoutAdmin(adminId: string) {
  await connectDB();
  await Admin.findByIdAndUpdate(adminId, { refreshTokenHash: null });
}

export async function getAdminById(adminId: string) {
  await connectDB();
  const admin = await Admin.findById(adminId).lean();
  if (!admin) throw new AuthError("Admin not found", 404);
  return { id: String(admin._id), name: admin.name, email: admin.email, role: admin.role };
}

// Local development without SMTP configured: a fixed code so the admin can sign in without
// email delivery. Never active in production or once SMTP credentials are present.
function generateOtp() {
  if (process.env.NODE_ENV !== "production" && !(process.env.SMTP_USER && process.env.SMTP_PASS)) {
    return "000000";
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Strictly checks whether the user is registered in the database, and whether their role is 'admin'
export async function requestPasswordReset(email: string) {
  await connectDB();
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if user is registered at all in the system
  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    throw new AuthError("Yeh email admin ke roop me registered nahi hai. Only registered administrators can request a password reset.", 404);
  }

  // 2. Check if the registered user has role: 'admin'
  if (admin.role !== "admin") {
    throw new AuthError("Aapke account ke paas admin access nahi hai. Only accounts with the admin role can receive password reset codes.", 403);
  }

  const otp = generateOtp();
  admin.resetTokenHash = hashToken(otp);
  admin.resetTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  await admin.save();

  return otp;
}

export async function verifyAdminOtp(email: string, otp: string) {
  await connectDB();
  const normalizedEmail = email.toLowerCase().trim();

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    throw new AuthError("Yeh email admin ke roop me registered nahi hai.", 404);
  }
  if (admin.role !== "admin") {
    throw new AuthError("Aapke account ke paas admin role nahi hai.", 403);
  }
  if (!admin.resetTokenExpires || admin.resetTokenExpires < new Date()) {
    throw new AuthError("That verification code has expired. Please request a new code.", 400);
  }
  if (!admin.resetTokenHash || admin.resetTokenHash !== hashToken(otp)) {
    throw new AuthError("Invalid verification code. Please check and try again.", 400);
  }
  return true;
}

export async function resetAdminPassword(email: string, otp: string, newPassword: string) {
  await connectDB();
  const normalizedEmail = email.toLowerCase().trim();

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin) {
    throw new AuthError("Yeh email admin ke roop me registered nahi hai.", 404);
  }
  if (admin.role !== "admin") {
    throw new AuthError("Aapke account ke paas admin role nahi hai.", 403);
  }
  if (!admin.resetTokenExpires || admin.resetTokenExpires < new Date()) {
    throw new AuthError("That verification code has expired. Please request a new code.", 400);
  }
  if (!admin.resetTokenHash || admin.resetTokenHash !== hashToken(otp)) {
    throw new AuthError("Invalid verification code.", 400);
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  admin.resetTokenHash = null;
  admin.resetTokenExpires = null;
  admin.refreshTokenHash = null;
  await admin.save();
}

export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
) {
  await connectDB();

  // A session without a real Admin document (id isn't a real ObjectId) can't change a password.
  if (!isValidObjectId(adminId)) {
    throw new AuthError("Password changes aren't available for this account", 400);
  }

  const admin = await Admin.findById(adminId);
  if (!admin) throw new AuthError("Admin not found", 404);

  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) throw new AuthError("Current password is incorrect", 400);

  admin.password = await bcrypt.hash(newPassword, 12);
  // Other sessions must log in again with the new password; this one keeps working
  // until its short-lived access token naturally expires.
  admin.refreshTokenHash = null;
  await admin.save();
}
