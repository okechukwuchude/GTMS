# GTMS MVP Development Plan - REVISED

**Last Updated**: December 16, 2025
**Estimated Total Tasks**: 39 tasks across 7 sprints
**Target MVP Features**: Container tracking with manual registration, dashboard with stats, basic authentication

**IMPORTANT**: This plan has been revised based on comprehensive review. See Critical Updates section below.

---

## ⚠️ CRITICAL UPDATES FROM PLAN REVIEW

### 🔴 MUST-FIX Items (will cause failures if not addressed):
1. **Container form missing required fields** → Added: bill_of_lading, shipper_name, consignee_name
2. **Ports table is empty** → Added: Seed ports data in Sprint 1
3. **Ports API missing** → Added: Create ports API endpoint in Sprint 5
4. **React Query Provider order** → Moved to FIRST task in Sprint 1
5. **Next.js route caching** → Added: `export const dynamic = 'force-dynamic'` to all API routes

---

## Sprint 1: Complete Auth & Setup Foundation (Tasks 25-28)

### Task 25: Add React Query Provider ⭐ CRITICAL

**Objective**: Set up React Query for server state management across the application

**Files to create**:
- `src/app/providers.tsx`

**Files to modify**:
- `src/app/layout.tsx`

**Implementation**:
```typescript
// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Acceptance Criteria**:
- [ ] providers.tsx created with QueryClientProvider
- [ ] React Query DevTools configured for development
- [ ] layout.tsx updated to wrap children with Providers
- [ ] DevTools panel appears in browser (bottom-left corner)
- [ ] No console errors

**Dependencies**: Tasks 1-2 (Next.js and React Query installed)

**Rollback**: Remove providers.tsx, revert layout.tsx changes

---

### Task 26: Update Design System Colors

**Objective**: Update Tailwind theme to match design mockups with #0066FF primary blue

**Files to modify**:
- `tailwind.config.ts`
- `src/app/globals.css`

**Implementation**:

Update `tailwind.config.ts`:
```typescript
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          // ... add shades if needed
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          inactive: '#6B7280',
        },
      },
    },
  },
}
```

Add to `globals.css`:
```css
@layer base {
  :root {
    --primary: 0 102 255; /* #0066FF */
    --status-success: 16 185 129;
    --status-warning: 245 158 11;
    --status-danger: 239 68 68;
    --status-info: 59 130 246;
  }
}
```

**Acceptance Criteria**:
- [ ] Primary color is #0066FF
- [ ] Status color utilities added (success, warning, danger, info, inactive)
- [ ] Colors match design mockups
- [ ] No build errors after changes

**Dependencies**: Task 1 (Tailwind CSS configured)

**Rollback**: Revert tailwind.config.ts and globals.css changes

---

### Task 27: Create Protected Route Middleware

**Objective**: Implement Next.js middleware to protect authenticated routes

**Files to create**:
- `src/middleware.ts`

**Implementation**:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to login if accessing protected route without session
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing auth pages with session
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
```

**Acceptance Criteria**:
- [ ] Unauthenticated users redirected to /login when accessing /dashboard
- [ ] Authenticated users redirected to /dashboard when accessing /login or /register
- [ ] Session refresh works correctly
- [ ] No infinite redirect loops

**Dependencies**: Task 11 (Supabase client utilities created)

**Rollback**: Delete src/middleware.ts

---

### Task 28: Seed Ports Table ⭐ CRITICAL

**Objective**: Add initial port data for container form dropdowns

**Files to create**:
- `scripts/seed-ports.sql` (or use Supabase SQL Editor)

