-- ============================================================================
-- GTMS Database Migration Scripts
-- ============================================================================
-- Project: Global Trade Monitoring System (Maritime Container Inspection)
-- Database: PostgreSQL (Supabase)
-- Last Updated: December 15, 2025
--
-- INSTRUCTIONS:
-- - Run these migrations in order (Migration 1 → 2 → 3 → 4)
-- - Execute in Supabase SQL Editor
-- - Test each migration before proceeding to the next
-- - Rollback scripts provided at the end of each section
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: PROFILES TABLE
-- ============================================================================
-- Description: User profile information extending Supabase auth.users
-- Dependencies: Requires Supabase Auth to be enabled
-- Task Reference: Task #12
-- ============================================================================

-- Create profiles table
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

-- Create indexes for profiles
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company_name ON profiles(company_name);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- RLS Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'public')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROLLBACK MIGRATION 1
-- ============================================================================
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS profiles CASCADE;
*/

-- ============================================================================
-- MIGRATION 2: PORTS TABLE
-- ============================================================================
-- Description: Port reference data for origin/destination tracking
-- Dependencies: None
-- Task Reference: Task #13
-- ============================================================================

-- Create ports table
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

-- Create indexes for ports
CREATE INDEX idx_ports_code ON ports(code);
CREATE INDEX idx_ports_country ON ports(country_code);
CREATE INDEX idx_ports_status ON ports(status);

-- Enable Row Level Security
ALTER TABLE ports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Ports are viewable by all authenticated users
CREATE POLICY "Ports are viewable by all authenticated users"
ON ports FOR SELECT
TO authenticated
USING (true);

-- Trigger to auto-update updated_at on ports
CREATE TRIGGER update_ports_updated_at
  BEFORE UPDATE ON ports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample ports for testing
INSERT INTO ports (name, code, country_code, city, latitude, longitude, timezone, status) VALUES
('Port of Lagos', 'NGLOS', 'NGA', 'Lagos', 6.4474, 3.3903, 'Africa/Lagos', 'active'),
('Port Harcourt', 'NGPHC', 'NGA', 'Port Harcourt', 4.7774, 7.0134, 'Africa/Lagos', 'active'),
('Apapa Port', 'NGAPP', 'NGA', 'Lagos', 6.4474, 3.3903, 'Africa/Lagos', 'active');

-- ============================================================================
-- ROLLBACK MIGRATION 2
-- ============================================================================
/*
DROP TABLE IF EXISTS ports CASCADE;
*/

-- ============================================================================
-- MIGRATION 3: CONTAINERS TABLE
-- ============================================================================
-- Description: Core table for container/cargo records
-- Dependencies: profiles table, ports table
-- Task Reference: Task #14
-- ============================================================================

-- Create containers table
CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number VARCHAR(20) NOT NULL UNIQUE,
  seal_number VARCHAR(50),
  bill_of_lading VARCHAR(50) NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),

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
  ata TIMESTAMPTZ,
  etd TIMESTAMPTZ,
  atd TIMESTAMPTZ,
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

-- Create indexes for containers
CREATE INDEX idx_containers_number ON containers(container_number);
CREATE INDEX idx_containers_owner ON containers(owner_id);
CREATE INDEX idx_containers_status ON containers(status);
CREATE INDEX idx_containers_bol ON containers(bill_of_lading);
CREATE INDEX idx_containers_current_port ON containers(current_port_id);
CREATE INDEX idx_containers_created_at ON containers(created_at DESC);
CREATE INDEX idx_containers_registration_date ON containers(registration_date DESC);

-- Enable Row Level Security
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own containers
CREATE POLICY "Users can view own containers"
ON containers FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- RLS Policy: Users can create containers
CREATE POLICY "Users can create containers"
ON containers FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- RLS Policy: Users can update own containers
CREATE POLICY "Users can update own containers"
ON containers FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Trigger to auto-update updated_at on containers
CREATE TRIGGER update_containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROLLBACK MIGRATION 3
-- ============================================================================
/*
DROP TABLE IF EXISTS containers CASCADE;
*/

