# Borlo

P2P rental marketplace for university students in Singapore.

**Live:** [borlo.app](https://borlo.app)

---

## What it does

Students list idle items for rent (cameras, consoles, gear, textbooks, anything). Other students browse, request a date range, and the owner accepts or declines. Once accepted, both parties connect via Telegram to arrange handover.

All users must sign up with a university email (`.edu.sg` / `.edu`).

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Auth | Supabase Auth (OTP via email) |
| Database | Supabase (PostgreSQL + RLS) |
| Storage | Supabase Storage |
| Email | Resend via Supabase Edge Functions |
| Deployment | Vercel |
| Tests | Playwright (E2E) |

---

## Local development

**Prerequisites:** Node.js 20+, a Supabase project

```bash
git clone https://github.com/your-username/borlo.git
cd borlo
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## E2E tests

```bash
# Requires ENABLE_E2E_TESTING=true and E2E_TEST_PASSWORD in .env.local
npm run test:e2e

# Interactive UI
npm run test:e2e:ui
```

18 tests covering listings CRUD, rental request flow, overlap validation, auto-decline, and the full accept → contact flow.

---

## Email notifications (Edge Function)

The `notify-rental-request` Edge Function handles two events:

- `INSERT` on `rental_requests` → emails owner
- `UPDATE` where `pending → accepted` → emails renter with owner's Telegram handle

Deploy:
```bash
supabase functions deploy notify-rental-request
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set SITE_URL=https://borlo.app
supabase secrets set FROM_EMAIL="Borlo <noreply@borlo.app>"
```

Then create two Database Webhooks in the Supabase dashboard pointing to `notify-rental-request`: one for INSERT, one for UPDATE on the `rental_requests` table.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage — listings grid
│   ├── login/                      # OTP login
│   ├── new/                        # Create listing
│   ├── profile/                    # User profile, my listings, requests
│   └── listings/[id]/
│       ├── page.tsx                # Listing detail
│       ├── edit/                   # Edit listing
│       ├── RequestForm.tsx         # Rental request form
│       ├── AvailabilityCalendar.tsx
│       ├── OwnerControls.tsx
│       └── ShareButtons.tsx
├── components/
│   ├── Header.tsx                  # Shared responsive header (server)
│   ├── MobileMenu.tsx              # Hamburger menu (client)
│   └── LogoutButton.tsx
└── lib/
    ├── supabase.ts                 # Client-side Supabase client
    └── supabase-server.ts          # Server-side + admin clients

supabase/
└── functions/
    └── notify-rental-request/     # Edge Function for email notifications

e2e/                                # Playwright tests
docs/
└── product.md                     # Product document (Chinese)
```

---

## License

MIT
