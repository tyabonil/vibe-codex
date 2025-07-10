# Full-Stack Example

This example shows vibe-codex configuration for modern full-stack applications with separate frontend and backend concerns.

## Features

- Frontend/backend separation
- Framework-specific patterns
- API documentation requirements
- Environment variable management
- Build process validation

## Usage

```bash
# Copy this configuration to your project
cp examples/fullstack/.vibe-codex.json /path/to/your/project/

# Or initialize with fullstack preset
npx vibe-codex init --preset fullstack
```

## What's Included

### Core Module
- Enhanced secret detection for frontend env vars
- React/Next.js specific patterns

### Testing Module
- 80% coverage for both frontend and backend
- Test file requirements
- Framework-specific test patterns

### Deployment Module
- Multi-platform support (Vercel + Docker)
- Frontend build configuration
- Backend health checks
- Environment variable validation

### Documentation Module
- Full-stack specific sections
- API endpoint documentation
- Database schema documentation
- Environment variable docs

### Patterns Module
- Frontend patterns:
  - React component naming (PascalCase)
  - Hook naming (useXxx)
  - Page naming (kebab-case)
- Backend patterns:
  - Controller naming (XxxController)
  - Service naming (XxxService)
  - Model naming (PascalCase)

## Project Structure

This configuration assumes a structure like:

```
project/
├── src/                 # Frontend source
│   ├── components/
│   ├── hooks/
│   └── pages/
├── api/                 # Backend source
│   ├── controllers/
│   ├── services/
│   └── models/
├── shared/              # Shared utilities
├── public/              # Static assets
└── tests/               # Test files
```

## Frontend Configuration

### Next.js Specific

```json
"deployment": {
  "frontend": {
    "framework": "nextjs",
    "buildCommand": "next build",
    "outputDirectory": ".next"
  }
}
```

### React Specific

```json
"deployment": {
  "frontend": {
    "framework": "react",
    "buildCommand": "react-scripts build",
    "outputDirectory": "build"
  }
}
```

## Backend Configuration

### Express.js

```json
"deployment": {
  "backend": {
    "framework": "express",
    "port": 3001,
    "healthCheckEndpoint": "/health"
  }
}
```

### NestJS

```json
"deployment": {
  "backend": {
    "framework": "nestjs",
    "port": 3000,
    "healthCheckEndpoint": "/api/health"
  }
}
```

## Database Integration

### PostgreSQL

```json
"deployment": {
  "database": {
    "type": "postgresql",
    "migrations": "db/migrations",
    "requiredEnvVars": ["DATABASE_URL"]
  }
}
```

### MongoDB

```json
"deployment": {
  "database": {
    "type": "mongodb",
    "requiredEnvVars": ["MONGODB_URI"]
  }
}
```

## API Documentation

The configuration enforces API documentation:

1. OpenAPI/Swagger specification
2. Endpoint descriptions
3. Request/response examples
4. Error handling documentation

## Environment Variables

### Frontend Variables
- Must start with `NEXT_PUBLIC_` or `REACT_APP_`
- No secrets in frontend code
- Document all public variables

### Backend Variables
- Store in `.env` files
- Never commit `.env`
- Always provide `.env.example`
- Document in README

## Testing Strategy

### Frontend Testing
- Component tests (React Testing Library)
- Integration tests (Cypress/Playwright)
- Visual regression tests

### Backend Testing
- Unit tests (Jest)
- API tests (Supertest)
- Database tests

## Deployment

### Vercel (Frontend)
```bash
vercel --prod
```

### Docker (Full Stack)
```dockerfile
# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend
FROM node:18-alpine
WORKDIR /app
COPY --from=frontend /app/.next ./.next
COPY package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

## Development Workflow

1. Feature branch from main
2. Develop with hot reload
3. Write tests alongside code
4. Run validation before commit
5. Create PR with description
6. Deploy to staging
7. Merge to main
8. Auto-deploy to production

## Performance Considerations

- Lazy load frontend modules
- API response caching
- Database query optimization
- Static asset optimization
- Code splitting

## Security

- Environment variable encryption
- API rate limiting
- Input validation
- CORS configuration
- Authentication/Authorization

## Monitoring

- Frontend: Error tracking (Sentry)
- Backend: APM (New Relic, DataDog)
- Logging: Structured logs
- Metrics: Custom dashboards