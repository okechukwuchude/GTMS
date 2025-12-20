# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Global Trade Monitoring System (GTMS)** - a Maritime Container Inspection Application for tracking vessels, containers, and cargo through national ports. The system serves two distinct user groups:

1. **Internal Staff**: Customs officials, port authorities, inspectors, trade analysts, and compliance officers
2. **Public Users**: Importers, exporters, freight forwarders, and shipping agents

## Current Project Status

**This repository currently contains planning and design documentation only - no implementation code exists yet.**

The project is in the **planning/design phase** with comprehensive PRD and architecture documentation.

## Technology Stack (Planned)

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (client) + React Query (server)
- **Maps**: Mapbox GL JS / Leaflet

### Backend

- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **OCR**: Google Cloud Vision API / AWS Textract

### Development

- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library + Playwright (E2E)
- **Git Hooks**: Husky + lint-staged

## File Structure (Current)

```
GTMS/
├── architecture.md           # Complete system architecture document
├── maritime_inspection_prd.md # Product requirements document
└── design/                   # UI/UX design mockups (PNG files)
```

## Architecture Highlights

### Two-Tier User System

**Internal Staff Routes** (`/admin/*`):

- Dashboard with port activity overview
- Vessel tracking with AIS integration
- Container search across all users
- Inspection workflow management
- Analytics and reporting tools

**Public User Routes** (`/dashboard/*`, `/containers/*`):

- Personal container dashboard
- Cargo registration (manual + OCR)
- Document management
- Real-time tracking and notifications

### Database Design

The schema follows a normalized structure with these core tables:

- `profiles` - User accounts (extends Supabase auth.users)
- `staff_roles` - Internal staff permissions
- `ports` - Port information
- `vessels` - Vessel registry with AIS tracking
- `vessel_movements` - Arrival/departure tracking
- `containers` - Container records (owned by public users)
- `inspections` - Inspection workflow and results
- `documents` - Document metadata and storage
- `notifications` - User notification system

### Row Level Security (RLS)

All tables use Supabase RLS policies to enforce:

- Public users can only view/edit their own containers
- Staff can view all containers but with role-based write permissions
- Document access controlled by ownership and staff role

### OCR Integration

The system uses OCR to auto-populate cargo registration forms from bill of lading documents:

1. User uploads document (PDF/JPG/PNG)
2. OCR service extracts text (Google Vision API or AWS Textract)
3. Parser maps extracted data to form fields
4. User reviews and corrects before submission
5. Target accuracy: 85%+ for standard formats

## Key Implementation Patterns

### Authentication Flow

- Public users: Self-registration with email verification
- Staff users: Admin-created accounts with role assignment
- Middleware checks user type and routes to appropriate dashboard
- Session-based auth with Supabase

### State Management Strategy

- **Client State (Zustand)**: UI preferences, filters, temporary form data
- **Server State (React Query)**: Container data, vessels, inspections
- **Real-time (Supabase Realtime)**: Status updates, notifications
- **URL State (searchParams)**: Pagination, filters, sort order

### API Structure

All API routes follow RESTful conventions:

- `GET /api/containers` - List with pagination
- `POST /api/containers` - Create new
- `GET /api/containers/:id` - Get details
- `PATCH /api/containers/:id` - Update
- `DELETE /api/containers/:id` - Delete

Response format:

```typescript
{ data: T, meta?: { page, limit, total, totalPages } }
{ error: { code, message, details? } }
```

## Important Business Rules

1. **Container Registration**: Public users register cargo either manually or via OCR upload of bill of lading
2. **Inspection Queue**: Containers auto-sorted by risk score (calculated by factors like value, hazmat, shipper history)
3. **Status Transitions**: Container status flows: registered → in_transit → arrived → pending_inspection → under_inspection → cleared/detained → released → departed
4. **Notifications**: Trigger on status changes, inspection scheduled, documents required, clearance complete
5. **Document Retention**: All records and documents must be kept for minimum 7 years

## Security Considerations

- All user inputs validated with Zod schemas
- File uploads limited to 10MB, specific MIME types only
- Row Level Security on all database tables
- Rate limiting on public APIs
- User data isolation (public users can't see others' containers)
- Audit logging for all critical operations

## When Implementing This Project

### Initial Setup Steps

1. Initialize Next.js 14 project with TypeScript
2. Set up Supabase project and configure environment variables
3. Install dependencies: `pnpm install`
4. Run database migrations in `/supabase/migrations/`
5. Generate TypeScript types: `pnpm supabase:gen-types`
6. Configure shadcn/ui components
7. Set up authentication middleware

### Development Workflow

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
pnpm test:e2e

# Generate Supabase types after schema changes
pnpm supabase:gen-types
```

### Naming Conventions

- **Files**: kebab-case.tsx (e.g., `container-list.tsx`)
- **Components**: PascalCase (e.g., `ContainerList`)
- **Hooks**: Prefix with `use` (e.g., `useContainers`)
- **Stores**: Suffix with `-store` (e.g., `authStore`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Route Organization

Use Next.js 14 App Router with route groups:

- `(auth)/` - Login, registration pages
- `(public)/` - Public user dashboard, containers, documents
- `(staff)/` - Internal staff admin, inspections, analytics
- `api/` - API routes

### Component Structure

Follow this organization:

- `/components/ui/` - shadcn/ui primitives
- `/components/auth/` - Authentication forms
- `/components/containers/` - Container-related components
- `/components/vessels/` - Vessel tracking components
- `/components/inspections/` - Inspection workflow components
- `/components/layout/` - Headers, sidebars, navigation
- `/components/shared/` - Reusable utilities (loading, errors, etc.)

## Critical Implementation Notes

1. **OCR Processing**: Implement as async job with progress indicators. Store raw OCR data in JSONB for future reprocessing
2. **Real-time Updates**: Use Supabase Realtime channels filtered by user_id for public users
3. **Risk Scoring**: Implement `calculate_container_risk_score()` function in PostgreSQL (see architecture.md:1206)
4. **Document Storage**: Use Supabase Storage with RLS policies matching documents table
5. **Notification System**: Database trigger creates notification records, separate service sends emails/SMS
6. **Performance**: Add indexes on frequently queried fields (container_number, status, owner_id, created_at)

## References

- Full architecture details: `architecture.md`
- Complete requirements: `maritime_inspection_prd.md`
- UI mockups: `design/` directory
- after every changes, update the changelog.md and status.md files