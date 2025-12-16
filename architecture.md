# System Architecture Document

## Maritime Container Inspection Application

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Tech Stack:** Next.js 14, Supabase, TypeScript  
**Status:** Draft

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [File & Folder Structure](#2-file--folder-structure)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Environment Setup](#5-environment-setup)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Structure](#7-api-structure)
8. [State Management](#8-state-management)
9. [External Integrations](#9-external-integrations)
10. [Security Considerations](#10-security-considerations)

---

## 1. Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand (client state) + React Query (server state)
- **Charts/Visualization:** Recharts
- **Maps:** Mapbox GL JS / Leaflet
- **File Upload:** react-dropzone
- **Date Handling:** date-fns
- **Tables:** TanStack Table (React Table v8)

### Backend

- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for documents/images)
- **Real-time:** Supabase Realtime (for status updates)
- **API:** Next.js API Routes (Edge/Node runtime)
- **OCR Service:** Google Cloud Vision API / AWS Textract / Tesseract.js (fallback)

### DevOps & Infrastructure

- **Hosting:** Vercel (Frontend) + Supabase Cloud (Backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking) + Vercel Analytics
- **Email:** Resend / SendGrid
- **SMS:** Twilio (for notifications)

### Development Tools

- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Testing:** Jest + React Testing Library + Playwright (E2E)
- **Type Safety:** TypeScript strict mode
- **Git Hooks:** Husky + lint-staged

---

## 2. File & Folder Structure

```
maritime-container-app/
├── .github/                      # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── public/                       # Static assets
│   ├── icons/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Auth route group (layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx       # Auth layout (centered forms)
│   │   ├── (public)/            # Public user routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Public user container dashboard
│   │   │   ├── containers/
│   │   │   │   ├── page.tsx     # Container list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx # Container details
│   │   │   │   └── new/
│   │   │   │       └── page.tsx # Cargo registration
│   │   │   ├── documents/
│   │   │   │   └── page.tsx     # Document management
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx     # Notification center
│   │   │   ├── profile/
│   │   │   │   └── page.tsx     # User profile
│   │   │   └── layout.tsx       # Public user layout (sidebar + header)
│   │   ├── (staff)/             # Internal staff routes
│   │   │   ├── admin/
│   │   │   │   └── dashboard/
│   │   │   │       └── page.tsx # Staff dashboard
│   │   │   ├── vessels/
│   │   │   │   ├── page.tsx     # Vessel tracking
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Vessel details
│   │   │   ├── inspections/
│   │   │   │   ├── page.tsx     # Inspection queue
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx # Inspection form
│   │   │   │   └── new/
│   │   │   │       └── page.tsx # Create inspection
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx     # Trade analytics
│   │   │   ├── reports/
│   │   │   │   └── page.tsx     # Report generation
│   │   │   ├── users/
│   │   │   │   └── page.tsx     # User management
│   │   │   └── layout.tsx       # Staff layout (full sidebar + header)
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts # OAuth callback
│   │   │   ├── containers/
│   │   │   │   ├── route.ts     # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PATCH, DELETE
│   │   │   ├── ocr/
│   │   │   │   ├── process/
│   │   │   │   │   └── route.ts # Process uploaded document
│   │   │   │   └── validate/
│   │   │   │       └── route.ts # Validate OCR results
│   │   │   ├── vessels/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── inspections/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── analytics/
│   │   │   │   ├── commodities/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── trade-partners/
│   │   │   │   │   └── route.ts
│   │   │   │   └── summary/
│   │   │   │       └── route.ts
│   │   │   ├── notifications/
│   │   │   │   └── route.ts
│   │   │   ├── documents/
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       ├── ais/
│   │   │       │   └── route.ts # AIS data webhook
│   │   │       └── supabase/
│   │   │           └── route.ts # Supabase webhooks
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css          # Global styles
│   │   └── error.tsx            # Global error boundary
│   ├── components/              # React components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── protected-route.tsx
│   │   ├── containers/
│   │   │   ├── container-list.tsx
│   │   │   ├── container-card.tsx
│   │   │   ├── container-status-badge.tsx
│   │   │   ├── container-timeline.tsx
│   │   │   └── cargo-registration-form.tsx
│   │   ├── ocr/
│   │   │   ├── document-uploader.tsx
│   │   │   ├── ocr-preview.tsx
│   │   │   └── ocr-validation-modal.tsx
│   │   ├── vessels/
│   │   │   ├── vessel-map.tsx
│   │   │   ├── vessel-list.tsx
│   │   │   └── vessel-details-card.tsx
│   │   ├── inspections/
│   │   │   ├── inspection-form.tsx
│   │   │   ├── inspection-checklist.tsx
│   │   │   └── inspection-history.tsx
│   │   ├── analytics/
│   │   │   ├── commodity-chart.tsx
│   │   │   ├── trade-flow-chart.tsx
│   │   │   └── stats-card.tsx
│   │   ├── notifications/
│   │   │   ├── notification-bell.tsx
│   │   │   ├── notification-list.tsx
│   │   │   └── notification-item.tsx
│   │   ├── documents/
│   │   │   ├── document-list.tsx
│   │   │   ├── document-viewer.tsx
│   │   │   └── document-upload.tsx
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (other UI primitives)
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── footer.tsx
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── error-message.tsx
│   │       ├── empty-state.tsx
│   │       ├── search-input.tsx
│   │       ├── filter-bar.tsx
│   │       └── pagination.tsx
│   ├── lib/                     # Utility functions & configurations
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   ├── middleware.ts    # Auth middleware
│   │   │   └── admin.ts         # Admin client (service role)
│   │   ├── api/
│   │   │   ├── containers.ts    # Container API functions
│   │   │   ├── vessels.ts       # Vessel API functions
│   │   │   ├── inspections.ts   # Inspection API functions
│   │   │   ├── users.ts         # User API functions
│   │   │   └── analytics.ts     # Analytics API functions
│   │   ├── ocr/
│   │   │   ├── processor.ts     # OCR processing logic
│   │   │   ├── validators.ts    # OCR validation rules
│   │   │   └── parsers.ts       # Document parsing logic
│   │   ├── utils/
│   │   │   ├── date.ts          # Date utilities
│   │   │   ├── format.ts        # Formatting utilities
│   │   │   ├── validation.ts    # Validation utilities
│   │   │   └── cn.ts            # className utility
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-containers.ts
│   │   │   ├── use-vessels.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── use-realtime.ts
│   │   │   └── use-debounce.ts
│   │   ├── stores/              # Zustand stores
│   │   │   ├── auth-store.ts
│   │   │   ├── filter-store.ts
│   │   │   └── notification-store.ts
│   │   ├── constants/
│   │   │   ├── routes.ts        # Route constants
│   │   │   ├── statuses.ts      # Status enums
│   │   │   ├── roles.ts         # User role constants
│   │   │   └── permissions.ts   # Permission constants
│   │   └── validations/         # Zod schemas
│   │       ├── auth.ts
│   │       ├── container.ts
│   │       ├── inspection.ts
│   │       └── user.ts
│   ├── types/                   # TypeScript type definitions
│   │   ├── database.ts          # Supabase generated types
│   │   ├── api.ts               # API types
│   │   ├── container.ts
│   │   ├── vessel.ts
│   │   ├── inspection.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── styles/                  # Additional styles
│   │   └── theme.css            # Theme variables
│   └── middleware.ts            # Next.js middleware (auth)
├── supabase/                    # Supabase configuration
│   ├── migrations/              # Database migrations
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_add_rls_policies.sql
│   │   ├── 00003_add_indexes.sql
│   │   └── ...
│   ├── functions/               # Edge functions
│   │   ├── ocr-processor/
│   │   │   └── index.ts
│   │   └── notification-sender/
│   │       └── index.ts
│   ├── seed.sql                 # Seed data
│   └── config.toml              # Supabase config
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                        # Documentation
│   ├── api.md
│   ├── deployment.md
│   └── user-guide.md
├── .env.local.example           # Example environment variables
├── .env.local                   # Local environment (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── pnpm-lock.yaml              # Lock file
└── README.md                   # Project README
```

### Naming Conventions

**Files:**

- Components: `kebab-case.tsx` (e.g., `container-list.tsx`)
- Pages: `page.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Types: `kebab-case.ts` (e.g., `container.ts`)
- Utilities: `kebab-case.ts` (e.g., `date-utils.ts`)

**Directories:**

- All lowercase with hyphens: `container-management/`
- Route groups: `(group-name)/`

**Components:**

- PascalCase for component names: `ContainerList`, `CargoForm`
- Prefix custom hooks with `use`: `useAuth`, `useContainers`
- Suffix stores with `-store`: `authStore`, `filterStore`

**Variables/Functions:**

- camelCase: `getUserData`, `containerList`
- Constants: UPPER_SNAKE_CASE: `API_BASE_URL`, `MAX_FILE_SIZE`

---

## 3. System Architecture

### 3.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js Web App]
        MOBILE[Mobile Browser]
    end

    subgraph "API Layer"
        NEXTAPI[Next.js API Routes]
        EDGE[Edge Functions]
    end

    subgraph "Authentication"
        AUTH[Supabase Auth]
    end

    subgraph "Data Layer"
        DB[(Supabase PostgreSQL)]
        STORAGE[Supabase Storage]
        REALTIME[Supabase Realtime]
    end

    subgraph "External Services"
        OCR[OCR Service<br/>Google Vision/Textract]
        AIS[AIS Data Feed]
        EMAIL[Email Service<br/>Resend/SendGrid]
        SMS[SMS Service<br/>Twilio]
        MAPS[Maps API<br/>Mapbox]
    end

    WEB --> NEXTAPI
    MOBILE --> NEXTAPI
    NEXTAPI --> AUTH
    NEXTAPI --> DB
    NEXTAPI --> STORAGE
    NEXTAPI --> OCR
    NEXTAPI --> EMAIL
    NEXTAPI --> SMS
    WEB --> REALTIME
    MOBILE --> REALTIME
    REALTIME --> DB
    EDGE --> DB
    AIS --> NEXTAPI
    WEB --> MAPS
```

### 3.2 Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Next.js)
    participant API as API Routes
    participant Auth as Supabase Auth
    participant DB as Database
    participant OCR as OCR Service
    participant Storage as File Storage

    U->>C: Upload Bill of Lading
    C->>Storage: Upload document
    Storage-->>C: Return file URL
    C->>API: POST /api/ocr/process
    API->>Auth: Verify user token
    Auth-->>API: Token valid
    API->>OCR: Send document for processing
    OCR-->>API: Return extracted data
    API->>DB: Store OCR results
    DB-->>API: Return container ID
    API-->>C: Return parsed data
    C->>U: Show review form with pre-filled data
    U->>C: Review & submit
    C->>API: POST /api/containers
    API->>Auth: Verify permissions
    API->>DB: Create container record
    DB-->>API: Success
    API-->>C: Return container
    C->>U: Redirect to container dashboard
```

### 3.3 Data Flow Diagrams

#### Public User Flow: Cargo Registration

```mermaid
flowchart TD
    A[User Login] --> B{Registration Method?}
    B -->|Manual Entry| C[Fill Cargo Form]
    B -->|OCR Upload| D[Upload Bill of Lading]
    D --> E[OCR Processing]
    E --> F[Data Extraction]
    F --> G[Confidence Scoring]
    G --> H[Pre-fill Form]
    H --> I{User Reviews Data}
    C --> I
    I -->|Edits Needed| J[User Corrects Data]
    I -->|Looks Good| K[Submit Registration]
    J --> K
    K --> L[Validation]
    L -->|Invalid| M[Show Errors]
    M --> J
    L -->|Valid| N[Create Container Record]
    N --> O[Save Documents]
    O --> P[Send Notifications]
    P --> Q[Show in Dashboard]
```

#### Internal Staff Flow: Inspection Workflow

```mermaid
flowchart TD
    A[Inspector Login] --> B[View Inspection Queue]
    B --> C[Risk-Sorted Containers]
    C --> D{Select Container}
    D --> E[View Container Details]
    E --> F[Review Documents]
    F --> G[Start Inspection]
    G --> H[Fill Inspection Form]
    H --> I[Upload Photos]
    I --> J[Record Findings]
    J --> K{Decision}
    K -->|Clear| L[Mark as Cleared]
    K -->|Detain| M[Mark as Detained]
    K -->|Refer| N[Escalate to Supervisor]
    L --> O[Update Container Status]
    M --> O
    N --> O
    O --> P[Notify Container Owner]
    P --> Q[Update Dashboard]
```

### 3.4 State Management Strategy

**Client State (Zustand):**

- User preferences (theme, language)
- UI state (sidebar open/closed, active filters)
- Form state (temporary, non-persistent)
- Notification queue

**Server State (React Query):**

- Container data
- Vessel data
- Inspection records
- User profiles
- Analytics data

**Real-time State (Supabase Realtime):**

- Container status updates
- Vessel position changes
- New notification arrivals
- Inspection status changes

**URL State (Next.js searchParams):**

- Pagination state
- Filter parameters
- Sort order
- Search queries

---

## 4. Database Schema

### 4.1 Core Tables

#### Table: `profiles`

User profile information extending Supabase auth.users

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('public', 'staff')),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  company_registration VARCHAR(100),
  company_verified BOOLEAN DEFAULT FALSE,
  address TEXT,
  country_code VARCHAR(3),
  preferred_language VARCHAR(10) DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company_name ON profiles(company_name);
```

#### Table: `staff_roles`

Role and permission management for internal staff

```sql
CREATE TABLE staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customs_inspector', 'port_manager', 'trade_analyst', 'compliance_officer', 'supervisor')),
  port_id UUID REFERENCES ports(id),
  permissions JSONB DEFAULT '[]'::jsonb,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, role, port_id)
);

-- Indexes
CREATE INDEX idx_staff_roles_user_id ON staff_roles(user_id);
CREATE INDEX idx_staff_roles_role ON staff_roles(role);
CREATE INDEX idx_staff_roles_port_id ON staff_roles(port_id);
```

#### Table: `ports`

Port information

```sql
CREATE TABLE ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  country_code VARCHAR(3) NOT NULL,
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ports_code ON ports(code);
CREATE INDEX idx_ports_country ON ports(country_code);
CREATE INDEX idx_ports_status ON ports(status);
```

#### Table: `vessels`

Vessel information

```sql
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imo_number VARCHAR(20) UNIQUE,
  vessel_name VARCHAR(255) NOT NULL,
  vessel_type VARCHAR(50),
  flag_country VARCHAR(3),
  gross_tonnage INTEGER,
  net_tonnage INTEGER,
  built_year INTEGER,
  length_meters DECIMAL(10, 2),
  beam_meters DECIMAL(10, 2),
  draft_meters DECIMAL(10, 2),
  mmsi VARCHAR(20),
  call_sign VARCHAR(20),
  owner_name VARCHAR(255),
  operator_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  last_known_position POINT,
  last_position_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_name ON vessels(vessel_name);
CREATE INDEX idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX idx_vessels_position ON vessels USING GIST(last_known_position);
```

#### Table: `vessel_movements`

Track vessel arrivals and departures

```sql
CREATE TABLE vessel_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  port_id UUID NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('arrival', 'departure')),
  scheduled_time TIMESTAMPTZ,
  actual_time TIMESTAMPTZ,
  voyage_number VARCHAR(50),
  berth_number VARCHAR(20),
  cargo_manifest JSONB,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vessel_movements_vessel ON vessel_movements(vessel_id);
CREATE INDEX idx_vessel_movements_port ON vessel_movements(port_id);
CREATE INDEX idx_vessel_movements_scheduled_time ON vessel_movements(scheduled_time);
CREATE INDEX idx_vessel_movements_status ON vessel_movements(status);
```

#### Table: `containers`

Container records (core table)

```sql
CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number VARCHAR(20) NOT NULL UNIQUE,
  seal_number VARCHAR(50),
  bill_of_lading VARCHAR(50) NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  vessel_movement_id UUID REFERENCES vessel_movements(id),

  -- Shipper/Consignee info
  shipper_name VARCHAR(255) NOT NULL,
  shipper_address TEXT,
  shipper_country VARCHAR(3),
  consignee_name VARCHAR(255) NOT NULL,
  consignee_address TEXT,
  consignee_country VARCHAR(3),

  -- Cargo details
  cargo_description TEXT NOT NULL,
  hs_code VARCHAR(20),
  commodity_type VARCHAR(100),
  quantity DECIMAL(15, 2),
  quantity_unit VARCHAR(20),
  weight_kg DECIMAL(15, 2),
  volume_cbm DECIMAL(15, 2),
  value_usd DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Routing
  origin_port_id UUID REFERENCES ports(id),
  destination_port_id UUID REFERENCES ports(id),
  current_port_id UUID REFERENCES ports(id),

  -- Container specifications
  container_type VARCHAR(50) DEFAULT '20FT' CHECK (container_type IN ('20FT', '40FT', '40FT_HC', '45FT', 'REEFER', 'TANK', 'OPEN_TOP', 'FLAT_RACK')),
  container_condition VARCHAR(20) DEFAULT 'good',
  is_hazardous BOOLEAN DEFAULT FALSE,
  hazard_class VARCHAR(50),
  temperature_celsius DECIMAL(5, 2),

  -- Status tracking
  status VARCHAR(30) DEFAULT 'registered' CHECK (status IN (
    'registered', 'in_transit', 'arrived', 'pending_inspection',
    'under_inspection', 'inspection_complete', 'cleared',
    'detained', 'released', 'departed'
  )),
  sub_status VARCHAR(100),
  current_location VARCHAR(255),

  -- Dates
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  eta TIMESTAMPTZ,
  ata TIMESTAMPTZ, -- Actual Time of Arrival
  etd TIMESTAMPTZ,
  atd TIMESTAMPTZ, -- Actual Time of Departure
  clearance_date TIMESTAMPTZ,

  -- OCR metadata
  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_confidence DECIMAL(5, 2),
  ocr_data JSONB,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_containers_number ON containers(container_number);
CREATE INDEX idx_containers_owner ON containers(owner_id);
CREATE INDEX idx_containers_status ON containers(status);
CREATE INDEX idx_containers_bol ON containers(bill_of_lading);
CREATE INDEX idx_containers_vessel_movement ON containers(vessel_movement_id);
CREATE INDEX idx_containers_current_port ON containers(current_port_id);
CREATE INDEX idx_containers_created_at ON containers(created_at DESC);
CREATE INDEX idx_containers_registration_date ON containers(registration_date DESC);
```

#### Table: `container_status_history`

Track all status changes

```sql
CREATE TABLE container_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  sub_status VARCHAR(100),
  location VARCHAR(255),
  notes TEXT,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_status_history_container ON container_status_history(container_id);
CREATE INDEX idx_status_history_changed_at ON container_status_history(changed_at DESC);
```

#### Table: `inspections`

Container inspection records

```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  inspection_type VARCHAR(50) NOT NULL CHECK (inspection_type IN ('routine', 'random', 'risk_based', 'targeted', 'x_ray', 'physical')),
  inspector_id UUID NOT NULL REFERENCES profiles(id),
  supervisor_id UUID REFERENCES profiles(id),

  -- Inspection details
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  location VARCHAR(255),

  -- Risk assessment
  risk_score DECIMAL(5, 2),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB,

  -- Findings
  findings TEXT,
  discrepancies JSONB,
  violations JSONB,

  -- Results
  result VARCHAR(30) NOT NULL CHECK (result IN ('cleared', 'detained', 'referred', 'pending', 'in_progress')),
  clearance_notes TEXT,

  -- Checklist completion
  checklist_data JSONB,
  checklist_completed BOOLEAN DEFAULT FALSE,

  -- Media
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Workflow
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inspections_container ON inspections(container_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_scheduled ON inspections(scheduled_at);
CREATE INDEX idx_inspections_risk_level ON inspections(risk_level);
```

#### Table: `documents`

Document storage metadata

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES containers(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),

  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'bill_of_lading', 'commercial_invoice', 'packing_list',
    'certificate_origin', 'customs_declaration', 'inspection_report',
    'photo', 'other'
  )),

  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket VARCHAR(100) DEFAULT 'documents',

  ocr_processed BOOLEAN DEFAULT FALSE,
  ocr_text TEXT,
  ocr_confidence DECIMAL(5, 2),

  version INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT TRUE,
  parent_document_id UUID REFERENCES documents(id),

  metadata JSONB,

  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_documents_container ON documents(container_id);
CREATE INDEX idx_documents_inspection ON documents(inspection_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);
```

#### Table: `notifications`

User notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL CHECK (type IN (
    'container_status_change', 'inspection_scheduled',
    'document_required', 'clearance_complete', 'vessel_arrival',
    'payment_due', 'deadline_reminder', 'system_alert'
  )),

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  related_container_id UUID REFERENCES containers(id),
  related_inspection_id UUID REFERENCES inspections(id),

  channels JSONB DEFAULT '["in_app"]'::jsonb,

  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  action_url TEXT,
  action_label VARCHAR(100),

  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

#### Table: `analytics_cache`

Cache for analytics queries

```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  query_params JSONB,
  result_data JSONB NOT NULL,
  port_id UUID REFERENCES ports(id),
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
```

#### Table: `audit_logs`

Comprehensive audit trail

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### 4.2 Row Level Security (RLS) Policies

#### Profiles Table Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Staff can view all profiles
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_roles
    WHERE staff_roles.user_id = auth.uid()
    AND staff_roles.role IN ('admin', 'port_manager', 'compliance_officer')
  )
);
```

#### Containers Table Policies

```sql
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- Public users can view their own containers
CREATE POLICY "Users can view own containers"
ON containers FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Public users can create containers
CREATE POLICY "Users can create containers"
ON containers FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Public users can update their own containers (limited fields)
CREATE POLICY "Users can update own containers"
ON containers FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Staff can view all containers
CREATE POLICY "Staff can view all containers"
ON containers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_roles
    WHERE staff_roles.user_id = auth.uid()
  )
);

-- Staff can update containers (inspection/status)
CREATE POLICY "Staff can update containers"
ON containers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_roles
    WHERE staff_roles.user_id = auth.uid()
  )
);
```

#### Inspections Table Policies

```sql
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Public users can view inspections for their containers
CREATE POLICY "Users can view inspections for own containers"
ON inspections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM containers
    WHERE containers.id = inspections.container_id
    AND containers.owner_id = auth.uid()
  )
);

-- Staff can view all inspections
CREATE POLICY "Staff can view all inspections"
ON inspections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_roles
    WHERE staff_roles.user_id = auth.uid()
  )
);

-- Inspectors can create/update inspections
CREATE POLICY "Inspectors can manage inspections"
ON inspections FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_roles
    WHERE staff_roles.user_id = auth.uid()
    AND staff_roles.role IN ('customs_inspector', 'supervisor', 'admin')
  )
);
```

#### Documents Table Policies

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents for their containers
CREATE POLICY "Users can view own container documents"
ON documents FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM containers
    WHERE containers.id = documents.container_id
    AND containers.owner_id = auth.uid()
  )
);

