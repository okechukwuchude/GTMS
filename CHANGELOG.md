# Changelog

All notable changes to the GTMS (Global Trade Monitoring System) project will be documented in this file.

---

## Template for Future Entries

```markdown
## [YYYY-MM-DD] - Task #X.Y: [Task Title]

### [Type: Added/Changed/Fixed/Removed/Database/Security/Performance]
- **Description**: [Clear summary of changes made]
- **Files Modified**:
  - `/path/to/file1.ts` (created/modified)
  - `/path/to/file2.tsx` (modified)
  - `/database_script.sql` (Section XX added)
- **Breaking Changes**: [None / Description of breaking changes]
- **Notes**: [Any important discoveries, issues resolved, or deviations from plan]
```

---

## [2025-12-16] - Bug Fix: Middleware Blocking API Routes

### Type: Fixed
- **Description**: Fixed critical issue where middleware was intercepting API routes and causing login/authentication to fail with JSON parse errors
- **Files Modified**:
  - `/src/middleware.ts` (modified)
- **Breaking Changes**: None
- **Notes**:
  - **Problem**: Middleware matcher was running on `/api/*` routes, causing the login API to return HTML redirects instead of JSON responses
  - **Error Message**: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
  - **Root Cause**: The matcher pattern didn't exclude `api` from the negative lookahead, so it was matching all API routes
  - **Solution**: Added `api` to the exclusion pattern: `'/((?!api|_next/static|_next/image|...'`
  - **Impact**: All API routes (login, register, containers, etc.) now work correctly without middleware interference
  - This was blocking user login and all API functionality

---

## [2025-12-16] - Task #37: Update Middleware for User Type Routing

### Type: Added
- **Description**: Implemented user-type-based routing to automatically route users to appropriate dashboards based on their user_type (public vs staff)
- **Files Modified**:
  - `/src/middleware.ts` (modified)
- **Breaking Changes**: None
- **Notes**:
  - Public users (`user_type: 'public'`) are now automatically routed to `/dashboard`
  - Staff users (`user_type: 'staff'`) are now automatically routed to `/admin/dashboard`
  - Added cross-access prevention (public users cannot access `/admin` routes, staff users cannot access public `/dashboard` routes)
  - Authenticated users are redirected from auth pages to their appropriate dashboard

---

## [2025-12-16] - Staff Admin Dashboard Creation

### Type: Added
- **Description**: Created complete staff admin portal with dashboard, loading states, and error boundaries
- **Files Modified**:
  - `/src/app/admin/layout.tsx` (created)
  - `/src/app/admin/dashboard/page.tsx` (created)
  - `/src/app/admin/dashboard/loading.tsx` (created)
  - `/src/app/admin/dashboard/error.tsx` (created)
  - `/src/components/layout/Sidebar.tsx` (modified)
- **Breaking Changes**: None
- **Notes**:
  - Admin layout includes server-side auth check to verify staff user type
  - Staff dashboard includes placeholder sections for inspections and recent activity
  - Sidebar navigation now shows different menu items based on user type:
    - Public users: Dashboard, Container Tracking, Settings
    - Staff users: Dashboard, Inspections, Containers, Users, Settings
  - Added new icons: ClipboardCheck (inspections), Users (user management)

---

## [2025-12-16] - Task #59: Enhanced Error Handling

### Type: Added
- **Description**: Implemented centralized error handling system with user-friendly messages and specific HTTP status code handling
- **Files Modified**:
  - `/src/lib/utils/error-handler.ts` (created)
  - `/src/lib/hooks/useContainers.ts` (modified)
  - `/src/lib/hooks/useDashboard.ts` (modified)
  - `/src/lib/hooks/usePorts.ts` (modified)
- **Breaking Changes**: None
- **Notes**:
  - Created ApiError class for structured error responses
  - Implemented specific handling for HTTP status codes:
    - 401: Session expiry with auto-redirect to login after 2 seconds
    - 403: RLS policy blocks with message "You do not have permission to access this resource"
    - 404: Resource not found
    - 409: Conflict/duplicate errors
    - 422: Validation errors
    - 500+: Server errors
  - Added network error detection and retry logic with exponential backoff
  - All React Query hooks now use enhanced error handling
  - Development-mode error logging for debugging

---

## [2025-12-16] - Task #58: Add Confirmation Dialog

