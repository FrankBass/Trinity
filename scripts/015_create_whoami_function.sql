-- Script pour créer la fonction whoami() qui affiche l'utilisateur, le rôle et l'email
-- Cette fonction aide à déboguer les problèmes de permissions RLS

-- Créer ou remplacer la fonction whoami
CREATE OR REPLACE FUNCTION public.whoami()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'user', auth.uid(),
    'role', current_role,
    'email', (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$;

-- Donner les permissions d'exécution à tous
GRANT EXECUTE ON FUNCTION public.whoami() TO anon;
GRANT EXECUTE ON FUNCTION public.whoami() TO authenticated;

-- Vérifier que la fonction existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'whoami';
