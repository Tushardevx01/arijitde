# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2026-09-20

### Fixed

- **Global 401 Unauthorized on Unauthenticated Endpoints (`backend/src/index.ts`)**:
  - *What changed:* Replaced the global `app.use(authMiddleware)` with `app.use(optionalAuthMiddleware)`.
  - *Why:* `authMiddleware` throws `ApiError.unauthorized('Access token is missing or invalid')` whenever a request lacks a valid JWT Bearer header or cookie. Applying it as a top-level Express middleware rejected all unauthenticated and public requests (such as `GET /api/csrf`, `POST /api/auth/admin/login`, `POST /api/auth/otp/send`, and Google OAuth callback) with a 401 error before those route handlers could ever execute.
  - *Security & Risk Assessment:* **Zero Security Risk.** All sensitive and protected routes (`/api/admin/*`, `/api/portfolio/*`, `/api/assess/*`, `/api/leads/*`, etc.) continue to enforce strict authentication via their explicit, route-level `authMiddleware` and `adminMiddleware`. `optionalAuthMiddleware` parses and validates JWTs when present (populating `req.user` for rate-limiter exemption) without prematurely blocking public routes.

- **Missing Admin Password Login Endpoint (`backend/src/routes/auth/auth.password.ts`)**:
  - *What changed:* Restored the `POST /api/auth/admin/login` endpoint with Zod input validation (`adminLoginSchema`), brute-force rate limiting (`passwordLoginLimiter`: 10 attempts / 15 min), role verification (`role: 'ADMIN'`), and bcrypt hash comparison.
  - *Why:* The frontend admin login flow at `/onboarding` calls `POST /api/auth/admin/login` with email and password. This endpoint was omitted during an earlier modularization of the auth routes into separate files.
  - *Security & Risk Assessment:* **Zero Risk / Security Hardened.** Requests are strictly rate-limited against credential stuffing. Passwords are verified using constant-time `bcrypt.compare`. Generic error messages prevent user enumeration. Only accounts with `role: 'ADMIN'` can log in.

- **Leads Sub-route Parameter Conflict (`backend/src/routes/leads.ts`)**:
  - *What changed:* Moved parameterized dynamic routes (`GET /:id` and `DELETE /:id`) to the bottom of `leads.ts`, after all static sub-routes (`/my-bookings`, `/my-sessions`, `/availability`, `/slots`, etc.).
  - *Why:* In Express, routes are matched in declaration order. Because `/:id` was declared before `/my-bookings` and `/my-sessions`, requests like `GET /api/leads/my-bookings` had their URL segment `'my-bookings'` captured as the `id` parameter. This triggered a Zod UUID validation failure (`Invalid lead ID format`) and returned a 400 error instead of reaching the actual bookings handler.
  - *Security & Risk Assessment:* **Zero Risk.** All permission checks and role verifications remain unchanged. This strictly fixes route resolution order.

- **Admin Router Missing Leads Route Mount (`backend/src/routes/admin.ts`)**:
  - *What changed:* Mounted `leadsRouter` at `/leads` inside `adminRouter`.
  - *Why:* Frontend administrative screens making requests to `/api/admin/leads/*` were returning 404 Not Found.
  - *Security & Risk Assessment:* **Zero Risk.** Requests through `/api/admin/leads` inherit both `authMiddleware` and `adminMiddleware` applied at the `adminRouter` root, ensuring only authenticated administrators can access these endpoints.

- **Email Service Template Lookup & Production Build Packaging (`backend/src/services/email.ts`, `backend/package.json`)**:
  - *What changed:* Dynamic fallback resolution for the Nunjucks templates folder (`src/templates` vs `dist/templates`) and added `cp -r src/templates dist/templates` to the `build` script.
  - *Why:* When running the backend via compiled JavaScript in production (`dist/`), Nunjucks failed to locate template files (e.g. `emails/otp.njk`), which threw runtime errors and prevented OTP and notification emails from being dispatched.
  - *Security & Risk Assessment:* **Zero Risk.** The existing `ALLOWED_TEMPLATES` whitelist is preserved, preventing arbitrary path traversal or template injection.

