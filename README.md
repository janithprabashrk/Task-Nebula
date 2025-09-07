# 🚀 Project Management System – *Janith Prabhash*

A small, production-like slice of a **Projects & Tasks** app.

## 🛠 Tech Stack  

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
![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?logo=docker)  

---

## 📌 Assumptions
- Members can **view projects** that have at least one task assigned to them.  
- Members can **create/edit tasks** only where **assignee = self**.  
- Admin can assign tasks to **any member**.  
- **Optimistic locking:** `PATCH /tasks/:id` requires a version via `If-Match` header (preferred) or `body.version`.  

---

## ⚙️ How to Run (PowerShell)

### 📋 Prerequisites
- Node.js **18+**
- **Docker Desktop** (for Postgres) or a local Postgres  

---
#2) Install dependencies & prepare DB

### ▶️ 1) Start Postgres via Docker (recommended)
```powershell
cd d:\Projects\NovaVantix\FS-Intern_YourName
docker compose up -d

# Backend
cd server
npm install
npx prisma generate
npm run db:reset

# Frontend
cd ..\web
npm install

```

#🖥️ 3) Run the apps
# Backend
cd ..\server
npm run dev

# Frontend (new terminal)
cd d:\Projects\NovaVantix\FS-Intern_YourName\web
npm run dev


Backend → http://localhost:4000

Frontend → http://localhost:5173

🌱 Env Setup

Copy .env.sample → .env in server/ and edit if needed.

Seeded users:

👑 Admin → admin@demo.test / Passw0rd!

👤 Member → alice@demo.test / Passw0rd!

👤 Member → bob@demo.test / Passw0rd!

📖 API Quick Reference

POST /auth/login

GET /health

GET /projects?q=

POST /projects (admin only)

GET /projects/:id/tasks?status=&assignee=

POST /projects/:id/tasks

PATCH /tasks/:id (If-Match or body.version)

DELETE /tasks/:id (member: own; admin: any)

🧪 Tests
cd d:\Projects\NovaVantix\FS-Intern_YourName\server
npm test

✅ What Works vs. Partial

Core API aligns with spec, including optimistic locking and RBAC.

Members can CRUD their own tasks within assigned projects; admin can manage all.

Minimal but polished UI with optimistic updates and rollback on 409.

⚠️ Known issues

Metrics are minimal; can expand with more counters/gauges.

🏗️ Architecture (ASCII)
 [Web (Vite React TS)]  -->  [API (Express TS)]  -->  [Prisma ORM]  -->  [PostgreSQL]
          |                    |  \
          |                    |   --> /auth, /projects, /tasks routes
      Optimistic UI         JWT middleware, RBAC, zod validation
          |                    |  \
        Browser <--- JSON -----+   --> pino logs, error handler, /metrics

Do you want me to also add **GitHub Actions CI/CD badges** (like ✅ Build passing, 🧪 Tests passing, 🐳 Docker Ready) at the very top of the README?