-- Users can upload documents for their containers
CREATE POLICY "Users can upload documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM containers
    WHERE containers.id = documents.container_id
    AND containers.owner_id = auth.uid()
  )
);

-- Staff can view all documents
CREATE POLICY "Staff can view all documents"
ON documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_roles
    WHERE staff_roles.user_id = auth.uid()
  )
);
```

#### Notifications Table Policies

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 4.3 Database Functions and Triggers

#### Function: Update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to other tables with updated_at)
```

#### Function: Track container status changes

```sql
CREATE OR REPLACE FUNCTION track_container_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO container_status_history (
      container_id,
      status,
      sub_status,
      location,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.status,
      NEW.sub_status,
      NEW.current_location,
      NEW.updated_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_container_status
  AFTER UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION track_container_status_change();
```

#### Function: Create notification on status change

```sql
CREATE OR REPLACE FUNCTION notify_container_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_container_id,
      priority
    ) VALUES (
      NEW.owner_id,
      'container_status_change',
      'Container Status Updated',
      'Container ' || NEW.container_number || ' status changed to ' || NEW.status,
      NEW.id,
      CASE
        WHEN NEW.status IN ('cleared', 'detained') THEN 'high'
        ELSE 'normal'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_status_change
  AFTER UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION notify_container_status_change();
```

