# 🚀 Project Management System – Janith Prabhash

[![CI](https://github.com/janithprabashrk/Task-Nebula/actions/workflows/ci.yml/badge.svg)](https://github.com/janithprabashrk/Task-Nebula/actions/workflows/ci.yml)
[![Pages](https://github.com/janithprabashrk/Task-Nebula/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/janithprabashrk/Task-Nebula/actions/workflows/deploy-web.yml)
[![Server Image](https://github.com/janithprabashrk/Task-Nebula/actions/workflows/deploy-server.yml/badge.svg)](https://github.com/janithprabashrk/Task-Nebula/actions/workflows/deploy-server.yml)
[![Docker-Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)]()

A small, production-like slice of a **Projects & Tasks** app.

##  Tech Stack  
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)  
![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express)  
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend%20%26%20Backend-blue?logo=typescript)  
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)  
![Vite](https://img.shields.io/badge/Vite-Bundler-yellow?logo=vite)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)  
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)  
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)  
![Zod](https://img.shields.io/badge/Validation-Zod-purple)  
![Vitest](https://img.shields.io/badge/Tests-Vitest-blueviolet)  
![Supertest](https://img.shields.io/badge/Tests-Supertest-orange)  
![Pino](https://img.shields.io/badge/Logs-Pino-green)

##  Assumptions
- Members can **view projects** that have at least one task assigned to them.  
- Members can **create/edit tasks** only where **assignee = self**.  
- Admin can assign tasks to **any member**.  
- **Optimistic locking:** `PATCH /tasks/:id` requires a version via `If-Match` header (preferred) or `body.version`.  

##  How to Run Locally (PowerShell)

###  Prerequisites
- Node.js **18+**  
- **Docker Desktop** (for Postgres) or a local Postgres  

###  Step-by-Step

```powershell
# 1) Start Postgres via Docker (recommended)
cd d:\Projects\NovaVantix\Task-Nebula\FS-Intern_Janith_Prabhash
docker compose up -d

# 2) Backend: install deps & prepare DB
cd .\server
copy .env.sample .env
npm install
npx prisma generate
npm run db:reset

# 3) Frontend: install deps
cd ..\web
npm install

# 4) Run the apps
# Backend (terminal 1)
cd ..\server
npm run dev

# Frontend (terminal 2)
cd d:\Projects\NovaVantix\Task-Nebula\FS-Intern_Janith_Prabhash\web
npm run dev
```

* Backend → [http://localhost:4000](http://localhost:4000)
* Frontend → [http://localhost:5173](http://localhost:5173)

## Env Setup

Copy `.env.sample` → `.env` in `server/` and adjust as needed.

**Seeded users:**

* 👑 Admin → `admin@demo.test / Passw0rd!`
* 👤 Member → `alice@demo.test / Passw0rd!`
* 👤 Member → `bob@demo.test / Passw0rd!`

## API Quick Reference

* `POST /auth/login`
* `GET /health`
* `GET /projects?q=`
* `POST /projects` *(admin only)*
* `GET /projects/:id/tasks?status=&assignee=`
* `POST /projects/:id/tasks`
* `PATCH /tasks/:id` *(If-Match or body.version)*
* `DELETE /tasks/:id` *(member: own; admin: any)*

## Tests (Server)

```powershell
cd d:\Projects\NovaVantix\Task-Nebula\FS-Intern_Janith_Prabhash\server
npm test
```

## CI/CD

This repo includes GitHub Actions:

- ci.yml: build, lint, and test the server; build the web.
- deploy-web.yml: builds the web app and deploys to GitHub Pages.
- deploy-server.yml: builds and pushes the server Docker image to GitHub Container Registry (GHCR).

First-time setup you do once in GitHub repository settings:

- Pages: set Source to GitHub Actions.
- Packages permissions: ensure GITHUB_TOKEN has write permission to packages (default for public repos).
- Optionally set repository secrets (if you later push to a cloud registry or need non-default env).

Local Docker image build for the server:

```powershell
cd d:\Projects\NovaVantix\Task-Nebula\FS-Intern_Janith_Prabhash\server
docker build -t task-nebula-server:local .
```

Run with a local Postgres:

```powershell
docker run --rm -p 4000:4000 `
  -e DATABASE_URL="postgresql://app:app@host.docker.internal:5432/app?schema=public" `
  -e JWT_SECRET="changeme" `
  task-nebula-server:local
```

## What Works vs. Partial

* Core API aligns with spec, including **optimistic locking** and **RBAC**.
* Members can **CRUD their own tasks** within assigned projects; admin can manage all.
* Minimal but polished UI with **optimistic updates** and rollback on `409`.

⚠️ Known issues

* Metrics are minimal; can expand with more counters/gauges.

## Architecture (ASCII)

```
 [Web (Vite React TS)]  -->  [API (Express TS)]  -->  [Prisma ORM]  -->  [PostgreSQL]
          |                    |  \
          |                    |   --> /auth, /projects, /tasks routes
      Optimistic UI         JWT middleware, RBAC, zod validation
          |                    |  \
        Browser <--- JSON -----+   --> pino logs, error handler, /metrics
```
