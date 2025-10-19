# Trinity Front - SaaS Affiliate Management Platform

Une plateforme complète de gestion d'affiliation multi-rôles construite avec Next.js 14, TypeScript, Tailwind CSS et Supabase.

## 🎯 Fonctionnalités

### 7 Portails Utilisateurs

1. **Affilié** - Gestion des campagnes, statistiques, paiements
2. **Client** - Gestion des affiliés, validation des campagnes, rapports
3. **Account Manager (AM)** - Gestion des clients, tableau Kanban des plans, grilles de commissions
4. **Manager** - Supervision des AMs, performance d'équipe, alertes
5. **Pole Manager** - Vue d'ensemble multi-managers, objectifs du pôle
6. **Entity Admin** - Administration de la structure, logs d'audit, permissions
7. **Trinity Owner** - Vue globale multi-entités, mode impersonation

### Fonctionnalités Clés

- 🔐 Authentification Supabase avec gestion de session
- 🎨 Design system cohérent avec dark/light mode
- 📊 Tableaux de bord interactifs avec statistiques en temps réel
- 🎯 Tableau Kanban pour la gestion des plans
- 👥 Gestion hiérarchique des utilisateurs
- 📈 Rapports et exports de données
- 🔍 Logs d'audit complets
- 🎭 Mode impersonation pour les administrateurs
- 📱 Interface responsive et accessible

## 🚀 Installation

### Prérequis

- Node.js 18+
- Un compte Supabase

### Configuration

1. **Cloner le projet**
\`\`\`bash
git clone <repository-url>
cd trinity-front
npm install
\`\`\`

2. **Configuration Supabase**

Les variables d'environnement sont déjà configurées dans votre projet v0. Vous devez maintenant exécuter les scripts SQL pour créer les tables :

- Allez dans votre dashboard Supabase
- Ouvrez l'éditeur SQL
- Exécutez les scripts dans l'ordre :
  1. `scripts/01-setup-profiles.sql`
  2. `scripts/02-seed-test-users.sql`

3. **Lancer le projet**
\`\`\`bash
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000)

## 👤 Comptes de Test

Après avoir exécuté les scripts SQL, vous pouvez créer des utilisateurs de test via l'interface de login. Voici les rôles disponibles :

- `affiliate` - Affilié
- `client` - Client
- `am` - Account Manager
- `manager` - Manager
- `pole_manager` - Pole Manager
- `entity_admin` - Entity Admin
- `owner` - Trinity Owner

## 🏗️ Architecture

\`\`\`
trinity-front/
├── app/                      # Pages Next.js (App Router)
│   ├── affiliate/           # Portail Affilié
│   ├── client/              # Portail Client
│   ├── am/                  # Portail Account Manager
│   ├── manager/             # Portail Manager
│   ├── pole-manager/        # Portail Pole Manager
│   ├── entity-admin/        # Portail Entity Admin
│   ├── owner/               # Portail Trinity Owner
│   └── login/               # Page de connexion
├── components/
│   ├── layout/              # Composants de layout (sidebar, header)
│   ├── shared/              # Composants partagés
│   └── ui/                  # Composants UI (shadcn/ui)
├── lib/
│   ├── supabase/            # Configuration Supabase
│   ├── store/               # Zustand stores
│   ├── navigation/          # Configuration navigation
│   ├── constants/           # Constantes (rôles, etc.)
│   └── utils/               # Utilitaires (formatage, etc.)
└── scripts/                 # Scripts SQL pour Supabase
\`\`\`

## 🎨 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables Supabase
- Middleware de protection des routes
- Validation des permissions côté serveur
- Gestion sécurisée des sessions

## 📝 Développement

### Ajouter un nouveau rôle

1. Ajouter le rôle dans `lib/constants/roles.ts`
2. Créer le portail dans `app/[role]/`
3. Ajouter les routes de navigation dans `lib/navigation/nav-items.ts`
4. Mettre à jour le middleware si nécessaire

### Ajouter une nouvelle page

1. Créer le fichier dans le dossier du portail approprié
2. Utiliser `DashboardLayout` pour la cohérence
3. Ajouter la route dans la navigation si nécessaire

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de développement.

## 📄 Licence

Propriétaire - Trinity SaaS Platform
\`\`\`



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay13YWl0aW5nLXYxIiwiY3JlYXRlZEF0IjoxNzYwODEzNzQ1MzIzLCJmaW5pc2hlZEF0IjoxNzYwODEzNzQ1MzIzLCJpZCI6Ik04TllBdFZyQUxBYVBNMGUiLCJsYXN0UGFydFNlbnRBdCI6MTc2MDgxMzc0NTMyMywicGFydHMiOlt7InR5cGUiOiJ0b29sLWNhbGxzIn1dfQ==" />



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay1tYW5hZ2UtdG9kb3MtdjEiLCJpZCI6IjZlWmhYTXRTMjg0S3lxdXciLCJ0YXNrTmFtZUFjdGl2ZSI6IkNvbXBsZXRpbmcgdG9kbyBsaXN0IiwidG9vbENhbGxJZCI6InRvb2x1XzAxTWI3Z2NwSkFuWEcxQ3ZMZVJjekRNMyIsInRhc2tOYW1lQ29tcGxldGUiOiJDb21wbGV0ZWQgdG9kbyBsaXN0IiwiY3JlYXRlZEF0IjoxNzYwODEzNzQ2MzI3LCJmaW5pc2hlZEF0IjpudWxsLCJwYXJ0cyI6W10sImxhc3RQYXJ0U2VudEF0IjpudWxsfQ==" />
