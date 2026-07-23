# Decisions Log

Any deviations from the build guide are logged here with a one-line reason.

| Date | Decision | Reason |
|------|----------|--------|
| 2026-07-21 | Added `OtpToken` model to Prisma schema | Build guide says "stores hashed OTP + expiry in Redis or a temp DB table" — using DB table to avoid Redis dependency in MVP |
| 2026-07-21 | Used `bcryptjs` instead of `bcrypt` | `bcryptjs` is pure JS (no native build), avoids Windows node-gyp issues |
| 2026-07-21 | Project structure is flat (not monorepo `apps/web/`) | Build guide Section 3 shows `apps/web/` but Next.js creates flat structure; functionally identical, simpler for MVP |
| 2026-07-21 | Using Prisma v5 instead of v7 | Prisma v7 has breaking config changes incompatible with the build guide's schema format; v5 is stable and matches the guide's expectations |
| 2026-07-21 | Using SQLite for local dev instead of PostgreSQL | No local PostgreSQL or Docker available; SQLite for dev, switch to PostgreSQL for production deploy. Schema uses `Float` instead of `Decimal` and `String` instead of `Json` for SQLite compat |
| 2026-07-21 | Using `jose` instead of `jsonwebtoken` for JWT | `jose` is edge-compatible (works in Next.js middleware); `jsonwebtoken` is Node-only and crashes in Edge Runtime |
