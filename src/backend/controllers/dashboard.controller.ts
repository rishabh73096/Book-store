import { connectDB } from "@/backend/config/db";
import { Order } from "@/backend/models/Order";
import { ContactMessage } from "@/backend/models/ContactMessage";
import { getContactStats } from "@/backend/controllers/contact.controller";
import { getBookStats } from "@/backend/controllers/book.controller";
import { getOrderStats } from "@/backend/controllers/order.controller";
import { addDays, startOfDay } from "@/lib/week";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Last 7 days (oldest first), counting paid orders, revenue and queries per day.
async function getDailyBreakdown() {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return Promise.all(
    days.map(async (date) => {
      const next = addDays(date, 1);
      const [orders, revenueAgg, queries] = await Promise.all([
        Order.countDocuments({
          status: { $ne: "pending_payment" },
          createdAt: { $gte: date, $lt: next },
        }),
        Order.aggregate([
          {
            $match: {
              status: { $in: ["paid", "shipped", "delivered"] },
              createdAt: { $gte: date, $lt: next },
            },
          },
          { $group: { _id: null, revenue: { $sum: "$total" } } },
        ]),
        ContactMessage.countDocuments({ createdAt: { $gte: date, $lt: next } }),
      ]);
      return {
        day: DAY_LABELS[date.getDay()],
        orders,
        revenue: (revenueAgg[0]?.revenue as number | undefined) ?? 0,
        queries,
      };
    })
  );
}

export async function getDashboardOverview() {
  await connectDB();
  const [contactStats, bookStats, orderStats, daily] = await Promise.all([
    getContactStats(),
    getBookStats(),
    getOrderStats(),
    getDailyBreakdown(),
  ]);
  return { contactStats, bookStats, orderStats, daily };
}
