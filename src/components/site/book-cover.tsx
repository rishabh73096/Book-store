import Image from "next/image";
import { cn } from "@/lib/utils";

// 2:3 framed book image (books without an image are not shown on the public site).
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
    </div>
  );
}
