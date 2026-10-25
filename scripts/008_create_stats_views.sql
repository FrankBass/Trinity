-- Create views for aggregated statistics
-- These views calculate totals and validated amounts automatically

-- View for affiliate statistics
CREATE OR REPLACE VIEW public.affiliate_stats AS
SELECT 
  a.id as affiliate_id,
  a.name as affiliate_name,
  COUNT(p.id) as plans_total,
  COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as plans_validated,
  COALESCE(SUM(p.gains_affilie), 0) as gains_affilie_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.gains_affilie ELSE 0 END), 0) as gains_affilie_validated,
  COALESCE(SUM(p.notre_marge), 0) as notre_marge_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.notre_marge ELSE 0 END), 0) as notre_marge_validated,
  COALESCE(SUM(p.depense_client), 0) as depense_client_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.depense_client ELSE 0 END), 0) as depense_client_validated,
  ROUND(AVG(p.hdr_pct), 2) as commission_moyenne
FROM public.affiliates a
LEFT JOIN public.plans p ON a.id = p.affiliate_id
GROUP BY a.id, a.name;

-- View for client statistics
CREATE OR REPLACE VIEW public.client_stats AS
SELECT 
  c.id as client_id,
  c.name as client_name,
  COUNT(p.id) as plans_total,
  COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as plans_validated,
  COALESCE(SUM(p.gains_affilie), 0) as gains_affilie_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.gains_affilie ELSE 0 END), 0) as gains_affilie_validated,
  COALESCE(SUM(p.notre_marge), 0) as notre_marge_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.notre_marge ELSE 0 END), 0) as notre_marge_validated,
  COALESCE(SUM(p.depense_client), 0) as depense_client_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.depense_client ELSE 0 END), 0) as depense_client_validated,
  ROUND(AVG(p.hdr_pct), 2) as commission_moyenne
FROM public.clients c
LEFT JOIN public.plans p ON c.id = p.client_id
GROUP BY c.id, c.name;

-- View for account manager statistics
CREATE OR REPLACE VIEW public.am_stats AS
SELECT 
  am.id as am_id,
  am.name as am_name,
  COUNT(DISTINCT c.id) as clients_total,
  COUNT(p.id) as plans_total,
  COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as plans_validated,
  COUNT(DISTINCT p.affiliate_id) as affiliates_count,
  COALESCE(SUM(p.gains_affilie), 0) as gains_affilie_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.gains_affilie ELSE 0 END), 0) as gains_affilie_validated,
  COALESCE(SUM(p.notre_marge), 0) as notre_marge_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.notre_marge ELSE 0 END), 0) as notre_marge_validated,
  COALESCE(SUM(p.depense_client), 0) as depense_client_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.depense_client ELSE 0 END), 0) as depense_client_validated,
  ROUND(AVG(p.hdr_pct), 2) as commission_moyenne,
  am.monthly_objective,
  CASE 
    WHEN am.monthly_objective > 0 THEN ROUND((COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.notre_marge ELSE 0 END), 0) / am.monthly_objective * 100), 2)
    ELSE 0 
  END as performance_pct
FROM public.account_managers am
LEFT JOIN public.clients c ON am.id = c.account_manager_id
LEFT JOIN public.plans p ON c.id = p.client_id
GROUP BY am.id, am.name, am.monthly_objective;

-- View for campaign statistics
CREATE OR REPLACE VIEW public.campaign_stats AS
SELECT 
  p.campaign_name,
  p.client_id,
  c.name as client_name,
  MIN(p.start_date) as start_date,
  MAX(p.end_date) as end_date,
  COUNT(p.id) as plans_total,
  COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as plans_validated,
  COUNT(DISTINCT p.affiliate_id) as affiliates_count,
  COALESCE(SUM(p.gains_affilie), 0) as gains_affilie_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.gains_affilie ELSE 0 END), 0) as gains_affilie_validated,
  COALESCE(SUM(p.notre_marge), 0) as notre_marge_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.notre_marge ELSE 0 END), 0) as notre_marge_validated,
  COALESCE(SUM(p.depense_client), 0) as depense_client_total,
  COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.depense_client ELSE 0 END), 0) as depense_client_validated,
  ROUND(AVG(p.hdr_pct), 2) as commission_moyenne,
  CASE 
    WHEN CURRENT_DATE < MIN(p.start_date) THEN 'Planifiée'
    WHEN CURRENT_DATE > MAX(p.end_date) THEN 'Terminée'
    ELSE 'Active'
  END as status
FROM public.plans p
JOIN public.clients c ON p.client_id = c.id
GROUP BY p.campaign_name, p.client_id, c.name;

-- Grant permissions to authenticated users
GRANT SELECT ON public.affiliate_stats TO authenticated;
GRANT SELECT ON public.client_stats TO authenticated;
GRANT SELECT ON public.am_stats TO authenticated;
GRANT SELECT ON public.campaign_stats TO authenticated;

-- Add comments to views
COMMENT ON VIEW public.affiliate_stats IS 'Statistiques agrégées par affilié (total et validé)';
COMMENT ON VIEW public.client_stats IS 'Statistiques agrégées par client (total et validé)';
COMMENT ON VIEW public.am_stats IS 'Statistiques agrégées par account manager (total et validé)';
COMMENT ON VIEW public.campaign_stats IS 'Statistiques agrégées par campagne (total et validé)';
