# InvoiceDotCom — Full-Stack Build Guide (Agent-Executable)

**Purpose:** This document is written to be handed directly to an AI coding agent (e.g., Antigravity, Claude Code, Cursor) to build the **entire InvoiceDotCom web app** — backend, database, APIs, and frontend — from scratch. It contains concrete decisions (not open options) so the agent can execute without needing clarification.

**How to use this file:** Feed this whole file to the agent as the project brief. Then execute Section 6 (Build Order) task-by-task, in sequence. Each task is scoped to be completable and testable independently.

---

## 1. Project Summary

Build **InvoiceDotCom** — a full-stack web application where individuals (registered or unregistered businesses) can create interactive, shareable invoices with embedded payment details (UPI/QR/bank), track payment status, and share invoices via WhatsApp/Email/social links.

Reference product spec: see companion document `InvoiceDotCom-Product-Engineering-Documentation.md` for full feature/workflow context. This build guide is the **execution spec** derived from it, scoped to a buildable MVP first.

---

## 2. Locked Tech Stack

Do not substitute these unless a library is unavailable — pick the closest equivalent and note it in `/docs/decisions.md`.

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | **Next.js 14+ (App Router, TypeScript)** | SSR for public invoice pages (SEO + fast share previews), API routes co-located |
| Styling | **Tailwind CSS** | Fast iteration, consistent design tokens |
| UI components | **shadcn/ui** | Accessible, unstyled primitives, easy to theme |
| Backend | **Next.js API routes** (MVP) → extractable to standalone Node/Express service later if scaling requires | Keep MVP monorepo-simple |
| ORM | **Prisma** | Type-safe DB access, easy migrations |
| Database | **PostgreSQL** | Relational integrity for invoices/payments/clients |
| Auth | **Custom OTP-based auth** (phone number + OTP via Twilio/MSG91) + JWT session | Matches product spec; no email/password needed for MVP |
| File storage | **Local disk (dev)** → **AWS S3 / Cloudflare R2 (prod)** | PDFs, logos, QR images |
| PDF generation | **Puppeteer** (render invoice HTML template → PDF) | Full control over invoice layout |
| QR generation | **`qrcode` npm package** generating UPI-standard payment string | Static QR for MVP; dynamic gateway QR in Phase 2 |
| Payment gateway (Phase 2, not MVP) | **Razorpay** | Best individual/unregistered onboarding support in India |
| Notifications | **Twilio (SMS)**, **WhatsApp Business API** (Phase 2), **Resend or SendGrid (email)** | |
| Hosting | **Vercel (frontend + API routes)** + **Supabase or Neon (Postgres)** | Fast to deploy, scales for MVP |
| State management | **React Server Components + minimal client state (Zustand where needed)** | Avoid over-engineering |
| Form handling | **React Hook Form + Zod** | Type-safe validation shared between client and API |

---

## 3. Repository Structure

```
invoicedotcom/
├── apps/
│   └── web/                          # Next.js app (frontend + API routes)
│       ├── app/
│       │   ├── (public)/             # No-auth routes
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   └── inv/[token]/page.tsx   # Public interactive invoice view
│       │   ├── (app)/                # Authenticated routes
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── invoices/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── new/page.tsx
│       │   │   │   └── [id]/page.tsx
│       │   │   ├── clients/page.tsx
│       │   │   └── settings/
│       │   │       ├── profile/page.tsx
│       │   │       └── payment/page.tsx
│       │   └── api/
│       │       ├── auth/otp/send/route.ts
│       │       ├── auth/otp/verify/route.ts
│       │       ├── business-profiles/route.ts
│       │       ├── invoices/route.ts
│       │       ├── invoices/[id]/route.ts
│       │       ├── invoices/[id]/send/route.ts
│       │       ├── invoices/[id]/mark-paid/route.ts
│       │       ├── invoices/[id]/pdf/route.ts
│       │       ├── clients/route.ts
│       │       ├── templates/route.ts
│       │       └── public/invoice/[token]/route.ts
│       ├── components/
│       │   ├── ui/                   # shadcn components
│       │   ├── invoice-builder/
│       │   ├── invoice-preview/
│       │   └── dashboard/
│       ├── lib/
│       │   ├── prisma.ts
│       │   ├── auth.ts
│       │   ├── pdf-generator.ts
│       │   ├── qr-generator.ts
│       │   └── validators/           # Zod schemas
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── public/
│           └── templates/            # Invoice HTML templates per vertical
├── docs/
│   ├── InvoiceDotCom-Product-Engineering-Documentation.md
│   ├── InvoiceDotCom-BUILD-GUIDE-for-AI-Agent.md
│   └── decisions.md                  # Log any deviations from this guide here
├── .env.example
├── package.json
└── README.md
```

