import type { Metadata } from "next";
import { CalendarDays, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getContactMessages, getContactStats } from "@/backend/controllers/contact.controller";
import { ContactTable } from "@/components/dashboard/contact/contact-table";
import { StatSparkline } from "@/components/dashboard/stat-sparkline";
import { dailyCounts } from "@/lib/daily-trend";

export const metadata: Metadata = {
  title: "Queries",
  robots: { index: false, follow: false },
};

export default async function DashboardContactPage() {
  const [stats, messages] = await Promise.all([getContactStats(), getContactMessages()]);

  const trend = dailyCounts(messages.map((m) => new Date(m.createdAt)));

  const cards = [
    { label: "Total queries", value: stats.total, icon: Users },
    { label: "New today", value: stats.today, icon: MessageSquare },
    { label: "New this week", value: stats.last7Days, icon: TrendingUp },
    { label: "New this month", value: stats.last30Days, icon: CalendarDays },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Queries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who submitted the contact form.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {card.label}
                <card.icon className="size-4 text-muted-foreground" />
              </CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatSparkline data={trend} id={card.label} />
            </CardContent>
          </Card>
        ))}
      </div>

      <ContactTable
        total={stats.total}
        initialMessages={messages.map((m) => ({
          id: String(m._id),
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          phone: m.phone,
          message: m.message,
          status: m.status,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
