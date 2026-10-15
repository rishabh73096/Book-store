// Usage: node --env-file=.env.local scripts/create-admin.mjs "Name" admin@example.com 'password'
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs "Name" email password');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const admins = mongoose.connection.collection("admins");
const hash = await bcrypt.hash(password, 12);
await admins.updateOne(
  { email: email.toLowerCase() },
  {
    $set: { name, password: hash, role: "admin" },
    $setOnInsert: {
      email: email.toLowerCase(),
      refreshTokenHash: null,
      resetTokenHash: null,
      resetTokenExpires: null,
      loginOtpHash: null,
      loginOtpExpires: null,
      createdAt: new Date(),
    },
  },
  { upsert: true }
);
console.log(`Admin ready: ${email}`);
await mongoose.disconnect();
