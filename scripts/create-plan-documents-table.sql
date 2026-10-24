-- Create plan_documents table for file uploads
CREATE TABLE IF NOT EXISTS plan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('emplacements', 'ressources', 'other')),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_plan_documents_plan_id ON plan_documents(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_documents_category ON plan_documents(category);
