"use client";

import { useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { LogoutDialog } from "@/components/dashboard/logout-dialog";

export function DashboardHeader({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <DashboardSearch />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLogoutOpen(true)}
          aria-label="Log out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}
