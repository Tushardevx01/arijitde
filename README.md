# FinAnalysis Platform

A comprehensive financial analysis platform built with Next.js 16, Express 5, Prisma ORM, and PostgreSQL (Neon).

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Database      │
│   (Next.js 16)  │     │   (Express 5)   │     │   (PostgreSQL)  │
│                 │     │                 │     │   (Neon)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   Cache         │
                        │   (Upstash      │
                        │   Redis)        │
                        └─────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 16.3.5 |
| Backend | Express | 5.2.1 |
| Database | PostgreSQL | 16 (Neon) |
| ORM | Prisma | 7.10.0 |
| Cache | Upstash Redis | - |
| Auth | JWT + Google OAuth | - |
| Testing | Jest + React Query + Playwright | - |

## Project Structure

```
finanalysis/
├── backend/                 # Express API
│   ├── src/
│   │   ├── index.ts         # App entry point
│   │   ├── lib/             # Shared utilities
│   │   │   ├── api-error.ts # RFC 7807 errors
│   │   │   ├── jwt.ts       # JWT utilities
│   │   │   ├── cache.ts     # Redis caching
│   │   │   ├── openapi.ts   # OpenAPI spec
│   │   │   └── prisma.ts    # Prisma client
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.ts      # JWT auth
│   │   │   ├── csrf.ts      # CSRF protection
│   │   │   ├── error.ts     # Global error handler
│   │   │   └── admin.ts     # Admin middleware
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts      # Authentication
│   │   │   ├── leads.ts     # Leads & advisory
│   │   │   ├── assess.ts    # Risk assessment
│   │   │   ├── portfolio.ts # Portfolio management
│   │   │   ├── score.ts     # Scoring engine
│   │   │   ├── admin.ts     # Admin panel
│   │   │   ├── chat.ts      # AI chat
│   │   │   ├── contact.ts   # Contact form
│   │   │   └── support.ts   # Support queries
│   │   └── services/        # Business logic
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # DB migrations
│   └── tests/               # Unit tests
│
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Client utilities
│   │   │   ├── api-client.ts # API client
│   │   │   ├── api-hooks.ts # React Query hooks
│   │   │   └── csrf.ts      # CSRF utilities
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
│
├── shared/                  # Shared types
└── .github/workflows/       # CI/CD pipelines
```

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (Neon recommended)
- Upstash Redis account
- Google Cloud OAuth credentials
- Gmail App Password

### Environment Variables

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.pooler.neon.tech/db?sslmode=require"

# JWT Secrets
JWT_SECRET="your-32-char-secret"
OTP_SECRET="your-32-char-secret"
PAN_VERIFICATION_SECRET="your-32-char-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Gmail SMTP
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Redis Cache
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# AI
GROK_API_KEY="your-grok-key"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Optional
ENABLE_REFRESH_TOKENS="true"
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

### Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Generate Prisma Client
cd backend && npx prisma generate

# Run migrations
cd backend && npx prisma migrate dev

# Start dev servers
cd backend && npm run dev    # Port 5000
cd frontend && npm run dev   # Port 3000
```

### Production Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production:  https://api.finanalysis.site/api
```

### Swagger UI
```
Development: http://localhost:5000/api/docs
Production:  https://api.finanalysis.site/api/docs
```