**SQL Script**:
```sql
INSERT INTO ports (name, code, country_code, city, status) VALUES
('Port of Rotterdam', 'NLRTM', 'NLD', 'Rotterdam', 'active'),
('Port of Singapore', 'SGSIN', 'SGP', 'Singapore', 'active'),
('Port of New York', 'USNYC', 'USA', 'New York', 'active'),
('Port of Shanghai', 'CNSHA', 'CHN', 'Shanghai', 'active'),
('Port of Dubai', 'AEDXB', 'ARE', 'Dubai', 'active'),
('Port of Los Angeles', 'USLAX', 'USA', 'Los Angeles', 'active'),
('Port of Hamburg', 'DEHAM', 'DEU', 'Hamburg', 'active'),
('Port of Hong Kong', 'HKHKG', 'HKG', 'Hong Kong', 'active'),
('Port of Busan', 'KRPUS', 'KOR', 'Busan', 'active'),
('Port of Antwerp', 'BEANR', 'BEL', 'Antwerp', 'active'),
('Port of Qingdao', 'CNTAO', 'CHN', 'Qingdao', 'active'),
('Port of Tokyo', 'JPTYO', 'JPN', 'Tokyo', 'active'),
('Port of Long Beach', 'USLGB', 'USA', 'Long Beach', 'active'),
('Port of Mumbai', 'INBOM', 'IND', 'Mumbai', 'active'),
('Port of Jeddah', 'SAJED', 'SAU', 'Jeddah', 'active');
```

**Acceptance Criteria**:
- [ ] At least 15 ports added to database
- [ ] Ports visible in Supabase dashboard
- [ ] All ports have status='active'
- [ ] Port codes follow UN/LOCODE format (5 characters)

**Dependencies**: Task 13 (Ports table created)

**Rollback**:
```sql
DELETE FROM ports WHERE code IN ('NLRTM', 'SGSIN', 'USNYC', ...);
```

---

## Sprint 2: Create Main Layout & Navigation (Tasks 29-32)

### Task 29: Create MainLayout Component

**Objective**: Build responsive layout wrapper with sidebar and main content area

**Files to create**:
- `src/components/layout/MainLayout.tsx`

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Two-column layout (sidebar + content)
- [ ] Sidebar collapsible on mobile
- [ ] Main content area scrollable
- [ ] Responsive design working

**Dependencies**: Tasks 30-31 (Sidebar and TopBar components)

---

### Task 30: Create Sidebar Component

**Objective**: Build navigation sidebar with menu items and user info

**Files to create**:
- `src/components/layout/Sidebar.tsx`

**Navigation Items**:
- Dashboard (Home icon)
- Container Tracking (Package icon)
- Settings (Settings icon)

**Acceptance Criteria**:
- [ ] Logo displayed at top
- [ ] Navigation items render
- [ ] Active state highlighting works
- [ ] User info at bottom
- [ ] Logout button functional
- [ ] Collapsible on mobile

**Dependencies**: Task 22 (useAuth hook), lucide-react icons

---

### Task 31: Create TopBar Component

**Objective**: Build top navigation bar with search and user profile

**Files to create**:
- `src/components/layout/TopBar.tsx`

**Features**:
- Search bar (placeholder for now)
- User profile dropdown
- Breadcrumbs/page title

**Acceptance Criteria**:
- [ ] Top bar renders correctly
- [ ] User profile dropdown works
- [ ] Responsive on mobile

**Dependencies**: Task 22 (useAuth hook)

---

### Task 32: Create Dashboard Route Group Layout

**Objective**: Apply MainLayout to all dashboard routes

**Files to create**:
- `src/app/(dashboard)/layout.tsx`

**Implementation**:
```typescript
import MainLayout from '@/components/layout/MainLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
```

**Acceptance Criteria**:
- [ ] Dashboard layout renders with sidebar
- [ ] All dashboard routes use MainLayout
- [ ] No layout shift between pages

**Dependencies**: Task 29 (MainLayout component)

---

## Sprint 3: Build Reusable Components (Tasks 33-38)

### Task 33: Create EmptyState Component

**Objective**: Reusable component for no-data states

**Files to create**:
- `src/components/shared/EmptyState.tsx`

**Props**: icon, title, description, actionButton?

