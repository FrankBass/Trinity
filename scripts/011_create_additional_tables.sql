-- Tables supplémentaires pour les fonctionnalités manager

-- Table pour les rapports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'quarterly', 'annual', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_by_am_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  data JSONB, -- Stockage flexible pour les données du rapport
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, doc, xlsx, etc.
  file_size INTEGER, -- en bytes
  category TEXT NOT NULL CHECK (category IN ('contract', 'invoice', 'report', 'presentation', 'other')),
  uploaded_by_am_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  related_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  related_plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les contrats
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('service', 'partnership', 'master', 'amendment')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'active', 'expired', 'terminated')),
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(12,2),
  file_url TEXT,
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  created_by_am_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les commissions
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  am_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'approved', 'paid')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les media kits
CREATE TABLE IF NOT EXISTS media_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  description TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  file_size INTEGER,
  downloads_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les templates d'emails
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('welcome', 'reminder', 'notification', 'report', 'custom')),
  variables JSONB, -- Variables disponibles dans le template
  created_by_am_id UUID REFERENCES account_managers(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour optimisation
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by_am_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by_am_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(related_client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_commissions_am ON commissions(am_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_media_kits_affiliate ON media_kits(affiliate_id);
