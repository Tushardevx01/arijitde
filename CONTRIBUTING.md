# Contributing Guide

Thank you for contributing to FinAnalysis! This document outlines the process for contributing to the project.

## Code of Conduct

By participating, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- No harassment, discrimination, or offensive behavior

## Getting Started

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/finanalysis.git
cd finanalysis

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma Client
cd ../backend && npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development servers
npm run dev        # In backend (port 5000)
npm run dev        # In frontend (port 3000)
```

### IDE Setup

Recommended: VS Code with extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Hero

## Code Style

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` instead)
- Explicit return types for public functions
- Use `type` over `interface` for unions/intersections

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `api-error.ts` |
| Classes | PascalCase | `ApiError` |
| Functions | camelCase | `signAccessToken` |
| Variables | camelCase | `userId` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `JWTPayload` |
| Enums | PascalCase | `Role` |

### Git Commits

Follow Conventional Commits:

```
feat: add user profile endpoint
fix: handle expired refresh token
docs: update API documentation
refactor: simplify JWT verification
test: add unit tests for ApiError
chore: update dependencies
```

## Pull Request Process

### Before Submitting

1. **Branch**: Create from `main` with descriptive name
   ```
   git checkout -b feat/user-profile-api
   ```

2. **Code Quality**: Ensure all checks pass
   ```bash
   cd backend && npx tsc --noEmit && npm test
   cd ../frontend && npx tsc --noEmit && npm run build
   ```

3. **Tests**: Add tests for new functionality
   - Unit tests for utilities/services
   - Integration tests for API endpoints

4. **Documentation**: Update relevant docs
   - API docs (OpenAPI spec)
   - README if new features
   - DEPLOYMENT.md if infra changes

### Pull Request Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactor

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No console.log/debugger left
```

### Review Process

1. **Automated Checks**: CI must pass (types, tests, build)
2. **Code Review**: At least 1 approval required
3. **Merge**: Squash and merge after approval
3. **Cleanup**: Delete branch after merge

## Coding Standards

### Backend

- Use `async/await` over promises
- Always handle errors with `try/catch`
- Use Zod for input validation
- Return RFC 7807 errors via `ApiError`
- Use Prisma transactions for multi-step operations
- Log with structured JSON (method, path, IP, duration)

### Frontend

- Use React Server Components by default
- Client components only when needed (`'use client'`)
- Use React Query for server state
- Use Tailwind CSS for styling
- Accessible by default (semantic HTML, ARIA)

### Database

- Use Prisma migrations for schema changes
- Add indexes for query performance
- Use soft deletes (`deletedAt`) for audit trails
- Audit fields (`createdBy`, `updatedBy`) on all models

## Testing Guidelines

### Unit Tests

- Test pure functions in isolation
- Mock external dependencies (Prisma, Redis, external APIs)
- Test edge cases and error paths
- Aim for >80% coverage on utilities

### Integration Tests

- Test API endpoints with real database
- Use test database (separate from dev)
- Clean up between tests
- Test auth flows and permissions

### E2E Tests (Future)

- Critical user flows (registration, booking, payment)
- Run in CI on staging environment

## Release Process

### Versioning

Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. GitHub Actions creates release
6. Deploy to production

## Issue Reporting

### Bug Reports

Use the bug report template:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs
- Environment details

### Feature Requests

- Clear problem statement
- Proposed solution
- Alternatives considered
- Implementation complexity estimate

## Security

### Reporting Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Email: security@finanalysis.site

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll acknowledge within 24 hours and provide timeline for fix.

## Questions?

- GitHub Discussions for general questions
- Discord/Slack for real-time chat (link in repo)
- Email: dev@finanalysis.site

Thank you for contributing! 🚀