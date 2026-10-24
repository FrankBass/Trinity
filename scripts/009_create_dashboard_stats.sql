-- Create function for dashboard statistics
-- This provides a single call to get all dashboard stats

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  total_ams INTEGER,
  total_clients INTEGER,
  total_affiliates INTEGER,
  plans_total INTEGER,
  plans_validated INTEGER,
  plans_pending INTEGER,
  plans_rejected INTEGER,
  gains_affilie_total NUMERIC,
  gains_affilie_validated NUMERIC,
  notre_marge_total NUMERIC,
  notre_marge_validated NUMERIC,
  depense_client_total NUMERIC,
  depense_client_validated NUMERIC,
  commission_moyenne NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.account_managers WHERE status = 'active')::INTEGER as total_ams,
    (SELECT COUNT(*) FROM public.clients)::INTEGER as total_clients,
    (SELECT COUNT(*) FROM public.affiliates)::INTEGER as total_affiliates,
    (SELECT COUNT(*) FROM public.plans)::INTEGER as plans_total,
    (SELECT COUNT(*) FROM public.plans WHERE status = 'approved')::INTEGER as plans_validated,
    (SELECT COUNT(*) FROM public.plans WHERE status = 'pending')::INTEGER as plans_pending,
    (SELECT COUNT(*) FROM public.plans WHERE status = 'rejected')::INTEGER as plans_rejected,
    COALESCE((SELECT SUM(gains_affilie) FROM public.plans), 0) as gains_affilie_total,
    COALESCE((SELECT SUM(gains_affilie) FROM public.plans WHERE status = 'approved'), 0) as gains_affilie_validated,
    COALESCE((SELECT SUM(notre_marge) FROM public.plans), 0) as notre_marge_total,
    COALESCE((SELECT SUM(notre_marge) FROM public.plans WHERE status = 'approved'), 0) as notre_marge_validated,
    COALESCE((SELECT SUM(depense_client) FROM public.plans), 0) as depense_client_total,
    COALESCE((SELECT SUM(depense_client) FROM public.plans WHERE status = 'approved'), 0) as depense_client_validated,
    COALESCE((SELECT ROUND(AVG(hdr_pct), 2) FROM public.plans), 0) as commission_moyenne;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

COMMENT ON FUNCTION public.get_dashboard_stats IS 'Retourne toutes les statistiques du dashboard (total et validé)';
