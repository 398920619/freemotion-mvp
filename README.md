# FreeMotion MVP Backend

A NestJS + Prisma implementation of the FreeMotion fitness marketplace MVP. It covers authentication, coach onboarding, booking, mock payments, and admin review workflows described in the product brief.

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
```

## Available Scripts
- `npm run start:dev` – start the NestJS server with automatic reload.
- `npm run build` – build the production-ready bundle into `dist/`.
- `npm run prisma:migrate` – run Prisma migrations (interactive).
- `npm run prisma:generate` – regenerate the Prisma Client after schema changes.

## Project Structure
```
src/
  auth/         # registration, login, JWT strategy
  user/         # self-service profile APIs
  coach/        # coach onboarding, profile & order views
  order/        # booking, payment simulation, order transitions
  admin/        # admin login & coach approvals
  payment/      # mock payment webhook
  scheduler/    # cron to auto-complete paid orders
  prisma/       # Prisma service wrapper
```

See `docs/mvp-plan.md` for the original planning document.
