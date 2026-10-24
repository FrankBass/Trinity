-- Script pour corriger la fonction whoami() et les permissions RLS
-- Le problème est que current_role retourne "postgres" au lieu du rôle JWT

-- Corriger la fonction whoami pour retourner le bon rôle
CREATE OR REPLACE FUNCTION public.whoami()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  jwt_role text;
BEGIN
  -- Essayer de récupérer le rôle du JWT
  BEGIN
    jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
  EXCEPTION
    WHEN OTHERS THEN
      jwt_role := 'anon';
  END;

  -- Si auth.uid() existe, c'est un utilisateur authentifié
  IF auth.uid() IS NOT NULL THEN
    jwt_role := 'authenticated';
  END IF;

  RETURN json_build_object(
    'user', auth.uid(),
    'role', jwt_role,
    'email', (SELECT email FROM auth.users WHERE id = auth.uid()),
    'connection_role', current_role
  );
END;
$$;

-- Révoquer toutes les permissions existantes sur les tables
REVOKE ALL ON plans FROM anon, authenticated, postgres;
REVOKE ALL ON plan_history FROM anon, authenticated, postgres;
REVOKE ALL ON plan_comments FROM anon, authenticated, postgres;

-- Donner toutes les permissions aux rôles anon, authenticated ET postgres
GRANT ALL ON plans TO anon, authenticated, postgres;
GRANT ALL ON plan_history TO anon, authenticated, postgres;
GRANT ALL ON plan_comments TO anon, authenticated, postgres;

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "allow_all_plans" ON plans;
DROP POLICY IF EXISTS "allow_all_plan_history" ON plan_history;
DROP POLICY IF EXISTS "allow_all_plan_comments" ON plan_comments;
DROP POLICY IF EXISTS "plans_select_policy" ON plans;
DROP POLICY IF EXISTS "plans_insert_policy" ON plans;
DROP POLICY IF EXISTS "plans_update_policy" ON plans;
DROP POLICY IF EXISTS "plan_history_select_policy" ON plan_history;
DROP POLICY IF EXISTS "plan_history_insert_policy" ON plan_history;
DROP POLICY IF EXISTS "plan_comments_select_policy" ON plan_comments;
DROP POLICY IF EXISTS "plan_comments_insert_policy" ON plan_comments;

-- Créer des policies permissives qui acceptent TOUS les rôles
CREATE POLICY "allow_all_on_plans"
  ON plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_on_plan_history"
  ON plan_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_on_plan_comments"
  ON plan_comments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Vérifier les permissions
SELECT 
  schemaname,
  tablename,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('plans', 'plan_history', 'plan_comments')
GROUP BY schemaname, tablename, grantee
ORDER BY tablename, grantee;

-- Vérifier les policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('plans', 'plan_history', 'plan_comments')
ORDER BY tablename, policyname;
