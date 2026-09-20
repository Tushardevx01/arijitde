-- 20260917_add_audit_fields - Add audit fields and soft delete
-- Safe for production: adds nullable columns first

-- AdvisorySession
ALTER TABLE "AdvisorySession" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "AdvisorySession" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Assessment
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Assessment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Client
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- ContactMessage
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- ExistingClient
ALTER TABLE "ExistingClient" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "ExistingClient" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "ExistingClient" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Folio
ALTER TABLE "Folio" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Folio" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Folio" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
ALTER TABLE "Folio" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Lead
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Portfolio
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- PortfolioRow
ALTER TABLE "PortfolioRow" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "PortfolioRow" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "PortfolioRow" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Score
ALTER TABLE "Score" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Score" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Score" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- SupportQuery
ALTER TABLE "SupportQuery" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "SupportQuery" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- User (keep tokenVersion, add deletedAt and updatedAt)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- RefreshToken table
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- Composite indexes
CREATE INDEX IF NOT EXISTS "Folio_clientPan_email_idx" ON "Folio"("clientPan", "email");
CREATE INDEX IF NOT EXISTS "Folio_deletedAt_idx" ON "Folio"("deletedAt");
CREATE INDEX IF NOT EXISTS "ExistingClient_pan_email_idx" ON "ExistingClient"("pan", "email");

-- Foreign keys for audit fields (nullable, SET NULL on delete)
ALTER TABLE "AdvisorySession" ADD CONSTRAINT "AdvisorySession_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdvisorySession" ADD CONSTRAINT "AdvisorySession_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Client" ADD CONSTRAINT "Client_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExistingClient" ADD CONSTRAINT "ExistingClient_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExistingClient" ADD CONSTRAINT "ExistingClient_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Folio" ADD CONSTRAINT "Folio_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Folio" ADD CONSTRAINT "Folio_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PortfolioRow" ADD CONSTRAINT "PortfolioRow_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PortfolioRow" ADD CONSTRAINT "PortfolioRow_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Score" ADD CONSTRAINT "Score_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Score" ADD CONSTRAINT "Score_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SupportQuery" ADD CONSTRAINT "SupportQuery_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportQuery" ADD CONSTRAINT "SupportQuery_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;