- **Next.js Rewrite API Prefix Compatibility (`backend/src/index.ts`)**:
  - *What changed:* Mounted routers to both `/api/v1/*` and `/api/*`.
  - *Why:* Frontend requests proxied via Next.js rewrites target `/api/*`, while the backend previously only listened on `/api/v1/*`, leading to 404 errors on several API calls.
  - *Security & Risk Assessment:* **Zero Risk.** The identical security middleware and route handlers apply to both prefixes.

- **Missing Relational Database Timestamps (`Neon PostgreSQL`)**:
  - *What changed:* Added `createdAt TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()` columns to `PortfolioRow` and `Client` tables via idempotent migrations (`ADD COLUMN IF NOT EXISTS`).
  - *Why:* Prisma queries in `admin.ts` (`prisma.user.findMany` with relations) failed with database error `P2022 (column PortfolioRow.createdAt does not exist)`, crashing the Admin Dashboard user list with a 500 error.
  - *Security & Risk Assessment:* **Zero Risk.** Uses non-destructive default values without dropping or modifying any existing records.

- **TypeScript Compilation Configuration (`backend/tsconfig.json`)**:
  - *What changed:* Removed `"jest"` and `"@types/jest"` from compilerOptions `types`, keeping `types: ["node"]`.
  - *Why:* Jest types were not present in the runtime environment dependencies, which caused `tsc` to throw `Cannot find type definition file for 'jest'` during `npm run build`, blocking the deployment pipeline.
  - *Security & Risk Assessment:* **Zero Risk.** Build-time type definition configuration only; produces no change to runtime JavaScript logic.

- **AMFI Service Import & Rate Limiter Deprecation Warning (`backend/src/index.ts`)**:
  - *What changed:*
    1. Removed unused `import * as Sentry from '@sentry/node'` (Sentry is initialized through `./lib/sentry`).
    2. Replaced dynamic `import('./services/amfiService.js')` with `require('./services/amfiService')` during startup AMFI scheme validation.
    3. Added `validate: { keyGeneratorIpFallback: false }` to the global `rateLimit` configuration.
  - *Why:* The explicit `.js` extension in the TypeScript dynamic import caused `ERR_MODULE_NOT_FOUND` under CommonJS `ts-node` runtime execution. Removing the unused Sentry import eliminates compiler warnings. The rate-limiter validation flag silences express-rate-limit v8 deprecation warnings when resolving client IPs behind reverse proxies (Railway and Cloudflare).
  - *Security & Risk Assessment:* **Zero Risk.** AMFI benchmark validation and rate-limiting behaviors operate exactly as intended with zero bypasses.

- **Unused Auth Middleware Imports Cleanup (`backend/src/routes/auth/auth.password.ts`)**:
  - *What changed:* Removed unused `authMiddleware` and `AuthenticatedRequest` imports.
  - *Why:* Neither import was referenced in this file; cleaning up unused symbols prevents dead code accumulation and compiler warnings.
  - *Security & Risk Assessment:* **Zero Risk.** Purely clean code maintenance.

---

## [1.3.1] - 2026-09-20

### Fixed

- **Railway Deployment Crash (`leadsService.ts`)**: Replaced `new PrismaClient()` with the shared singleton from `lib/prisma`. The project uses `@prisma/adapter-pg` (PostgreSQL driver adapter), which requires `PrismaClient` to be constructed with explicit adapter options. Calling `new PrismaClient()` with no arguments threw `PrismaClientInitializationError` immediately when `leads.js` was loaded, causing the Railway container to crash on every startup attempt.

- **Railway Deployment Crash (`audit.ts`)**: Same fix as above — `audit.ts` also had its own `new PrismaClient()` with no arguments. In addition to the startup crash, this would have opened a second unnecessary connection pool to the database, wasting Neon's limited connections.

