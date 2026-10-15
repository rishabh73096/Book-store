"use client";

import { useMemo, useState } from "react";
import { BookCard } from "@/components/site/book-card";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import type { SiteBook } from "@/lib/site-data";

type Sort = "featured" | "title" | "price-asc" | "price-desc";

export function BookBrowser({ books, initialCategory }: { books: SiteBook[]; initialCategory?: string }) {
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of books) if (b.category) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
    return Array.from(counts);
  }, [books]);

  const [category, setCategory] = useState(
    initialCategory && categories.some(([c]) => c === initialCategory) ? initialCategory : "All"
  );
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");
  const [inStock, setInStock] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = books.filter(
      (b) =>
        (category === "All" || b.category === category) &&
        (!inStock || b.stock > 0) &&
        (!q || `${b.title} ${b.category} ${b.shortDescription}`.toLowerCase().includes(q))
    );
    const sorted = [...list];
    if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "featured") sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [books, category, sort, query, inStock]);

  const chip = (active: boolean) =>
    cn("t-meta min-h-11 border px-4 text-left transition-colors", active ? "border-plum bg-plum text-white" : "border-ink/30 hover:border-ink");

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <aside aria-label="Filters" className="flex flex-col gap-6 lg:sticky lg:top-28 lg:h-fit">
        {books.length > 6 && (
          <label className="flex flex-col gap-1">
            <span className="t-meta">Search</span>
            <input type="search" placeholder="Title or category" value={query} onChange={(e) => setQuery(e.target.value)} className="site-input" />
          </label>
        )}
        {categories.length > 1 && (
          <div role="group" aria-label="Filter by category" className="flex flex-col gap-2">
            <span className="t-meta">Category</span>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <button type="button" aria-pressed={category === "All"} onClick={() => setCategory("All")} className={chip(category === "All")}>
                All ({books.length})
              </button>
              {categories.map(([c, count]) => (
                <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={chip(category === c)}>
                  {c} ({count})
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="t-meta">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="site-input">
            <option value="featured">Featured first</option>
            <option value="title">Title A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-5 accent-plum" />
          <span>In stock only</span>
        </label>
      </aside>

      <div>
        <p aria-live="polite" className="t-meta mb-6 border-b border-ink/15 pb-3 text-ink/75">
          {visible.length} {visible.length === 1 ? "book" : "books"}
          {category !== "All" && <> in {category}</>}
        </p>
        {visible.length === 0 ? (
          <p>No books match your filters.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8">
            {visible.map((book, i) => (
              <Reveal as="li" key={book.id} delay={(i % 3) * 80}>
                <BookCard book={book} index={i} priority={i < 2} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
