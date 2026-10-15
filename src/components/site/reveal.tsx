"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Scroll-triggered reveal. Rendered "hidden" on the server so there is no flash; CSS
// (reduced-motion media query + <noscript> in the layout) makes it visible without JS/motion.
export function Reveal({
  children,
  delay = 0,
  variant = "fade",
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: "fade" | "wipe";
  className?: string;
  as?: "div" | "section" | "li" | "p" | "figure" | "blockquote";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no observer/motion: show immediately
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal={variant === "wipe" ? undefined : shown ? "shown" : "hidden"}
      className={cn(variant === "wipe" ? undefined : "reveal", className)}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      {/* The wipe is clipped, so the observed element must be the unclipped wrapper. */}
      {variant === "wipe" ? (
        <div data-reveal={shown ? "shown" : "hidden"} className="page-wipe">
          {children}
        </div>
      ) : (
        children
      )}
    </Tag>
  );
}