#### Function: Calculate risk score

```sql
CREATE OR REPLACE FUNCTION calculate_container_risk_score(container_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  risk_score DECIMAL := 0;
  container_rec RECORD;
BEGIN
  SELECT * INTO container_rec FROM containers WHERE id = container_id;

  -- High value cargo
  IF container_rec.value_usd > 100000 THEN
    risk_score := risk_score + 20;
  END IF;

  -- Hazardous materials
  IF container_rec.is_hazardous THEN
    risk_score := risk_score + 30;
  END IF;

  -- High-risk origin countries (example)
  -- IF container_rec.shipper_country IN ('XX', 'YY') THEN
  --   risk_score := risk_score + 25;
  -- END IF;

  -- First-time shipper
  IF NOT EXISTS (
    SELECT 1 FROM containers
    WHERE shipper_name = container_rec.shipper_name
    AND id != container_id
  ) THEN
    risk_score := risk_score + 15;
  END IF;

  RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Environment Setup

### 5.1 Environment Variables

Create `.env.local` file:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Maritime Container Inspection"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database (for direct connection if needed)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# OCR Service (Choose one)
# Google Cloud Vision
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}

# OR AWS Textract
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Email Service
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@yourdomain.com

# SMS Service
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Maps API
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# AIS Data Feed (if applicable)
AIS_API_KEY=your-ais-key
AIS_API_URL=https://api.ais-provider.com

# Analytics & Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Feature Flags
NEXT_PUBLIC_ENABLE_OCR=true
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_SMS_NOTIFICATIONS=false

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# File Upload
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png
```

