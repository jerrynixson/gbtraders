# GBTraders

An e‑catalogue web app for GB Traders to display and manage vehicle listings, dealer profiles, inquiries, plans/payments, and search — built with Next.js (App Router), TypeScript, Firebase, Stripe, Tailwind CSS, and Algolia.

## Overview

GBTraders lets private sellers and third‑party dealers:

- Create and manage vehicle listings (images, details, price, status)
- Browse and search vehicles by make/model, brand, category, etc.
- Sent and receive quote price for vehicles
- Manage dealer profiles, plans, and tokens for listing quotas
- Purchase/upgrade/renew plans using Stripe Checkout
- Handle images via Firebase Storage and cache
- Persist data with Firestore and secure rules
- Support auth via Firebase + NextAuth (credentials/ID token flow)
- Browse Garages with separate dashboard for management
- Admin panel with function to manage vehicles and dealers

The app uses Firebase App Hosting for SSR (Next.js)

## Tech stack

- Next.js 15 (App Router) + React 18
- TypeScript 5
- Tailwind CSS 3 + shadcn/radix UI components
- Firebase (Auth, Firestore, Storage, Admin SDK)
- Stripe (Checkout + Webhooks)
- Algolia (InstantSearch)
- Zustand, React Hook Form, Zod

## Monorepo/project structure (key paths)

```
app/                # Next.js App Router pages and API routes
	api/              # Server routes (Stripe, auth utils, plan info, etc.)
	...               # Pages like /browse-vehicles, /vehicles, /dashboard, /signup
components/         # UI + domain components (vehicle cards, admin, dealer, etc.)
lib/                # Firebase client/admin, auth, utils, upload manager, offers
	db/               # Database helpers (types/utils/search)
hooks/              # Reusable hooks (useAuth, useAdmin, useToast)
public/             # Static assets (brands, banners, icons, etc.)
scripts/            # Dev utilities (add test vehicles, test token system)
styles/             # Global styles
firebase.json       # Hosting + App Hosting + rules/indexes config
apphosting.yaml     # App Hosting runtime + environment variables mapping
firestore.rules     # Firestore security rules
storage.rules       # Storage security rules
firestore.indexes.json # Composite indexes
next.config.mjs     # Next.js config (standalone output, images, redirects)
```

## Getting started

### Prerequisites

- Node.js 18+ (Next.js 15 requires Node 18 or newer)
- npm 9+ (or yarn/pnpm; commands below use npm)
- Stripe account (for payments)
- Firebase project with Firestore + Storage enabled

### Install

1. Install dependencies

```
npm ci
```

2. Create a `.env.local` at the project root and set environment variables (see full list below). You can copy/paste this starter and fill in values:

```
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (admin)
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App/Admin
NEXT_PUBLIC_ADMIN_EMAILS="admin1@example.com,admin2@example.com"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=
NEXT_PUBLIC_ALGOLIA_VEHICLES_INDEX=vehicles
NEXT_PUBLIC_ALGOLIA_GARAGES_INDEX=garages
NEXT_PUBLIC_ALGOLIA_DEALERS_INDEX=dealers

# Third‑party integrations
oneauto_key=                # OneAuto API key

```

3. Run the app

```
npm run dev
```

The app should be available at http://localhost:3000.

## Environment variables

The project reads variables in several places. App Hosting also maps secrets via `apphosting.yaml`.

All environment variables need to referenced from apphosting.yaml to GCP Secret Manager service.

## Stripe integration

- Checkout session creation: `POST /api/stripe/create-checkout`

  - Requires Firebase ID token in `Authorization: Bearer <idToken>`
  - Derives plan details and generates Stripe Checkout session

- Webhook endpoint: `POST /api/stripe/webhook`
  - Configure your Stripe webhook to this URL
  - Events handled: `checkout.session.completed`, `checkout.session.async_payment_failed`, `checkout.session.expired`
  - On success, updates `users` or `dealers` doc: tokens, history, plan validity

Local webhook testing (optional):

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Firebase setup and deploy

This repo is configured for Firebase Hosting + App Hosting (Cloud Run). Key files:

- `firebase.json` — Hosting rewrites/headers, rules, indexes, and App Hosting
- `apphosting.yaml` — Cloud Run settings, env vars mapped to Secret Manager
- `firestore.rules`, `storage.rules`, `firestore.indexes.json`

### Deploy

```
firebase deploy
```

CLI or Firebase platform through UI will build and deploy the Next.js app with SSR to Cloud Run behind Firebase App Hosting. 

## Useful npm scripts

- `dev` — Start Next.js in dev mode
- `build` — Production build
- `start` — Run the production build
- `preview` — Build and serve the standalone output (`.next/standalone/server.js`)
- `lint` — Run Next.js linting

## Security and data

- Firestore and Storage security rules live in the repo; review before going live
- Admin SDK uses service account via `FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`