### Type: Added
- **Description**: Created reusable confirmation dialog component for destructive actions (e.g., delete confirmations)
- **Files Modified**:
  - `/src/components/shared/ConfirmDialog.tsx` (created)
  - `/src/components/ui/alert-dialog.tsx` (created via shadcn)
- **Breaking Changes**: None
- **Notes**:
  - Built using shadcn/ui AlertDialog component
  - Supports default and destructive variants
  - Includes loading state support for async operations
  - Installed shadcn alert-dialog component as dependency

---

## [2025-12-16] - Task #57: Add Constants File

### Type: Added
- **Description**: Created centralized constants file for container-related values used throughout the application
- **Files Modified**:
  - `/src/lib/constants/container.ts` (created)
- **Breaking Changes**: None
- **Notes**:
  - CONTAINER_STATUSES array with all 10 status types and descriptions
  - STATUS_COLOR_MAP for badge styling (blue, yellow, green, red, gray)
  - STATUS_BADGE_STYLES with Tailwind classes for each color variant
  - CONTAINER_TYPES array (8 types: 20FT, 40FT, 40FT_HC, 45FT, REEFER, TANK, OPEN_TOP, FLAT_RACK)
  - HAZARD_CLASSES array with UN/IMO classification (13 classes)
  - CURRENCY_CODES with ISO 4217 codes and symbols
  - QUANTITY_UNITS, RISK_LEVELS, PAGINATION_DEFAULTS, DATE_FORMATS
  - All constants are strongly typed with TypeScript

---

## [2025-12-16] - Task #56: Add Utility Functions

### Type: Added
- **Description**: Created utility functions for date formatting, number formatting, and container number validation
- **Files Modified**:
  - `/src/lib/utils/date.ts` (created)
  - `/src/lib/utils/number.ts` (created)
  - `/src/lib/utils/container.ts` (created)
- **Breaking Changes**: None
- **Notes**:
  - **Date utilities**: formatDate, formatRelativeTime, formatDateTime, formatDateForInput
  - **Number utilities**: formatNumber, formatCurrency, formatNumberWithUnit, formatPercentage
  - **Container utilities**:
    - ISO 6346 compliant container number validation with check digit calculation
    - validateContainerNumber() verifies checksum
    - formatContainerNumber() adds space before check digit
    - getContainerNumberValidationMessage() provides user-friendly error messages
    - parseContainerNumber() breaks down container number into components
  - All utilities are fully typed with TypeScript
  - Includes comprehensive error handling

---

## [2025-12-16] - UI/UX Improvements: Container Tracking Page

### Type: Changed
- **Description**: Reorganized container tracking page table to improve layout and usability
- **Files Modified**:
  - `/src/app/(dashboard)/dashboard/containers/page.tsx` (modified)
- **Breaking Changes**: None
- **Notes**:
  - Moved Track button from inline with container number to separate dedicated column
  - Track button now uses outline variant instead of link variant
  - Improved table column organization and spacing
  - Track button is currently disabled (placeholder for future tracking feature)

---

## [2025-12-16] - UI/UX Improvements: Filter Panel

### Type: Changed
- **Description**: Improved FilterPanel UX by changing default state and adding click-outside functionality
- **Files Modified**:
  - `/src/components/shared/FilterPanel.tsx` (modified)
- **Breaking Changes**: None
- **Notes**:
  - Changed default state from open to closed (reduces visual clutter on page load)
  - Added click-outside functionality to auto-close panel when clicking outside
  - Used useRef and useEffect with mousedown event listener
  - Improves mobile UX by allowing easy dismissal

---

## [2025-12-16] - UI/UX Improvements: Dashboard Data Integration

### Type: Changed
- **Description**: Updated main dashboard to display real container data instead of placeholder content
- **Files Modified**:
  - `/src/app/(dashboard)/dashboard/page.tsx` (modified)
- **Breaking Changes**: None
- **Notes**:
  - Integrated useContainerList hook to fetch 5 most recent containers
  - Added "Register Container" button to dashboard header with Package icon
  - Recent containers section now shows actual table with container data
  - Added proper loading states with skeleton loaders
  - Conditional rendering for empty states
  - Removed placeholder EmptyState component
  - Table displays: Container Number, Status, Origin Port, Destination Port, Registration Date

---

## [2025-12-16] - Bug Fix: Route Structure

