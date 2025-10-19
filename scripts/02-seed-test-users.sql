-- Insert test users into user_profiles
-- Note: These users need to be created in Supabase Auth first
-- Password for all test users: password

-- This script assumes you've already created these users in Supabase Auth
-- You can create them via the Supabase dashboard or using the signup flow

-- Example profiles (update IDs with actual auth.users IDs after creating them)
INSERT INTO user_profiles (id, email, name, role, entity_id, avatar)
VALUES
  -- Replace these UUIDs with actual user IDs from auth.users after signup
  ('00000000-0000-0000-0000-000000000001', 'affiliate@trinity.com', 'Jean Dupont', 'affiliate', '10000000-0000-0000-0000-000000000001', '/affiliate-avatar.jpg'),
  ('00000000-0000-0000-0000-000000000002', 'client@trinity.com', 'Marie Martin', 'client', '10000000-0000-0000-0000-000000000001', '/professional-client-avatar.png'),
  ('00000000-0000-0000-0000-000000000003', 'am@trinity.com', 'Pierre Bernard', 'am', '10000000-0000-0000-0000-000000000001', '/am-avatar.jpg'),
  ('00000000-0000-0000-0000-000000000004', 'manager@trinity.com', 'Sophie Dubois', 'manager', '10000000-0000-0000-0000-000000000001', '/manager-avatar.png'),
  ('00000000-0000-0000-0000-000000000005', 'pole@trinity.com', 'Luc Thomas', 'pole_manager', '10000000-0000-0000-0000-000000000001', '/pole-manager-avatar.jpg'),
  ('00000000-0000-0000-0000-000000000006', 'admin@trinity.com', 'Claire Robert', 'admin', '10000000-0000-0000-0000-000000000001', '/admin-avatar.png'),
  ('00000000-0000-0000-0000-000000000007', 'owner@trinity.com', 'Alexandre Petit', 'owner', NULL, '/owner-avatar.jpg')
ON CONFLICT (id) DO NOTHING;