**Acceptance Criteria**:
- [ ] Component renders with all props
- [ ] Icon displays correctly (from lucide-react)
- [ ] Action button works if provided

---

### Task 34: Create StatusBadge Component

**Objective**: Color-coded badge for container statuses

**Files to create**:
- `src/components/shared/StatusBadge.tsx`

**Status Color Mapping**:
- registered, in_transit, arrived → blue
- pending_inspection, under_inspection → yellow
- inspection_complete, cleared, released → green
- detained → red
- departed → gray

**Acceptance Criteria**:
- [ ] All 10 container statuses have colors
- [ ] Badge pill-shaped with rounded-full
- [ ] Small uppercase text
- [ ] Size prop works (sm, md, lg)

**Dependencies**: Task 26 (Design system colors)

---

### Task 35: Create StatsCard Component

**Objective**: Card component for dashboard statistics

**Files to create**:
- `src/components/shared/StatsCard.tsx`

**Props**: title, value, icon, trend?, color?

**Features**:
- White card with shadow
- Icon in colored circle
- Optional trend (up/down arrow with percentage)

**Acceptance Criteria**:
- [ ] Card matches design mockup
- [ ] Icon displays in colored circle
- [ ] Trend arrow shows correctly
- [ ] Responsive on mobile

---

### Task 36: Create Skeleton Loaders

**Objective**: Loading state components for async content

**Files to create**:
- `src/components/shared/Skeletons.tsx`

**Exports**:
- StatsCardSkeleton
- TableRowSkeleton
- DetailPageSkeleton

**Acceptance Criteria**:
- [ ] Skeletons match dimensions of real components
- [ ] Used in loading.tsx files
- [ ] Smooth animation

---

### Task 37: Create FilterPanel Component

**Objective**: Collapsible filter panel for container list

**Files to create**:
- `src/components/shared/FilterPanel.tsx`

**Filter Inputs**:
- Status multi-select (checkboxes)
- Port select
- Date range (from/to)
- Search input

**Acceptance Criteria**:
- [ ] Collapsible panel works
- [ ] All filter inputs functional
- [ ] Clear filters button works
- [ ] Matches design mockup

---

### Task 38: Create DataTable Component

**Objective**: Reusable data table with sorting and pagination

**Files to create**:
- `src/components/shared/data-table/DataTable.tsx`
- `src/components/shared/data-table/DataTableHeader.tsx`
- `src/components/shared/data-table/DataTablePagination.tsx`
- `src/components/shared/data-table/DataTableToolbar.tsx`

**Features**:
- Server-side pagination (NOT client-side)
- Sortable columns
- Row selection
- Loading state
- Empty state

**Acceptance Criteria**:
- [ ] Table renders with data
- [ ] Sorting works on column click
- [ ] Pagination controls functional
- [ ] Server-side pagination implemented
- [ ] Loading skeleton displays
- [ ] Empty state shows when no data

**Dependencies**: @tanstack/react-table v8.x

---

## Sprint 4: Build Dashboard Page (Tasks 39-42)

### Task 39: Create Dashboard Loading/Error States

**Objective**: Add loading.tsx and error.tsx for dashboard

**Files to create**:
- `src/app/(dashboard)/loading.tsx`
- `src/app/(dashboard)/error.tsx`

**Acceptance Criteria**:
- [ ] Loading shows skeleton cards
- [ ] Error boundary catches errors
- [ ] Retry button works on error page

**Dependencies**: Task 36 (Skeleton loaders)

---

### Task 40: Create Dashboard API Route

**Objective**: API endpoint for dashboard statistics

**Files to create**:
- `src/app/api/dashboard/stats/route.ts`

**Returns**:
- total: total container count
- in_transit: count of in_transit + arrived
- cleared: count of cleared + released
- high_risk: count of detained + pending_inspection

