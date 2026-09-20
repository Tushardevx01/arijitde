# Deployment Guide

## Prerequisites

- GitHub repository with main branch
- Render account (backend)
- Vercel account (frontend)
- Neon PostgreSQL database
- Upstash Redis account
- Google Cloud Console project
- Gmail account with App Password

## Environment Variables

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | Neon PostgreSQL connection string |
| JWT_SECRET | Yes | 32+ char random string |
| OTP_SECRET | Yes | 32+ char random string (different from JWT) |
| PAN_VERIFICATION_SECRET | Yes | 32+ char random string (for PAN verification tokens) |
| GOOGLE_CLIENT_ID | Yes | Google OAuth Client ID |
| GOOGLE_CLIENT_SECRET | Yes | Google OAuth Secret |
| GMAIL_USER | Yes | Gmail address |
| GMAIL_APP_PASSWORD | Yes | Gmail App Password |
| GROK_API_KEY | Yes | Grok API Key |
| UPSTASH_REDIS_REST_URL | Yes | Upstash Redis REST URL |
| UPSTASH_REDIS_REST_TOKEN | Yes | Upstash Redis Token |
| FRONTEND_URL | Yes | Comma-separated frontend URLs |
| RENDER_EXTERNAL_URL | No | Render service URL for keep-alive |
| NODE_ENV | Yes | `production` |
| ENABLE_REFRESH_TOKENS | No | `true` (default) - enables refresh token rotation |
| SENTRY_DSN | No | Sentry error tracking DSN |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_API_URL | Yes | Backend API URL |
| NODE_ENV | Yes | `production` |

## Render Deployment (Backend)

### 1. Create Web Service

1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `finanalysis-api`
   - **Region**: Choose closest to users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Starter (or higher)

### 2. Add Environment Variables

In Render dashboard → Environment:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.pooler.neon.tech/db?sslmode=require&channel_binding=require
JWT_SECRET=your-64-char-secret
OTP_SECRET=your-64-char-secret
PAN_VERIFICATION_SECRET=your-64-char-secret
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
GROK_API_KEY=xxx
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
FRONTEND_URL=https://finanalysis.site,https://www.finanalysis.site
RENDER_EXTERNAL_URL=https://finanalysis-api.onrender.com
NODE_ENV=production
ENABLE_REFRESH_TOKENS=true
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3. Add Persistent Disk (Optional)

For uploads: Add a disk at `/backend/uploads` (1 GB minimum)

### 4. Deploy

Click "Create Web Service" and wait for deployment.

> **Note**: Build command runs `npm install && npx prisma generate && npm run build`. Prisma 7.10.0 is now used (updated from 7.8.0).

### 5. Verify

```bash
curl https://finanalysis-api.onrender.com/api/health
# {"success":true,"data":{"status":"healthy"}}

curl https://finanalysis-api.onrender.com/api/docs
# Should show Swagger UI
```

## Vercel Deployment (Frontend)

### 1. Import Project

1. Go to Vercel Dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Add Environment Variables

In Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://finanalysis-api.onrender.com/api
NODE_ENV=production
```

### 3. Deploy

Click "Deploy" and wait for completion.

### 3. Configure Custom Domain

1. Go to Project Settings → Domains
2. Add `finanalysis.site` and `www.finanalysis.site`
3. Configure DNS:
   - `A` record: `76.76.21.21` (Vercel IP)
   - `CNAME`: `www` → `cname.vercel-dns.com`

## Neon Database Setup

### 1. Create Project

1. Go to Neon Console
2. Create project: `finanalysis`
3. Select region closest to Render
4. Copy connection string

### 2. Configure Pooling

Use the **pooled** connection string:
```
postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db?sslmode=require&channel_binding=require
```

### 3. Run Migrations

```bash
# Locally with production DATABASE_URL
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 4. Enable Backups

Neon provides automatic daily backups. For point-in-time recovery, enable in project settings.

## Upstash Redis Setup

### 1. Create Database

1. Go to Upstash Console
2. Create database: `finanalysis-cache`
3. Select region matching Render
3. Copy REST URL and Token

### 2. Configure Eviction

Set eviction policy to `allkeys-lru` for cache behavior.

## Google Cloud OAuth Setup

### 1. Create OAuth Client

