# StudyNook Server

Backend API for [StudyNook](https://studynook-client-zeta.vercel.app) — a library study room booking platform.

Live API: https://study-nook-server-theta.vercel.app

Client repository: https://github.com/mimdev14/studynook-client.git

- 🔐 Better Auth authentication with HTTP-only cookie sessions, mounted on Express
- 🏫 Full CRUD API for study rooms, with server-side ownership verification
- 📅 Booking API with time-conflict detection to prevent double-booking
- 🔎 Search and filter endpoints using MongoDB `$regex`, `$in`, and range queries
- 🚀 Deployed as a Vercel serverless function

## Tech Stack
- Node.js, Express
- Better Auth
- MongoDB (native driver)

## Getting Started
```bash
npm install
npm run dev
```
Create a `.env` file based on `.env.example` before running.

## API Routes
- `/api/auth/*` — authentication (Better Auth)
- `/api/rooms` — room CRUD, search, and filtering
- `/api/bookings` — booking creation, listing, and cancellation
