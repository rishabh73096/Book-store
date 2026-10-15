import { cn } from "@/lib/utils";

// "S" monogram: a serif S inside a ring, with a clay bookmark ribbon hanging from it.
// Uses currentColor, so it follows the surrounding text colour (ink on paper, paper on ink).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 74" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <circle cx="32" cy="32" r="29.5" stroke="currentColor" strokeWidth="2" />
      <g stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        <path strokeLinecap="round" d="M42.5 22.5C39 16.5 22.5 16.5 22.5 26.5c0 9.5 20 5 20 14.5 0 9.5-16.5 9.5-20.5 3.5" />
      </g>
      <path d="M26 58h12v14l-6-4.5L26 72z" fill="#C93A22" />
    </svg>
  );
}

export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-10 w-auto" />
      <span className="font-display text-2xl leading-none tracking-tight sm:text-3xl">{name}</span>
    </span>
  );
}
