-- Script pour ajouter les permissions RLS pour le rôle 'anon' en plus de 'authenticated'
-- Ce script résout les erreurs "permission denied for table plans/plan_comments"

-- Activer RLS sur toutes les tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_comments ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies pour éviter les conflits
DROP POLICY IF EXISTS "plans_select_policy" ON plans;
DROP POLICY IF EXISTS "plans_insert_policy" ON plans;
DROP POLICY IF EXISTS "plans_update_policy" ON plans;
DROP POLICY IF EXISTS "plans_select_policy_for_anon" ON plans;
DROP POLICY IF EXISTS "plans_insert_policy_for_anon" ON plans;
DROP POLICY IF EXISTS "plans_update_policy_for_anon" ON plans;

DROP POLICY IF EXISTS "plan_history_select_policy" ON plan_history;
DROP POLICY IF EXISTS "plan_history_insert_policy" ON plan_history;
DROP POLICY IF EXISTS "plan_history_select_policy_for_anon" ON plan_history;
DROP POLICY IF EXISTS "plan_history_insert_policy_for_anon" ON plan_history;

DROP POLICY IF EXISTS "plan_comments_select_policy" ON plan_comments;
DROP POLICY IF EXISTS "plan_comments_insert_policy" ON plan_comments;
DROP POLICY IF EXISTS "plan_comments_select_policy_for_anon" ON plan_comments;
DROP POLICY IF EXISTS "plan_comments_insert_policy_for_anon" ON plan_comments;

-- =============================================================================
-- POLICIES POUR LA TABLE 'plans'
-- =============================================================================

-- Pour le rôle 'authenticated'
CREATE POLICY "plans_select_policy"
  ON plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "plans_insert_policy"
  ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "plans_update_policy"
  ON plans
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pour le rôle 'anon' (ajouté pour résoudre les permissions denied)
CREATE POLICY "plans_select_policy_for_anon"
  ON plans
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "plans_insert_policy_for_anon"
  ON plans
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "plans_update_policy_for_anon"
  ON plans
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- POLICIES POUR LA TABLE 'plan_history'
-- =============================================================================

-- Pour le rôle 'authenticated'
CREATE POLICY "plan_history_select_policy"
  ON plan_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "plan_history_insert_policy"
  ON plan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Pour le rôle 'anon'
CREATE POLICY "plan_history_select_policy_for_anon"
  ON plan_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "plan_history_insert_policy_for_anon"
  ON plan_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================================================
-- POLICIES POUR LA TABLE 'plan_comments'
-- =============================================================================

-- Pour le rôle 'authenticated'
CREATE POLICY "plan_comments_select_policy"
  ON plan_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "plan_comments_insert_policy"
  ON plan_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Pour le rôle 'anon'
CREATE POLICY "plan_comments_select_policy_for_anon"
  ON plan_comments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "plan_comments_insert_policy_for_anon"
  ON plan_comments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================================================
-- VÉRIFICATIONS
-- =============================================================================

-- Afficher toutes les policies créées
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('plans', 'plan_history', 'plan_comments')
ORDER BY tablename, policyname;

-- Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('plans', 'plan_history', 'plan_comments');

-- Vérifier le rôle actuel (depuis le client de l'app)
-- À exécuter depuis votre composant React pour voir le rôle:
-- SELECT current_user, current_role;
