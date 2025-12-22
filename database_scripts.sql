-- ============================================================================
-- GTMS Database Migration Scripts
-- ============================================================================
-- Project: Global Trade Monitoring System (Maritime Container Inspection)
-- Database: PostgreSQL (Supabase)
-- Last Updated: December 21, 2025
--
-- INSTRUCTIONS:
-- - Run these migrations in order (Migration 1 → 2 → 3 → 4 → 5 → 6)
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
-- MIGRATION 5: VESSEL TRACKING TABLES (PHASE 7)
-- ============================================================================
-- Description: Real-time vessel tracking and container-vessel associations
-- Dependencies: containers table, ports table
-- Task Reference: Task #51 (Phase 7: Container Tracking & Vessel Monitoring)
-- Integration: Mapbox for visualization, AIS Stream for real-time positions
-- ============================================================================

-- Create vessels table
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vessel identification
  imo_number VARCHAR(20) UNIQUE,
  mmsi VARCHAR(20) UNIQUE,
  vessel_name VARCHAR(255) NOT NULL,
  call_sign VARCHAR(20),

  -- Vessel specifications
  vessel_type VARCHAR(50),
  vessel_type_code INTEGER,
  flag_country VARCHAR(3),
  gross_tonnage INTEGER,
  net_tonnage INTEGER,
  deadweight_tonnage INTEGER,
  built_year INTEGER,

  -- Dimensions (in meters)
  length_meters DECIMAL(10, 2),
  beam_meters DECIMAL(10, 2),
  draft_meters DECIMAL(10, 2),

  -- Ownership
  owner_name VARCHAR(255),
  operator_name VARCHAR(255),
  manager_name VARCHAR(255),

  -- Current status
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN (
    'active', 'inactive', 'in_transit', 'at_berth',
    'anchored', 'under_repair', 'decommissioned'
  )),

  -- Current position (latest from AIS)
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_speed_knots DECIMAL(5, 2),
  current_course DECIMAL(5, 2),
  current_heading DECIMAL(5, 2),
  navigation_status INTEGER,
  current_port_id UUID REFERENCES ports(id),

  -- Destination
  destination_port_id UUID REFERENCES ports(id),
  destination_name VARCHAR(255),
  eta TIMESTAMPTZ,

  -- Tracking metadata
  last_position_update TIMESTAMPTZ,
  ais_data_source VARCHAR(50) DEFAULT 'aisstream',
  position_update_frequency_seconds INTEGER DEFAULT 30,

  -- AIS raw data (for debugging)
  last_ais_message JSONB,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Create indexes for vessels
CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX idx_vessels_name ON vessels(vessel_name);
CREATE INDEX idx_vessels_status ON vessels(status);
CREATE INDEX idx_vessels_current_port ON vessels(current_port_id);
CREATE INDEX idx_vessels_destination_port ON vessels(destination_port_id);
CREATE INDEX idx_vessels_last_position_update ON vessels(last_position_update DESC);

-- Geospatial index for position-based queries (e.g., "vessels near this port")
CREATE INDEX idx_vessels_position ON vessels USING BTREE(current_latitude, current_longitude);

-- Enable Row Level Security
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Vessels are viewable by all authenticated users
CREATE POLICY "Vessels are viewable by all authenticated users"
ON vessels FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Only staff can create/update vessels
CREATE POLICY "Staff can create vessels"
ON vessels FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

CREATE POLICY "Staff can update vessels"
ON vessels FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

-- Trigger to auto-update updated_at on vessels
CREATE TRIGGER update_vessels_updated_at
  BEFORE UPDATE ON vessels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create vessel_positions table (historical position tracking)
-- ============================================================================

CREATE TABLE vessel_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,

  -- Position data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed_knots DECIMAL(5, 2),
  course_over_ground DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  navigation_status INTEGER,

  -- Port proximity
  port_id UUID REFERENCES ports(id),
  distance_to_port_km DECIMAL(10, 2),

  -- AIS metadata
  timestamp TIMESTAMPTZ NOT NULL,
  data_source VARCHAR(50) DEFAULT 'aisstream',
  message_type VARCHAR(50),
  raw_ais_data JSONB,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for vessel_positions