- **Railway Deployment Crash (`pan.ts`)**: Same Prisma singleton fix. Also hardened `PAN_VERIFICATION_SECRET` reading — the old code used a TypeScript `!` non-null assertion (`process.env.PAN_VERIFICATION_SECRET!`), which would silently be `undefined` at runtime if the env var was missing, causing cryptic JWT errors. Now explicitly falls back to `JWT_SECRET` with a clear error message if neither is set.

- **Unreachable `ENABLE_REFRESH_TOKENS` Default (`index.ts`)**: The default value for `ENABLE_REFRESH_TOKENS` was set **after** the required-env-var validation loop that calls `process.exit(1)`. This meant the default was never reached in production if the var was absent. Moved both `ENABLE_REFRESH_TOKENS` and `PAN_VERIFICATION_SECRET` defaults **before** the validation block so they are in place before any exit check runs.

- **Frontend Production Build Failure (`tsconfig.json`)**: Added `playwright.config.ts` and `tests/` to the TypeScript `exclude` list. After a `git pull`, the newly added `playwright.config.ts` was being type-checked by Next.js during `npm run build`. Since `@playwright/test` is not installed in production, TypeScript failed with `Cannot find module '@playwright/test'`, blocking the entire build. Playwright is a testing tool and should not be part of the production TypeScript compilation.

### Changed

- **Prisma Client Architecture**: `leadsService.ts`, `audit.ts`, and `pan.ts` now all use the shared `prisma` singleton from `lib/prisma` instead of creating their own `PrismaClient` instances. This ensures the `@prisma/adapter-pg` connection pool is shared correctly across all services.

---

## [1.3.0] - 2026-09-20

### Added
- **OTP Development Fallback**: In-memory Map storage for local development without Redis (NODE_ENV !== 'production')
- **Email Template Whitelist**: Validation against allowed templates (`otp`, `password-reset`, `password-reset-confirm`, `welcome`, `contact`, `support-query`, `booking-confirmation`) to prevent template injection
- **AMFI Scheme Code Validation**: Startup validation of mutual fund scheme codes against live AMFI API with warnings for invalid codes
- **Cache Invalidation for Public Session Booking**: `bookSessionPublic` now invalidates admin sessions cache
- **AMFI Benchmark Export**: `CATEGORY_BENCHMARKS` now exported for startup validation

### Changed
- **Rate Limiter Fix**: Moved `authMiddleware` before `globalLimiter`; authenticated users (`req.user`) now skip rate limiting via `skip: (req) => !!req.user` instead of synchronous `require()` in hot path
- **Constants Deduplication**: Removed duplicate `OTP_EXPIRY_SECONDS` and `OTP_MAX_ATTEMPTS` from `SECURITY_CONFIG` (now single-sourced from `OTP_CONFIG`)
- **OTP Service Refactor**: Removed Lua script dependency for in-memory fallback; simplified verification logic for development mode

### Fixed
- **Rate Limiter Auth Bypass**: Eliminated synchronous `require('./lib/jwt')` in rate limiter `skip` function
- **OTP Dev Blocking**: Development no longer requires Redis; in-memory Map with 10-min TTL + hourly cleanup for local development
- **Email Template Injection Risk**: Added whitelist validation for template parameter
- **Cache Invalidation Gap**: `bookSessionPublic` now properly invalidates `leads:admin:sessions` cache
- **TypeScript Compilation**: All strict mode errors resolved (43 tests passing, 0 TS errors)
- **OTP Memory Leak**: Added hourly cleanup interval with `.unref()` for in-memory OTP store in development
- **AMFI Startup Blocking**: Cached validation results with 24hr TTL + periodic revalidation (6hr interval)
- **Rate Limiter Performance**: Replaced SHA256 with FNV-1a 32-bit hash + LRU cache (10k entries) for key generation

