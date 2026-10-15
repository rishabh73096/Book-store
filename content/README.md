# Local content

Used by the website **only when the database has no published books** (or is unreachable).

- `site.json` — author name, bio, contact, social links, shipping. Any non-empty value is overridden by the dashboard (Site Content) once saved there.
- `books.json` — the books shown on the site. Cover images go in `public/books/` and are referenced as `/books/<file>`.

Everything in this folder is **dummy content** (titles, prices, bio, excerpts, contact details, and stock photographs in place of covers). Replace it with the real material, or add real data through the dashboard — database content always wins over this folder.

These books can be browsed and added to the cart, but they can only be *ordered* after they exist in the database:

    node --env-file=.env.local scripts/import-books.mjs

(or add them in Dashboard → Books).