CREATE INDEX idx_vessel_positions_vessel_id ON vessel_positions(vessel_id);
CREATE INDEX idx_vessel_positions_timestamp ON vessel_positions(timestamp DESC);
CREATE INDEX idx_vessel_positions_vessel_timestamp ON vessel_positions(vessel_id, timestamp DESC);

-- Composite index for position-based queries
CREATE INDEX idx_vessel_positions_location ON vessel_positions USING BTREE(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE vessel_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Position history viewable by all authenticated users
CREATE POLICY "Vessel positions are viewable by all authenticated users"
ON vessel_positions FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Only system can insert positions (via API)
CREATE POLICY "System can insert vessel positions"
ON vessel_positions FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- Create vessel_routes table (planned and actual routes)
-- ============================================================================

CREATE TABLE vessel_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,

  -- Route details
  route_name VARCHAR(255),
  origin_port_id UUID REFERENCES ports(id),
  destination_port_id UUID REFERENCES ports(id),

  -- Route type
  route_type VARCHAR(20) DEFAULT 'active' CHECK (route_type IN (
    'planned', 'active', 'completed', 'cancelled'
  )),

  -- Route geometry (array of coordinates)
  coordinates JSONB NOT NULL, -- [{lat, lng}, {lat, lng}, ...]
  total_distance_km DECIMAL(10, 2),

  -- Schedule
  departure_time TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,

  -- Waypoints and stops
  waypoints JSONB, -- [{name, lat, lng, eta, ata}, ...]
  intermediate_ports UUID[] DEFAULT ARRAY[]::UUID[],

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create indexes for vessel_routes
CREATE INDEX idx_vessel_routes_vessel_id ON vessel_routes(vessel_id);
CREATE INDEX idx_vessel_routes_origin_port ON vessel_routes(origin_port_id);
CREATE INDEX idx_vessel_routes_destination_port ON vessel_routes(destination_port_id);
CREATE INDEX idx_vessel_routes_type ON vessel_routes(route_type);
CREATE INDEX idx_vessel_routes_departure ON vessel_routes(departure_time);

-- Enable Row Level Security
ALTER TABLE vessel_routes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Routes viewable by all authenticated users
CREATE POLICY "Vessel routes are viewable by all authenticated users"
ON vessel_routes FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Staff can manage routes
CREATE POLICY "Staff can create vessel routes"
ON vessel_routes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

CREATE POLICY "Staff can update vessel routes"
ON vessel_routes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

-- Trigger to auto-update updated_at on vessel_routes
CREATE TRIGGER update_vessel_routes_updated_at
  BEFORE UPDATE ON vessel_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create container_vessels table (link containers to vessels)
-- ============================================================================

CREATE TABLE container_vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,

  -- Loading details
  loaded_at_port_id UUID REFERENCES ports(id),
  loaded_at TIMESTAMPTZ,
  loading_confirmed BOOLEAN DEFAULT FALSE,

  -- Unloading details
  unload_at_port_id UUID REFERENCES ports(id),
  estimated_unload_at TIMESTAMPTZ,
  actual_unload_at TIMESTAMPTZ,
  unloading_confirmed BOOLEAN DEFAULT FALSE,

  -- Status
  status VARCHAR(30) DEFAULT 'loaded' CHECK (status IN (
    'loaded', 'in_transit', 'arrived', 'unloaded'
  )),

  -- Container position on vessel
  bay_position VARCHAR(20),
  row_position VARCHAR(20),
  tier_position VARCHAR(20),

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),

  -- Ensure a container is only on one active vessel at a time
  UNIQUE(container_id, vessel_id, loaded_at)
);

