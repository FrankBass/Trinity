# Guide de Configuration Supabase - Étape par Étape

## Étape 1 : Exécuter les scripts SQL dans l'ordre

Copiez et collez ces scripts un par un dans l'éditeur SQL de Supabase :

### 1. Créer la fonction exec_sql (si elle n'existe pas déjà)
\`\`\`sql
-- Fichier : scripts/000_create_exec_sql_function.sql
\`\`\`

### 2. Créer la table account_managers
\`\`\`sql
-- Fichier : scripts/001_create_account_managers.sql
\`\`\`

### 3. Créer les autres tables principales
\`\`\`sql
-- Exécuter dans cet ordre :
-- scripts/002_create_am_delegations.sql
-- scripts/003_create_am_objectives.sql
-- scripts/004_create_affiliates.sql
-- scripts/005_create_clients.sql
-- scripts/006_create_plans.sql
\`\`\`

### 4. Ajouter les colonnes calculées
\`\`\`sql
-- Fichier : scripts/007_add_calculated_columns.sql
\`\`\`

### 5. Créer les vues et statistiques
\`\`\`sql
-- scripts/008_create_stats_views.sql
-- scripts/009_create_dashboard_stats.sql
\`\`\`

### 6. Insérer les données de test
\`\`\`sql
-- Fichier : scripts/010_seed_all_data.sql
-- Ce script contient 2 Account Managers, 4 Affiliés, 2 Clients et 12 Plans
\`\`\`

### 7. (Optionnel) Créer les tables additionnelles
\`\`\`sql
-- Fichier : scripts/011_create_additional_tables.sql
-- Tables pour : reports, documents, contracts, commissions, media_kits, email_templates
\`\`\`

## Étape 2 : Vérifier que les données sont insérées

Dans l'éditeur SQL de Supabase, exécutez :

\`\`\`sql
SELECT COUNT(*) as account_managers FROM account_managers;
SELECT COUNT(*) as affiliates FROM affiliates;
SELECT COUNT(*) as clients FROM clients;
SELECT COUNT(*) as plans FROM plans;
\`\`\`

Vous devriez voir :
- 2 account_managers
- 4 affiliates
- 2 clients
- 12 plans

## Étape 3 : Vérifier l'application

1. Rechargez votre application
2. Ouvrez la console du navigateur (F12)
3. Recherchez les logs commençant par `[v0]`
4. Vérifiez qu'il n'y a pas d'erreurs

## Résolution de problèmes

### Si vous voyez "An unsupported type was passed to use()"
- C'est un problème de code qui a été corrigé
- Rechargez l'application après le déploiement

### Si les données ne s'affichent pas
1. Vérifiez dans Supabase que les tables contiennent bien des données
2. Vérifiez les logs console pour voir d'où viennent les erreurs
3. Assurez-vous que vos variables d'environnement Supabase sont correctes

### Si vous avez des erreurs SQL
- Exécutez les scripts dans l'ordre indiqué
- Si une table existe déjà, supprimez-la d'abord : `DROP TABLE IF EXISTS nom_table CASCADE;`
