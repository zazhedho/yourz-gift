<p align="center">
  <img src="frontend/public/logo-nobg.png" alt="Yourz Gift" width="180">
</p>

<h1 align="center">Yourz Gift</h1>

<p align="center">
  A thoughtful gift-list platform for moments that matter.
</p>

<p align="center">
  <a href="https://go.dev/"><img src="https://img.shields.io/badge/Go-1.26.3-00ADD8?logo=go&logoColor=white" alt="Go 1.26.3"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827" alt="React 19"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-frontend-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
</p>

> Yourz Gift was created specially for the birth of our first child. What began as a personal family milestone became a simple and thoughtful way to share gifts, avoid duplicates, and make every contribution feel meaningful.
>
> Dibuat khusus untuk menyambut kelahiran anak pertama kami.

## Contents

<details open>
<summary>Jump to a section</summary>

- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Product Flows](#product-flows)
- [API Surface](#api-surface)
- [Development](#development)
- [MVP Scope](#mvp-scope)
- [Design Notes](#design-notes)

</details>

## What It Does

Yourz Gift supports generic gift lists for weddings, birthdays, baby registries, baby showers, housewarmings, holidays, and custom occasions.

| Area | Available now |
| --- | --- |
| Gift lists | Create, edit, share, expire, and manage personalized lists. |
| Gift items | Add product links, images, prices, quantities, priorities, and descriptions. Reorder, archive, and restore items. |
| Reservations | Guests reserve quantities from a public link without creating an account. Owners can review, thank, and cancel reservation records. |
| Public sharing | Shareable public list codes with item availability, search, sorting, and reservation flow. |
| Identity | Email/password authentication, Google login, OTP registration, password reset, Turnstile validation, and optional session management. |
| Friends | Create friend connections and browse gift lists shared by friends. |
| Media | Upload and delete list or item images through the configured object storage provider. |
| Responsive UI | React frontend designed for both desktop and mobile workflows. |

## Architecture

~~~mermaid
flowchart LR
    Browser["Owner or guest browser"] --> Frontend["React + Vite frontend"]
    Frontend --> API["Gin HTTP API"]
    API --> Auth["JWT and permission middleware"]
    API --> Services["Domain services"]
    Services --> Database[("PostgreSQL")]
    Services -. optional .-> Redis[("Redis sessions and rate limits")]
    Services --> Storage[("MinIO or Cloudflare R2")]
    API -. optional .-> Mail["SMTP email"]
~~~

The backend follows a predictable flow:

~~~text
route -> handler -> service -> repository -> database
~~~

Common CRUD behavior uses the generic repository layer. Module repositories stay focused on business-specific queries, joins, aggregates, and transactional operations.

## Tech Stack

| Layer | Technology |
| --- | --- |
| API | Go, Gin, GORM |
| Database | PostgreSQL |
| Authentication | JWT, Google OAuth, OTP, Cloudflare Turnstile |
| Authorization | Permission-first RBAC |
| Frontend | React, Vite, React Router, Axios |
| Object storage | MinIO for local development, Cloudflare R2 as an option |
| Optional infrastructure | Redis for sessions, caching, and rate limiting; SMTP for email flows |
| Verification | Go tests, Vitest, Testing Library, Playwright |

## Project Structure

~~~text
yourz-gift/
├── cmd/                    # CLI helpers such as module seed generation
├── frontend/               # React and Vite application
├── infrastructure/         # Database and external service setup
├── internal/
│   ├── domain/             # Domain models
│   ├── dto/                # Request and response contracts
│   ├── handlers/http/      # HTTP handlers
│   ├── interfaces/         # Repository and service contracts
│   ├── repositories/       # Generic and module repositories
│   ├── router/             # API route registration
│   └── services/           # Business logic
├── migrations/             # Database migrations and seed data
├── middlewares/            # Authentication, permission, and request middleware
├── pkg/                    # Reusable packages such as security and storage
├── utils/                  # Small shared utilities
├── main.go
└── Makefile
~~~

## Quick Start

### Prerequisites

- Go 1.26.3 or newer
- Node.js and npm
- PostgreSQL
- Redis and MinIO are optional for a minimal local run, but recommended when testing sessions and image uploads

### 1. Start the backend

~~~bash
cp .env.example .env
~~~

Set the local database, JWT secret, and storage values in .env. For local image uploads, use:

~~~dotenv
STORAGE_PROVIDER=minio
~~~

Then install and run the API with migrations:

~~~bash
go mod download
go run . -migrate
~~~

The API is available at http://localhost:8080.

Health check:

~~~text
GET http://localhost:8080/healthcheck
~~~

After the first migration, start the API without migration when needed:

~~~bash
go run .
~~~

### 2. Start the frontend

~~~bash
cd frontend
npm install
cp .env.example .env
npm run dev
~~~

The frontend is available at http://localhost:5173 and expects:

~~~dotenv
VITE_API_URL=http://localhost:8080/api
~~~

Useful pages:

| Page | Route |
| --- | --- |
| Login | /login |
| Registration | /register |
| Owner lists | /lists |
| Friends | /friends |
| Public list | /g/:share_code |

## Configuration

Copy the example files before starting local development:

~~~bash
cp .env.example .env
cp frontend/.env.example frontend/.env
~~~

<details>
<summary>Backend configuration</summary>

Required values depend on the selected infrastructure:

- APP_NAME, APP_ENV, PORT, and GIN_MODE
- DATABASE_URL, or the individual DB_* variables
- JWT_KEY with a strong secret of at least 32 characters
- JWT_EXP
- PATH_MIGRATE

Optional integrations:

- Redis: sessions, permission cache, and rate limiting
- MinIO or Cloudflare R2: image upload and deletion
- Google: Google login
- Cloudflare Turnstile: login and registration protection
- SMTP: registration OTP and password reset email
- Location Service: location synchronization

Never commit .env, production secrets, access tokens, or private keys.

</details>

<details>
<summary>Frontend configuration</summary>

~~~dotenv
VITE_API_URL=http://localhost:8080/api
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
~~~

The Turnstile test keys from the example file are intended for local testing only. Use keys configured for the actual production hostname in production.

</details>

## Product Flows

### Owner flow

1. Register or sign in.
2. Create a list and choose an occasion.
3. Add gift items, images, quantities, and priorities.
4. Share the public link.
5. Review reservations and manage their lifecycle.

### Guest flow

1. Open the public list link.
2. Search or sort the available items.
3. Choose a quantity and reserve without an account.
4. The remaining quantity is updated transactionally so reservations cannot exceed availability.

### Permission model

Permissions are the runtime source of truth. Roles group permissions, while menu visibility is derived from the permissions available to the current user. superadmin is the only role with a global bypass.

## API Surface

The API is grouped by capability and uses /api as its protected and authenticated prefix.

<details>
<summary>Authentication and identity</summary>

~~~text
GET  /api/user/register/status
POST /api/user/register
POST /api/user/register/otp/send
POST /api/user/login
POST /api/user/google/login
POST /api/user/refresh-token
POST /api/user/forgot-password
POST /api/user/reset-password
POST /api/user/logout
GET  /api/user
~~~

</details>

<details>
<summary>Gift lists, items, and reservations</summary>

~~~text
GET  /api/gift-lists
POST /api/gift-lists
GET  /api/gift-lists/:id
PUT  /api/gift-lists/:id
DELETE /api/gift-lists/:id
GET  /api/gift-lists/:id/items
POST /api/gift-lists/:id/items
POST /api/gift-lists/:id/items/reorder
GET  /api/gift-lists/:id/reservations
PUT  /api/gift-items/:id
DELETE /api/gift-items/:id

GET  /api/public/gift-lists/:code
GET  /api/public/gift-lists/:code/items
POST /api/public/gift-lists/:code/items/:item_id/reservations

POST /api/gift-reservations/:id/thank
POST /api/gift-reservations/:id/cancel
~~~

</details>

<details>
<summary>Friends, media, and optional sessions</summary>

~~~text
GET  /api/friends
GET  /api/friends/requests
POST /api/friends/request
POST /api/friends/:id/accept
POST /api/friends/:id/reject
DELETE /api/friends/:id

POST   /api/media/upload
DELETE /api/media

GET  /api/user/sessions
DELETE /api/user/session/:session_id
POST /api/user/sessions/revoke-others
~~~

Session routes are registered only when Redis is available.

</details>

The API also includes system foundations for roles, permissions, menus, runtime configurations, locations, and audit logs.

## Development

Backend checks:

~~~bash
go test ./...
make lint
~~~

Frontend checks:

~~~bash
cd frontend
npm test -- --run
npm run lint
npm run build
~~~

For a new module, keep the existing pattern: add domain and DTO contracts, reuse the generic repository for common CRUD, add custom repository methods only for business queries, register routes, and seed matching menu and permission resources.

Generate menu and permission seed SQL with:

~~~bash
go run ./cmd/module-seed \
  --name projects \
  --display-name "Projects" \
  --path /projects \
  --icon bi-folder \
  --order-index 905
~~~

## MVP Scope

| Included | Deliberately outside the current MVP |
| --- | --- |
| Authenticated list ownership and management | Payment processing |
| Public no-account reservation | Guest account and reservation editing |
| Item availability and transactional quantity checks | Email confirmation for every reservation |
| Thank, cancel, archive, and restore flows | Notification center |
| Friend connections and shared-list browsing | Exchanges and exchange-specific workflows |
| Responsive desktop and mobile UI | Marketplace or seller integrations |

This keeps the product focused on the core loop: create a list, share it, reserve a gift, and manage the result.

## Design Notes

- [Shopify-inspired visual direction](DESIGN-shopify.md)
- [Backend MVP plan](docs/superpowers/plans/2026-07-01-yourz-gift-backend-mvp.md)
- [Frontend MVP plan](docs/superpowers/plans/2026-07-01-yourz-gift-frontend-mvp.md)

<p align="center">
  Built specially for the arrival of our first child.
  <br>
  Zaqia &amp; Zaidus
</p>
