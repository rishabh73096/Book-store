"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const THEME_KEY = "dashboard-theme";
const listeners = new Set<() => void>();

function getThemeSnapshot() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

// Always light during SSR/first paint — avoids a hydration mismatch against the
// client's actual localStorage value, which useSyncExternalStore reconciles after mount.
function getServerThemeSnapshot() {
  return false;
}

function setDashboardTheme(next: boolean) {
  try {
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  } catch {
    // Ignore — theme just won't persist across reloads.
  }
  listeners.forEach((listener) => listener());
}

// Called on logout: the site itself is always light, so a fresh session should start
// from light too rather than carrying over the previous admin's dashboard preference.
export function clearDashboardTheme() {
  try {
    localStorage.removeItem(THEME_KEY);
  } catch {
    // Nothing to clean up.
  }
  listeners.forEach((listener) => listener());
}

function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Dark mode is scoped to this subtree only (the `.dark` class, not <html>) — the rest
// of the site stays light-only, matching the shared globals.css dark-mode tokens.
export function DashboardShell({
  admin,
  children,
}: {
  admin: { email: string; role: string } | null;
  children: React.ReactNode;
}) {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  return (
    <div className={cn("min-h-screen", dark ? "dark" : "dashboard-light-bg")}>
      <TooltipProvider>
        <SidebarProvider className="bg-background text-foreground">
          <AppSidebar admin={admin} />
          <main className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader dark={dark} onToggleDark={() => setDashboardTheme(!dark)} />
            <div className="min-w-0 flex-1 overflow-x-hidden p-6">{children}</div>
          </main>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
