-- Script de correction finale des permissions RLS pour plans, plan_history et plan_comments
-- Ce script résout définitivement les erreurs "permission denied"

-- ============================================================
-- ÉTAPE 1 : Activer RLS sur toutes les tables
-- ============================================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 2 : Supprimer TOUTES les anciennes policies (nettoyage complet)
-- ============================================================

-- Nettoyage des policies de la table plans
DROP POLICY IF EXISTS "Enable read access for all users" ON plans;
DROP POLICY IF EXISTS "Enable insert access for all users" ON plans;
DROP POLICY IF EXISTS "Enable update access for all users" ON plans;
DROP POLICY IF EXISTS "Allow all authenticated to read plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to update plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated read plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated insert plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated update plans" ON plans;

-- Nettoyage des policies de la table plan_history
DROP POLICY IF EXISTS "Allow all authenticated to read plan history" ON plan_history;
DROP POLICY IF EXISTS "Allow all authenticated to insert history" ON plan_history;
DROP POLICY IF EXISTS "Allow authenticated read history" ON plan_history;
DROP POLICY IF EXISTS "Allow authenticated insert history" ON plan_history;

-- Nettoyage des policies de la table plan_comments
DROP POLICY IF EXISTS "Allow all authenticated to read plan comments" ON plan_comments;
DROP POLICY IF EXISTS "Allow all authenticated to insert comments" ON plan_comments;
DROP POLICY IF EXISTS "Allow all authenticated to update comments" ON plan_comments;
DROP POLICY IF EXISTS "Allow authenticated read comments" ON plan_comments;
DROP POLICY IF EXISTS "Allow authenticated insert comments" ON plan_comments;
DROP POLICY IF EXISTS "Allow authenticated update comments" ON plan_comments;

-- ============================================================
-- ÉTAPE 3 : Créer les nouvelles policies permissives et claires
-- ============================================================

-- Policies pour la table plans
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

-- Policies pour la table plan_history
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

-- Policies pour la table plan_comments
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

CREATE POLICY "plan_comments_update_policy"
  ON plan_comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ÉTAPE 4 : Vérification des permissions (tests)
-- ============================================================

-- Test de lecture
SELECT 'Test SELECT plans:' as test, COUNT(*) as count FROM plans;
SELECT 'Test SELECT plan_history:' as test, COUNT(*) as count FROM plan_history;
SELECT 'Test SELECT plan_comments:' as test, COUNT(*) as count FROM plan_comments;

-- ============================================================
-- ÉTAPE 5 : Afficher toutes les policies actives pour vérification
-- ============================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('plans', 'plan_history', 'plan_comments')
ORDER BY tablename, policyname;
