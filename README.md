# Sawaalnama — ਸਵਾਲਨਾਮਾ

> Build beautiful forms with the spirit of Punjab. Collect responses with pride and warmth.

A full-stack, type-safe, monorepo form management platform built with **Next.js 16**, **tRPC**, **Drizzle ORM**, **PostgreSQL**, and **Turborepo**.

---

## 🚀 Features

| Feature | Status |
|---------|--------|
| Creator authentication (JWT cookie) | ✅ |
| Create, edit, publish, delete forms | ✅ |
| Dynamic field builder (10+ types) | ✅ |
| Public & Unlisted visibility modes | ✅ |
| Public Explore page | ✅ |
| Form submission without login | ✅ |
| QR Code sharing | ✅ |
| Clone forms | ✅ |
| Response analytics + bar chart | ✅ |
| CSV export for responses | ✅ |
| Email notifications via Resend | ✅ (optional) |
| API documentation via Scalar | ✅ |
| Punjab-themed design system | ✅ |

---

## 🏗️ Architecture

```
trpc-monorepo/
├── apps/
│   ├── api/          → Express + tRPC + OpenAPI (port 8000)
│   └── web/          → Next.js 16 frontend (port 3000)
├── packages/
│   ├── database/     → Drizzle ORM schema + migrations
│   ├── services/     → Business logic layer
│   ├── trpc/         → Shared tRPC router + types
│   ├── logger/       → Structured logging
│   └── typescript-config/ → Shared TS config
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL 15+ (or Docker)

### 1. Clone and Install
```bash
git clone <repo-url>
cd trpc-monorepo
pnpm install
```

### 2. Configure Environment

Create `.env` in the **root** of the monorepo:
```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/dev
JWT_SECRET=your-secret-here

# Optional — for Resend email notifications
RESEND_API_KEY=re_xxxxxxxx
FROM_EMAIL=your@domain.com
```

### 3. Start PostgreSQL (Docker)
```bash
docker-compose up -d
```

### 4. Migrate Database
```bash
pnpm db:migrate
```

### 5. Seed Demo Data
```bash
pnpm seed
```

### 6. Start Development
```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API Server | http://localhost:8000 |
| API Docs (Scalar) | http://localhost:8000/docs |

---

## 🎭 Demo Credentials

After running `pnpm seed`:

| Field | Value |
|-------|-------|
| Email | `demo@sawaalnama.com` |
| Password | `password123` |

Or use the **"Login as Demo User"** button on the login page.

---

## 📡 API Documentation

Full interactive API docs are available at:
- **Via Web App**: http://localhost:3000/docs
- **Direct (Scalar)**: http://localhost:8000/docs
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Key Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/trpc/form/createForm` | POST | Create a new form |
| `/trpc/form/listForms` | GET | List creator's forms |
| `/trpc/form/getFormById` | GET | Get form + fields |
| `/trpc/form/toggleFormStatus` | POST | Publish/unpublish |
| `/trpc/form/submitForm` | POST | Submit response (public) |
| `/trpc/form/listPublicForms` | GET | Public explore listing |
| `/trpc/form/cloneForm` | POST | Clone a form |

---

## 🎨 Design System

Uses a custom **Punjab Theme** with:
- **Saffron**: `oklch(0.62 0.19 48)` — primary actions and highlights
- **Green**: `oklch(0.5 0.14 145)` — success states and published status
- Phulkari-inspired decorative dot patterns
- Gurmukhi welcome text on login

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Authentication + profiles |
| `forms` | Form metadata + visibility |
| `form_fields` | Dynamic field definitions |
| `form_submissions` | Collected responses (JSONB) |

**Visibility Modes:**
- `public` — Shown in the public explore gallery. Anyone can submit.
- `unlisted` — Hidden from listings. Only accessible via direct link.

---

## 🔧 Available Commands

```bash
pnpm dev          # Start all services in development
pnpm build        # Build all packages
pnpm db:generate  # Generate Drizzle migration files
pnpm db:migrate   # Apply migrations to database
pnpm seed         # Seed demo data
pnpm lint         # Run ESLint
pnpm check-types  # Run TypeScript type checking
```

---

## 📦 Field Types Supported

`text`, `number`, `email`, `phone`, `textarea`, `select`, `radio`, `checkbox`, `YES_NO`, `file`, `image`, `rating`, `date`

---

## 🌍 Visibility Checks

| Form State | Public Listing | Direct Link | Submit |
|------------|----------------|-------------|--------|
| Draft (isActive=false) | ❌ | ❌ | ❌ |
| Published + Unlisted | ❌ | ✅ | ✅ |
| Published + Public | ✅ | ✅ | ✅ |

---

Built with ❤️ in the spirit of Punjab.
