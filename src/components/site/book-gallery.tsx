"use client";

import { useState } from "react";
import Image from "next/image";
import { BookCover } from "@/components/site/book-cover";
import { Tilt } from "@/components/site/tilt";
import { cn } from "@/lib/utils";

export function BookGallery({ title, images }: { title: string; images: string[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto w-[72%] max-w-md md:w-full">
        <Tilt>
          <BookCover title={title} image={images[active]} priority sizes="(min-width: 768px) 40vw, 72vw" />
        </Tilt>
      </div>
      {images.length > 1 && (
        <ul className="flex flex-wrap justify-center gap-3" aria-label="Book images">
          {images.map((src, i) => (
            <li key={src + i}>
              <button
                type="button"
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={cn("relative block h-20 w-14 border-2 p-0.5 transition-colors", i === active ? "border-plum" : "border-transparent hover:border-ink/40")}
              >
                <Image src={src} alt="" fill sizes="56px" className="object-cover p-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