---

## 4. Environment Variables (`.env.example`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/invoicedotcom
JWT_SECRET=replace_with_random_64_char_string
OTP_PROVIDER_API_KEY=
OTP_PROVIDER_SENDER_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
FILE_STORAGE_MODE=local          # local | s3
S3_BUCKET_NAME=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=
EMAIL_PROVIDER_API_KEY=
RAZORPAY_KEY_ID=                 # Phase 2
RAZORPAY_KEY_SECRET=             # Phase 2
```

---

## 5. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  phone         String    @unique
  name          String
  email         String?
  createdAt     DateTime  @default(now())
  businessProfiles BusinessProfile[]
}

model BusinessProfile {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  businessName  String
  businessType  String    // individual | registered
  vertical      String    // real_estate | restaurant | school | retail | freelance | healthcare | logistics | events | other
  gstin         String?
  pan           String?
  logoUrl       String?
  signatureUrl  String?
  createdAt     DateTime  @default(now())

  paymentMethods PaymentMethod[]
  clients        Client[]
  invoices       Invoice[]
}

model PaymentMethod {
  id                String   @id @default(uuid())
  businessProfileId String
  businessProfile   BusinessProfile @relation(fields: [businessProfileId], references: [id])
  type              String   // upi | bank | qr_upload | gateway_link
  value             String   // upi id, bank details JSON string, image url, or link
  isDefault         Boolean  @default(false)
}

model Client {
  id                String   @id @default(uuid())
  businessProfileId String
  businessProfile   BusinessProfile @relation(fields: [businessProfileId], references: [id])
  name              String
  phone             String?
  email             String?
  address           String?
  invoices          Invoice[]
}

model InvoiceTemplate {
  id         String   @id @default(uuid())
  name       String
  vertical   String
  schemaJson Json     // custom field definitions
  invoices   Invoice[]
}

model Invoice {
  id                String   @id @default(uuid())
  invoiceNo         String
  businessProfileId String
  businessProfile   BusinessProfile @relation(fields: [businessProfileId], references: [id])
  clientId          String
  client            Client   @relation(fields: [clientId], references: [id])
  templateId        String?
  template          InvoiceTemplate? @relation(fields: [templateId], references: [id])
  status            String   @default("draft") // draft | pending | partially_paid | paid | overdue | refunded
  totalAmount       Decimal
  paidAmount        Decimal  @default(0)
  currency          String   @default("INR")
  dueDate           DateTime?
  publicToken       String   @unique @default(uuid())
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  lineItems         InvoiceLineItem[]
  customFields      InvoiceCustomField[]
  payments          Payment[]
  activityLogs      ActivityLog[]
}

model InvoiceLineItem {
  id          String  @id @default(uuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id])
  description String
  qty         Decimal
  rate        Decimal
  taxPercent  Decimal @default(0)
  amount      Decimal
}

model InvoiceCustomField {
  id        String  @id @default(uuid())
  invoiceId String
  invoice   Invoice @relation(fields: [invoiceId], references: [id])
  fieldKey  String
  fieldValue String
}

model Payment {
  id             String   @id @default(uuid())
  invoiceId      String
  invoice        Invoice  @relation(fields: [invoiceId], references: [id])
  amount         Decimal
  mode           String   // upi | bank | cash | gateway
  transactionRef String?
  status         String   // success | pending | failed
  paidAt         DateTime @default(now())
}

model ActivityLog {
  id        String   @id @default(uuid())
  invoiceId String
  invoice   Invoice  @relation(fields: [invoiceId], references: [id])
  action    String   // viewed | paid | commented | signed | reminder_sent
  actor     String?  // "sender" | "recipient"
  timestamp DateTime @default(now())
}
```

