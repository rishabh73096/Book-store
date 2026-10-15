import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { bookSchema } from "@/lib/validations/book";
import { createBook } from "@/backend/controllers/book.controller";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const parsed = bookSchema.safeParse(await req.json());
  if (!parsed.success) return response.validationError(parsed.error);

  try {
    const book = await createBook(parsed.data);
    revalidatePath("/", "layout");
    return response.ok({ id: String(book._id) }, 201);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: number }).code === 11000) {
      return response.error("A book with that slug already exists", 409);
    }
    throw err;
  }
}
