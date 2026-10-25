# Instructions de configuration Supabase

## Ordre d'exécution des scripts SQL

Exécutez les scripts dans cet ordre dans l'éditeur SQL de Supabase :

### 1. Configuration initiale
\`\`\`sql
-- Exécuter scripts/000_create_exec_sql_function.sql
\`\`\`

### 2. Création des tables principales
\`\`\`sql
-- Exécuter dans l'ordre :
001_create_account_managers.sql
002_create_am_delegations.sql
003_create_am_objectives.sql
004_create_affiliates.sql
005_create_clients.sql
006_create_plans.sql
\`\`\`

### 3. Optimisations et calculs
\`\`\`sql
-- Exécuter dans l'ordre :
007_add_calculated_columns.sql
007_add_updated_at_triggers.sql
008_create_stats_views.sql
009_create_dashboard_stats.sql
\`\`\`

### 4. Tables supplémentaires
\`\`\`sql
-- Exécuter scripts/011_create_additional_tables.sql
\`\`\`

### 5. Seed des données de test
\`\`\`sql
-- Exécuter scripts/010_seed_all_data.sql
\`\`\`

## Vérification

Après l'exécution, vérifiez que les tables suivantes existent :

**Tables principales :**
- account_managers
- clients
- affiliates
- plans
- campaigns (créée automatiquement par le seed)

**Tables supplémentaires :**
- am_delegations
- am_objectives
- reports
- documents
- contracts
- commissions
- media_kits
- email_templates

**Vues (views) :**
- am_stats
- dashboard_stats

## Problèmes courants

### Erreur "relation already exists"
- Normal si vous réexécutez un script. Les scripts utilisent `IF NOT EXISTS` pour éviter les erreurs.

### Erreur "invalid input syntax for type uuid"
- Vérifiez que vous utilisez des UUID valides dans vos requêtes
- Les IDs dans les URLs doivent être des UUID, pas des noms

### Colonnes calculées ne se mettent pas à jour
- Vérifiez que les triggers sont bien créés avec `007_add_updated_at_triggers.sql`
- Les colonnes `gains_affilie_total`, `gains_affilie_valide`, etc. sont automatiques

## Logs de debug

Pour tracer l'origine des données dans l'application :
- Ouvrez la console du navigateur (F12)
- Cherchez les logs commençant par `[v0]`
- Exemple : `[v0] Loading account managers from Supabase...`

## Variables d'environnement requises

Vérifiez que ces variables sont configurées dans votre projet Vercel :

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_key (pour server actions)
