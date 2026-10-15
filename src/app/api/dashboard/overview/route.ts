import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { getDashboardOverview } from "@/backend/controllers/dashboard.controller";
import { response } from "@/backend/response";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const overview = await getDashboardOverview();
  return response.ok(overview);
}