### OpenAPI Spec
```
Development: http://localhost:5000/api/openapi.json
Production:  https://api.finanalysis.site/api/openapi.json
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Email/password login |
| POST | /auth/google | Google OAuth |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout |
| GET | /auth/me | Current user profile |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |
| POST | /auth/verify-otp | Verify OTP |

### Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /assess | Create risk assessment |
| GET | /assess | List user assessments |
| GET | /assess/:id | Get assessment by ID |
| GET | /assess/user/:userId | Get user's latest assessment |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /portfolio | Create portfolio |
| GET | /portfolio | List user portfolios |
| GET | /portfolio/:id | Get portfolio by ID |
| PUT | /portfolio/:id | Update portfolio |
| DELETE | /portfolio/:id | Soft delete portfolio |
| GET | /portfolio/client-data | Get client portfolio data |

### Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /score/:portfolioId | Calculate score |
| GET | /score/:id | Get score by ID |
| GET | /score/portfolio/:portfolioId | Get scores for portfolio |

### Leads & Advisory Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /leads | Create lead |
| GET | /leads | List leads (admin) |
| GET | /leads/my-bookings | User bookings |
| GET | /leads/availability | Available slots |
| POST | /leads/book-session | Book session (auth) |
| POST | /leads/book-session-public | Book session (public) |
| GET | /leads/my-sessions | User sessions |
| PUT | /leads/:id/status | Update lead status (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/users | List users with pagination |
| GET | /admin/leads | List leads with counts |
| GET | /admin/existing-clients | List existing clients |
| POST | /admin/portfolio-upload | Upload portfolio Excel |
| POST | /admin/sync-folios | Sync folios |
| POST | /admin/existing-clients/upload | Upload clients CSV |
| DELETE | /admin/existing-clients/clear | Clear all clients |

### Chat & Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /chat | AI chat message |
| POST | /contact | Submit contact form |
| POST | /support/query | Submit support query |
| GET | /support | List user queries |

## Error Handling (RFC 7807)

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Validation Error",
  "status": 400,
  "detail": "email: Invalid email; password: Password too short",
  "instance": "/api/auth/login",
  "errors": [
    { "field": "email", "message": "Invalid email", "code": "invalid_string" },
    { "field": "password", "message": "Password too short", "code": "too_small" }
  ]
}
```

### Standard Error Responses
| Status | Title | Description |
|--------|-------|-------------|
| 400 | Validation Error | Request validation failed |
| 401 | Unauthorized | Invalid or missing auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected error |

## Caching Strategy

Cache keys follow the pattern: `{domain}:{operation}:{params}`

| Domain | TTL | Invalidation |
|--------|-----|--------------|
| Leads list | 1 min | On create/update/delete |
| User bookings | 5 min | On create/update |
| Availability | 5 min | On new booking |
| User sessions | 5 min | On create/update |
| Admin sessions | 30 sec | On create/update |
| Assessments | 5 min | On create |
| Portfolios | 5 min | On create/update |
| Scores | 5 min | On calculate |
| Client data | 1 hour | On update |
| Admin users | 5 min | On create/update |
| Admin clients | 5 min | On create/update/delete |

## Security

- **Helmet**: Security headers
- **CORS**: Configured origins + Vercel
- **Rate Limiting**: 200 req/15min global
- **CSRF**: Double-submit cookie pattern
- **JWT**: Access (15m) + Refresh (30d) tokens
- **OTP**: HMAC-SHA256, 6-digit, 10-min expiry
- **Passwords**: bcrypt (10 rounds)
- **Input Validation**: Zod schemas

## Deployment

### Docker

```yaml
# docker-compose.yml
services:
  pgbouncer:
    image: edoburu/pgbouncer:1.23
    environment:
      DATABASES_HOST: ${DB_HOST}
      DATABASES_PORT: ${DB_PORT}
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 100
      DEFAULT_POOL_SIZE: 20
    ports:
      - "6432:6432"
```

### Render / Vercel

1. Connect GitHub repo
2. Add environment variables
3. Deploy backend to Render
4. Deploy frontend to Vercel

### Health Checks

```bash
curl https://api.finanalysis.site/api/health
# {"success":true,"data":{"status":"healthy"}}
```

## Testing

```bash
# Backend tests
cd backend && npm test

# With coverage
cd backend && npm run test:coverage

# Frontend build verification
cd frontend && npm run build
```

## Monitoring

- **Logs**: Structured JSON logging
- **Errors**: RFC 7807 format with stack traces
- **Performance**: Response time headers
- **Cache**: Hit/miss metrics via Redis

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

Proprietary - FinAnalysis Platform