-- Create indexes for container_vessels
CREATE INDEX idx_container_vessels_container_id ON container_vessels(container_id);
CREATE INDEX idx_container_vessels_vessel_id ON container_vessels(vessel_id);
CREATE INDEX idx_container_vessels_status ON container_vessels(status);
CREATE INDEX idx_container_vessels_loaded_at_port ON container_vessels(loaded_at_port_id);
CREATE INDEX idx_container_vessels_unload_at_port ON container_vessels(unload_at_port_id);

-- Enable Row Level Security
ALTER TABLE container_vessels ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view container-vessel links for their own containers
CREATE POLICY "Users can view own container-vessel links"
ON container_vessels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM containers
    WHERE containers.id = container_vessels.container_id
    AND containers.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

-- RLS Policy: Staff can create container-vessel links
CREATE POLICY "Staff can create container-vessel links"
ON container_vessels FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

-- RLS Policy: Staff can update container-vessel links
CREATE POLICY "Staff can update container-vessel links"
ON container_vessels FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'staff'
  )
);

-- Trigger to auto-update updated_at on container_vessels
CREATE TRIGGER update_container_vessels_updated_at
  BEFORE UPDATE ON container_vessels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Add vessel_id to containers table (for quick lookup)
-- ============================================================================

ALTER TABLE containers ADD COLUMN vessel_id UUID REFERENCES vessels(id);
CREATE INDEX idx_containers_vessel_id ON containers(vessel_id);

-- ============================================================================
-- ROLLBACK MIGRATION 5
-- ============================================================================
/*
-- Remove vessel_id column from containers
ALTER TABLE containers DROP COLUMN IF EXISTS vessel_id;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_container_vessels_updated_at ON container_vessels;
DROP TRIGGER IF EXISTS update_vessel_routes_updated_at ON vessel_routes;
DROP TRIGGER IF EXISTS update_vessels_updated_at ON vessels;

-- Drop all tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS container_vessels CASCADE;
DROP TABLE IF EXISTS vessel_routes CASCADE;
DROP TABLE IF EXISTS vessel_positions CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
*/

-- ============================================================================
-- MIGRATION 6: USER VESSELS TABLE (PHASE 7)
-- ============================================================================
-- Description: Track which vessels belong to which users
-- Dependencies: Requires Migration 1 (profiles) and Migration 5 (vessels)
-- Task Reference: Phase 7 - Vessel Monitoring
-- ============================================================================

-- Create user_vessels table
CREATE TABLE user_vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, vessel_id)
);

-- Create indexes for user_vessels
CREATE INDEX idx_user_vessels_user_id ON user_vessels(user_id);
CREATE INDEX idx_user_vessels_vessel_id ON user_vessels(vessel_id);

-- Enable Row Level Security
ALTER TABLE user_vessels ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own vessel associations
CREATE POLICY "Users can view their own vessels"
  ON user_vessels FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can add vessels to their account
CREATE POLICY "Users can add vessels to their account"
  ON user_vessels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can remove vessels from their account
CREATE POLICY "Users can remove vessels from their account"
  ON user_vessels FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Staff can view all vessel associations
CREATE POLICY "Staff can view all user vessels"
  ON user_vessels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'staff'
    )
  );

-- ============================================================================
-- ROLLBACK MIGRATION 6
-- ============================================================================
/*
-- Drop user_vessels table (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS user_vessels CASCADE;
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
-- Remove vessel_id column from containers (Migration 5)
ALTER TABLE containers DROP COLUMN IF EXISTS vessel_id;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_container_vessels_updated_at ON container_vessels;
DROP TRIGGER IF EXISTS update_vessel_routes_updated_at ON vessel_routes;
DROP TRIGGER IF EXISTS update_vessels_updated_at ON vessels;
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
-- Migration 6 tables
DROP TABLE IF EXISTS user_vessels CASCADE;
-- Migration 5 tables
DROP TABLE IF EXISTS container_vessels CASCADE;
DROP TABLE IF EXISTS vessel_routes CASCADE;
DROP TABLE IF EXISTS vessel_positions CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
-- Migration 1-4 tables
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
