# GDG on Campus UPES — Architecture & Vercel Deployment Guide

## 1. Architecture Overview (Browser-Local Portals)
This application runs completely standalone in the browser with **no external backend, no Supabase configuration, and no API keys required**.

- **Web Crypto Password Verifiers (`src/utils/crypto.ts`)**: Student and administrator accounts never store plaintext passwords in `localStorage` or `sessionStorage`. Instead, each account generates a unique 16-byte random salt and stores a salted PBKDF2 (`SHA-256`, 120,000 iterations) verifier.
- **Persistence (`localStorage`) & Active Sessions (`sessionStorage`)**:
  - `gdg_upes_students_v1`: Student accounts and profile metadata (`localStorage`).
  - `gdg_upes_admin_v1`: Local organizer administrator account (`localStorage`), initialized once via `/admin/login`.
  - `gdg_upes_events_v1`: Locally created/configured events (`localStorage`), merged with the verified historical chapter archive.
  - `gdg_upes_registrations_v1`: Event registration records (`localStorage`), checked for `(eventId, normalizedEmail)` uniqueness and capacity before saving.
  - `gdg_upes_student_session_v1` & `gdg_upes_admin_session_v1`: Active portal sessions stored in `sessionStorage` without passwords.

> **Important Security & Data Scope Note**: Because browser-local storage lives exclusively on the user's device and is accessible to client-side scripts on the same origin, this architecture demonstrates the full Student & Admin workflows on a single browser without a remote database. Data does not sync across separate browsers or devices, and client-side route guards are not equivalent to server-enforced access control.

## 2. Routes
- **Public Showcase & Discovery**: `/` (3D Developer Universe + Event Discovery + 3-Step Registration), `/events`
- **Student Portal**: `/student/login`, `/student/signup`, `/student/dashboard`, `/student/register/:eventId`, `/student/registrations`
- **Admin Portal**: `/admin/login` (includes first-time local administrator initialization when no admin exists yet), `/admin/dashboard`, `/admin/events`, `/admin/participants`, `/admin/settings`

## 3. Local Development & Build
```bash
npm install
npm run dev       # Starts Vite on http://localhost:3000
npm run lint      # Runs TypeScript check (tsc --noEmit)
npm run build     # Builds production bundle into dist/
```

## 4. Deploying on Vercel
1. Connect the repository in Vercel (Framework Preset: **Vite**).
2. Build Command: `npm run build`, Output Directory: `dist`.
3. `vercel.json` is included with SPA rewrites (`/(.*) -> /index.html`) so direct visits and page refreshes on `/student/*`, `/admin/*`, and `/events` never 404.
4. No environment variables or database credentials are required.
