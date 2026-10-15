"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { dashboardNavGroups } from "@/data/dashboard-nav";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";

export function AppSidebar({
  admin,
}: {
  admin: { email: string; role: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single click -> dashboard overview, double click -> public website. The single-click
  // navigation is delayed briefly so a double click can cancel it.
  function handleLogoClick() {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => router.push("/dashboard"), 250);
  }

  function handleLogoDoubleClick() {
    if (clickTimer.current) clearTimeout(clickTimer.current);
    router.push("/");
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-4">
        <button
          type="button"
          onClick={handleLogoClick}
          onDoubleClick={handleLogoDoubleClick}
          title="Click: Overview · Double-click: Website"
          className="cursor-pointer select-none"
        >
          <span className="text-brand-name block whitespace-nowrap">
            {brand.name.toUpperCase()}
          </span>
          <span className="block text-center text-[10px] tracking-[0.3em] text-muted-foreground">
            {brand.tagline.toUpperCase()}
          </span>
        </button>
      </SidebarHeader>
      <SidebarContent>
        {dashboardNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.url} />}
                        className={cn(
                          isActive &&
                            "rounded-md border-2 border-ink bg-ink p-3 my-1 text-paper shadow-[3px_3px_0_#ffb627] hover:bg-ink hover:text-paper data-active:bg-ink data-active:text-paper"
                        )}
                      >
                        {isActive ? (
                          <span className="flex size-5 items-center justify-center rounded-md bg-clay text-ink">
                            <item.icon className="size-3.5" />
                          </span>
                        ) : (
                          <item.icon />
                        )}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-sidebar-accent"
        >
          <Avatar size="lg">
            <AvatarFallback>
              <User className="size-6" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Administrator</p>
            <p className="truncate text-xs text-muted-foreground">
              {admin?.email ?? "Not signed in"}
            </p>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
