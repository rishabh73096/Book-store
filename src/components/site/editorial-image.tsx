import Image from "next/image";
import { cn } from "@/lib/utils";

// Royalty-free editorial photography (Pexels licence), stored locally in /public/images.
export const EDITORIAL = {
  stack: {
    src: "/images/hardcover-books-vertical-stack.jpg",
    width: 1400,
    height: 2100,
    alt: "A tall stack of hardcover books with worn cloth spines",
  },
  fabric: {
    src: "/images/hardcover-books-white-fabric.jpg",
    width: 1400,
    height: 1867,
    alt: "Two hardcover books resting on a creased white linen cloth",
  },
  vintage: {
    src: "/images/vintage-leather-books-stack.jpg",
    width: 1400,
    height: 2248,
    alt: "A dark green cloth-bound book on top of a pile of vintage leather-bound books",
  },
} as const;

export function EditorialImage({
  image,
  className,
  imgClassName,
  priority,
  sizes,
  decorative,
  tint,
}: {
  image: { src: string; width: number; height: number; alt: string };
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes: string;
  decorative?: boolean;
  tint?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden border-2 border-ink", tint ?? "bg-paper-deep", className)}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={decorative ? "" : image.alt}
        sizes={sizes}
        priority={priority}
        className={cn("size-full object-cover", tint && "grayscale contrast-110 mix-blend-multiply", imgClassName)}
      />
    </div>
  );
}
