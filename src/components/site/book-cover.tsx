import Image from "next/image";
import { cn } from "@/lib/utils";

// 2:3 book object. Always the owner's real cover image (books without one are not shown on
// the public site). Spine shading and a soft shadow give it a physical presence.
export function BookCover({
  title,
  image,
  priority,
  sizes = "(min-width: 1024px) 24vw, 60vw",
  className,
}: {
  title: string;
  image: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[2/3] w-full overflow-hidden border-2 border-ink bg-paper-deep shadow-book", className)}>
      <Image
        src={image}
        alt={`Cover of ${title}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-top"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgb(0 0 0 / .28) 0, rgb(255 255 255 / .14) 2.5%, rgb(0 0 0 / .08) 5%, transparent 9%)",
        }}
      />
    </div>
  );
}
