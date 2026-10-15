import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { bookSchema } from "@/lib/validations/book";
import { updateBook, deleteBook } from "@/backend/controllers/book.controller";
import { response } from "@/backend/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const { id } = await params;
  const parsed = bookSchema.safeParse(await req.json());
  if (!parsed.success) return response.validationError(parsed.error);

  try {
    const book = await updateBook(id, parsed.data);
    if (!book) return response.notFound("Book not found");
    revalidatePath("/", "layout");
    return response.ok({ id: String(book._id) });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code: number }).code === 11000) {
      return response.error("A book with that slug already exists", 409);
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const { id } = await params;
  const deleted = await deleteBook(id).catch(() => false);
  if (!deleted) return response.notFound("Book not found");

  revalidatePath("/", "layout");
  return response.ok({ success: true });
}