1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Create Credentials → OAuth Client ID
3. Application type: Web Application
4. Authorized redirect URIs:
   - `https://finanalysis-api.onrender.com/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (dev)
4. Save Client ID and Secret

### 2. Configure Consent Screen

1. OAuth Consent Screen
2. User Type: External
3. App Name: FinAnalysis
4. Authorized Domains: `finanalysis.site`
5. Scopes: `email`, `profile`, `openid`

## Gmail App Password

### 1. Enable 2FA

Google Account → Security → 2-Step Verification

### 2. Generate App Password

1. Security → App Passwords
2. Select "Mail" and "Other" → name it "FinAnalysis"
3. Copy the 16-character password

## DNS Configuration

### Cloudflare / DNS Provider

| Type | Name | Value | TTL | Proxy |
|------|------|-------|-----|-------|
| A | @ | 76.76.21.21 | Auto | Proxied |
| CNAME | www | cname.vercel-dns.com | Auto | Proxied |
| CNAME | api | finanalysis-api.onrender.com | Auto | Proxied |

### SSL/TLS

- Vercel: Automatic (Let's Encrypt)
- Render: Automatic (Let's Encrypt)
- Cloudflare: Full (Strict) SSL mode

## Post-Deployment Verification

### Health Checks

```bash
# Backend
curl https://finanalysis-api.onrender.com/api/health
# {"success":true,"data":{"status":"healthy"}}

# Frontend
curl -I https://finanalysis.site
# HTTP/2 200

# API Docs
curl https://finanalysis-api.onrender.com/api/openapi.json
```

### Functional Tests

1. **Registration Flow**: Register → Verify OTP → Login
2. **Assessment**: Complete risk assessment
3. **Portfolio**: Upload CAS → Generate scorecard
4. **Booking**: Book advisory session
5. **Admin**: Login as admin → View users/leads

### Monitoring

- **Uptime**: UptimeRobot / Better Uptime
- **Logs**: Render Logs + Vercel Logs
- **Errors**: Sentry (optional)
- **Performance**: Vercel Analytics + Render Metrics

## Rollback Procedure

### Backend (Render)

1. Go to Render Dashboard → Deploys
2. Click "Rollback" on previous successful deploy
4. Or: `render deploy rollback` via CLI

### Frontend (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Click "..." on previous deployment → "Promote to Production"
3. Or: `vercel rollback` via CLI

### Database

```bash
# If migration caused issues
cd backend
DATABASE_URL="..." npx prisma migrate resolve --rolled-back "migration_name"
DATABASE_URL="..." npx prisma migrate deploy
```

## Maintenance

### Scheduled Tasks

- **Daily**: Neon automated backups
- **Weekly**: Dependency updates (`npm audit fix`) — **Frontend now clean, Backend has 5 high (Prisma 6.x / nodemailer 10.x deferred)**
- **Monthly**: Rotate JWT/OTP secrets
- **Quarterly**: Review and rotate all API keys

### Scaling

| Component | Trigger | Action |
|-----------|---------|--------|
| Backend CPU > 80% | Sustained 5min | Upgrade Render plan |
| DB Connections > 80% | Sustained | Upgrade Neon compute |
| Redis Memory > 80% | Sustained | Upgrade Upstash plan |
| Build Time > 10min | Consistent | Optimize dependencies |

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Prisma generate fails | Schema drift | `npx prisma db push` |
| Migration fails | Lock timeout | Retry or split migration |
| CORS errors | Wrong origin | Check FRONTEND_URL |
| JWT expired | Clock skew | Sync server time (NTP) |
| Redis connection refused | Wrong URL | Check UPSTASH_REDIS_REST_URL |
| Google OAuth fails | Redirect URI mismatch | Check Google Cloud Console |
| Email not sending | App password expired | Regenerate Gmail App Password |

### Debug Commands

```bash
# Check Prisma schema
npx prisma validate

# Check migration status
npx prisma migrate status

# Test DB connection
npx prisma db execute --file check.sql

# View logs
render logs finanalysis-api --tail
vercel logs finanalysis-site
```

## Security Checklist

- [ ] All secrets in environment variables (not code)
- [ ] JWT_SECRET and OTP_SECRET are different
- [ ] PAN_VERIFICATION_SECRET is set and different from JWT_SECRET/OTP_SECRET
- [ ] HTTPS enforced everywhere
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] CSRF protection on state-changing routes
- [ ] Input validation on all endpoints
- [ ] SQL injection prevented (Prisma)
- [ ] XSS prevented (React auto-escape)
- [ ] Security headers (Helmet)
- [ ] Database backups enabled
- [ ] Secrets rotated quarterly
- [ ] Dependency audit clean (`npm audit`) — **Frontend: ✅ 0 vulns, Backend: 5 high (breaking changes required)**
- [ ] **Supply chain: xlsx from npm (not CDN)** — verified `package-lock.json` integrity