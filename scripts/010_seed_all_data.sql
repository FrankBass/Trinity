-- ============================================
-- SEED DATA FOR TRINITY AFFILIATION PLATFORM
-- ============================================
-- This script will populate all tables with sample data
-- Run this after creating all tables and views

-- ============================================
-- 1. ACCOUNT MANAGERS
-- ============================================
INSERT INTO account_managers (name, email, phone, status, join_date, level, monthly_objective, location) VALUES
('Sophie Martin', 'sophie.martin@company.com', '+33 6 12 34 56 78', 'active', '2023-01-15', 'senior', 50000, 'Paris, France'),
('Thomas Dubois', 'thomas.dubois@company.com', '+33 6 98 76 54 32', 'active', '2023-03-20', 'junior', 30000, 'Lyon, France')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. AFFILIATES
-- ============================================
INSERT INTO affiliates (name, email, phone, company, status, join_date, account_manager_id) VALUES
('iGraal', 'contact@igraal.com', '+33 1 23 45 67 89', 'iGraal SAS', 'active', '2024-01-10', 
  (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1)),
('Poulpeo', 'hello@poulpeo.com', '+33 1 34 56 78 90', 'Poulpeo SARL', 'active', '2024-02-15',
  (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1)),
('Dealabs', 'contact@dealabs.com', '+33 1 45 67 89 01', 'Dealabs SAS', 'active', '2024-03-20',
  (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1)),
('Ma Réduction', 'info@mareduction.com', '+33 1 56 78 90 12', 'Ma Réduction SARL', 'active', '2024-04-05',
  (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1))
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. CLIENTS
-- ============================================
INSERT INTO clients (name, email, phone, company, industry, status, join_date, account_manager_id) VALUES
('Desigual', 'contact@desigual.fr', '+33 1 11 22 33 44', 'Desigual France SAS', 'Mode & Textile', 'active', '2025-01-05',
  (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1)),
('Miliboo', 'contact@miliboo.com', '+33 1 22 33 44 55', 'Miliboo SARL', 'Ameublement', 'active', '2025-01-12',
  (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1))
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. PLANS (12 plans avec campagnes intégrées)
-- ============================================