---

## 6. Build Order (Execute Sequentially)

Each task should end with a working, testable increment. Do not skip ahead.

### Task 1 — Project Scaffolding
- Init Next.js 14 app with TypeScript, App Router, Tailwind
- Install: `prisma`, `@prisma/client`, `zod`, `react-hook-form`, `zustand`, `qrcode`, `puppeteer`, `jsonwebtoken`, `bcrypt` (if needed), shadcn/ui CLI
- Set up `.env` from `.env.example`
- Configure `prisma/schema.prisma` per Section 5, run `npx prisma migrate dev --name init`
- **Test:** App boots on `localhost:3000`, DB connects, Prisma Studio shows empty tables

### Task 2 — Auth (OTP-based)
- Build `/api/auth/otp/send` — accepts phone, generates 6-digit OTP, stores hashed OTP + expiry in Redis or a temp DB table, sends via SMS provider (stub/mock for local dev)
- Build `/api/auth/otp/verify` — validates OTP, creates/fetches `User`, issues JWT, sets httpOnly cookie
- Build `/login` and `/signup` pages with phone input → OTP input flow
- Build middleware to protect `(app)/*` routes, redirect to `/login` if no valid session
- **Test:** Can sign up with phone number, verify OTP, land on `/dashboard`, session persists on refresh

### Task 3 — Business Profile Setup
- Build `/api/business-profiles` (POST/GET/PUT)
- Build onboarding flow: choose Individual/Registered → business type/vertical dropdown → optional GSTIN/PAN → logo upload → payment method (UPI ID input, minimum viable)
- Store payment method in `PaymentMethod` table
- **Test:** New user completes onboarding, profile appears in DB, redirected to dashboard

### Task 4 — Invoice Templates (Seed Data)
- Seed `InvoiceTemplate` table with at least 3 templates: `real_estate_broker_v1`, `restaurant_v1`, `freelance_generic_v1` (schema per Section 6 of the product doc — custom_fields JSON)
- Build `/api/templates` GET endpoint
- **Test:** Templates fetchable via API, visible in seed data

### Task 5 — Invoice Builder (Core)
- Build `/invoices/new` multi-step form:
  1. Select/confirm client (search existing `Client` or create new inline)
  2. Select template (auto-suggested from business profile vertical)
  3. Dynamic custom fields rendered from `template.schemaJson`
  4. Line items repeater (description, qty, rate, tax%) with live total calculation
  5. Payment method selection (from saved `PaymentMethod`s)
  6. Preview screen (rendered invoice HTML)
- Build `/api/invoices` POST — creates `Invoice`, `InvoiceLineItem[]`, `InvoiceCustomField[]`
- Auto-generate `invoiceNo` (format: `{businessInitials}/{year}/{sequence}`)
- **Test:** Full flow creates an invoice, visible in DB with correct line items and totals

### Task 6 — Invoice PDF + QR Generation
- Build invoice HTML template (per vertical) in `public/templates/`
- Build `lib/pdf-generator.ts` using Puppeteer: render HTML → PDF, store to `FILE_STORAGE_MODE` location
- Build `lib/qr-generator.ts`: generate UPI QR string (`upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR`) → PNG via `qrcode` package, embed in PDF/invoice page
- Build `/api/invoices/[id]/pdf` GET — returns/downloads PDF
- **Test:** Downloaded PDF renders correctly with QR code that scans to correct UPI intent (test with any UPI app)