### Type: Fixed
- **Description**: Fixed 404 errors by correctly implementing Next.js App Router route groups
- **Files Modified**:
  - Moved `/src/app/(dashboard)/containers/` → `/src/app/(dashboard)/dashboard/containers/` (directory structure change)
- **Breaking Changes**: None
- **Notes**:
  - **Discovery**: Route groups like `(dashboard)` do NOT add to the URL path
  - **Issue**: Pages at `(dashboard)/containers/page.tsx` were accessible at `/containers` not `/dashboard/containers`
  - **Solution**: Need subdirectories within route groups for actual URL segments
  - **Pattern**: `(dashboard)/dashboard/containers/` → URL: `/dashboard/containers`
  - This is a recurring pattern that was fixed multiple times during development

---

## [2025-12-16] - Sprint 6 Complete: Container Management Frontend

### Type: Added
- **Description**: Completed all container management frontend features including forms, dialogs, list pages, and detail pages
- **Files Modified**:
  - `/src/components/containers/ContainerRegistrationForm.tsx` (created)
  - `/src/components/containers/ContainerDialog.tsx` (created)
  - `/src/app/(dashboard)/dashboard/containers/page.tsx` (created)
  - `/src/app/(dashboard)/dashboard/containers/loading.tsx` (created)
  - `/src/app/(dashboard)/dashboard/containers/error.tsx` (created)
  - `/src/app/(dashboard)/dashboard/containers/[id]/page.tsx` (created)
  - `/src/app/(dashboard)/dashboard/containers/[id]/loading.tsx` (created)
  - `/src/app/(dashboard)/dashboard/containers/[id]/error.tsx` (created)
- **Breaking Changes**: None
- **Notes**:
  - **ContainerRegistrationForm**: Comprehensive 5-section form with all required database fields
    - Section 1: Container Details (number, bill of lading, seal, type)
    - Section 2: Shipper Information (name, address, country)
    - Section 3: Consignee Information (name, address, country)
    - Section 4: Cargo Details (description, HS code, quantity, weight, value, hazmat)
    - Section 5: Ports & Schedule (origin, destination, ETA, temperature for reefers)
  - **ContainerDialog**: Reusable modal for create/edit operations
  - **Container List Page**: DataTable with filters, pagination, stats cards, and actions
  - **Container Detail Page**: Tabs for overview and status history
  - All pages include proper loading states and error boundaries

---

## [2025-12-16] - Sprint 5 Complete: Container Management Backend

### Type: Added
- **Description**: Implemented complete container CRUD API with React Query integration
- **Files Modified**:
  - `/src/lib/hooks/queryKeys.ts` (created)
  - `/src/types/container.types.ts` (created)
  - `/src/lib/validations/container.validations.ts` (created)
  - `/src/app/api/ports/route.ts` (created)
  - `/src/app/api/containers/route.ts` (created)
  - `/src/app/api/containers/[id]/route.ts` (created)
  - `/src/app/api/containers/[id]/history/route.ts` (created)
  - `/src/lib/hooks/usePorts.ts` (created)
  - `/src/lib/hooks/useContainers.ts` (created)
- **Breaking Changes**: None
- **Notes**:
  - **Query Key Factory**: Centralized React Query keys for containers, ports, dashboard
  - **Container APIs**:
    - GET /api/containers - List with server-side pagination, filtering, search
    - POST /api/containers - Create with validation
    - GET /api/containers/[id] - Detail with relations
    - PATCH /api/containers/[id] - Update with status history tracking
    - DELETE /api/containers/[id] - Delete
    - GET /api/containers/[id]/history - Status change history
  - **Ports API**: GET /api/ports - List all active ports
  - **React Query Hooks**: useContainerList, useContainerDetail, useContainerHistory, useCreateContainer, useUpdateContainer, useDeleteContainer, usePorts
  - All APIs include RLS enforcement (users only see their own data)
  - Optimistic updates with automatic cache invalidation
  - Added `export const dynamic = 'force-dynamic'` to prevent Next.js caching

---

## [2025-12-16] - Sprint 4 Complete: Dashboard Implementation

