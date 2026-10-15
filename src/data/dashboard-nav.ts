import { BookOpen, LayoutDashboard, Mail, MessageSquare, Settings, ShoppingBag } from "lucide-react";

export const dashboardNavGroups = [
  {
    label: "Menu",
    items: [{ title: "Overview", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Store",
    items: [
      { title: "Books", url: "/dashboard/books", icon: BookOpen },
      { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Queries", url: "/dashboard/contact", icon: MessageSquare },
      { title: "Subscribers", url: "/dashboard/subscribers", icon: Mail },
      { title: "Site Content", url: "/dashboard/settings", icon: Settings },
    ],
  },
];

// Flat list for search — every nav item across all groups, in the same order.
export const dashboardNavItems = dashboardNavGroups.flatMap((group) => group.items);
