import Link from "next/link";
import { ArrowRight, BookOpen, IndianRupee, MessageSquare, ShoppingBag } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { StatSparkline } from "@/components/dashboard/stat-sparkline";
import { getDashboardOverview } from "@/backend/controllers/dashboard.controller";
import { getOrders } from "@/backend/controllers/order.controller";
import { getContactMessages } from "@/backend/controllers/contact.controller";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [overview, orders, messages] = await Promise.all([
    getDashboardOverview(),
    getOrders({ paidOnly: true }),
    getContactMessages(),
  ]);

  const stats = [
    {
      label: "Orders",
      value: String(overview.orderStats.total),
      icon: ShoppingBag,
      trend: overview.daily.map((d) => d.orders),
    },
    {
      label: "Revenue",
      value: formatPrice(overview.orderStats.revenue),
      icon: IndianRupee,
      trend: overview.daily.map((d) => d.revenue),
    },
    {
      label: "Books",
      value: String(overview.bookStats.total),
      icon: BookOpen,
      trend: overview.daily.map(() => overview.bookStats.total),
    },
    {
      label: "Queries",
      value: String(overview.contactStats.total),
      icon: MessageSquare,
      trend: overview.daily.map((d) => d.queries),
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const recentMessages = messages.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Snapshot of the store.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {stat.label}
                <stat.icon className="size-4 text-muted-foreground" />
              </CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatSparkline data={stat.trend} id={stat.label} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>To ship</CardTitle>
            <CardDescription>Paid orders waiting for dispatch</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{overview.orderStats.toShip}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {overview.bookStats.lowStock} book(s) low on stock
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders — last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <OverviewChart data={overview.daily.map((d) => ({ day: d.day, inquiries: d.orders }))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardAction>
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/dashboard/orders" />}>
                View all
                <ArrowRight className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={String(order._id)} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.customer.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.orderNumber}</p>
                  </div>
                  <span className="shrink-0 font-medium">{formatPrice(order.total)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent queries</CardTitle>
            <CardAction>
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/dashboard/contact" />}>
                View all
                <ArrowRight className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={String(msg._id)} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {msg.firstName} {msg.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{msg.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
