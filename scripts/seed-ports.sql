-- GTMS Ports Table Seeding Script
-- This script seeds the ports table with major international ports
-- Run this in Supabase SQL Editor

-- Insert major international ports
INSERT INTO ports (name, code, country_code, city, status) VALUES
  ('Port of Lagos (Apapa)', 'NGLOS', 'NGA', 'Lagos', 'active'),
  ('Port of Tema', 'GHTEM', 'GHA', 'Tema', 'active'),
  ('Port of Abidjan', 'CIABJ', 'CIV', 'Abidjan', 'active'),
  ('Port of Dakar', 'SNDKR', 'SEN', 'Dakar', 'active'),
  ('Port of Lomé', 'TGLFW', 'TGO', 'Lomé', 'active'),
  ('Port of Cotonou', 'BJCOO', 'BEN', 'Cotonou', 'active'),
  ('Port of Conakry', 'GNCKY', 'GIN', 'Conakry', 'active'),
  ('Port of Freetown', 'SLFNA', 'SLE', 'Freetown', 'active'),
  ('Port of Monrovia', 'LRMLW', 'LBR', 'Monrovia', 'active'),
  ('Port of Banjul', 'GMBJL', 'GMB', 'Banjul', 'active'),
  ('Port of Takoradi', 'GHTKD', 'GHA', 'Takoradi', 'active'),
  ('Port of San Pedro', 'CISPY', 'CIV', 'San Pedro', 'active'),
  ('Port of Calabar', 'NGCBQ', 'NGA', 'Calabar', 'active'),
  ('Port of Onne', 'NGONN', 'NGA', 'Onne', 'active'),
  ('Port of Nouakchott', 'MRNKC', 'MRT', 'Nouakchott', 'active'),
  ('Port of Bissau', 'GWBXO', 'GNB', 'Bissau', 'active'),
  ('Port of Lungi', 'SLLUN', 'SLE', 'Lungi', 'active'),
  ('Port of Owendo', 'GAOWE', 'GAB', 'Owendo', 'active'),
  ('Port of Libreville', 'GALBV', 'GAB', 'Libreville', 'active'),
  ('Port of Malabo', 'GQSSG', 'GNQ', 'Malabo', 'active')
ON CONFLICT (code) DO NOTHING;

-- Verify insertion
SELECT COUNT(*) as total_ports FROM ports WHERE status = 'active';

-- Display all ports
SELECT id, name, code, country_code, city, status
FROM ports
ORDER BY name;
