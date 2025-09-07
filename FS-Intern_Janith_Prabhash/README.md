# Project management system - Janith Prabhash

A small, production‑like slice of a Projects & Tasks app.

Tech stack
- Backend: Node.js + Express + TypeScript
- DB/ORM: PostgreSQL + Prisma
- Frontend: React + TypeScript (Vite)
- Auth: Email/password with JWT
- Validation: zod
- Tests: Vitest + Supertest
- Logs: pino (structured)

Assumptions
- Members can view projects that have at least one task assigned to them.
- Members can only create/edit tasks where assignee is self. Admin can assign tasks to anyone.
- Optimistic locking: PATCH /tasks/:id requires a version via If-Match header (preferred) or body.version.

## How to run (PowerShell)

Prereqs
- Node.js 18+
- Docker Desktop (for Postgres) or a local Postgres

1) Start Postgres via Docker (recommended)

```powershell
cd d:\Projects\NovaVantix\FS-Intern_YourName
docker compose up -d
```

2) Install dependencies and prepare DB

```powershell
# Backend
cd server
npm install
npx prisma generate
npm run db:reset

# Frontend
cd ..\web
npm install
```

3) Run the apps

```powershell
# Backend
cd ..\server
npm run dev

# Frontend (in a new terminal)
cd d:\Projects\NovaVantix\FS-Intern_YourName\web
npm run dev
```

Backend runs on http://localhost:4000
Frontend runs on http://localhost:5173

## Env setup
Copy `.env.sample` to `.env` in `server/` and edit if needed.

Seeded users
- Admin: admin@demo.test / Passw0rd!
- Member: alice@demo.test / Passw0rd!
- Member: bob@demo.test / Passw0rd!

## API quick reference
- POST /auth/login
- GET /health
- GET /projects?q=
- POST /projects (admin)
- GET /projects/:id/tasks?status=&assignee=
- POST /projects/:id/tasks
- PATCH /tasks/:id (If-Match or body.version)
 - DELETE /tasks/:id (member: own; admin: any)

## Tests

```powershell
cd d:\Projects\NovaVantix\FS-Intern_YourName\server
npm test
```

## What works vs. partial
- Core API aligns with spec, including optimistic locking and RBAC.
- Members can create/read/update/delete their own tasks within assigned projects; admin can manage all.
- Minimal but polished UI with optimistic updates and rollback on 409.

Known issues
- Metrics are minimal; can expand with more counters/gauges.

## Architecture (ASCII)
```
 [Web (Vite React TS)]  -->  [API (Express TS)]  -->  [Prisma ORM]  -->  [PostgreSQL]
		  |                    |  \
		  |                    |   --> /auth, /projects, /tasks routes
	  Optimistic UI         JWT middleware, RBAC, zod validation
		  |                    |  \
	    Browser <--- JSON -----+   --> pino logs, error handler, /metrics
```

