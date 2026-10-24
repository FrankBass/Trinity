-- Add updated_at trigger to all tables that don't have it yet

-- Affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Plans
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- AM Objectives
CREATE TRIGGER update_am_objectives_updated_at
  BEFORE UPDATE ON am_objectives
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- AM Delegations
CREATE TRIGGER update_am_delegations_updated_at
  BEFORE UPDATE ON am_delegations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add index for filtering plans by status and date
CREATE INDEX IF NOT EXISTS idx_plans_status_date ON plans(status, start_date);

-- Add other useful indexes
CREATE INDEX IF NOT EXISTS idx_plans_client_id ON plans(client_id);
CREATE INDEX IF NOT EXISTS idx_plans_affiliate_id ON plans(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_plans_account_manager_id ON plans(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager_id ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_account_manager_id ON affiliates(account_manager_id);
