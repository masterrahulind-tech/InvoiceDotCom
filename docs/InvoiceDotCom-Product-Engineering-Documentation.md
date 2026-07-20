# InvoiceDotCom — Product & Engineering R&D Documentation

**Document Owner:** Software Development R&D Team
**Version:** 1.0 (Draft)
**Last Updated:** July 21, 2026
**Status:** Planning / Pre-Development

---

## 1. Executive Summary

**InvoiceDotCom** is a universal, interactive invoice-generation platform designed to serve **every category of income earner** — from unregistered individual brokers and freelancers to fully registered companies (real estate firms, restaurants, schools, retail shops, service providers, etc.).

The core idea: **anyone who needs to bill someone should be able to create a professional, shareable, payment-ready invoice in under 2 minutes — with or without a registered business.**

Key differentiators:
- Works for **individuals without GST/business registration** as well as **registered businesses**
- **Industry-specific invoice templates** (Real Estate, Restaurant, School/Education, Retail, Freelance/Services, Healthcare, Logistics, etc.)
- **Interactive invoices** — recipient can view status, pay via UPI/QR, and see receipt confirmation in real time
- **Payment status tracking** — Paid / Partially Paid / Pending / Overdue
- Built-in **QR code / UPI ID / bank account / payment link** embedding
- **One-tap social sharing** (WhatsApp, Instagram, LinkedIn, Email, SMS)
- Multi-business, multi-user, multi-currency support

---

## 2. Target Users & Business Verticals

| Segment | Example Users | Special Needs |
|---|---|---|
| Individual / Unregistered | Real estate brokers, freelance agents, tutors, local vendors | No GSTIN required, simple KYC (name, phone, UPI) |
| Registered Business | Pvt Ltd, LLP, Proprietorship | GSTIN, business PAN, letterhead, tax breakup |
| Real Estate | Individual brokers, agencies, builders | Property details, brokerage %, buyer/seller party fields, RERA number field |
| Restaurant / Food | Cafes, cloud kitchens, catering | Item-wise menu billing, table/order number, tax (CGST/SGST), tip field |
| Education | Schools, coaching centers, tutors | Student/parent details, fee head breakup (tuition, transport, exam fee), receipt numbering per academic year |
| Retail / Shop | Kirana, boutique, electronics | Item + quantity + discount, barcode/SKU optional |
| Freelance / Services | Designers, developers, consultants | Milestone-based invoicing, hourly billing, project reference |
| Healthcare | Clinics, individual doctors | Patient name (privacy-masked option), consultation/procedure codes |
| Logistics / Transport | Individual transporters, fleet owners | Trip details, distance, vehicle number, freight charges |
| Event / Wedding Planners | Individual planners, agencies | Package breakdown, advance/balance tracking |

The platform architecture must remain **vertical-agnostic at the core** and use a **template/plugin layer** for industry-specific fields (see Section 6).

---

## 3. Core Feature List

### 3.1 Account & Identity
- Sign up as **Individual** or **Business** (toggle at onboarding)
- Optional GSTIN / PAN / business registration number
- Multiple business profiles under one login (e.g., a broker running 2 side businesses)
- KYC-lite: Name, Phone (OTP verified), Email, UPI ID / Bank details
- Digital signature / stamp upload (optional, for professional invoices)

### 3.2 Invoice Creation
- Guided invoice builder (step-by-step, mobile-first)
- Industry template selection (auto-suggested based on profile type)
- Custom line items: description, quantity, rate, discount, tax
- Auto invoice numbering (customizable prefix, e.g., `SG/2026/0045`)
- Multi-currency support
- Save as **Draft**, **Recurring Invoice**, or **One-Time**
- Duplicate / clone previous invoice
- Multi-language invoice generation (Hindi, English, regional languages)

### 3.3 Payment Handling
- Payment status: `Paid` / `Partially Paid` / `Pending` / `Overdue` / `Refunded`
- Embed **UPI ID**, **QR code (auto-generated)**, **bank account (IFSC + A/C)**, or **external payment gateway link**
- "Mark as Paid" (manual) and **auto-detect via payment gateway webhook** (Razorpay/Cashfree/PhonePe integration — Phase 2)
- Partial payment logging (advance + balance tracking) — critical for real estate & event planners
- Auto payment reminders (SMS/WhatsApp/Email) for pending invoices
- Receipt auto-generation on payment confirmation

### 3.4 Interactivity (the "Interactive Invoice")
- Every invoice gets a **unique shareable link** (`invoicedotcom.com/inv/<id>`)
- Recipient view: mobile-optimized, can view, download PDF, pay directly, and see live status
- Sender gets **real-time notification** when invoice is viewed / paid
- Comment/query thread on invoice (buyer can ask "why is this charge here?")
- E-signature / acknowledgment button ("Accepted by Buyer")

