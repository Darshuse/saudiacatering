# Warathah | ورثة

**Islamic Inheritance & Estate Management SaaS Platform**

Warathah is a full-stack platform for calculating Islamic inheritance shares (fara'id) according to all four major madhabs, managing shared estates between heirs, tracking rental income distributions, running transparent Waqf donation campaigns, and maintaining an immutable audit trail for every action.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Manual Setup](#manual-setup)
  - [Backend (Spring Boot)](#backend-spring-boot)
  - [Frontend (Next.js)](#frontend-nextjs)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Migrations](#database-migrations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Warathah ("ورثة", Arabic for "heirs") solves the real-world complexity of Islamic estate management:

1. **Inheritance Calculator** — Enter heirs and estate values; receive exact fractional shares (e.g. 3/24) and monetary amounts, with Fiqh explanations per heir, supporting Hanafi, Maliki, Shafi'i, and Hanbali schools.
2. **Estate Workspace** — Collaborative space where heirs can be invited, assets catalogued, rental income recorded, and distributions triggered automatically pro-rata to shares.
3. **Proposal & Voting** — Heirs vote on estate decisions (sell, renovate, lease) with share-weighted quorum enforcement.
4. **Waqf & Mosque Donations** — Transparent donation campaigns for mosques and awqaf with full spending ledger.
5. **Audit Trail** — Every state change is logged to an append-only audit_log table with old/new values.

---

## Features

| Module | Description |
|---|---|
| Auth | JWT + refresh tokens, email verification, role-based access |
| Fara'id Engine | Full 4-madhhab inheritance calculator with blocking/asaba logic |
| Estate Management | Multi-heir workspaces, asset registry, document storage |
| Income & Distribution | Rental income recording, pro-rata distributions with optimistic locking |
| Voting | Proposal lifecycle with share-weighted quorum |
| Waqf | Campaign management, donation pledges, spending transparency |
| Audit | Immutable append-only event log with RLS |

---

## Architecture

```
                          ┌─────────────────────────────────┐
                          │         warathah-network         │
                          │                                  │
  Browser / Mobile        │  ┌──────────────┐               │
  ─────────────────  ───► │  │   Next.js    │  :3000        │
                          │  │  (Frontend)  │               │
                          │  └──────┬───────┘               │
                          │         │ HTTP / REST            │
                          │  ┌──────▼───────┐               │
                          │  │  Spring Boot │  :8080        │
                          │  │  (Backend)   │               │
                          │  └──────┬───────┘               │
                          │         │ JDBC / Flyway          │
                          │  ┌──────▼───────┐               │
                          │  │  PostgreSQL  │  :5432        │
                          │  │   16-alpine  │               │
                          │  └──────────────┘               │
                          └─────────────────────────────────┘

  Backend internals:
  ┌──────────────────────────────────────────────────┐
  │  Controllers (REST)                              │
  │    AuthController  InheritanceController         │
  │    EstateController  WaqfController              │
  ├──────────────────────────────────────────────────┤
  │  Services (business logic)                       │
  │    FaraaidEngine  DistributionService            │
  │    ProposalService  AuditService                 │
  ├──────────────────────────────────────────────────┤
  │  Repositories (Spring Data JPA)                  │
  ├──────────────────────────────────────────────────┤
  │  Security (Spring Security + JWT)                │
  ├──────────────────────────────────────────────────┤
  │  DB Migrations (Flyway V1–V5)                    │
  └──────────────────────────────────────────────────┘
```

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Docker | 24.x | Required for containerised run |
| Docker Compose | 2.x | Bundled with Docker Desktop |
| Java (JDK) | 21 | Only needed for manual backend run |
| Maven | 3.9+ | Only needed for manual backend build |
| Node.js | 20 LTS | Only needed for manual frontend run |
| npm | 10+ | Bundled with Node 20 |
| PostgreSQL | 16 | Provided via Docker; manual setup optional |

---

## Quick Start with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/your-org/warathah.git
cd warathah/al-wiratha

# 2. Copy environment template and adjust secrets
cp .env.example .env
# Edit .env and set a strong JWT_SECRET and DB_PASS

# 3. Build and start all services
docker compose up --build -d

# 4. Verify health
docker compose ps
# All three services should show "healthy" or "running"

# 5. Open the application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080/api/v1
# Swagger:   http://localhost:8080/api/v1/swagger-ui.html
```

To stop all services:
```bash
docker compose down
```

To stop and remove all data (including the database volume):
```bash
docker compose down -v
```

---

## Manual Setup

### Backend (Spring Boot)

```bash
cd backend

# Ensure a PostgreSQL 16 instance is running and create the database
psql -U postgres -c "CREATE DATABASE warathah;"
psql -U postgres -c "CREATE USER warathah WITH PASSWORD 'warathah';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE warathah TO warathah;"

# Set environment variables (or export them in your shell)
export DB_URL=jdbc:postgresql://localhost:5432/warathah
export DB_USER=warathah
export DB_PASS=warathah
export JWT_SECRET=warathah-secret-key-change-in-production-must-be-at-least-256-bits-long
export ALLOWED_ORIGINS=http://localhost:3000

# Build
mvn clean package -DskipTests

# Run
java -jar target/*.jar
# Backend is available at http://localhost:8080
```

Flyway migrations (V1–V5) run automatically on startup. No manual SQL execution is needed.

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm ci

# Set the API URL
export NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Development mode (hot reload)
npm run dev
# Open http://localhost:3000

# Production build
npm run build
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Default | Description |
|---|---|---|
| `DB_USER` | `warathah` | PostgreSQL username |
| `DB_PASS` | `warathah_secure_password_here` | PostgreSQL password — change in production |
| `JWT_SECRET` | *(example value)* | HS256 signing key — must be at least 256 bits (32 characters) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Backend API base URL visible to the browser |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins for the backend |

> **Security note:** Never commit your `.env` file. It is listed in `.gitignore`.

---

## API Documentation

Once the backend is running, interactive Swagger UI is available at:

```
http://localhost:8080/api/v1/swagger-ui.html
```

OpenAPI JSON spec:
```
http://localhost:8080/api/v1/v3/api-docs
```

### Key Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Obtain JWT access + refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/inheritance/calculate` | Calculate inheritance shares |
| GET | `/inheritance/cases` | List user's cases |
| POST | `/estates` | Create an estate workspace |
| POST | `/estates/{id}/members` | Invite an heir |
| POST | `/estates/{id}/income` | Record rental income |
| POST | `/estates/{id}/distributions` | Trigger distribution |
| POST | `/proposals` | Create a vote proposal |
| POST | `/proposals/{id}/vote` | Cast a vote |
| GET | `/waqf` | List Waqf entities |
| POST | `/waqf/{id}/campaigns` | Create a donation campaign |
| POST | `/donations` | Pledge a donation |
| GET | `/actuator/health` | Health check |

---

## Database Migrations

Migrations are managed by **Flyway** and run automatically at application startup.

| Version | File | Description |
|---|---|---|
| V1 | `V1__create_users.sql` | Users table and refresh tokens |
| V2 | `V2__create_inheritance.sql` | Inheritance cases and case_heirs |
| V3 | `V3__create_estates.sql` | Estates, members, assets, distributions, proposals, votes, expenses |
| V4 | `V4__create_waqf.sql` | Waqf entities, campaigns, donations, waqf_expenses |
| V5 | `V5__create_audit_log.sql` | Immutable audit log with RLS |

Migration files are located in:
```
backend/src/main/resources/db/migration/
```

---

## Contributing

We welcome contributions from the community. Please follow these steps:

1. **Fork** the repository and create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Code style**
   - Backend: follow Google Java Style Guide; run `mvn checkstyle:check` before committing.
   - Frontend: ESLint + Prettier; run `npm run lint` before committing.

3. **Tests**
   - Backend: `mvn test` — unit tests for the Fara'id engine are mandatory for any inheritance logic change.
   - Frontend: `npm test`

4. **Commit messages** follow Conventional Commits:
   ```
   feat(inheritance): add awl (proportional reduction) for Hanafi
   fix(distribution): correct rounding when heirs > 12
   docs: update README with Waqf endpoints
   ```

5. **Pull Request**
   - Target the `main` branch.
   - Fill in the PR template (what, why, how to test).
   - At least one maintainer approval is required before merging.

6. **Islamic jurisprudence changes** require a citation to a classical fiqh source (e.g. Ibn Qudama's al-Mughni, al-Nawawi's al-Majmu') in the PR description.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

*Built with the intention of making the rights of heirs clear, fair, and accessible — in accordance with Islamic principles of justice.*
