import { cn } from "@/lib/utils";

// Handwritten margin note with a hand-drawn arrow. Decorative — hidden from assistive tech.
export function Annotation({
  children,
  className,
  arrow = "down-left",
}: {
  children: React.ReactNode;
  className?: string;
  arrow?: "down-left" | "down-right" | "left";
}) {
  return (
    <span
      aria-hidden
      className={cn("font-hand pointer-events-none inline-flex items-end gap-2 text-2xl text-clay -rotate-3", className)}
    >
      <span>{children}</span>
      <svg width="46" height="34" viewBox="0 0 46 34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        className={arrow === "down-right" ? "-scale-x-100" : arrow === "left" ? "rotate-90" : ""}>
        <path d="M43 3C30 4 14 9 6 27" />
        <path d="M5 18l1 10 10-3" />
      </svg>
    </span>
  );
}
