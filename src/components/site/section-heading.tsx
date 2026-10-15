import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  label,
  title,
  className,
  children,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className={cn("mb-10 md:mb-14", className)}>
      <p className="t-meta flex items-center gap-4 border-t border-ink/15 pt-3 text-ink/70">
        <span className="text-clay" aria-hidden>
          {index}
        </span>
        <span>{label}</span>
      </p>
      <h2 className="t-h2 mt-6 max-w-3xl">{title}</h2>
      {children}
    </Reveal>
  );
}
