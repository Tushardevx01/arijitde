# FinAnalysis API Versioning Policy

## Overview
This document defines the versioning strategy for the FinAnalysis API to ensure backward compatibility, clear communication of changes, and smooth migration paths for API consumers.

## Versioning Strategy

### URL-Based Versioning
All API endpoints are prefixed with the version in the URL path:
```
/api/v1/...
```

Current version: **v1** (stable)

### Version Format
- **Major versions** (`v1`, `v2`, etc.): Breaking changes that require client migration
- **Minor versions** (`v1.1`, `v1.2`): Backward-compatible feature additions
- **Patch versions** (`v1.0.1`): Bug fixes only, fully backward compatible

## Version Lifecycle

### Current Version: v1 (Stable)
- **Status**: Active, supported
- **Release Date**: 2024-01-15
- **Support End Date**: TBD (minimum 24 months from release)

### Deprecation Policy
1. **Notice Period**: Minimum 6 months advance notice before deprecation
2. **Migration Window**: 12 months from deprecation announcement to end-of-life
3. **Communication Channels**:
   - API response headers (`X-API-Deprecation-Warning`)
   - Developer portal announcements
   - Email notifications to registered API consumers
   - Changelog entries

### Version Header
All API responses include version information:
```
X-API-Version: 1.0.0
X-API-Deprecation-Warning: (present if version is deprecated)
```

## Breaking Changes Definition

The following changes are considered **breaking** and require a major version bump:

### Request/Response Changes
- Removing or renaming request/response fields
- Changing field types (e.g., string → number)
- Making optional fields required
- Removing or changing enum values
- Changing validation rules (more restrictive)

### Endpoint Changes
- Removing endpoints
- Changing HTTP methods
- Changing URL paths
- Changing authentication requirements

### Behavior Changes
- Changing default values
- Modifying business logic that affects output
- Changing pagination behavior
- Changing error response formats

### Non-Breaking Changes (Minor/Patch)
- Adding new optional fields
- Adding new endpoints
- Adding new enum values
- Relaxing validation rules
- Performance improvements
- Bug fixes that don't change behavior

## Migration Guidelines

### For API Consumers
1. **Monitor deprecation headers** in API responses
2. **Test against new versions** in staging before migrating
3. **Update client libraries** to match new version
4. **Monitor error rates** during migration

### For Internal Teams
1. **Maintain backward compatibility** during migration window
2. **Run both versions in parallel** during transition
3. **Provide migration guides** with code examples
4. **Offer support** during transition period

## Version Release Process

### Release Cadence
- **Major versions**: As needed (breaking changes)
- **Minor versions**: Quarterly (new features)
- **Patch versions**: As needed (bug fixes)

### Release Process
1. **Development** → Feature branch
2. **Staging** → Integration testing
3. **Release Candidate** → Staging environment
4. **Production** → Gradual rollout (canary → 10% → 50% → 100%)

### Rollback Plan
- Previous version maintained for 30 days post-release
- Feature flags for quick rollback
- Database migration rollback scripts prepared

## API Endpoints by Version

### Current Version (v1)
```
/api/v1/auth/*          - Authentication endpoints
/api/v1/assess/*        - Risk assessment
/api/v1/portfolio/*     - Portfolio management
/api/v1/score/*         - Portfolio scoring
/api/v1/leads/*         - Leads & advisory sessions
/api/v1/admin/*         - Admin endpoints
/api/v1/chat/*          - AI chat
/api/v1/contact         - Contact form
/api/v1/support/*       - Support queries
/api/v1/metrics         - Prometheus metrics
/api/v1/health          - Health checks
```

## Deprecation Timeline

| Version | Status | Release Date | Deprecation Notice | End of Life |
|---------|--------|--------------|-------------------|-------------|
| v1      | Stable | 2024-01-15   | TBD               | TBD         |

## Migration Examples

### v1 → v2 Migration (Hypothetical)
```javascript
// v1 (Current)
POST /api/v1/auth/login
{ email: "user@example.com", password: "secret" }

// v2 (Future - Breaking Change Example)
POST /api/v2/auth/login
{
  email: "user@example.com",
  password: "secret",
  device_fingerprint: "abc123..."  // New required field
}

// Response format change
// v1
{ success: true, data: { token: "...", user: {...} } }

// v2
{ success: true, data: { accessToken: "...", refreshToken: "...", user: {...} } }
```

## Support Channels

- **Technical Issues**: support@finanalysis.site
- **API Questions**: api-support@finanalysis.site
- **Documentation**: https://docs.finanalysis.site
- **Status Page**: https://status.finanalysis.site

## Changelog
See [CHANGELOG.md](../CHANGELOG.md) for detailed version history.

---
*Last Updated: 2024-09-20 | Version: 1.0.0*