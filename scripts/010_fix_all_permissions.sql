-- ========================================
-- Script de correction complète pour Supabase
-- ========================================
-- Ce script corrige tous les problèmes identifiés:
-- 1. Crée les tables plan_history et plan_comments si elles n'existent pas
-- 2. Active les permissions UPDATE/INSERT sur la table plans
-- 3. Configure correctement toutes les policies RLS

-- ========================================
-- 1. CRÉER LES TABLES MANQUANTES
-- ========================================

-- Table plan_history
CREATE TABLE IF NOT EXISTS public.plan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('affiliate', 'client', 'manager', 'am', 'system')),
  actor_id UUID,
  actor_name TEXT NOT NULL,
  status TEXT NOT NULL,
  action TEXT NOT NULL,
  message TEXT NOT NULL,
  changes JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour plan_history
CREATE INDEX IF NOT EXISTS idx_plan_history_plan_id ON public.plan_history(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_history_created_at ON public.plan_history(created_at);
CREATE INDEX IF NOT EXISTS idx_plan_history_actor_id ON public.plan_history(actor_id);

-- Table plan_comments
CREATE TABLE IF NOT EXISTS public.plan_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  am_id UUID NOT NULL,
  am_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour plan_comments
CREATE INDEX IF NOT EXISTS idx_plan_comments_plan_id ON public.plan_comments(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_am_id ON public.plan_comments(am_id);
CREATE INDEX IF NOT EXISTS idx_plan_comments_created_at ON public.plan_comments(created_at);

-- ========================================
-- 2. ACTIVER RLS SUR LES NOUVELLES TABLES
-- ========================================

ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_comments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. SUPPRIMER LES ANCIENNES POLICIES
-- ========================================

-- Plans table
DROP POLICY IF EXISTS "Allow authenticated users to read plans" ON public.plans;
DROP POLICY IF EXISTS "Allow authenticated users to update plans" ON public.plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert plans" ON public.plans;

-- plan_history table
DROP POLICY IF EXISTS "Allow authenticated users to read plan history" ON public.plan_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert plan history" ON public.plan_history;

-- plan_comments table
DROP POLICY IF EXISTS "Allow AMs to read their plan comments" ON public.plan_comments;
DROP POLICY IF EXISTS "Allow AMs to insert plan comments" ON public.plan_comments;
DROP POLICY IF EXISTS "Allow AMs to update their own comments" ON public.plan_comments;

-- ========================================
-- 4. CRÉER LES NOUVELLES POLICIES PERMISSIVES
-- ========================================

-- Plans: SELECT pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read plans"
  ON public.plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Plans: UPDATE pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to update plans"
  ON public.plans
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Plans: INSERT pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to insert plans"
  ON public.plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- plan_history: SELECT pour tous
CREATE POLICY "Allow authenticated users to read plan history"
  ON public.plan_history
  FOR SELECT
  TO authenticated
  USING (true);

-- plan_history: INSERT pour tous
CREATE POLICY "Allow authenticated users to insert plan history"
  ON public.plan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- plan_comments: SELECT pour tous
CREATE POLICY "Allow authenticated users to read plan comments"
  ON public.plan_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- plan_comments: INSERT pour tous
CREATE POLICY "Allow authenticated users to insert plan comments"
  ON public.plan_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- plan_comments: UPDATE pour tous
CREATE POLICY "Allow authenticated users to update plan comments"
  ON public.plan_comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 5. VÉRIFIER QUE TOUT FONCTIONNE
-- ========================================

-- Test de lecture des tables
SELECT COUNT(*) as plan_history_count FROM public.plan_history;
SELECT COUNT(*) as plan_comments_count FROM public.plan_comments;
SELECT COUNT(*) as plans_count FROM public.plans;

-- Afficher les policies actives
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('plans', 'plan_history', 'plan_comments')
ORDER BY tablename, policyname;