### 5.2 Package.json Dependencies

```json
{
  "name": "maritime-container-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "supabase:gen-types": "supabase gen types typescript --local > src/types/database.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.7",
    "@tanstack/react-query": "^5.28.0",
    "@tanstack/react-table": "^8.13.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.344.0",
    "mapbox-gl": "^3.2.0",
    "next": "14.1.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.51.0",
    "recharts": "^2.12.2",
    "sharp": "^0.33.2",
    "sonner": "^1.4.3",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.1",
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@types/jest": "^29.5.12",
    "@types/mapbox-gl": "^3.1.0",
    "@types/node": "^20.11.25",
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@typescript-eslint/eslint-plugin": "^7.1.1",
    "@typescript-eslint/parser": "^7.1.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.1.3",
    "eslint-config-prettier": "^9.1.0",
    "husky": "^9.0.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "lint-staged": "^15.2.2",
    "postcss": "^8.4.35",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.12",
    "supabase": "^1.148.6",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.2"
  }
}
```

### 5.3 Supabase Configuration

#### supabase/config.toml

```toml
project_id = "your-project-id"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/**"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[storage]
enabled = true
file_size_limit = "10MB"

[storage.buckets.documents]
public = false
file_size_limit = "10MB"
allowed_mime_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

[storage.buckets.avatars]
public = true
file_size_limit = "2MB"
allowed_mime_types = ["image/jpeg", "image/png", "image/jpg"]
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant MW as Middleware
    participant Auth as Supabase Auth
    participant DB as Database

    U->>C: Visit protected page
    C->>MW: Check auth
    MW->>Auth: Validate session

    alt No valid session
        Auth-->>MW: Unauthorized
        MW-->>C: Redirect to /login
        C->>U: Show login form
        U->>C: Submit credentials
        C->>Auth: signInWithPassword()
        Auth->>DB: Verify credentials
        DB-->>Auth: User valid
        Auth-->>C: Session + tokens
        C->>C: Store session
        C-->>U: Redirect to dashboard
    else Valid session
        Auth-->>MW: Session valid
        MW->>DB: Get user profile
        DB-->>MW: User data + roles
        MW-->>C: Allow access
        C->>U: Show protected content
    end
```

