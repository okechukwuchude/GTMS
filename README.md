<div align="center">

# GTMS — Global Trade Monitoring System

**A full-stack maritime container inspection platform for tracking vessels, cargo, and customs clearance through national ports in real time.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Mapbox](https://img.shields.io/badge/Mapbox_GL-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://mapbox.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Demo

<video src="docs/assets/demo.mp4" controls width="100%">
  <a href="docs/assets/demo.mp4">Watch demo video</a>
</video>

---

## Overview

GTMS is a production-grade maritime logistics platform serving two distinct user groups:

- **Port Authorities & Customs Staff** — real-time vessel tracking, inspection queue management, risk scoring, and compliance reporting
- **Trade Operators** — importers, exporters, and freight forwarders who register cargo, manage documents, and track clearance status

The system integrates a live **AIS (Automatic Identification System) data stream** so port staff see vessel positions update in real time on an interactive map, while trade operators receive automated notifications as their cargo moves through the inspection pipeline.

---

## Key Features

### Real-Time Vessel Tracking
- Live AIS stream integration via WebSocket — position data refreshes continuously
- Interactive **Mapbox GL** map with smooth `flyTo()` animation on vessel selection
- Vessel sidebar with dynamic filtering and status indicators
- Custom ship icons with heading indicators rendered on the map

### Container & Cargo Management
- Full container lifecycle: `registered → in_transit → arrived → under_inspection → cleared/detained → released`
- Risk scoring engine that auto-prioritises the inspection queue by value, hazmat flag, and shipper history
- Advanced search and filtering across all containers for staff users

### OCR Document Processing
- Drag-and-drop bill of lading upload (PDF, JPG, PNG)
- **Google Cloud Vision API** extracts text and auto-populates cargo registration forms
- 85%+ accuracy target on standard document formats; raw OCR data stored in JSONB for reprocessing

### Two-Tier Security Model
- Staff and public users share one codebase but access completely separate route groups (`/admin/*` vs `/dashboard/*`)
- **Supabase Row Level Security** enforces data isolation at the database level — public users are structurally prevented from reading other users' containers
- Role-based write permissions for customs staff (inspector, analyst, supervisor)

### Notifications & Audit Trail
- Database triggers fire notifications on every status change
- Email/SMS dispatch layer hooks into the trigger system
- All critical operations are audit-logged; records retained for 7 years per compliance requirements

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Maps | Mapbox GL JS |
| Forms | React Hook Form + Zod |
| Server State | TanStack React Query |
| Client State | Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Real-time | Supabase Realtime + AIS WebSocket |
| OCR | Google Cloud Vision API |
| Package Manager | pnpm |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Next.js 14                      │
│                                                     │
│  ┌──────────────────┐   ┌────────────────────────┐  │
│  │  (staff) /admin  │   │  (public) /dashboard   │  │
│  │  Vessel tracking │   │  Container dashboard   │  │
│  │  Inspection queue│   │  Document upload (OCR) │  │
│  │  Analytics       │   │  Clearance tracking    │  │
│  └──────────────────┘   └────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │              API Routes                     │    │
│  │  /api/vessels  /api/containers  /api/ocr    │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │         Supabase           │
         │  PostgreSQL + RLS          │
         │  Auth · Storage · Realtime │
         └────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │      External Services     │
         │  AIS Stream (WebSocket)    │
         │  Google Cloud Vision (OCR) │
         └────────────────────────────┘
```

### Database Schema (core tables)

`profiles` → `staff_roles` | `vessels` → `vessel_movements` | `containers` → `inspections` → `documents` → `notifications`

Full schema and RLS policies: [`database_scripts.sql`](database_scripts.sql)

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase project ([supabase.com](https://supabase.com))
- Mapbox account with public token ([mapbox.com](https://mapbox.com))
- AIS Stream API key ([aisstream.io](https://aisstream.io)) — optional, enables live vessel data
- Google Cloud Vision credentials — optional, enables OCR

### Installation

```bash
# Clone the repository
git clone https://github.com/okechukwuchude/GTMS.git
cd GTMS

# Install dependencies
pnpm install
```

### Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token

# AIS Stream (optional — enables live vessel tracking)
AIS_API_KEY=your_aisstream_api_key
AIS_TEST_MODE=false

# Google Cloud Vision (optional — enables OCR)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### Database Setup

Run the migrations in your Supabase SQL editor:

```bash
# Apply schema and RLS policies
# Copy contents of database_scripts.sql into Supabase SQL Editor and execute
```

### Run

```bash
# Development server
pnpm dev

# Start AIS data stream (separate terminal)
pnpm ais:start

# Type checking
pnpm type-check

# Lint
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & registration
│   ├── (dashboard)/      # Public user routes
│   ├── (staff)/          # Internal staff routes
│   └── api/              # REST API endpoints
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── vessels/          # Vessel tracking & map
│   ├── containers/       # Container management
│   ├── inspections/      # Inspection workflow
│   └── layout/           # Navigation & shell
├── hooks/                # Custom React hooks
├── lib/                  # Supabase client, utilities
├── services/             # AIS WebSocket backend
└── types/                # TypeScript & DB types
```

---

## Roadmap

- [ ] Mobile-responsive inspection workflow
- [ ] Bulk container import via CSV
- [ ] Advanced analytics dashboard with Chart.js
- [ ] Push notifications (Web Push API)
- [ ] PDF report generation for customs clearance

---

## Author

**Okechukwu Chude**
[GitHub](https://github.com/okechukwuchude) · [Email](mailto:okechukwuchude@gmail.com)

---

<div align="center">
  <sub>Built with Next.js 14 · Supabase · Mapbox GL · TypeScript</sub>
</div>