**Acceptance Criteria**:
- [ ] GET endpoint returns stats
- [ ] RLS applied (user's containers only)
- [ ] `export const dynamic = 'force-dynamic'` added
- [ ] Returns proper status codes

**Dependencies**: Task 14 (Containers table)

---

### Task 41: Create useDashboard Hook

**Objective**: React Query hook for dashboard stats

**Files to create**:
- `src/lib/hooks/useDashboard.ts`

**Features**:
- Auto-refetch every 30 seconds
- Loading/error states

**Acceptance Criteria**:
- [ ] Hook fetches stats from API
- [ ] Auto-refetch works
- [ ] Loading state handled

**Dependencies**: Task 25 (React Query Provider), Task 40 (Dashboard API)

---

### Task 42: Create Dashboard Page

**Objective**: Main dashboard page with stats cards

**Files to create**:
- `src/app/(dashboard)/page.tsx`

**Layout**:
- 4 stats cards (Total, In Transit, Cleared, High Risk)
- Recent containers section (mock data for now)

**Acceptance Criteria**:
- [ ] Stats cards display correctly
- [ ] Data fetched from API
- [ ] Matches design mockup
- [ ] Responsive on mobile

**Dependencies**: Tasks 35 (StatsCard), 41 (useDashboard hook)

---

## Sprint 5: Container Management Backend (Tasks 43-51)

### Task 43: Create Query Key Factory

**Objective**: Centralize React Query keys

**Files to create**:
- `src/lib/hooks/queryKeys.ts`

**Acceptance Criteria**:
- [ ] Query keys for containers, ports, dashboard exported
- [ ] Follows React Query best practices

---

### Task 44: Create Container Types

**Objective**: TypeScript types for containers

**Files to create**:
- `src/types/container.types.ts`

**Types**:
- Container (from database)
- ContainerFormData (for forms)
- ContainerFilters (for filtering)
- ContainerListResponse (paginated)

**Acceptance Criteria**:
- [ ] All types exported
- [ ] No TypeScript errors

**Dependencies**: Task 16 (Database types generated)

---

### Task 45: Create Container Validation Schemas ⭐ CRITICAL

**Objective**: Zod schemas with ALL required fields

**Files to create**:
- `src/lib/validations/container.validations.ts`

**Required Fields**:
- container_number (regex validation)
- bill_of_lading
- shipper_name
- consignee_name
- cargo_description

**Acceptance Criteria**:
- [ ] containerCreateSchema includes ALL required DB fields
- [ ] Container number validates ISO 6346 format
- [ ] Conditional validation for hazard_class
- [ ] No TypeScript errors

---

### Task 46: Create Ports API Route ⭐ CRITICAL

**Objective**: API endpoint to list ports

**Files to create**:
- `src/app/api/ports/route.ts`

**Returns**: List of active ports sorted alphabetically

**Acceptance Criteria**:
- [ ] GET /api/ports returns active ports
- [ ] Sorted by name
- [ ] `export const dynamic = 'force-dynamic'` added

**Dependencies**: Task 28 (Ports seeded)

---

### Task 47: Create Container API - List/Create

**Objective**: API endpoints for container listing and creation

**Files to create**:
- `src/app/api/containers/route.ts`

**Endpoints**:
- GET: List containers (paginated, filtered, searchable)
- POST: Create new container

**Acceptance Criteria**:
- [ ] GET returns paginated results
- [ ] Filters work (status, ports, search)
- [ ] POST creates container with status history
- [ ] RLS enforced
- [ ] `export const dynamic = 'force-dynamic'` added

**Dependencies**: Task 45 (Validation schemas)

---

### Task 48: Create Container API - Detail/Update/Delete

**Objective**: API endpoints for container CRUD operations

**Files to create**:
- `src/app/api/containers/[id]/route.ts`

**Endpoints**:
- GET: Single container details
- PATCH: Update container
- DELETE: Delete container

**Acceptance Criteria**:
- [ ] GET returns container with port names
- [ ] PATCH updates and creates status history if status changed
- [ ] DELETE removes container
- [ ] RLS enforced (404 for unauthorized)
- [ ] `export const dynamic = 'force-dynamic'` added

---

### Task 49: Create Container Status History API

**Objective**: API endpoint for container status timeline

**Files to create**:
- `src/app/api/containers/[id]/history/route.ts`

**Returns**: Array of status changes with timestamps and users

**Acceptance Criteria**:
- [ ] GET returns status history
- [ ] Ordered by created_at DESC
- [ ] RLS enforced

---

### Task 50: Create usePorts Hook

**Objective**: React Query hook for ports

**Files to create**:
- `src/lib/hooks/usePorts.ts`

**Features**:
- Long staleTime (1 hour - ports don't change often)

**Acceptance Criteria**:
- [ ] Hook fetches ports from API
- [ ] Used in container form dropdowns

**Dependencies**: Task 46 (Ports API)

---

### Task 51: Create useContainers Hook

**Objective**: React Query hooks for container operations

**Files to create**:
- `src/lib/hooks/useContainers.ts`

**Exports**:
- useContainerList
- useContainerDetail
- useContainerHistory
- useCreateContainer
- useUpdateContainer
- useDeleteContainer

**Features**:
- Optimistic updates
- Cache invalidation
- Error handling

**Acceptance Criteria**:
- [ ] All hooks work correctly
- [ ] Optimistic updates functional
- [ ] Cache invalidated on mutations

**Dependencies**: Tasks 43 (Query keys), 47-49 (Container APIs)

---

## Sprint 6: Container Management Frontend (Tasks 52-55)

### Task 52: Create Container Registration Form ⭐ CRITICAL

**Objective**: Comprehensive form with ALL required fields

**Files to create**:
- `src/components/containers/ContainerRegistrationForm.tsx`

**Sections**:
1. Container Details (container_number, bill_of_lading, seal_number, container_type)
2. Shipper Information (shipper_name, shipper_address, shipper_country)
3. Consignee Information (consignee_name, consignee_address, consignee_country)
4. Cargo Details (cargo_description, hs_code, quantity, weight, value, hazardous)
5. Ports & Schedule (origin_port, destination_port, eta, temperature)

**Acceptance Criteria**:
- [ ] All required fields included
- [ ] Validation with Zod schema
- [ ] Port dropdowns use usePorts hook
- [ ] Conditional fields work (hazard_class, temperature)
- [ ] Form mode (create/edit) works

**Dependencies**: Tasks 45 (Validation), 50 (usePorts hook)

---

### Task 53: Create Container Dialog

**Objective**: Reusable modal for container create/edit

**Files to create**:
- `src/components/containers/ContainerDialog.tsx`

**Features**:
- Full-screen on mobile
- Modal on desktop
- Uses ContainerRegistrationForm

**Acceptance Criteria**:
- [ ] Dialog opens/closes correctly
- [ ] Form submission works
- [ ] Toast notification on success

**Dependencies**: Task 52 (Container form)

---

### Task 54: Create Container List Page

**Objective**: Main container tracking page

**Files to create**:
- `src/app/(dashboard)/containers/page.tsx`
- `src/app/(dashboard)/containers/loading.tsx`
- `src/app/(dashboard)/containers/error.tsx`

**Features**:
- Stats cards
- Filter panel
- Data table
- Register button
- Pagination

**Acceptance Criteria**:
- [ ] Page matches "Container Tracking Overview" design
- [ ] Filters update table
- [ ] Pagination works
- [ ] Register button opens dialog
- [ ] Table columns display correctly

**Dependencies**: Tasks 37 (FilterPanel), 38 (DataTable), 51 (useContainers), 53 (Dialog)

---

### Task 55: Create Container Detail Page

**Objective**: Container details with tabs

**Files to create**:
- `src/app/(dashboard)/containers/[id]/page.tsx`
- `src/app/(dashboard)/containers/[id]/loading.tsx`
- `src/app/(dashboard)/containers/[id]/error.tsx`

**Tabs**:
1. Overview (all container details)
2. Status History (timeline)
3. Documents (placeholder)

**Acceptance Criteria**:
- [ ] Details display correctly
- [ ] Status history timeline works
- [ ] Edit/Delete buttons functional
- [ ] Breadcrumbs work

**Dependencies**: Task 51 (useContainers hook)

---

## Sprint 7: Polish & Testing (Tasks 56-63)

### Task 56: Add Utility Functions

**Objective**: Helper functions for formatting

**Files to create**:
- `src/lib/utils/date.ts` (formatDate, formatRelativeTime)
- `src/lib/utils/number.ts` (formatNumber, formatCurrency)
- `src/lib/utils/container.ts` (validateContainerNumber, formatContainerNumber)

**Acceptance Criteria**:
- [ ] All utility functions work correctly
- [ ] Used throughout application

---

### Task 57: Add Constants File

**Objective**: Constants for container types and statuses

**Files to create**:
- `src/lib/constants/container.ts`

**Exports**:
- CONTAINER_STATUSES
- CONTAINER_TYPES
- STATUS_COLOR_MAP
- HAZARD_CLASSES

**Acceptance Criteria**:
- [ ] All constants exported
- [ ] Used in StatusBadge and forms

---

### Task 58: Add Confirmation Dialog

**Objective**: Reusable confirmation dialog

**Files to create**:
- `src/components/shared/ConfirmDialog.tsx`

**Used for**: Delete confirmations

**Acceptance Criteria**:
- [ ] Dialog works for confirmations
- [ ] Used in delete operations

---

### Task 59: Add Error Handling

**Objective**: Comprehensive error handling

**Tasks**:
- Network error toasts
- Form validation feedback
- Session expiry handling
- 403 Forbidden handling

**Acceptance Criteria**:
- [ ] All error scenarios handled gracefully
- [ ] User-friendly error messages

---

### Task 60: Test RLS Policies ⭐ CRITICAL

**Objective**: Verify data isolation

**Test Steps**:
1. Create 2 user accounts (A and B)
2. User A creates container
3. Verify User B cannot see it
4. Verify dashboard stats are isolated

**Acceptance Criteria**:
- [ ] User A's containers not visible to User B
- [ ] API returns 404 when User B tries to access User A's container
- [ ] Dashboard stats only count user's own containers
- [ ] Results documented

---

### Task 61: Test Optimistic Updates

**Objective**: Verify UI updates immediately

**Test Steps**:
- Create container → appears in list immediately
- Update container → updates in list immediately
- Delete container → disappears immediately
- Test with 3G throttling

**Acceptance Criteria**:
- [ ] Optimistic updates work correctly
- [ ] Rollback works on error

---

### Task 62: Responsive Design Review

**Objective**: Test on all screen sizes

**Test Sizes**:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1440px

**Acceptance Criteria**:
- [ ] Sidebar collapses on mobile
- [ ] Stats cards stack correctly
- [ ] Tables scroll horizontally on mobile
- [ ] Forms are single column on mobile

---

### Task 63: Final Design Polish

**Objective**: Match design mockups exactly

**Checklist**:
- [ ] Primary color is #0066FF
- [ ] Status badge colors match
- [ ] Spacing and typography correct
- [ ] Shadows/borders consistent
- [ ] Icons all from lucide-react
- [ ] Hover states work
- [ ] Focus states for accessibility

---

## Summary

**Total Tasks**: 63 (including 24 completed from original plan)
**Remaining Tasks**: 39 new/updated tasks
**Estimated Time**: 25-32 hours

**Critical Path**:
1. React Query Provider (blocks everything)
2. Ports seeding (blocks container form)
3. Ports API (blocks container form)
4. Container validation with all required fields (prevents DB errors)
5. RLS testing (security critical)

**Note**: This plan supersedes the original 42-task plan with updated requirements based on comprehensive review.
