-- Creation of client_messages and affiliate_messages tables for Bug 1
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_messages_plan ON client_messages(plan_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_messages_plan ON affiliate_messages(plan_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_messages_created ON affiliate_messages(created_at DESC);

-- Drop existing policies if they exist to recreate them correctly
DROP POLICY IF EXISTS "Allow authenticated to read client_messages" ON client_messages;
DROP POLICY IF EXISTS "Allow authenticated to insert client_messages" ON client_messages;
DROP POLICY IF EXISTS "Allow authenticated to read affiliate_messages" ON affiliate_messages;
DROP POLICY IF EXISTS "Allow authenticated to insert affiliate_messages" ON affiliate_messages;

-- Enable RLS
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_messages ENABLE ROW LEVEL SECURITY;

-- More permissive policies for authenticated users
-- Allow all authenticated users to read all messages (they can filter by plan_id in the query)
CREATE POLICY "Allow authenticated users to read client messages" 
  ON client_messages
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert client messages" 
  ON client_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Same policies for affiliate_messages
CREATE POLICY "Allow authenticated users to read affiliate messages" 
  ON affiliate_messages
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert affiliate messages" 
  ON affiliate_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
