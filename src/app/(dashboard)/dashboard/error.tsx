"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="zine-card flex max-w-xl flex-col items-start gap-4 p-6">
      <h1 className="text-2xl">This page couldn&apos;t load.</h1>
      <p className="text-sm text-muted-foreground">
        The database or a service may be unreachable. Check your connection and the environment keys, then try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