### 6.2 User Registration Flow

```mermaid
flowchart TD
    A[User visits /register] --> B{User Type?}
    B -->|Public User| C[Fill registration form]
    B -->|Staff| D[Admin invitation only]
    C --> E[Submit form]
    E --> F[Create auth.users record]
    F --> G[Send verification email]
    G --> H[User clicks email link]
    H --> I[Email verified]
    I --> J[Create profile record]
    J --> K{Business account?}
    K -->|Yes| L[Pending admin approval]
    K -->|No| M[Account active]
    L --> N[Admin reviews]
    N --> O[Approve/Reject]
    O -->|Approved| M
    M --> P[User can login]
```

### 6.3 Protected Routes Implementation

#### middleware.ts

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Redirect to login if not authenticated
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, get user profile and check permissions
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, company_verified')
      .eq('id', session.user.id)
      .single()

    // Check staff routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (profile?.user_type !== 'staff') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Check public user routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (profile?.user_type === 'staff') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      if (profile?.user_type === 'public' && !profile?.company_verified) {
        return NextResponse.redirect(new URL('/pending-verification', request.url))
      }
    }

    // Redirect from auth pages if already logged in
    if (isPublicRoute && request.nextUrl.pathname !== '/') {
      if (profile?.user_type === 'staff') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### 6.4 Permission Levels

| Role                   | Permissions                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Public User**        | - View own containers<br>- Create cargo registrations<br>- Upload documents<br>- View own inspections<br>- Receive notifications                       |
| **Customs Inspector**  | - View all containers<br>- Create/update inspections<br>- Access inspection queue<br>- Upload inspection photos<br>- Update container status (limited) |
| **Port Manager**       | - View all containers & vessels<br>- Assign inspections<br>- View analytics dashboard<br>- Manage resources<br>- Generate reports                      |
| **Trade Analyst**      | - View all containers<br>- Access full analytics<br>- Generate custom reports<br>- Export data<br>- View historical trends                             |
| **Compliance Officer** | - View all containers<br>- Access risk assessments<br>- Review violations<br>- Generate compliance reports<br>- Update sanctions database              |
| **Admin**              | - Full system access<br>- User management<br>- System configuration<br>- Access audit logs<br>- Manage ports & staff                                   |

### 6.5 Role Checking Utilities

```typescript
// lib/permissions.ts
export const ROLES = {
  ADMIN: 'admin',
  CUSTOMS_INSPECTOR: 'customs_inspector',
  PORT_MANAGER: 'port_manager',
  TRADE_ANALYST: 'trade_analyst',
  COMPLIANCE_OFFICER: 'compliance_officer',
  SUPERVISOR: 'supervisor',
} as const

export const PERMISSIONS = {
  VIEW_ALL_CONTAINERS: 'view_all_containers',
  CREATE_INSPECTION: 'create_inspection',
  UPDATE_INSPECTION: 'update_inspection',
  UPDATE_CONTAINER_STATUS: 'update_container_status',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
} as const

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_CONTAINERS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.UPDATE_INSPECTION,
    PERMISSIONS.UPDATE_CONTAINER_STATUS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  [ROLES.CUSTOMS_INSPECTOR]: [
    PERMISSIONS.VIEW_ALL_CONTAINERS,
    PERMISSIONS.CREATE_INSPECTION,
    PERMISSIONS.UPDATE_INSPECTION,
  ],
  [ROLES.PORT_MANAGER]: [PERMISSIONS.VIEW_ALL_CONTAINERS, PERMISSIONS.VIEW_ANALYTICS],
  // ... other roles
} as const

export function hasPermission(userRoles: string[], permission: string): boolean {
  return userRoles.some((role) =>
    ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.includes(permission)
  )
}
```

---

## 7. API Structure

### 7.1 API Endpoint Organization

```
/api
├── /auth
│   └── /callback          [GET]  OAuth callback handler
├── /containers
│   ├── /                  [GET]  List containers (paginated)
│   ├── /                  [POST] Create new container
│   └── /:id
│       ├── /              [GET]  Get container details
│       ├── /              [PATCH] Update container
│       ├── /              [DELETE] Delete container
│       └── /status        [PATCH] Update container status
├── /ocr
│   ├── /process           [POST] Process document with OCR
│   └── /validate          [POST] Validate OCR results
├── /vessels
│   ├── /                  [GET]  List vessels (with position)
│   ├── /                  [POST] Create vessel (staff only)
│   ├── /:id               [GET]  Get vessel details
│   └── /:id/movements     [GET]  Get vessel movements
├── /inspections
│   ├── /                  [GET]  List inspections
│   ├── /                  [POST] Create inspection
│   ├── /:id               [GET]  Get inspection details
│   ├── /:id               [PATCH] Update inspection
│   └── /queue             [GET]  Get inspection queue (staff)
├── /analytics
│   ├── /commodities       [GET]  Commodity statistics
│   ├── /trade-partners    [GET]  Trade partner analysis
│   └── /summary           [GET]  Dashboard summary stats
├── /notifications
│   ├── /                  [GET]  List user notifications
│   ├── /:id/read          [PATCH] Mark as read
│   └── /preferences       [PATCH] Update notification preferences
├── /documents
│   ├── /upload            [POST] Upload document
│   ├── /:id               [GET]  Get document (signed URL)
│   └── /:id               [DELETE] Delete document
└── /webhooks
    ├── /ais               [POST] Receive AIS updates
    └── /supabase          [POST] Handle Supabase webhooks
```

### 7.2 API Response Format

**Success Response:**

```typescript
{
  data: T,
  meta?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Error Response:**

```typescript
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### 7.3 Example API Route Implementation

```typescript
// app/api/containers/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const containerSchema = z.object({
  container_number: z.string().min(1).max(20),
  bill_of_lading: z.string().min(1),
  shipper_name: z.string().min(1),
  consignee_name: z.string().min(1),
  cargo_description: z.string().min(1),
  // ... other fields
})

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    // Check auth
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('containers')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching containers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check auth
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = containerSchema.parse(body)

    const { data, error } = await supabase
      .from('containers')
      .insert({
        ...validatedData,
        owner_id: session.user.id,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating container:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 8. State Management

### 8.1 Client State (Zustand)

```typescript
// lib/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, profile: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

// lib/stores/filter-store.ts
interface FilterState {
  status: string | null
  dateRange: DateRange | null
  searchQuery: string
  setStatus: (status: string | null) => void
  setDateRange: (range: DateRange | null) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  status: null,
  dateRange: null,
  searchQuery: '',
  setStatus: (status) => set({ status }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearFilters: () => set({ status: null, dateRange: null, searchQuery: '' }),
}))
```

### 8.2 Server State (React Query)

```typescript
// lib/hooks/use-containers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useContainers(filters?: ContainerFilters) {
  return useQuery({
    queryKey: ['containers', filters],
    queryFn: async () => {
      let query = supabase.from('containers').select('*').order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
  })
}