-- ============================================================================
-- MIGRATION 4: CONTAINER STATUS HISTORY TABLE
-- ============================================================================
-- Description: Audit trail for all container status changes
-- Dependencies: containers table, profiles table
-- Task Reference: Task #15
-- ============================================================================

-- Create container_status_history table
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

-- Create indexes for container_status_history
CREATE INDEX idx_status_history_container ON container_status_history(container_id);
CREATE INDEX idx_status_history_changed_at ON container_status_history(changed_at DESC);

-- Enable Row Level Security
ALTER TABLE container_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view status history for their own containers
CREATE POLICY "Users can view status history for own containers"
ON container_status_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM containers
    WHERE containers.id = container_status_history.container_id
    AND containers.owner_id = auth.uid()
  )
);

-- Function to automatically track container status changes
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

-- Trigger to automatically log status changes
CREATE TRIGGER track_container_status
  AFTER UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION track_container_status_change();

-- ============================================================================
-- ROLLBACK MIGRATION 4
-- ============================================================================
/*
DROP TRIGGER IF EXISTS track_container_status ON containers;
DROP FUNCTION IF EXISTS track_container_status_change();
DROP TABLE IF EXISTS container_status_history CASCADE;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after migrations to verify everything is set up correctly
-- ============================================================================

/*
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check all triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Count sample ports
SELECT COUNT(*) as port_count FROM ports;

-- View all indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;
*/

-- ============================================================================
-- COMPLETE ROLLBACK (ALL MIGRATIONS)
-- ============================================================================
-- WARNING: This will delete ALL data and tables
-- Only use this if you need to completely reset the database
-- ============================================================================

/*
-- Drop all triggers
DROP TRIGGER IF EXISTS track_container_status ON containers;
DROP TRIGGER IF EXISTS update_containers_updated_at ON containers;
DROP TRIGGER IF EXISTS update_ports_updated_at ON ports;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS track_container_status_change();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS container_status_history CASCADE;
DROP TABLE IF EXISTS containers CASCADE;
DROP TABLE IF EXISTS ports CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
*/

-- ============================================================================
-- ADDITIONAL UTILITY FUNCTIONS (OPTIONAL - FOR FUTURE USE)
-- ============================================================================
-- These are referenced in architecture.md but not required for MVP
-- ============================================================================

/*
-- Function to calculate container risk score
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
*/

-- ============================================================================
-- STAFF TABLES (POST-MVP)
-- ============================================================================
-- These tables are for Phase 8 (Staff Features) - not needed for MVP
-- ============================================================================

/*
-- Staff roles table
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

CREATE INDEX idx_staff_roles_user_id ON staff_roles(user_id);
CREATE INDEX idx_staff_roles_role ON staff_roles(role);
CREATE INDEX idx_staff_roles_port_id ON staff_roles(port_id);

-- Vessels table
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

CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_name ON vessels(vessel_name);
CREATE INDEX idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX idx_vessels_position ON vessels USING GIST(last_known_position);

-- Inspections table
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  inspection_type VARCHAR(50) NOT NULL CHECK (inspection_type IN ('routine', 'random', 'risk_based', 'targeted', 'x_ray', 'physical')),
  inspector_id UUID NOT NULL REFERENCES profiles(id),
  supervisor_id UUID REFERENCES profiles(id),

  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  location VARCHAR(255),

  risk_score DECIMAL(5, 2),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB,

  findings TEXT,
  discrepancies JSONB,
  violations JSONB,

  result VARCHAR(30) NOT NULL CHECK (result IN ('cleared', 'detained', 'referred', 'pending', 'in_progress')),
  clearance_notes TEXT,

  checklist_data JSONB,
  checklist_completed BOOLEAN DEFAULT FALSE,

  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],

  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspections_container ON inspections(container_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_scheduled ON inspections(scheduled_at);
CREATE INDEX idx_inspections_risk_level ON inspections(risk_level);
*/

-- ============================================================================
-- END OF DATABASE SCRIPTS
-- ============================================================================