### 3.5 Sharing
- One-tap share to **WhatsApp, Instagram (Story/DM), LinkedIn, Facebook, Telegram, Email, SMS**
- Auto-generated shareable preview card (image + link) optimized per platform
- QR code for offline sharing (print & display, useful for restaurants/shops)
- Downloadable PDF (branded with logo, letterhead)

### 3.6 Dashboard & Analytics
- Total invoiced, total received, total pending (monthly/yearly)
- Client-wise ledger (who owes what)
- Overdue alerts
- Export to Excel/CSV/PDF for accounting
- Basic GST report (for registered businesses) — Phase 2

### 3.7 Additional / Value-Add Features (Suggested Extensions)
- **Client/Customer CRM-lite** — save repeat client details
- **Estimate/Quotation → Invoice conversion** (send quote first, convert on approval)
- **Multi-user team access** (staff can create invoices, owner approves)
- **Invoice templates marketplace** (custom-designed themes per vertical)
- **Voice-to-invoice** (speak line items, AI fills the form) — future AI feature
- **WhatsApp Business API bot** — "Send me items and amount, I'll generate invoice" via chat
- **Offline mode** (PWA) — create invoice without internet, syncs when online
- **Multi-branch support** for franchises (restaurants, coaching chains)
- **Tax calculator assistant** for unregistered individuals unsure about GST applicability
- **Referral program** — brokers referring other brokers
- **White-label option** for agencies to use their own subdomain

---

## 4. High-Level User Workflow (Step-by-Step)

### 4.1 Onboarding Workflow
```
1. Landing page → "Create Free Invoice" CTA
2. Select: "I'm an Individual" OR "I have a Registered Business"
3. Enter phone number → OTP verification
4. Fill basic profile:
   - Name / Business Name
   - Business type (dropdown: Real Estate, Restaurant, School, Retail, Freelance, Other)
   - (If registered) GSTIN / PAN / Registration number
   - Logo upload (optional)
   - Payment details: UPI ID and/or Bank Account and/or QR upload
5. Choose default invoice template based on business type
6. Land on Dashboard → "Create Your First Invoice"
```

### 4.2 Invoice Creation Workflow
```
1. Click "New Invoice"
2. Select Invoice Type: Standard / Recurring / Quotation
3. Auto-filled: Invoice Number, Date, Due Date
4. Add "Bill To" party details (name, phone, email, address)
   - Option: Save this client for future invoices
5. Select or confirm industry template (fields adapt):
     Real Estate  → Property Address, Brokerage %, Buyer/Seller, RERA No.
     Restaurant   → Table/Order No., Item-wise menu, CGST/SGST, Tip
     School       → Student Name, Class, Fee Head breakup, Academic Year
     Retail       → Item, SKU, Qty, Discount
     Freelance    → Project Name, Milestone, Hours
6. Add line items (description, qty, rate, tax) — auto totals calculated
7. Add notes/terms (optional): payment terms, cancellation policy
8. Select Payment Mode to display: UPI QR / Bank Details / Payment Link
9. Preview invoice (live rendered)
10. Choose action:
     a. Save as Draft
     b. Generate & Share (moves to step 5)
```

### 4.3 Sharing & Payment Workflow
```
1. Invoice generated → unique link + PDF created
2. Sender selects share channel: WhatsApp / Instagram / Email / SMS / Copy Link / Print QR
3. Recipient opens link → views interactive invoice (mobile-optimized)
4. Recipient options:
     a. Download PDF
     b. Pay Now (scans QR / clicks UPI intent / opens payment gateway)
     c. Acknowledge / E-sign receipt
     d. Raise a query/comment
5. On payment:
     - If manual: Sender marks "Paid" from dashboard
     - If gateway-integrated: Status auto-updates via webhook
6. Auto receipt generated and shared back to both parties
7. Transaction logged in Dashboard → Client Ledger updated
```

### 4.4 Payment Reminder Workflow (Automated)
```
1. System checks due dates daily (cron job)
2. If invoice is "Pending" and due date is near/passed:
     → Send automated reminder (WhatsApp/SMS/Email) to recipient
3. Escalation: 3 reminders (Before due, On due, After due - overdue notice)
4. Sender can manually trigger "Send Reminder Now"
```

---

## 5. System Architecture (Proposed)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   Web App (React/Next.js)   |   Mobile App (React Native)    │
│   PWA (offline-first support for invoice creation)           │
└───────────────────────────┬────────────────────────────────┘
                             │  REST/GraphQL API (HTTPS)
