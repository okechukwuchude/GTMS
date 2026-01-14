-- Migration: Add vessel name and MMSI fields to containers table
-- This allows linking containers to vessels

BEGIN;

ALTER TABLE containers
  ADD COLUMN vessel_name VARCHAR(255),
  ADD COLUMN vessel_mmsi VARCHAR(20);

-- Add index for MMSI lookups
CREATE INDEX idx_containers_vessel_mmsi ON containers(vessel_mmsi);

COMMIT;