### Type: Added
- **Description**: Implemented dashboard with statistics API, React Query integration, and UI components
- **Files Modified**:
  - `/src/app/(dashboard)/dashboard/loading.tsx` (created)
  - `/src/app/(dashboard)/dashboard/error.tsx` (created)
  - `/src/app/api/dashboard/stats/route.ts` (created)
  - `/src/lib/hooks/useDashboard.ts` (created)
  - `/src/app/(dashboard)/dashboard/page.tsx` (created)
- **Breaking Changes**: None
- **Notes**:
  - Dashboard API calculates stats with RLS enforcement:
    - totalContainers: all statuses
    - inTransit: in_transit + arrived
    - cleared: cleared + released
    - highRisk: detained + pending_inspection
  - Used Supabase count queries with `{ count: 'exact', head: true }` for efficiency
  - Dashboard displays 4 stat cards with icons and colors
  - Auto-refetch every 30 seconds with React Query
  - Proper loading states with StatsCardSkeleton
  - Error boundary with retry functionality

---

## [2025-12-16] - Sprint 3 Complete: Reusable Components

### Type: Added
- **Description**: Created comprehensive set of reusable UI components for the application
- **Files Modified**:
  - `/src/components/shared/EmptyState.tsx` (created)
  - `/src/components/shared/StatusBadge.tsx` (created)
  - `/src/components/shared/StatsCard.tsx` (created)
  - `/src/components/shared/Skeletons.tsx` (created)
  - `/src/components/ui/skeleton.tsx` (created)
  - `/src/components/shared/FilterPanel.tsx` (created)
  - `/src/components/ui/collapsible.tsx` (created)
  - `/src/components/shared/data-table/DataTable.tsx` (created)
  - `/src/components/shared/data-table/DataTablePagination.tsx` (created)
  - `/src/components/shared/data-table/DataTableToolbar.tsx` (created)
  - `/src/components/shared/data-table/index.ts` (created)
- **Breaking Changes**: None
- **Notes**:
  - **EmptyState**: Reusable no-data component with icon, title, description, optional action
  - **StatusBadge**: Color-coded badges for 10 container statuses (blue, yellow, green, red, gray)
  - **StatsCard**: Dashboard cards with icon, value, optional trend indicators
  - **Skeleton Loaders**: StatsCardSkeleton, TableRowSkeleton, DetailPageSkeleton
  - **FilterPanel**: Collapsible filters with search, status checkboxes, port selects, date range
  - **DataTable**: Full-featured table built on TanStack Table v8:
    - Server-side pagination (NOT client-side)
    - Column sorting with up/down/unsorted icons
    - Row selection with checkboxes (optional)
    - Loading states with skeleton rows
    - Empty state integration
    - Alternating row colors with hover
    - Selected row highlighting
    - Sticky header with gray background

---

## [2025-12-16] - Sprint 2 Complete: Layout & Navigation

### Type: Added
- **Description**: Implemented main application layout with sidebar navigation and top bar
- **Files Modified**:
  - `/src/components/layout/MainLayout.tsx` (created)
  - `/src/components/layout/Sidebar.tsx` (created)
  - `/src/components/layout/TopBar.tsx` (created)
  - `/src/app/(dashboard)/layout.tsx` (created)
  - `/src/app/(dashboard)/dashboard/page.tsx` (created - placeholder)
- **Breaking Changes**: None
- **Notes**:
  - **MainLayout**: Two-column responsive layout (sidebar + main content)
  - **Sidebar**:
    - Logo and branding (GTMS with blue badge)
    - Navigation items with active state highlighting
    - User info display (name, email, user type)
    - Logout button
    - Mobile overlay with slide-in animation
    - Responsive: hidden on mobile, visible on desktop
  - **TopBar**:
    - Mobile menu button (hamburger)
    - Search bar placeholder
    - User profile dropdown with Settings and Logout
  - Fixed 404 error by moving dashboard page to `(dashboard)/dashboard/page.tsx`

---

## [2025-12-16] - Sprint 1 Complete: Auth & Foundation

### Type: Added
- **Description**: Completed authentication setup and foundational configurations
- **Files Modified**:
  - `/src/app/providers.tsx` (created)
  - `/src/app/layout.tsx` (modified)
  - `tailwind.config.ts` (modified)
  - `/src/app/globals.css` (modified)
  - `/src/middleware.ts` (created)
  - `/scripts/seed-ports.sql` (created)
