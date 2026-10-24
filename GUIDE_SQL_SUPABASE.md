# Guide d'Installation Supabase - Copier/Coller dans l'éditeur SQL

## Instructions
1. Ouvrez l'éditeur SQL de Supabase
2. Copiez et collez chaque script ci-dessous UN PAR UN
3. Cliquez sur "Run" après chaque script

---

## Script 1 : Créer les tables principales

\`\`\`sql
-- Account Managers
CREATE TABLE IF NOT EXISTS account_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'transferred')),
  join_date TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('senior', 'junior', 'stagiaire')),
  monthly_objective DECIMAL(10,2),
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Affiliates
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  join_date TEXT NOT NULL,
  specialties TEXT[],
  commission_rate DECIMAL(5,2),
  performance_score DECIMAL(3,2),
  total_campaigns INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  join_date TEXT NOT NULL,
  account_manager_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  monthly_budget DECIMAL(10,2),
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  account_manager_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'counter_proposal_sent')),
  affiliate_gain DECIMAL(10,2) NOT NULL DEFAULT 0,
  hdr_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  hdr_amount DECIMAL(10,2) GENERATED ALWAYS AS (affiliate_gain * hdr_pct / 100) STORED,
  total_expense DECIMAL(10,2) GENERATED ALWAYS AS (affiliate_gain + (affiliate_gain * hdr_pct / 100)) STORED,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
\`\`\`

---

## Script 2 : Insérer les données de test

\`\`\`sql
-- Account Managers
INSERT INTO account_managers (id, name, email, phone, status, join_date, level, monthly_objective, location) VALUES
('f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'Sophie Martin', 'sophie.martin@company.com', '+33 6 12 34 56 78', 'active', '15/01/2023', 'senior', 50000, 'Paris, France'),
('d9d3c17d-6548-4203-923e-7cadfd63212c', 'Thomas Dubois', 'thomas.dubois@company.com', '+33 6 98 76 54 32', 'active', '01/03/2023', 'junior', 30000, 'Lyon, France');

-- Affiliates
INSERT INTO affiliates (id, name, company, email, phone, status, join_date, specialties, commission_rate, performance_score) VALUES
('a1b2c3d4-e5f6-4321-8765-123456789abc', 'Digital Partners', 'Digital Partners SAS', 'contact@digitalpartners.com', '+33 1 23 45 67 89', 'active', '01/01/2023', ARRAY['SEO', 'Social Media', 'Content Marketing'], 15.00, 4.8),
('b2c3d4e5-f6a7-4321-8765-123456789bcd', 'Influence Agency', 'Influence Agency SARL', 'hello@influenceagency.com', '+33 1 34 56 78 90', 'active', '15/02/2023', ARRAY['Influencer Marketing', 'Brand Partnerships'], 20.00, 4.6),
('c3d4e5f6-a7b8-4321-8765-123456789cde', 'Marketing Pro', 'Marketing Pro & Co', 'info@marketingpro.com', '+33 1 45 67 89 01', 'active', '01/03/2023', ARRAY['Email Marketing', 'PPC', 'Analytics'], 12.00, 4.9),
('d4e5f6a7-b8c9-4321-8765-123456789def', 'Growth Partners', 'Growth Partners Ltd', 'contact@growthpartners.com', '+33 1 56 78 90 12', 'active', '20/04/2023', ARRAY['Growth Hacking', 'Conversion Optimization'], 18.00, 4.7);

-- Clients
INSERT INTO clients (id, name, company, email, phone, industry, status, join_date, account_manager_id, monthly_budget) VALUES
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Desigual', 'Desigual Fashion', 'contact@desigual.com', '+33 1 23 45 67 89', 'Fashion', 'active', '10/01/2024', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 100000),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Miliboo', 'Miliboo Furniture', 'hello@miliboo.com', '+33 1 34 56 78 90', 'Furniture', 'active', '15/02/2024', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 75000);

-- Plans for Desigual (Client 1, AM Sophie Martin)
INSERT INTO plans (client_id, affiliate_id, account_manager_id, name, description, status, affiliate_gain, hdr_pct, start_date, end_date) VALUES
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'a1b2c3d4-e5f6-4321-8765-123456789abc', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'Campagne Printemps 2024', 'Campagne de lancement collection printemps', 'approved', 50000, 15, '01/03/2024', '31/05/2024'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'b2c3d4e5-f6a7-4321-8765-123456789bcd', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'Influenceurs Mode', 'Partenariats avec influenceurs mode', 'approved', 35000, 20, '01/04/2024', '30/06/2024'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'c3d4e5f6-a7b8-4321-8765-123456789cde', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'Email Marketing Q2', 'Campagne email pour soldes été', 'pending', 25000, 12, '01/06/2024', '31/08/2024'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'd4e5f6a7-b8c9-4321-8765-123456789def', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'Optimisation Conversion', 'Amélioration taux de conversion site', 'rejected', 40000, 18, '01/07/2024', '30/09/2024'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'a1b2c3d4-e5f6-4321-8765-123456789abc', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'SEO Automne 2024', 'Optimisation SEO pour collection automne', 'pending', 30000, 15, '01/09/2024', '30/11/2024'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'b2c3d4e5-f6a7-4321-8765-123456789bcd', 'f5ded198-1d1e-4ed8-a88c-2f09d106ad9e', 'Social Media Hiver', 'Campagne réseaux sociaux hiver', 'counter_proposal_sent', 45000, 20, '01/12/2024', '28/02/2025');

-- Plans for Miliboo (Client 2, AM Thomas Dubois)
INSERT INTO plans (client_id, affiliate_id, account_manager_id, name, description, status, affiliate_gain, hdr_pct, start_date, end_date) VALUES
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'a1b2c3d4-e5f6-4321-8765-123456789abc', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 'Lancement Nouveau Catalogue', 'Promotion nouveau catalogue printemps', 'approved', 28000, 15, '15/03/2024', '15/06/2024'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'c3d4e5f6-a7b8-4321-8765-123456789cde', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 'PPC Meubles Design', 'Campagne Google Ads meubles design', 'approved', 22000, 12, '01/04/2024', '30/06/2024'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'd4e5f6a7-b8c9-4321-8765-123456789def', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 'Growth Hacking Déco', 'Stratégie growth hacking décoration', 'pending', 35000, 18, '01/07/2024', '30/09/2024'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'a1b2c3d4-e5f6-4321-8765-123456789abc', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 'Content Marketing Q3', 'Création contenu blog et guides', 'pending', 18000, 15, '01/08/2024', '31/10/2024'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'b2c3d4e5-f6a7-4321-8765-123456789bcd', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 'Influenceurs Déco', 'Partenariats influenceurs décoration', 'rejected', 42000, 20, '01/09/2024', '30/11/2024'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'c3d4e5f6-a7b8-4321-8765-123456789cde', 'd9d3c17d-6548-4203-923e-7cadfd63212c', 'Email Promotions Hiver', 'Campagne email promotions hiver', 'approved', 16000, 12, '01/12/2024', '28/02/2025');
\`\`\`

---

## Script 3 : Vérifier l'installation

\`\`\`sql
SELECT 
  (SELECT COUNT(*) FROM account_managers) as ams,
  (SELECT COUNT(*) FROM affiliates) as affiliates,
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM plans) as plans;
\`\`\`

Vous devriez voir : 2 AMs, 4 affiliates, 2 clients, 12 plans

---

## Prochaine étape

Une fois les données insérées, rechargez votre application. Les pages devraient maintenant afficher les vraies données depuis Supabase au lieu de données hardcodées.