┌───────────────────────────▼────────────────────────────────┐
│                      API GATEWAY / BFF                       │
│         Auth, Rate limiting, Request routing                 │
└───────────────────────────┬────────────────────────────────┘
                             │
   ┌─────────────┬───────────────┬───────────────┬────────────┐
   ▼             ▼               ▼               ▼            ▼
┌────────┐  ┌──────────┐  ┌─────────────┐  ┌───────────┐  ┌────────┐
│  Auth   │  │ Invoice  │  │  Payment    │  │ Notification│ │ Template│
│ Service │  │ Service  │  │  Service    │  │  Service    │ │ Service │
└────┬────┘  └────┬─────┘  └──────┬──────┘  └──────┬──────┘ └───┬────┘
     │            │               │                │            │
     ▼            ▼               ▼                ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  PostgreSQL (core relational data)                           │
│  Redis (sessions, caching, rate limits)                      │
│  S3/Cloud Storage (PDFs, logos, signatures, QR images)       │
└─────────────────────────────────────────────────────────────┘

External Integrations:
  - Payment Gateways: Razorpay / Cashfree / PhonePe Business / UPI Intent
  - Messaging: WhatsApp Business API, Twilio (SMS), SendGrid (Email)
  - QR Generation: UPI-standard QR (dynamic, per invoice)
  - PDF Generation: headless rendering (Puppeteer / wkhtmltopdf / server-side templating)
```

---

## 6. Template / Plugin Layer (Industry Customization)

To keep the core invoice engine universal while supporting many verticals, use a **schema-driven template system**:

```json
{
  "template_id": "real_estate_broker_v1",
  "base_fields": ["invoice_no", "date", "due_date", "bill_to", "line_items", "total", "payment_details"],
  "custom_fields": [
    { "key": "property_address", "label": "Property Address", "type": "text", "required": true },
    { "key": "brokerage_percent", "label": "Brokerage %", "type": "number" },
    { "key": "rera_number", "label": "RERA Registration No.", "type": "text", "required": false },
    { "key": "seller_name", "label": "Seller Name", "type": "text" },
    { "key": "buyer_name", "label": "Buyer Name", "type": "text" }
  ]
}
```

Each vertical (Restaurant, School, Retail, Freelance, Healthcare, Logistics, Events) gets its own JSON template definition. This allows:
- Fast onboarding of new business types without core code changes
- Admin panel to add/edit templates without a redeploy
- User-level custom field addition (any user can add their own extra field)

---

## 7. Database Schema (High-Level Entities)

| Entity | Key Fields |
|---|---|
| `users` | id, name, phone, email, role (individual/business), created_at |
| `business_profiles` | id, user_id, business_name, business_type, gstin, pan, logo_url, signature_url |
| `payment_methods` | id, business_profile_id, type (upi/bank/qr/gateway_link), value |
| `clients` | id, business_profile_id, name, phone, email, address |
| `invoice_templates` | id, name, vertical, schema_json |
| `invoices` | id, invoice_no, business_profile_id, client_id, template_id, status, total_amount, paid_amount, due_date, created_at |
| `invoice_line_items` | id, invoice_id, description, qty, rate, tax_percent, amount |
| `invoice_custom_fields` | id, invoice_id, field_key, field_value |
| `payments` | id, invoice_id, amount, mode, transaction_ref, status, paid_at |
| `notifications` | id, invoice_id, channel, status, sent_at |
| `activity_log` | id, invoice_id, action (viewed/paid/commented/signed), actor, timestamp |

---

## 8. Core API Endpoints (Draft)

```
Auth
  POST   /api/auth/otp/send
  POST   /api/auth/otp/verify
  POST   /api/auth/logout

Business Profile
  POST   /api/business-profiles
  GET    /api/business-profiles/:id
  PUT    /api/business-profiles/:id

Invoices
  POST   /api/invoices                    → create invoice
  GET    /api/invoices/:id                → fetch invoice
  PUT    /api/invoices/:id                → update/edit
  POST   /api/invoices/:id/send           → generate share link + trigger notification
  POST   /api/invoices/:id/mark-paid      → manual payment update
  GET    /api/invoices/:id/pdf            → download PDF
  GET    /api/invoices?client_id=&status= → list/filter

Payments
  POST   /api/payments/webhook            → gateway callback
  GET    /api/payments/:invoice_id        → payment history for invoice

Templates
  GET    /api/templates                   → list available industry templates
  GET    /api/templates/:id               → get schema

Public (recipient-facing, no auth)
  GET    /api/public/invoice/:token       → view invoice (recipient side)
  POST   /api/public/invoice/:token/pay   → initiate payment
  POST   /api/public/invoice/:token/ack   → acknowledge/e-sign
```

---

## 9. Screens / Pages Map

```
Public Site
  /                     → Landing page
  /pricing              → Pricing plans
  /templates            → Browse industry templates
  /login, /signup        → Auth

