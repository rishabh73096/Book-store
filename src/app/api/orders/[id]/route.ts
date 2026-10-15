import { NextRequest } from "next/server";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { orderUpdateSchema } from "@/lib/validations/order";
import { updateOrder } from "@/backend/controllers/order.controller";
import { response } from "@/backend/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const { id } = await params;
  const parsed = orderUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return response.validationError(parsed.error);

  const order = await updateOrder(id, parsed.data);
  if (!order) return response.notFound("Order not found");

  return response.ok({ id: String(order._id), status: order.status });
}
