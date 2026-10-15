import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/backend/config/db";
import { Book } from "@/backend/models/Book";
import { clientIp, rateLimit } from "@/backend/lib/rate-limit";
import { response } from "@/backend/response";

const schema = z.object({ ids: z.array(z.string()).min(1).max(20) });

// Public: tells the cart which books are still on sale and at what price/stock right now.
export async function POST(req: NextRequest) {
  const limit = rateLimit(`cart:${clientIp(req)}`, 60, 60_000);
  if (!limit.ok) return response.tooMany(limit.retryAfter);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return response.validationError(parsed.error);

  const ids = parsed.data.ids.filter((id) => isValidObjectId(id));
  try {
    await connectDB();
    const books = ids.length ? await Book.find({ _id: { $in: ids }, published: true }).lean() : [];
    return response.ok({
      items: books.map((b) => ({
        bookId: String(b._id),
        slug: b.slug,
        title: b.title,
        price: b.price,
        stock: b.stock,
        image: b.images[0] ?? "",
      })),
    });
  } catch {
    return response.unavailable();
  }
}
