# Author Book Store

Next.js (App Router) project — frontend and backend live in this same app (API routes are the backend).
Admin panel, auth and backend structure are carried over from the lab-grown project; the public site is deliberately unstyled.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your own values
node --env-file=.env.local scripts/create-admin.mjs "Admin" you@example.com 'a-strong-password'
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/login → /dashboard (email + password, then an OTP sent via SMTP)

## Features

- Public: Home, About, Books, Book details, Cart, Checkout, Contact
- Payments: Razorpay (order created server-side, signature verified on `/api/orders/verify`, webhook at `/api/orders/webhook`)
- WhatsApp floating button + Facebook / Instagram links (set in Dashboard → Site Content)
- Admin: Books (price, stock, images, publish/feature), Orders (status, tracking note), Queries, Site Content, Profile
- Book prices are always re-read from the database at checkout; the browser only sends book ids and quantities.

## Stack

Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui (admin), MongoDB/Mongoose, Cloudinary, Razorpay, Nodemailer.
