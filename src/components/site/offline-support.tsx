"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Registers the service worker (production only — in dev it would cache stale bundles) and
// shows a banner whenever the browser loses its connection.
export function OfflineSupport() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Offline support is an enhancement; the site works normally without it.
      });
    }
    const update = () => setOnline(navigator.onLine);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the initial connection state after mount
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;
  return (
    <p role="status" className="t-meta fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 border-b-2 border-ink bg-clay px-4 py-2 text-center text-ink">
      <WifiOff className="size-4 shrink-0" aria-hidden />
      No internet — showing saved pages. Ordering and forms need a connection.
    </p>
  );
}
