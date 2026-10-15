---
name: author-bookstore-design
description: Art direction, tokens, components, motion, accessibility and SEO rules for the public (non-admin) pages of the author bookstore. Load before creating or editing any page under src/app/(site) or src/components/site.
---

# Author Bookstore — Public Site Design Skill

Scope: everything under `src/app/(site)` and `src/components/site`. The admin dashboard (`/dashboard`, `/login`) keeps its shadcn look and is NOT governed by this skill.

## 1. Identity — "Neo-zine"
A bold, printed-by-hand independent-zine feel: cream paper with a faint dot grid, thick ink outlines, hard offset shadows, big flat colour blocks, highlighter-marker emphasis and one rotated sticker per view. Books look like objects on a table (hard shadow, 2px ink border). Warm, playful, confident — never glossy.

Signature moves:
- 2px ink borders + hard shadow (`.zine-card`, `.btn-*`, covers). No soft blurred shadows, no big radii.
- `.mark` highlighter under the key words of headings (italic serif on a saffron stripe).
- Section blocks alternate flat colours: cream, saffron, lilac, mint, tomato, white, ink. Each section is one colour; never gradients.
- `.sticker` (rotated saffron label) for small callouts such as "Start here".
- Editorial photography is duotoned: greyscale + `mix-blend-multiply` over a colour block (`<EditorialImage tint="bg-lilac" />`). Book covers are never tinted.

## 2. Tokens (Tailwind theme names, defined in `globals.css`)
| Token | Hex | Use |
|---|---|---|
| `paper` | #FFF5E1 | page canvas (with dot grid) |
| `paper-deep` | #FFE8BF | image placeholders, soft bands |
| `ink` | #17140F | text, every border, hard shadows |
| `plum` | #C93A22 | primary action (tomato), links hover, error accent; white text passes AA |
| `clay` | #FFB627 | saffron: highlights, stickers, tiles; always with ink text |
| `sage` | #B8E0C8 | mint blocks |
| `lilac` | #CDB8F0 | lilac blocks |
| `white` | #FFFFFF | inputs, cards |

Contrast: ink on every block colour ≥ 9:1; white on `plum` ≈ 5:1. Saffron/mint/lilac are backgrounds only — never text colour on cream.

## 3. Typography
- Display: DM Serif Display (`font-display`, via `--font-heading`), weight 400, tight leading; italic reserved for `.mark` words.
- Body/UI: Inter; 16–18px, weight 500 on coloured blocks; measure ≤ 62ch.
- Hand: Caveat (`font-hand`) — rare annotations.
- Scale (fluid): `.t-hero` 3→8.5rem, `.t-h1` 2.5→5rem, `.t-h2` 2→3.5rem, `.t-h3` 1.5→2rem, `.t-meta` 0.75rem uppercase tracking-[0.18em].

## 4. Spacing, grid, containers
- 4px base. Section padding `py-20 md:py-32`. Gutter `px-5 sm:px-8`.
- `.container-site`: `max-w-[88rem]` with gutters; prose blocks `max-w-prose`.
- 12-col grid from `md`. Mobile: single column, but keep the editorial devices (numbers, rules, annotation, overlapping cover).
- Book cover ratio **2:3** (`aspect-[2/3]`), never stretch; use `object-cover` only in a 2:3 frame.

## 5. Book-cover treatment
Always render via `<BookCover>`: real image if present, otherwise a typographic cover generated from title/author (clearly a placeholder). Cover gets: left-edge spine gradient, 1px inner highlight, layered soft shadow (`shadow-book`), no border-radius beyond 2px. 2px ink border + hard shadow. Hover tilt (desktop, fine pointer, motion allowed): max ±6°. Cover must stay sharp and untinted.

## 6. Motion principles
Motion must show hierarchy, discovery or tactility. Prefer CSS transitions; no animation library is installed — do not add one.
- Reveal on scroll: opacity 0→1, translateY 16px→0, 600–800ms, `cubic-bezier(.22,.61,.36,1)`; stagger via `--d` (60–120ms steps). Once only.
- Featured hero book: fade + rise on load. Excerpt: page-like clip-path wipe.
- Carousel: native scroll-snap (touch for free) + prev/next buttons + arrow keys.
- Forbidden: continuous rotation, scroll hijacking, parallax on mobile, animating everything, infinite marquees.
- `prefers-reduced-motion: reduce` → all of the above render in final state with no transition (handled in `globals.css` and `Reveal`).

