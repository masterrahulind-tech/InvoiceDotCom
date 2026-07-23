# InvoiceDotCom

A full-stack web application where individuals (registered or unregistered businesses) can create interactive, shareable invoices with embedded payment details (UPI/QR/bank), track payment status, and share invoices via WhatsApp/Email/social links.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router, TypeScript), Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** Custom OTP-based (phone + OTP + JWT)
- **PDF Generation:** Puppeteer
- **QR Generation:** `qrcode` npm package
- **Form Handling:** React Hook Form + Zod
- **State Management:** React Server Components + Zustand

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

## Project Structure

See `docs/InvoiceDotCom-BUILD-GUIDE-for-AI-Agent.md` Section 3 for full structure.

## Phase 2 (Future Work — Not in Current Build)

The following features are planned for Phase 2 and beyond:

- Razorpay integration for auto payment detection (webhook → auto mark-as-paid)
- WhatsApp Business API automated reminders
- Recurring invoices (cron job)
- Quotation → Invoice conversion
- Multi-user team access (roles: owner/staff)
- E-signature/acknowledgment on public invoice page
- Analytics export (CSV/Excel)
- School/Education, Retail, Healthcare, Logistics templates
- Mobile app (React Native)
- Voice-to-invoice (AI-assisted)
- Multi-branch/franchise support
- White-label offering

## Decisions Log

See `docs/decisions.md` for any deviations from the build guide.
