# anorev

**Honest feedback. Hidden identities.**

anorev is an anonymous review platform. Create a room for anything that needs feedback — a design, a draft, a pitch deck — share one link, and let anyone leave exactly one anonymous review. No reviewer accounts, no sign-in, no friction.

## Features

- 🔗 **One link, one room** — paste a content URL and description, get a shareable review link
- 🕶️ **Fully anonymous reviews** — no reviewer accounts or names attached
- ✅ **One review per person** — lightweight duplicate-submission checks per room
- ⚡ **Live updates** — new reviews stream into the dashboard in real time via Pusher
- 🔐 **Email/OTP authentication** — sign up, verify by email, sign in with [better-auth](https://www.better-auth.com/)
- 🎛️ **Accepting-messages toggle** — creators can pause incoming reviews on any room
- 🧹 **Scheduled cleanup** — a daily cron job removes stale unverified accounts

## Tech stack

| Layer      | Choice                                              |
|------------|------------------------------------------------------|
| Framework  | [Next.js 16](https://nextjs.org) (App Router)         |
| UI         | React 19, Tailwind CSS v4, shadcn/ui, Radix primitives |
| Auth       | better-auth (email OTP)                                |
| Database   | MongoDB via Mongoose                                    |
| Realtime   | Pusher                                                   |
| Email      | Resend + React Email                                     |
| Forms      | react-hook-form + Zod                                     |
| Deployment | Vercel (with a scheduled cron job)                          |

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Pusher](https://pusher.com/) app (for live review updates)
- A [Resend](https://resend.com/) account (for verification emails)

### 1. Clone and install

    git clone <repo-url>
    cd webdev
    npm install

### 2. Configure environment variables

Create a `.env` file in the project root:

    # Auth
    BETTER_AUTH_SECRET=
    BETTER_AUTH_URL=http://localhost:3000

    # Database
    MONGODB_URI=

    # Email (Resend)
    RESEND_API_KEY=

    # Realtime (Pusher)
    PUSHER_APP_ID=
    NEXT_PUBLIC_PUSHER_KEY=
    PUSHER_SECRET=
    NEXT_PUBLIC_PUSHER_CLUSTER=

    # Cron job auth (see below)
    CRON_SECRET=

### 3. Run the dev server

    npm run dev

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command         | Description                       |
|-----------------|------------------------------------|
| `npm run dev`   | Start the development server        |
| `npm run build` | Build for production                 |
| `npm run start` | Run the production build              |
| `npm run lint`  | Run ESLint                             |

## Project structure

    src/
    ├── app/
    │   ├── api/                 # Route handlers (rooms, reviews, auth, pusher, cron)
    │   ├── dashboard/            # Authenticated creator dashboard
    │   │   ├── create/            # Create-room form
    │   │   └── rooms/[roomId]/     # Room detail + reviews
    │   ├── r/[roomId]/            # Public, anonymous review page
    │   ├── signin/, signup/        # Auth pages
    │   └── verifyEmail/             # OTP verification page
    ├── components/                # Shared UI (Navbar, RoomCard, Review, ui/*)
    ├── config/                    # DB + Resend client setup
    ├── lib/                       # auth, pusher clients, utils
    ├── models/                    # Mongoose schemas (room, review)
    └── utils/                     # API client + response/error helpers

## How it works

1. **Create a room** — a signed-in user pastes a content URL and description
2. **Share the link** — each room gets a public review link at `/r/[roomId]`
3. **Collect reviews** — visitors open the link and submit one anonymous review; the creator's dashboard updates live via Pusher
4. **Manage rooms** — creators can toggle whether a room is accepting new reviews, or delete it entirely

## Scheduled jobs

A Vercel cron job hits `/api/cron` daily (`vercel.json`) to delete accounts that never verified their email within 24 hours. The endpoint is protected by the `CRON_SECRET` environment variable via a bearer token.

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com/new), which will also pick up the cron schedule in `vercel.json` automatically. Make sure all environment variables above are set in your Vercel project settings.