## 7. Components (src/components/site)
`SiteHeader`, `SiteFooter`, `CartDrawer` (mini-cart), `QuickAdd`, `StickyBuyBar` (mobile), `ShippingProgress`, `EditorialImage`, `Reveal`, `BookCover`, `BookRail`, `BookCard`, `BookGrid` (filter/sort), `FeaturedBook`, `Excerpt`, `NewsletterForm`, `ContactForm`, `AddToCartButton`, `CartView`, `CheckoutForm`, `Annotation`, `SectionHeading`, `JsonLd`. Reuse before creating. Buttons: `.btn-primary` (plum fill), `.btn-ghost` (ink outline), min height 44px. Links in prose: underline, offset 4px.
States: every interactive element has hover, `:focus-visible` (2px plum ring, 3px offset), disabled, and loading/error where async.

## 8. Accessibility
Skip link, landmarks (`header/nav/main/footer`), one `h1` per page, logical heading order, labelled form fields with inline errors (`aria-invalid`, `aria-describedby`), `role="status"` for success, `role="alert"` for errors, carousel with `aria-roledescription="carousel"` and labelled controls, touch targets ≥ 44px, meaningful `alt` (empty only for decorative), mobile menu with `aria-expanded`, Esc to close.

## 9. SEO & performance
- Unique `title` + `description` per page; canonical via `metadataBase` + `alternates.canonical`; Open Graph/Twitter set in root layout and overridden per page.
- `sitemap.ts` and `robots.ts` (disallow `/dashboard`, `/api`, `/login`, `/checkout`, `/cart`).
- JSON-LD only from real data: `Book`/`Product` + `Offer` only when title, price and availability are real; never invent ISBN, rating, review, publisher.
- Images: `next/image` for local/remote with `sizes`; hero cover `priority`, everything below the fold lazy; fixed aspect ratios to avoid CLS. Fonts: ≤3 families, `display: swap`.
- Server components by default; client components only for interaction.

## 9b. Storefront structure (e-commerce)
Announcement bar and trust strip are built only from real settings (free-shipping threshold, shipping charge, payment provider). Home order: hero → assurances → featured book → category tiles → collection rail → author → excerpt → inside the books → newsletter → final CTA. Books page: sidebar filters (category, sort, in-stock) on lg, stacked above the grid on mobile. Cards offer View + Quick add; the header cart opens the mini-cart drawer; book pages get a sticky mobile buy bar and a delivery & payment block. Sections without real data are omitted, never faked.

## 10. Content honesty
- Never fabricate reviews, testimonials, subscriber counts, credentials, prices, ISBNs, quotes from published books.
- No placeholder copy anywhere in the public UI. If a fact is missing, hide the block or ask the owner for it.
- Real data comes from MongoDB through `src/lib/site-data.ts`; while the database has no books the site reads the local `content/` folder (dummy content, see `content/README.md`). Books without a cover image are never shown. The `content/` folder is dummy and must be replaced before launch.

## 11. Anti-patterns (reject on sight)
Centered SaaS hero; three identical rounded cards; purple/blue gradients; glassmorphism; glowing orbs/blobs; `rounded-3xl` everywhere; emoji as icons; stock "Lorem" in production paths; shadows heavier than the book itself; carousels that autoplay.

## 12. QA checklist
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` pass
- [ ] Every nav/footer/CTA link resolves (no 404)
- [ ] 320 / 375 / 390 / 768 / 1024 / 1440+: no horizontal scroll, no clipped text, covers visible in hero
- [ ] Keyboard: skip link, menu, carousel arrows, forms, focus rings visible
- [ ] Reduced motion: nothing animates, content fully visible
- [ ] Forms: validation, success and error states
- [ ] No console errors; images have alt, dimensions/aspect set
- [ ] Titles/descriptions unique; JSON-LD only where data is real
- [ ] No fabricated content presented as real
