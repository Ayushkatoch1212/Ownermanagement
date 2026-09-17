# PG Manager

Admin-only PG management system built with Next.js 16, TypeScript, MongoDB/Mongoose, NextAuth Credentials and GSAP.

## Features

- Admin signup/login
- Protected dashboard
- Multiple PGs
- Rooms and occupancy
- Students/tenants
- Manual monthly payment records
- Rent/electricity/other charges
- Security deposits
- Monthly billing
- Expenses
- Reminders
- Revenue/occupancy dashboard
- Dark/light theme
- GSAP entrance animations
- MongoDB persistence

## Setup

1. Install Node.js 20+.
2. Create a MongoDB database.
3. Copy `.env.example` to `.env.local`.
4. Fill in `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
5. Install packages:

```bash
npm install
```

6. Start:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seed development data

```bash
npm run seed
```

Seed login:

- Email: `admin@example.com`
- Password: `Admin@12345`

Change/delete the seed credentials before using a real deployment.

## Architecture

Authentication is admin-only. Students never receive an application account and no payment gateway is integrated. Payments are records entered by the admin.

For production scheduled reminders, connect the Reminder collection to a cron/scheduler provider or background worker. A normal Next.js page request should not be treated as a persistent scheduler.

## Production

- Use a strong `NEXTAUTH_SECRET`.
- Restrict MongoDB network access.
- Add rate limiting to authentication and mutation APIs.
- Add audit logs before multi-admin production use.
- Add automated backups.
