"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal collection rail. Touch = native scroll-snap; desktop = buttons + arrow keys.
export function BookRail({ label, children }: { label: string; children: React.ReactNode }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  function scrollBy(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  const buttonClass =
    "inline-flex size-11 items-center justify-center border border-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollBy(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollBy(-1);
        }
      }}
    >
      <div className="mb-6 flex justify-end gap-2">
        <button type="button" className={buttonClass} aria-label="Previous books" disabled={edges.start} onClick={() => scrollBy(-1)}>
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" className={buttonClass} aria-label="Next books" disabled={edges.end} onClick={() => scrollBy(1)}>
          <ChevronRight className="size-5" />
        </button>
      </div>
      <ul
        ref={scroller}
        onScroll={update}
        tabIndex={0}
        aria-label={`${label} — use left and right arrow keys to browse`}
        className="rail -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-6 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:scroll-px-8 sm:gap-8 sm:px-8"
      >
        {Children.map(children, (child, i) => (
          <li
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${Children.count(children)}`}
            className="w-[64%] shrink-0 snap-start sm:w-[36%] lg:w-[23%]"
          >
            {child}
          </li>
        ))}
      </ul>
    </div>
  );
}
