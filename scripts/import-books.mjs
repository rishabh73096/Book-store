// Usage: node --env-file=.env.local scripts/import-books.mjs
// Copies content/books.json into MongoDB (upsert by slug) so the books can be ordered.
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}
const books = JSON.parse(await readFile(new URL("../content/books.json", import.meta.url), "utf8"));
await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection("books");
for (const { id, ...book } of books) {
  await col.updateOne(
    { slug: book.slug },
    { $set: { ...book, published: true }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  console.log("imported", book.slug);
}
await mongoose.disconnect();