-- Desigual - Black Friday
INSERT INTO plans (
  affiliate_id, client_id, account_manager_id,
  campaign_name, start_date, end_date,
  fixed_fee, hdr_pct, placement_text,
  status, submitted_date, validated_date
) VALUES
-- Plan 1: iGraal - Black Friday Desigual (Approved)
((SELECT id FROM affiliates WHERE name = 'iGraal' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Desigual' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1),
 'Black Friday', '2025-11-01', '2025-11-30',
 3500, 15, 'Bannière homepage + Newsletter Black Friday',
 'approved', '2025-10-20', '2025-10-22'),

-- Plan 2: Poulpeo - Black Friday Desigual (Pending)
((SELECT id FROM affiliates WHERE name = 'Poulpeo' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Desigual' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1),
 'Black Friday', '2025-11-01', '2025-11-30',
 3000, 15, 'Email blast + Push notification Black Friday',
 'pending', '2025-10-23', NULL);

-- Desigual - Soldes d'hiver
INSERT INTO plans (
  affiliate_id, client_id, account_manager_id,
  campaign_name, start_date, end_date,
  fixed_fee, hdr_pct, placement_text,
  status, submitted_date, validated_date
) VALUES
-- Plan 3: iGraal - Soldes hiver Desigual (Approved)
((SELECT id FROM affiliates WHERE name = 'iGraal' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Desigual' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1),
 'Soldes d''hiver', '2026-01-08', '2026-02-04',
 3200, 15, 'Bannière homepage + Newsletter Soldes hiver',
 'approved', '2025-12-15', '2025-12-17'),

-- Plan 4: Poulpeo - Soldes hiver Desigual (Pending)
((SELECT id FROM affiliates WHERE name = 'Poulpeo' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Desigual' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1),
 'Soldes d''hiver', '2026-01-08', '2026-02-04',
 2800, 15, 'Email blast Soldes hiver',
 'pending', '2025-12-16', NULL);

-- Desigual - Soldes d'été (COMPLETED)
INSERT INTO plans (
  affiliate_id, client_id, account_manager_id,
  campaign_name, start_date, end_date,
  fixed_fee, hdr_pct, placement_text,
  status, submitted_date, validated_date, reattributed_date
) VALUES
-- Plan 5: iGraal - Soldes été Desigual (Approved + Reattributed)
((SELECT id FROM affiliates WHERE name = 'iGraal' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Desigual' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1),
 'Soldes d''été', '2025-06-25', '2025-07-29',
 3000, 15, 'Bannière homepage + Newsletter Soldes été',
 'approved', '2025-06-10', '2025-06-12', '2025-08-05'),

-- Plan 6: Poulpeo - Soldes été Desigual (Approved + Reattributed)
((SELECT id FROM affiliates WHERE name = 'Poulpeo' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Desigual' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Sophie Martin' LIMIT 1),
 'Soldes d''été', '2025-06-25', '2025-07-29',
 2600, 15, 'Email blast Soldes été',
 'approved', '2025-06-11', '2025-06-13', '2025-08-06');

-- Miliboo - Black Friday
INSERT INTO plans (
  affiliate_id, client_id, account_manager_id,
  campaign_name, start_date, end_date,
  fixed_fee, hdr_pct, placement_text,
  status, submitted_date, validated_date
) VALUES
-- Plan 7: Dealabs - Black Friday Miliboo (Approved)
((SELECT id FROM affiliates WHERE name = 'Dealabs' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Miliboo' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1),
 'Black Friday', '2025-11-01', '2025-11-30',
 2800, 18, 'Article sponsorisé + Bannière Black Friday',
 'approved', '2025-10-18', '2025-10-20'),

-- Plan 8: Ma Réduction - Black Friday Miliboo (Pending)
((SELECT id FROM affiliates WHERE name = 'Ma Réduction' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Miliboo' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1),
 'Black Friday', '2025-11-01', '2025-11-30',
 2400, 18, 'Newsletter + Push notification Black Friday',
 'pending', '2025-10-21', NULL);

-- Miliboo - Soldes d'hiver
INSERT INTO plans (
  affiliate_id, client_id, account_manager_id,
  campaign_name, start_date, end_date,
  fixed_fee, hdr_pct, placement_text,
  status, submitted_date, validated_date
) VALUES
-- Plan 9: Dealabs - Soldes hiver Miliboo (Approved)
((SELECT id FROM affiliates WHERE name = 'Dealabs' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Miliboo' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1),
 'Soldes d''hiver', '2026-01-08', '2026-02-04',
 2600, 18, 'Article sponsorisé + Bannière Soldes hiver',
 'approved', '2025-12-12', '2025-12-14'),

-- Plan 10: Ma Réduction - Soldes hiver Miliboo (Pending)
((SELECT id FROM affiliates WHERE name = 'Ma Réduction' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Miliboo' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1),
 'Soldes d''hiver', '2026-01-08', '2026-02-04',
 2200, 18, 'Newsletter Soldes hiver',
 'pending', '2025-12-13', NULL);

-- Miliboo - Soldes d'été (COMPLETED)
INSERT INTO plans (
  affiliate_id, client_id, account_manager_id,
  campaign_name, start_date, end_date,
  fixed_fee, hdr_pct, placement_text,
  status, submitted_date, validated_date, reattributed_date
) VALUES
-- Plan 11: Dealabs - Soldes été Miliboo (Approved + Reattributed)
((SELECT id FROM affiliates WHERE name = 'Dealabs' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Miliboo' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1),
 'Soldes d''été', '2025-06-25', '2025-07-29',
 2400, 18, 'Article sponsorisé + Bannière Soldes été',
 'approved', '2025-06-08', '2025-06-10', '2025-08-03'),

-- Plan 12: Ma Réduction - Soldes été Miliboo (Approved + Reattributed)
((SELECT id FROM affiliates WHERE name = 'Ma Réduction' LIMIT 1),
 (SELECT id FROM clients WHERE name = 'Miliboo' LIMIT 1),
 (SELECT id FROM account_managers WHERE name = 'Thomas Dubois' LIMIT 1),
 'Soldes d''été', '2025-06-25', '2025-07-29',
 2000, 18, 'Newsletter Soldes été',
 'approved', '2025-06-09', '2025-06-11', '2025-08-04');

-- ============================================
-- VERIFICATION
-- ============================================
-- Check data counts
SELECT 'Account Managers' as table_name, COUNT(*) as count FROM account_managers
UNION ALL
SELECT 'Affiliates', COUNT(*) FROM affiliates
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Plans', COUNT(*) FROM plans;

-- Check generated columns are working
SELECT 
  p.id,
  p.campaign_name,
  a.name as affiliate_name,
  c.name as client_name,
  p.fixed_fee as "Gains Affilié",
  p.gains_affilie as "Gains (Calculated)",
  p.notre_marge as "Notre Marge",
  p.depense_client as "Dépense Client",
  p.status
FROM plans p
JOIN affiliates a ON p.affiliate_id = a.id
JOIN clients c ON p.client_id = c.id
LIMIT 5;