App (Authenticated)
  /dashboard            → Overview: totals, recent invoices, pending alerts
  /invoices             → List + filter/search
  /invoices/new         → Invoice builder (multi-step)
  /invoices/:id         → Invoice detail/edit
  /clients              → Client list (mini-CRM)
  /clients/:id          → Client ledger
  /settings/profile     → Business profile settings
  /settings/payment     → UPI/Bank/QR settings
  /settings/team        → Team member access (Phase 2)
  /reports              → Analytics & export

Public/Recipient-facing (no login required)
  /inv/:token           → Interactive invoice view + pay
  /receipt/:token       → Payment receipt view
```

---

## 10. Security & Compliance Considerations

- OTP-based auth, JWT session tokens, refresh token rotation
- Role-based access control (Owner / Staff / Viewer) for business accounts
- PII encryption at rest (client phone numbers, addresses)
- Payment data: **never store card details**; rely on PCI-DSS compliant gateways
- Public invoice links: use non-guessable tokens (UUID v4), optional expiry
- Rate limiting on public invoice view/pay endpoints to prevent abuse
- GDPR/India DPDP Act-aligned data handling (user can request data deletion)
- Audit trail on every invoice (view/edit/payment/e-sign) for dispute resolution
- Optional two-factor authentication for business owners

---

## 11. Monetization Model (Suggested)

| Plan | Target | Features |
|---|---|---|
| Free | Individuals, brokers, small vendors | Limited invoices/month, InvoiceDoc branding on PDF, basic templates |
| Pro | Registered businesses, restaurants, schools | Unlimited invoices, custom branding, payment gateway integration, reminders |
| Business/Team | Agencies, multi-branch (franchise restaurants, coaching chains) | Multi-user, multi-branch, advanced reports, white-label subdomain |
| Enterprise | Large chains, real estate agencies | API access, dedicated support, custom template development |

Add-on revenue: transaction fee % on gateway-processed payments (optional), premium template marketplace.

---

## 12. Development Roadmap (Phased)

### Phase 1 — MVP (Weeks 1–8)
- Auth (OTP-based), individual + business profile creation
- Basic invoice builder (3 templates: Real Estate, Restaurant, Generic/Freelance)
- Manual payment status (Paid/Pending), UPI ID + static QR embedding
- Shareable invoice link + PDF download
- WhatsApp/Email share buttons
- Basic dashboard (list, totals)

### Phase 2 — Core Expansion (Weeks 9–16)
- School/Education, Retail, Healthcare, Logistics templates
- Payment gateway integration (Razorpay/Cashfree) + auto status update
- Automated payment reminders (WhatsApp/SMS/Email)
- Client CRM-lite + ledger view
- Recurring invoices
- Quotation → Invoice conversion

### Phase 3 — Differentiation (Weeks 17–24)
- Interactive invoice: comments, e-signature/acknowledgment
- Multi-user team access with roles
- Analytics/reports export (CSV/Excel)
- Mobile app (React Native) launch
- Custom template builder (drag-and-drop, for Pro users)

### Phase 4 — Scale & AI (Weeks 25+)
- WhatsApp bot for chat-based invoice creation
- Voice-to-invoice (AI-assisted)
- Multi-branch/franchise support
- White-label offering for agencies
- Referral & partner program
- Regional language support expansion

---

## 13. Non-Functional Requirements

- **Performance:** Invoice creation-to-share flow under 60 seconds for a new user
- **Availability:** 99.9% uptime target for public invoice view/pay pages
- **Scalability:** Architecture must support horizontal scaling per microservice (Invoice, Payment, Notification services independently scalable)
- **Mobile-first:** 80%+ of target users (individual brokers, small vendors) will access via mobile — design and test mobile experience first
- **Localization:** Support Hindi + English at MVP, expand to regional languages by Phase 3
- **Accessibility:** WCAG 2.1 AA compliance for public-facing invoice pages

---

## 14. Open Questions for Next Planning Session

1. Which payment gateway to prioritize first for India (Razorpay vs Cashfree vs PhonePe Business) based on settlement speed and individual/unregistered-user onboarding ease?
2. Should unregistered individuals be allowed to use dynamic UPI QR generation directly, or only static personal UPI ID (regulatory consideration)?
3. Do we build native mobile apps in Phase 1 or rely on PWA until Phase 3?
4. What's the pricing threshold for "Free" tier invoice limit (e.g., 5/month, 10/month)?
5. Should WhatsApp Business API integration be first-party (own number) or user-connects-their-own-number?

---

*End of Document — This is a living document and should be updated as R&D discussions progress, particularly around payment gateway selection, template schema finalization, and mobile app framework decision.*
