"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dashboardNavItems } from "@/data/dashboard-nav";

export function DashboardSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed
    ? dashboardNavItems.filter((item) => item.title.toLowerCase().includes(trimmed))
    : [];

  function goTo(url: string) {
    router.push(url);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative w-full max-w-80">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search pages…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) goTo(matches[0].url);
          if (e.key === "Escape") setOpen(false);
        }}
        className="h-9 pl-8"
      />
      {open && matches.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
          {matches.map((item) => (
            <Button
              key={item.url}
              type="button"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goTo(item.url)}
              className="h-auto w-full justify-start gap-2 px-2 py-1.5 font-normal"
            >
              <item.icon className="size-4" />
              {item.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
