# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2026-09-20

### Fixed
- **Critical Supply Chain Risk (xlsx)**: Replaced CDN URL dependency (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`) with official npm package `xlsx@0.18.5` — uses published npm package instead of direct CDN URL
- **Frontend Vulnerabilities (3 critical/high)**: Updated Next.js `16.2.6 → 16.3.5`, React `19.2.4 → 19.3.0`, TypeScript `5.6.0 → 5.9.3` — resolves RCE, SSRF, DoS, and cache confusion vulnerabilities in Next.js App Router
- **Backend Vulnerabilities (5 high)**: Updated Prisma `7.8.0 → 7.10.0`, multer `2.1.1 → 2.4.0`, google-auth-library `10.6.2 → 10.9.1`, helmet `8.2.0 → 8.3.0`, express-rate-limit `8.5.2 → 8.7.0` — resolves DoS, file descriptor leak, and auth bypass issues

### Changed
- **Dependency Audit Results**: `npm audit` reports **0 vulnerabilities** on frontend; **5 high** on backend (require Prisma 6.x + nodemailer 10.x — deferred as breaking dependency upgrades)
- **Frontend Patch Updates**: @tanstack/react-query `5.100.14 → 5.103.1`, lucide-react `1.17.0 → 1.47.0`, motion `12.40.0 → 12.43.0`, radix-ui `1.4.3 → 1.6.7`, recharts `3.8.0 → 3.10.1`, shadcn `4.8.2 → 4.21.0`, tailwind-merge `3.6.0 → 3.7.0`, tailwindcss `4.3.2 → 4.3.3`, @lottiefiles/dotlottie-react `0.19.4 → 0.19.16`, @tabler/icons-react `3.44.0 → 3.47.0`, axios `1.16.1 → 1.20.0`, lenis `1.3.25 → 1.3.26`, eslint `9 → 9.39.5`
- **Backend Patch Updates**: @asteasolutions/zod-to-openapi `7.3.0 → 7.3.4`, @prisma/client `7.8.0 → 7.10.0`, @prisma/adapter-pg `7.8.0 → 7.10.0`, pg `8.21.0 → 8.23.0`, razorpay `2.9.2 → 2.9.8`, swagger-ui-express `5.0.0 → 5.0.1`, tsx `4.23.13 → 4.23.15`, jest `30.5.1 → 30.5.2`, @types/* updated to latest patches

### Verified
- Backend build: ✅ Prisma Client v7.10.0 generated, TypeScript compiles
- Frontend build: ✅ Next.js 16.3.5 (Turbopack) compiles successfully
- Backend tests: ✅ 43/43 passing
- Frontend E2E tests: ✅ 26/26 passing

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