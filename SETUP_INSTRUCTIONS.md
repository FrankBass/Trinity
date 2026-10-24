# Instructions de Configuration Supabase

## Problèmes Résolus

1. ✅ **Erreur d'import** : `Failed to resolve module specifier "./account-managers"` - CORRIGÉ
2. ✅ **Export manquant** : `getAllAccountManagers` ajouté dans `ams.ts`

---

## Actions à Faire de Votre Côté

### 1. Créer les Tables dans Supabase (OBLIGATOIRE)

Connectez-vous à votre projet Supabase et exécutez les scripts SQL dans l'ordre :

#### Étape 1 : Tables Principales
Copiez et exécutez le contenu de **`scripts/002_create_core_tables.sql`** dans l'éditeur SQL Supabase.

Ce script crée :
- `account_managers` (Account Managers)
- `clients` (Clients avec lien vers AM)
- `affiliates` (Affiliés)
- `campaigns` (Campagnes)
- `affiliate_plans` (Plans avec colonnes calculées automatiques)

#### Étape 2 : Vues SQL
Copiez et exécutez le contenu de **`scripts/003_create_views.sql`**

Ce script crée :
- `am_stats` (Vue avec statistiques par AM)
- `client_stats` (Vue avec statistiques par Client)
- `affiliate_stats` (Vue avec statistiques par Affilié)

Ces vues calculent automatiquement les montants Total et Validé.

#### Étape 3 : Données de Test
Copiez et exécutez le contenu de **`scripts/004_seed_data.sql`**

Ce script insère :
- 2 Account Managers (Julie Moreau, Marc Dubois)
- 2 Clients (Desigual, Petit Bateau)
- 4 Affiliés (Sarah Martin, Thomas Bernard, Emma Lefebvre, Lucas Petit)
- 36 Plans d'affiliation avec données réalistes

#### Étape 4 (OPTIONNEL) : Tables Additionnelles
Si vous voulez les fonctionnalités avancées (documents, contrats, etc.), exécutez **`scripts/011_create_additional_tables.sql`**

Ce script crée :
- `reports` (Rapports mensuels/trimestriels)
- `documents` (Documents liés aux plans)
- `contracts` (Contrats d'affiliation)
- `commissions` (Historique des commissions)
- `media_kits` (Media kits des affiliés)
- `email_templates` (Templates d'emails)

---

### 2. Vérifier que les Données Sont Chargées

Après avoir exécuté les scripts, vérifiez dans Supabase :

1. **Table `account_managers`** : Devrait contenir 2 lignes
2. **Table `clients`** : Devrait contenir 2 lignes
3. **Table `affiliates`** : Devrait contenir 4 lignes
4. **Table `affiliate_plans`** : Devrait contenir 36 lignes
5. **Vue `am_stats`** : Devrait afficher 2 lignes avec statistiques calculées

---

### 3. Tester l'Application

Une fois les scripts exécutés :

1. Rechargez l'application v0
2. Ouvrez la console (F12) pour voir les logs `[v0]`
3. Naviguez vers `/manager` pour voir le dashboard
4. Toutes les données devraient maintenant venir de Supabase

**Logs attendus dans la console :**
\`\`\`
[v0] Loading dashboard data from Supabase
[v0] Dashboard data loaded: {ams: 2, clients: 2, plans: 36, affiliates: 4}
\`\`\`

---

## Structure de la Base de Données

### Tables Principales

**account_managers**
- `id` (uuid, PK)
- `name` (text)
- `email` (text, unique)
- `phone` (text)
- `avatar` (text)
- `status` (text: active/inactive)

**clients**
- `id` (uuid, PK)
- `name` (text)
- `company_name` (text)
- `email` (text)
- `phone` (text)
- `account_manager_id` (uuid, FK → account_managers)
- `status` (text)

**affiliates**
- `id` (uuid, PK)
- `name` (text)
- `email` (text)
- `phone` (text)
- `instagram_handle` (text)
- `followers_count` (integer)
- `engagement_rate` (decimal)
- `category` (text)
- `status` (text)

**campaigns**
- `id` (uuid, PK)
- `name` (text)
- `client_id` (uuid, FK → clients)
- `start_date` (date)
- `end_date` (date)
- `budget` (decimal)
- `status` (text)

**affiliate_plans**
- `id` (uuid, PK)
- `affiliate_id` (uuid, FK → affiliates)
- `client_id` (uuid, FK → clients)
- `campaign_id` (uuid, FK → campaigns)
- `month` (text)
- `status` (text: pending/approved/rejected/counter_proposal_sent)
- `nb_posts_total`, `nb_posts_validated` (integer)
- `nb_stories_total`, `nb_stories_validated` (integer)
- `nb_reels_total`, `nb_reels_validated` (integer)
- `prix_par_publication` (decimal)
- **Colonnes calculées automatiquement** :
  - `gains_affilie_total` = (posts + stories + reels) × prix
  - `gains_affilie_validated` = (posts_val + stories_val + reels_val) × prix
  - `notre_marge_total` = gains_affilie_total × hdr_percentage
  - `notre_marge_validated` = gains_affilie_validated × hdr_percentage
  - `depense_client_total` = gains_affilie_total + notre_marge_total
  - `depense_client_validated` = gains_affilie_validated + notre_marge_validated

### Vues SQL (Calculs Automatiques)

**am_stats** : Statistiques par Account Manager
- `am_id`, `am_name`, `am_email`
- `total_clients`, `total_affiliates`, `total_plans`, `validated_plans`
- `total_gains_affilie`, `validated_gains_affilie`
- `total_notre_marge`, `validated_notre_marge`
- `total_depense_client`, `validated_depense_client`
- `avg_hdr_pct`

**client_stats** : Statistiques par Client
- Mêmes colonnes mais agrégées par client

**affiliate_stats** : Statistiques par Affilié
- Mêmes colonnes mais agrégées par affilié

---

## Ordre d'Exécution des Scripts

\`\`\`bash
1. scripts/002_create_core_tables.sql    # Tables principales
2. scripts/003_create_views.sql          # Vues avec calculs
3. scripts/004_seed_data.sql             # Données de test
4. scripts/011_create_additional_tables.sql  # (Optionnel) Tables avancées
\`\`\`

---

## Debugging

Si vous rencontrez des erreurs :

1. **Erreur "relation already exists"** : La table existe déjà, vous pouvez ignorer ou supprimer la table d'abord
2. **Erreur de clé étrangère** : Vérifiez que les tables parents existent avant les tables enfants
3. **Aucune donnée affichée** : Vérifiez les logs console (F12) pour voir les erreurs Supabase

**Variables d'environnement requises :**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (pour les server actions)

Ces variables sont déjà configurées dans votre projet v0.

---

## Prochaines Étapes

Une fois les tables créées et les données chargées :

1. ✅ Vérifier que toutes les pages chargent correctement
2. 🔜 Implémenter les formulaires de création (Nouveau Client, Nouveau Plan, etc.)
3. 🔜 Ajouter les actions d'approbation/rejet de plans
4. 🔜 Implémenter les filtres par période et statut
5. 🔜 Ajouter l'authentification (après que tout fonctionne)

---

## Support

Si vous avez des questions ou des erreurs :
1. Envoyez-moi les logs de la console (F12)
2. Dites-moi quelle étape pose problème
3. Incluez les messages d'erreur de Supabase si applicable