- **Breaking Changes**: None
- **Notes**:
  - **React Query Provider**:
    - Configured with 1-minute staleTime
    - Disabled refetchOnWindowFocus
    - Added React Query DevTools for development
  - **Design System Colors**:
    - Primary blue: #0066FF (HSL: 211 100% 50%)
    - Success: #10B981 (green)
    - Warning: #F59E0B (orange/yellow)
    - Danger: #EF4444 (red)
    - Info: #3B82F6 (blue)
    - Inactive: #6B7280 (gray)
  - **Protected Route Middleware**: Redirects unauthenticated users to /login
  - **Seeded Ports**: 20 major ports with West African focus, all with UN/LOCODE format

---

## [2025-12-16] - Authentication Phase Complete (Tasks 17-24)

### Type: Added
- **Description**: Implemented complete authentication system with Supabase integration
- **Files Modified**:
  - `/src/types/auth.types.ts` (created)
  - `/src/lib/validations/auth.validations.ts` (created)
  - `/src/app/api/auth/register/route.ts` (created)
  - `/src/app/api/auth/login/route.ts` (created)
  - `/src/app/api/auth/logout/route.ts` (created)
  - `/src/lib/hooks/useAuth.ts` (created)
  - `/src/app/(auth)/login/page.tsx` (created)
  - `/src/app/(auth)/register/page.tsx` (created)
- **Breaking Changes**: None
- **Notes**:
  - Auth types include RegisterData, LoginCredentials, AuthUser, AuthSession
  - Zod schemas for register, login, profile update, password reset
  - Auth API routes handle registration, login, and logout
  - useAuth hook provides user state, isLoading, isAuthenticated, login(), register(), logout()
  - Login and registration pages built with React Hook Form and shadcn/ui
  - Toast notifications for success/error feedback
  - User type selection (public/staff) in registration

---

## [2025-12-16] - Database Phase Complete (Tasks 9-16)

### Type: Database
- **Description**: Set up Supabase database with complete schema and RLS policies
- **Files Modified**:
  - Database migrations (executed in Supabase)
  - `/src/types/database.types.ts` (created)
  - `/src/lib/supabase/server.ts` (created)
  - `/src/lib/supabase/client.ts` (created)
  - `/src/lib/supabase/middleware.ts` (created)
- **Breaking Changes**: None
- **Notes**:
  - **Tables Created**:
    - profiles: User profiles with user_type, company details
    - ports: Port master data with country, name, code
    - containers: Container tracking with all shipment details
    - container_status_history: Audit trail for status changes
  - **RLS Policies**: Users can only access their own data
  - **TypeScript Types**: Generated from Supabase schema
  - **Supabase Clients**: Server-side (RSC), client-side, and middleware clients created

---

## [2025-12-15] - Setup Phase Complete (Tasks 1-8)

### Type: Added
- **Description**: Initial project setup with Next.js, TypeScript, Tailwind CSS, and shadcn/ui
- **Files Modified**:
  - Project initialization (all base files)
  - `package.json` (dependencies)
  - `tsconfig.json` (path aliases)
  - `.prettierrc`, `.eslintrc.json` (code quality)
  - Folder structure created
- **Breaking Changes**: None
- **Notes**:
  - Next.js 14 with App Router
  - TypeScript strict mode enabled
  - Installed 16+ shadcn/ui components
  - Configured ESLint and Prettier with Tailwind CSS plugin
  - Created complete folder structure (components, lib, types, app routes)
  - Configured path aliases (@/components/*, @/lib/*, etc.)
  - Initialized git repository with clean .gitignore

---

## Project Information

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5
- **Styling**: Tailwind CSS 3, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Query (@tanstack/react-query v5)
- **Forms**: React Hook Form 7, Zod 3
- **Tables**: TanStack Table v8
- **Icons**: Lucide React
- **Notifications**: Sonner

### Package Manager
- pnpm v10.22.0
- Node.js v20.19.3

### Current Version
- **Version**: 0.2.0
- **Status**: Active Development
- **MVP Progress**: 90%+ Complete (37 of 42 tasks from original plan)

---

## Legend

- **Type: Added** - New features, components, or functionality
- **Type: Changed** - Modifications to existing features
- **Type: Fixed** - Bug fixes and corrections
- **Type: Removed** - Deleted features or code
- **Type: Database** - Database schema or migration changes
- **Type: Security** - Security-related improvements
- **Type: Performance** - Performance optimizations
