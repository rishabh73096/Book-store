import type { Metadata } from "next";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { getOrders, serializeOrder } from "@/backend/controllers/order.controller";

export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track payments and update shipping status.
        </p>
      </div>
      <OrdersTable initialOrders={orders.map(serializeOrder)} />
    </div>
  );
}
