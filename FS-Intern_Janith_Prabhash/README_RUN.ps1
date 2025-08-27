<#
Optional helper script to run everything on Windows PowerShell.

You have two ways to provide a valid Postgres at localhost:5432:
1) Docker Desktop (recommended): uses app/app user and app DB as in .env
2) Local Postgres: either create user/db to match .env, or change .env to your creds
#>

# --- Option A: Docker Desktop (recommended) ---
# Requires Docker Desktop running. Then start Postgres container defined in docker-compose.yml:
# Set-Location -Path "d:\Projects\NovaVantix\FS-Intern_YourName"
# docker compose up -d

# --- Backend setup ---
Set-Location -Path "d:\Projects\NovaVantix\FS-Intern_YourName\server"
npm install
npx prisma generate

# Apply migrations (DB must be running and credentials in .env must be valid)
# For Docker (Option A), the default .env is already correct (app/app@app:5432/app)
npx prisma migrate dev --name init

# Seed users and sample project/tasks
npm run db:seed

# Run the API server
npm run dev