### Task 7 — Public Interactive Invoice Page
- Build `/inv/[token]/page.tsx` — public, no-auth, SSR page
- Fetch via `/api/public/invoice/[token]` GET
- Display: invoice details, line items, total, payment status, QR/UPI/bank details, "Download PDF" button
- Log `ActivityLog` entry with action `viewed` on page load
- **Test:** Open invoice link in incognito, page loads without auth, view is logged

### Task 8 — Share Flow
- Build share buttons on `/invoices/[id]` (sender's authenticated view): WhatsApp (`wa.me` link with prefilled text + invoice link), Email (`mailto:`), Copy Link
- Build `/api/invoices/[id]/send` — marks invoice status `pending` if still `draft`, returns share-ready link/text
- **Test:** Clicking WhatsApp share opens WhatsApp Web/app with prefilled message containing invoice link

### Task 9 — Payment Status & Manual Mark-as-Paid
- Build `/api/invoices/[id]/mark-paid` POST — accepts amount, mode; creates `Payment` record; updates `Invoice.paidAmount` and `status` (auto-computes `partially_paid` vs `paid`)
- Build UI on `/invoices/[id]` (sender view) to trigger "Mark as Paid" with amount input
- On public invoice page, reflect live status (Paid badge / Pending badge)
- **Test:** Marking paid updates status on both sender dashboard and public invoice page

### Task 10 — Dashboard
- Build `/dashboard`: total invoiced, total received, total pending (aggregate queries), recent invoices list, overdue count
- Build `/invoices` list page with filters (status, client, date range)
- Build `/clients` page — list clients with total billed/pending per client (ledger view)
- **Test:** Dashboard numbers match DB state after creating/paying test invoices

### Task 11 — Polish & Deploy
- Add loading states, error boundaries, form validation error messages
- Mobile responsiveness pass (test at 375px width minimum)
- Deploy to Vercel, connect production Postgres (Supabase/Neon)
- Set production env vars
- **Test:** Full flow works end-to-end on production URL

---

## 7. Phase 2 (After MVP Ships — Not Part of Initial Build)

- Razorpay integration for auto payment detection (webhook → auto mark-as-paid)
- WhatsApp Business API automated reminders
- Recurring invoices (cron job)
- Quotation → Invoice conversion
- Multi-user team access (roles: owner/staff)
- E-signature/acknowledgment on public invoice page
- Analytics export (CSV/Excel)

Do not build these in the initial pass — flag them as "Phase 2" in the README so scope stays controlled.

---

## 8. Acceptance Criteria for MVP Completion

The MVP is considered done when a user can, end-to-end, without any manual DB intervention:

1. Sign up with phone + OTP as an individual (unregistered) broker
2. Set up business profile with a UPI ID as payment method
3. Create an invoice using the Real Estate template with property address, brokerage %, and buyer/seller fields
4. Generate a PDF with embedded QR code that scans to a valid UPI payment intent
5. Share the invoice via WhatsApp link
6. Open the invoice link on another device/incognito without logging in, and view it correctly
7. Mark the invoice as paid from the dashboard and see the status reflect on the public invoice page
8. See the invoice total reflected correctly in the dashboard's "Total Received" figure

---

## 9. Notes for the Agent

- Prefer server components by default in Next.js App Router; only use `"use client"` where interactivity is required (forms, live totals, share buttons)
- Keep all money values as `Decimal` in Prisma and format only at the display layer — never do currency math in floating point
- Every public-facing route (`/inv/[token]`) must validate the token exists and is not malformed before querying — return a clean 404 page, not a stack trace
- Log deviations from this guide (library swaps, schema changes) in `docs/decisions.md` as you go, with a one-line reason
- Write this MVP to be **framework-idiomatic Next.js** — no premature abstraction into separate backend services; that extraction can happen later if/when scale requires it

---

*This build guide is the execution companion to `InvoiceDotCom-Product-Engineering-Documentation.md`. Refer back to that document for full feature vision and long-term roadmap context.*