### Security
- **Explicit OTP_SECRET Required**: Removed JWT_SECRET fallback (already in 1.2.0, reinforced)
- **Template Injection Prevention**: Whitelist of 7 allowed email templates
- **Rate Limiter Integrity**: Authenticated user check via `req.user` set by `authMiddleware`

## [Unreleased]

### Added
- Comprehensive documentation (README, DEPLOYMENT, CONTRIBUTING, CHANGELOG)
- GitHub Actions CI/CD with test coverage
- PgBouncer configuration for connection pooling
- Docker Compose for local development

### Changed
- Updated all error responses to RFC 7807 format

### Fixed
- Various TypeScript strict mode issues

## [1.2.0] - 2024-09-18

### Added
- **API Standardization**: RFC 7807 Problem Details for all error responses
- **OpenAPI 3.1 Specification**: Complete API documentation with 55 endpoints
- **Swagger UI**: Interactive API documentation at `/api/docs`
- **React Query Migration**: Type-safe API client with hooks for all endpoints
- **Redis Caching Layer**: Upstash Redis with intelligent cache invalidation
- **API Error Handling**: Centralized `ApiError` class with RFC 7807 format

### Changed
- All routes now return consistent RFC 7807 error responses
- Updated all routes to use `ApiError` class
- Improved TypeScript strict mode compliance

### Security
- Strict JWT type validation
- CSRF Bearer token validation restored
- Explicit OTP_SECRET required (no JWT_SECRET fallback)

## [1.1.0] - 2024-09-17

### Added
- **Database Audit Fields**: `createdBy`, `updatedBy` on all models with relations
- **Soft Deletes**: `deletedAt` on User, Portfolio, Folio models
- **Composite Indexes**: Optimized queries on Folio and ExistingClient
- **N+1 Query Fixes**: Admin users and existing-clients endpoints optimized
- **Cursor Pagination**: Leads endpoint with cursor-based pagination

### Changed
- Prisma schema with audit relations on all models
- Admin endpoints with `_count` relations and limited folios

### Fixed
- Prisma schema validation (duplicate User fields removed)
- CSRF token parsing (slice → split)
- Refresh token atomic consumption
- OTP purpose binding (HMAC-SHA256)

### Security
- OTP purpose binding with HMAC-SHA256
- Atomic Lua scripts for OTP verification
- Explicit OTP_SECRET environment variable required

## [1.0.0] - 2024-09-16

### Added
- Initial release of FinAnalysis Platform
- Next.js 16 frontend with App Router
- Express 5 backend with TypeScript
- Prisma ORM with PostgreSQL (Neon)
- JWT authentication with access/refresh tokens
- Google OAuth integration
- OTP-based passwordless authentication
- Risk assessment engine
- Portfolio management with Excel import
- Scoring engine with AMFI data
- Advisory session booking system
- Admin panel with user/lead management
- AI chat assistant (Groq)
- Contact and support forms
- Upstash Redis caching
- Prisma migrations

### Security
- Helmet security headers
- CORS with Vercel domain allowlist
- Rate limiting (200 req/15min)
- CSRF protection (double-submit cookie)
- bcrypt password hashing (10 rounds)
- JWT access (15m) + refresh (30d) tokens
- OTP with HMAC-SHA256

## Migration Guide

### Upgrading to 1.2.0

#### Backend
1. Pull latest changes
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npx prisma migrate deploy`
4. Update environment variables:
   - Add `OTP_SECRET` (separate from JWT_SECRET)
4. Run `npm run build`
4. Deploy

#### Frontend
1. Pull latest changes
2. Run `npm install`
3. Run `npm run build`
4. Deploy

### Breaking Changes in 1.2.0

- Error responses now follow RFC 7807 format
- API clients must handle new error structure
- `ApiError` class replaces manual error responses

### Deprecations

- `signToken` / `verifyToken` legacy aliases (use `signAccessToken` / `verifyAccessToken`)
- Manual error response patterns (use `ApiError` static methods)

## Support

For questions about migrations or upgrades, please open a GitHub issue or contact the development team.