export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (container: CreateContainerDto) => {
      const { data, error } = await supabase.from('containers').insert(container).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}
```

### 8.3 Real-time Updates

```typescript
// lib/hooks/use-realtime.ts
import { useEffect } from 'use('react')
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useContainerRealtime(userId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('container-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'containers',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['containers'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}
```

---

## 9. External Integrations

### 9.1 OCR Service Integration

```typescript
// lib/ocr/processor.ts
import { GoogleVisionClient } from '@google-cloud/vision'

const visionClient = new GoogleVisionClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS!),
})

export async function processDocument(fileBuffer: Buffer, mimeType: string) {
  const [result] = await visionClient.documentTextDetection({
    image: { content: fileBuffer },
  })

  const fullText = result.fullTextAnnotation?.text || ''
  const confidence = calculateConfidence(result)

  // Parse bill of lading fields
  const parsedData = parseBillOfLading(fullText)

  return {
    fullText,
    confidence,
    parsedData,
    rawResult: result,
  }
}

function parseBillOfLading(text: string) {
  // Implement parsing logic based on common BOL formats
  return {
    containerNumber: extractContainerNumber(text),
    billOfLading: extractBOLNumber(text),
    shipperName: extractShipper(text),
    consigneeName: extractConsignee(text),
    cargoDescription: extractCargoDescription(text),
    // ... other fields
  }
}
```

### 9.2 AIS Data Integration

```typescript
// app/api/webhooks/ais/route.ts
export async function POST(request: Request) {
  const data = await request.json()

  // Validate AIS data structure
  if (!validateAISData(data)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  // Update vessel position in database
  await supabase.from('vessels').upsert({
    imo_number: data.imo,
    mmsi: data.mmsi,
    last_known_position: `POINT(${data.longitude} ${data.latitude})`,
    last_position_update: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
```

### 9.3 Notification Services

```typescript
// lib/notifications/sender.ts
import { Resend } from 'resend'
import { Twilio } from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  })
}

export async function sendSMS(to: string, message: string) {
  await twilio.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}
```

---

## 10. Security Considerations

### 10.1 Input Validation

- All user inputs validated with Zod schemas
- SQL injection prevented by Supabase parameterized queries
- XSS prevented by React's auto-escaping and CSP headers

### 10.2 File Upload Security

```typescript
// lib/utils/file-validation.ts
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File too large')
  }
  // Scan for malware (integrate with service like VirusTotal)
}
```

### 10.3 Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

const tokenCache = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
})

export function rateLimit(identifier: string) {
  const tokenCount = (tokenCache.get(identifier) as number) || 0
  if (tokenCount > 10) {
    return false
  }
  tokenCache.set(identifier, tokenCount + 1)
  return true
}
```

### 10.4 Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
]
```

---

## Appendices

### A. Glossary

- **BOL**: Bill of Lading
- **OCR**: Optical Character Recognition
- **AIS**: Automatic Identification System
- **TEU**: Twenty-foot Equivalent Unit
- **HS Code**: Harmonized System Code
- **RLS**: Row Level Security

### B. References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query Documentation](https://tanstack.com/query)

---

**End of Architecture Document**
