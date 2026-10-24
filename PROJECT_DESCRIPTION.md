# Trinity Front — Description détaillée du projet

## 1. Vue d'ensemble

Trinity Front est une application SaaS de gestion d'affiliation. Elle met en relation des affiliés, des clients/annonceurs et des équipes internes Trinity afin de gérer les campagnes, les plans commerciaux, les commissions, les documents, les rapports et le suivi de performance.

L'application est conçue comme une plateforme multi-rôles : chaque rôle dispose de son propre portail, de sa navigation et de ses actions métier. Le périmètre d'accès est contrôlé par l'authentification Supabase, le middleware Next.js, les règles RLS Supabase et les contrôles effectués dans les pages/actions.

> Ce document décrit l'état actuel du code présent dans le projet. Il signale aussi les subtilités et les écarts à connaître avant toute évolution.

---

## 2. Stack technique

- **Framework** : Next.js 16.2 avec App Router.
- **Langage** : TypeScript.
- **Runtime UI** : React 19.
- **Style** : Tailwind CSS 4 et `tw-animate-css`.
- **Composants** : shadcn/ui, Radix UI et Base UI.
- **Icônes** : Lucide React.
- **Animations** : Framer Motion.
- **Authentification et base de données** : Supabase Auth, Supabase PostgreSQL et `@supabase/ssr`.
- **État client** : Zustand, avec plusieurs stores métier.
- **Validation/formulaires** : React Hook Form et Zod.
- **Graphiques** : Recharts.
- **Fichiers** : Vercel Blob et routes API dédiées aux documents.
- **Analytics** : Vercel Analytics.
- **Dates** : date-fns et React Day Picker.
- **Exports** : XLSX.
- **Package manager** : pnpm 12.3.4.

Les scripts principaux sont :

```bash
pnpm dev       # développement local
pnpm build     # build de production
pnpm start     # démarrage après build
pnpm lint      # lint ESLint
```

---

## 3. Organisation du code

```text
app/                         Routes App Router et pages par portail
components/
  layout/                    Layout principal, header et sidebar
  layouts/                   Variantes de layouts
  shared/                    Composants partagés métier
  messaging/                Messagerie et discussions de plans
  notifications/            Centre de notifications
  audit/                    Timeline d'activité/audit
  manager/                  Upload et liste de documents
  ui/                       Primitives shadcn/Radix
lib/
  supabase/                 Clients, middleware, queries et server actions
  data/                     Stores et données métier côté application
  store/                    Stores Zustand et utilisateur courant
  navigation/               Configuration des menus par rôle
  constants/                Rôles et constantes métier
  utils/                    Formatage et helpers
scripts/                    SQL de création, évolution, RLS et seed
public/                     Avatars et assets statiques
middleware.ts               Protection et rafraîchissement des sessions
next.config.mjs             Configuration Next.js
```

Le projet utilise principalement des Server Components pour les pages et des Client Components uniquement lorsque l'interaction, l'état local ou les hooks navigateur sont nécessaires.

---

## 4. Rôles et portails

Les rôles canoniques déclarés dans `lib/constants/roles.ts` sont :

| Valeur technique | Libellé | Responsabilité principale |
|---|---|---|
| `affiliate` | Affilié | Consulter ses enseignes, campagnes, historiques et notifications. |
| `client` | Client | Gérer ses campagnes, affiliés et rapports. |
| `am` | Account Manager | Piloter les clients, affiliés, plans et performances de son portefeuille. |
| `manager` | Manager | Superviser les AM, clients, affiliés, campagnes, plans, commissions et support. |
| `pole_manager` | Pole Manager | Superviser un périmètre de managers et consolider la performance d'un pôle. |
| `entity_admin` | Admin Entité | Administrer les utilisateurs, managers, pôles, configuration et rapports. |
| `owner` | Trinity Owner | Vision globale multi-entités, administration système et sécurité. |

La hiérarchie numérique actuelle est :

```text
affiliate < client < am < manager < pole_manager < entity_admin < owner
```

La fonction `hasPermission` compare les niveaux numériques. C'est pratique pour un modèle hiérarchique simple, mais cela signifie qu'un rôle supérieur est considéré comme ayant les permissions d'un rôle inférieur. Pour une application multi-entités, cette vérification doit toujours être complétée par un contrôle de périmètre : entité, pôle, manager, client ou portefeuille concerné.

### Ce que chaque rôle doit afficher et masquer

Le rôle ne sert pas seulement à choisir une route. Il détermine aussi le contenu visible, les actions disponibles, les données retournées et les boutons affichés. Un élément masqué dans la sidebar doit également être refusé côté serveur et par RLS.

| Rôle | Doit afficher | Doit pouvoir faire | Ne doit pas afficher / faire |
|---|---|---|---|
| **Affilié** (`affiliate`) | Ses enseignes, opérations, campagnes accessibles, historique, commissions le concernant, notifications, profil et paramètres | Consulter les opportunités, consulter son historique, répondre ou participer aux plans qui le concernent, gérer ses informations | Les autres affiliés, les portefeuilles internes, les données financières globales, la configuration Trinity, les utilisateurs et les règles internes |
| **Client** (`client`) | Ses campagnes, ses affiliés liés, ses rapports, ses plans et messages liés à son activité, profil et paramètres | Gérer ses campagnes, consulter ses affiliés, suivre les performances et rapports, échanger sur les plans autorisés | Les campagnes d'autres clients, les données internes des AM/managers, les commissions globales, la configuration et les données d'autres entités |
| **Account Manager** (`am`) | Son portefeuille de clients et affiliés, plans associés, objectifs, performance, commissions et rapports de son périmètre | Créer et suivre des plans, gérer son portefeuille, préparer des propositions, consulter les performances, échanger avec les parties concernées | Les portefeuilles d'autres AM, les paramètres d'administration, les données globales du manager/pôle, les utilisateurs hors périmètre |
| **Manager** (`manager`) | Les AM, clients, affiliés, campagnes, plans et performances de son périmètre, ainsi que documents, contrats, support et activité | Superviser son équipe, créer/modifier les objets métier autorisés, valider les plans, gérer les documents, suivre commissions et tickets | Les données d'autres entités ou pôles sans rattachement explicite, les réglages Owner, les secrets et clés techniques |
| **Manager de Pôle** (`pole_manager`) | Les managers et indicateurs de son pôle, la performance consolidée et les rapports de son périmètre | Superviser le pôle, analyser les résultats, consulter les données descendantes autorisées et coordonner les managers | Les autres pôles, les secrets système, les actions Owner et les données non rattachées à son pôle |
| **Admin d'Entité** (`entity_admin`) | Utilisateurs, managers, pôles, configuration et rapports de son entité | Administrer les comptes et rattachements de son entité, gérer la configuration autorisée, auditer les performances et accès | Les autres entités, les secrets d'infrastructure et les actions réservées au Trinity Owner |
| **Trinity Owner** (`owner`) | La vision consolidée de toutes les entités, utilisateurs, sécurité, configuration et indicateurs globaux | Administrer le système, superviser toutes les entités, gérer les droits et consulter les données consolidées | Rien au niveau fonctionnel global, mais les opérations sensibles doivent rester protégées, auditées et confirmées |

#### Règle d'implémentation pour chaque élément d'interface

Pour chaque page, bouton, colonne, filtre, menu, action ou donnée, appliquer cette séquence :

1. **Définir le rôle autorisé** et le scope exact : entité, pôle, manager, client, affilié ou plan.
2. **Ne pas envoyer la donnée interdite au navigateur**, même si la colonne est ensuite masquée en React.
3. **Masquer l'élément dans l'interface** si le rôle ne peut pas l'utiliser : menu, bouton, action de ligne, onglet, colonne et statistiques.
4. **Refuser l'action côté serveur** si un utilisateur fabrique une requête ou appelle directement une server action/API.
5. **Appliquer la même règle dans Supabase RLS** et dans les queries/actions avec un filtrage par utilisateur et périmètre.
6. **Tester les deux cas** : élément visible et utilisable pour le rôle autorisé, absent et refusé pour les autres rôles.

Exemple : masquer le bouton « Valider le plan » pour un affilié ne suffit pas. L'action de validation doit aussi vérifier la session, le rôle, le rattachement au plan et la policy RLS.

### Comptes de démonstration et vérification des rôles

Les comptes fonctionnels prévus pour tester l'affichage et les permissions sont :

- `affiliate@trinity.com` — Affilié
- `client@trinity.com` — Client
- `am@trinity.com` — Account Manager
- `manager@trinity.com` — Manager
- `pole@trinity.com` — Manager de Pôle
- `admin@trinity.com` — Admin d'Entité
- `owner@trinity.com` — Trinity Owner

Le mot de passe ne doit pas être documenté dans ce fichier. Les comptes doivent être utilisés pour vérifier, rôle par rôle, la sidebar, les pages, les colonnes, les boutons, les actions, les données retournées et les refus d'accès.

### Avertissement « Browser Restriction Detected » dans l'aperçu

L'aperçu intégré de v0 peut afficher **Browser Restriction Detected** lorsqu'il détecte Supabase Auth ou une autre librairie d'authentification. Ce message concerne l'iframe de prévisualisation et les restrictions de cookies/session du navigateur intégré ; il ne signifie pas que les routes ou les fonctions métier sont absentes.

Pour tester l'authentification réelle :

1. ouvrir l'aperçu dans un nouvel onglet ;
2. se connecter avec l'un des comptes de test ci-dessus ;
3. vérifier séparément chaque rôle ;
4. tester aussi une URL interdite directement, car masquer un lien ne remplace pas un contrôle serveur.

### Portail affilié

Routes principales :

- `/affiliate` : tableau de bord.
- `/affiliate/brands` : enseignes disponibles ou suivies.
- `/affiliate/brand/[id]` : détail d'une enseigne.
- `/affiliate/op/[id]` : détail d'une opération.
- `/affiliate/history` : historique.
- `/affiliate/notifications` : notifications.
- `/affiliate/profile` et `/affiliate/settings` : compte.

### Portail client

Routes principales :

- `/client` : tableau de bord.
- `/client/campaigns` : campagnes.
- `/client/affiliates` : affiliés liés ou disponibles.
- `/client/reports` : rapports.
- `/client/profile` et `/client/settings` : compte.

### Portail Account Manager

Routes principales :

- `/am` : tableau de bord.
- `/am/affiliates` et `/am/clients` : portefeuille.
- `/am/plans` et `/am/plans/[id]` : suivi des plans.
- `/am/performance` : performance.
- `/am/commissions` : commissions.
- `/am/reports` : rapports.
- `/am/profile` et `/am/settings` : compte.

### Portail Manager

Le portail le plus riche fonctionnellement. Il couvre notamment :

- AM, clients, affiliés et campagnes.
- Création et suivi des plans.
- Objectifs, performance, analyse et récapitulatif.
- Commissions.
- Documents, contrats, media kits et templates d'e-mails.
- Notifications, activité et tickets de support.
- Profil et paramètres.

Routes représentatives : `/manager`, `/manager/ams`, `/manager/clients`, `/manager/affiliates`, `/manager/campaigns`, `/manager/plans`, `/manager/performance`, `/manager/commissions`, `/manager/documents`, `/manager/contracts`, `/manager/support/tickets`.

### Portail Pole Manager

Le code de navigation prévoit des routes `/pole/...` comme `/pole/managers` et `/pole/performance`, alors que les pages présentes dans l'arborescence sont actuellement sous `/pole-manager` avec une page principale `/pole-manager`.

C'est une subtilité importante : la navigation du rôle `pole_manager` et les routes effectivement créées ne sont pas parfaitement alignées. Toute évolution de ce portail doit choisir une convention et mettre à jour simultanément les pages, la navigation et le middleware.

### Portail Admin Entité

Les pages présentes sont sous `/entity-admin` :

- `/entity-admin`
- `/entity-admin/poles`
- `/entity-admin/managers`
- `/entity-admin/users`
- `/entity-admin/performance`
- `/entity-admin/reports`
- `/entity-admin/config`
- `/entity-admin/profile`

La configuration de navigation historique contient toutefois un rôle `admin` avec des routes `/admin/...`, tandis que les constantes de rôle utilisent `entity_admin`. Il faut traiter cette différence comme une dette de cohérence à corriger avec précaution, car elle peut affecter les menus et les redirections.

### Portail Owner

`/owner` fournit une vision globale, avec notamment la performance consolidée, les utilisateurs, les entités, la sécurité et la configuration système. Certaines routes sont prévues par la navigation mais ne correspondent pas nécessairement à une page actuellement présente dans l'arborescence.

---

## 5. Authentification et protection des routes

### Flux général

1. Le navigateur ouvre une page.
2. `middleware.ts` crée un client Supabase SSR.
3. La session est rafraîchie via `supabase.auth.getUser()`.
4. Les cookies Supabase sont recopiés sur le même objet `NextResponse`.
5. Les routes protégées redirigent vers `/login` si aucun utilisateur n'est connecté.
6. Un utilisateur déjà connecté qui visite `/login` est redirigé vers `/`.

Les routes protégées sont actuellement :

```text
/affiliate
/client
/am
/manager
/pole-manager
/entity-admin
/owner
```

### Subtilités de sécurité

- Le middleware vérifie principalement la présence d'une session, pas la correspondance entre le rôle de l'utilisateur et le préfixe de route.
- La protection réelle doit donc aussi être assurée dans les layouts, pages serveur, queries et server actions.
- Les règles RLS Supabase sont indispensables : ne pas considérer le middleware comme une frontière de sécurité suffisante.
- Les variables Supabase sont utilisées côté serveur et côté navigateur selon le client appelé. La clé service ne doit jamais être exposée au client.
- Les actions et queries doivent toujours filtrer par l'identité et le périmètre métier de l'utilisateur connecté.

---

## 6. Modèle de données et logique métier

Le modèle tourne autour des relations suivantes :

```text
Entité / pôle
  └── Managers
        └── Account Managers
              ├── Clients
              ├── Affiliés
              └── Plans
                    ├── Campagnes
                    ├── Historique
                    ├── Commentaires / messages
                    ├── Rémunérations
                    └── Documents
```

### Tables principales

- **Profils/utilisateurs** : identité, rôle et données de compte.
- **account_managers** : account managers et rattachements hiérarchiques.
- **am_delegations** : délégations entre responsables et portefeuilles.
- **am_objectives** : objectifs des AM.
- **affiliates** : affiliés et informations de partenariat.
- **clients** : clients/annonceurs.
- **plans** : propositions commerciales entre affilié, client et AM.
- **plan history** : changements d'état et événements du plan.
- **plan comments/messages** : échanges autour d'un plan.
- **client affiliate messages** : messagerie client-affilié.
- **commissions** : montants, pourcentages, validation et paiement.
- **reports** : rapports périodiques ou personnalisés.
- **documents** : fichiers associés à un client, un plan ou un upload.
- **contracts** : contrats, statuts de signature et montants.
- **media_kits** : ressources marketing pour les affiliés.
- **email_templates** : modèles d'e-mails avec variables JSON.
- **notifications** : notifications utilisateur.
- **audit/activity logs** : traçabilité des actions.
- **support tickets** : demandes de support et conversations.

### Plans

La table `plans` est un objet central. Elle référence :

- un affilié ;
- un client ;
- un account manager ;
- une campagne ;
- une période de validité ;
- un statut ;
- un forfait fixe ;
- un pourcentage `hdr_pct` ;
- un budget estimé ;
- un historique de contre-propositions en JSONB.

Les statuts principaux sont :

```text
pending
approved
rejected
counter_proposal_sent
```

La base impose notamment que la date de fin soit supérieure ou égale à la date de début, et que les pourcentages soient compris entre 0 et 100.

Les champs `updated_at`, `last_updated` et `validated_at` ne sont pas interchangeables : certains écrans s'appuient sur les dates techniques, d'autres sur les dates métier. Lors d'une modification, il faut conserver cette distinction.

---

## 7. Architecture des accès aux données

Les accès Supabase sont répartis en plusieurs catégories :

- `lib/supabase/client.ts` : client navigateur.
- `lib/supabase/server.ts` : client serveur.
- `lib/supabase/queries/*` : lecture des données.
- `lib/supabase/actions/*` : mutations et opérations serveur.
- `app/api/*` : routes HTTP pour certaines opérations, notamment les documents.
- `lib/data/*` : stores ou données applicatives non directement encapsulées dans une query Supabase.

La convention recommandée est :

1. Lire côté serveur lorsque les données sont nécessaires au rendu initial.
2. Utiliser les server actions pour les mutations.
3. Valider les entrées avant toute mutation.
4. Revalider ou rafraîchir les données après une mutation.
5. Ne jamais faire confiance à un rôle, un prix, un montant ou un identifiant envoyé par le navigateur.

---

## 8. Documents et fichiers

Les documents sont gérés par des routes dédiées :

- `GET/POST /api/plans/[id]/documents`
- upload via `/api/plans/[id]/documents/upload`

Les métadonnées sont conservées dans la base (`title`, `file_type`, `file_size`, catégorie, relations métier). Le stockage binaire repose sur Vercel Blob.

Points à respecter :

- vérifier la session côté serveur ;
- vérifier que l'utilisateur a accès au plan ;
- valider le type MIME, la taille et le nom du fichier ;
- ne pas accepter un `plan_id` uniquement parce qu'il a été envoyé par le client ;
- supprimer ou archiver les métadonnées en cohérence avec le fichier stocké ;
- ne pas exposer de token Blob au navigateur.

---

## 9. UI, design system et expérience utilisateur

L'interface utilise une structure de dashboard commune :

- sidebar de navigation par rôle ;
- header d'application ;
- en-têtes de pages réutilisables ;
- cartes de statistiques ;
- badges de statut ;
- skeletons de chargement ;
- tableaux et filtres ;
- modales et drawers pour les actions ;
- toasts via les composants de notification.

Le layout racine définit :

- la langue HTML `fr` ;
- les polices Geist et Geist Mono ;
- le `ThemeProvider` avec mode clair/sombre ;
- `SupabaseAuthProvider` ;
- le toaster ;
- Vercel Analytics.

Les pages doivent conserver :

- une hiérarchie visuelle claire ;
- des états loading, empty et error explicites ;
- des libellés français cohérents ;
- une navigation clavier correcte ;
- des labels accessibles pour les contrôles ;
- une présentation responsive, surtout pour les tableaux et les sidebars.

---

## 10. Données locales et stores

Zustand est utilisé pour l'état partagé côté client, notamment :

- utilisateur courant ;
- notifications ;
- objectifs ;
- recherche globale ;
- audit/activity ;
- tickets ;
- formulaires de contre-proposition.

Il faut distinguer :

- **état d'interface temporaire** : filtres, ouverture d'une modale, sélection locale ;
- **source de vérité métier** : utilisateurs, plans, commissions, droits et documents, qui doivent rester dans Supabase.

La persistance navigateur ne doit pas remplacer la base de données pour les données métier. Un store local peut afficher un état optimiste, mais la mutation serveur doit rester la référence.

---

## 11. Scripts SQL et évolution de la base

Le dossier `scripts/` contient une suite de scripts historiques et incrémentaux : création de tables, ajout de colonnes, triggers, vues, permissions, RLS et données de test.

Les scripts ne constituent pas encore un système de migration unique et linéaire parfaitement normalisé. Certains numéros sont réutilisés pour des fonctionnalités différentes, par exemple `007`, `008`, `009`, etc. Avant d'exécuter un script :

1. vérifier s'il a déjà été appliqué ;
2. lire les dépendances entre tables ;
3. vérifier qu'il est idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`) ;
4. contrôler les policies existantes pour éviter les doublons ;
5. tester en environnement de développement avant production.

Le projet contient également des scripts de seed et de setup Node.js. Ceux-ci doivent être traités comme des outils d'administration et ne doivent jamais être importés dans un bundle client.

---

## 12. RLS et subtilités d'autorisation

Plusieurs scripts activent ou corrigent les policies RLS. La présence d'une policy ne garantit pas automatiquement une isolation correcte.

À contrôler pour chaque table :

- les opérations autorisées : `SELECT`, `INSERT`, `UPDATE`, `DELETE` ;
- le rôle PostgreSQL ciblé : `authenticated` ou autre ;
- le contrôle de propriétaire et de rattachement hiérarchique ;
- les colonnes utilisées pour le scope ;
- les effets des `ON DELETE CASCADE` et `ON DELETE SET NULL` ;
- les actions effectuées via la clé service, qui contournent généralement RLS.

Dans l'état documenté par certains scripts historiques, des policies générales permettent à tout utilisateur authentifié de lire ou modifier certaines lignes. Ces policies sont à auditer avant un usage production multi-tenant.

---

## 13. Flux métier principaux

### Création d'un plan

1. Un AM ou un manager sélectionne un client, un affilié et une campagne.
2. Il définit les dates, le forfait, le pourcentage et le budget.
3. La validation Zod/formulaire contrôle les champs.
4. Une server action crée le plan.
5. Le plan démarre en `pending`.
6. Les parties concernées peuvent commenter ou envoyer une contre-proposition.
7. Le plan passe ensuite vers `approved`, `rejected` ou `counter_proposal_sent`.
8. L'historique conserve les transitions importantes.

### Gestion d'une commission

Une commission relie un plan à un AM, avec un montant, éventuellement un pourcentage et un statut de paiement :

```text
pending → calculated → approved → paid
```

Les montants doivent être recalculés et validés côté serveur. L'interface ne doit pas être la source de vérité financière.

### Documents

Un document peut être rattaché à un client, un plan ou un upload d'AM. Il faut maintenir la cohérence entre le fichier Blob et sa ligne en base.

### Support

Les managers disposent d'une liste de tickets et d'une page de détail. Les changements de statut et les réponses doivent être tracés si le support devient un processus auditable.

---

## 14. Points d'attention avant modification

### Incohérences de routes

- Les constantes utilisent `entity_admin`, mais la configuration de navigation contient aussi `admin`.
- Le portail Pole Manager est déclaré avec des routes `/pole/...` dans la navigation, alors que les pages présentes utilisent `/pole-manager/...`.
- Certaines routes prévues par la navigation Owner/Admin ne possèdent pas encore de page correspondante.

### Documentation historique

Le README mentionne Next.js 14 alors que `package.json` utilise Next.js 16.2. La documentation d'installation et les exemples de commandes devront être alignés sur pnpm et la version actuelle.

### Rôles et scope

La hiérarchie `hasPermission` donne un modèle global de niveau, mais elle ne remplace pas un contrôle de rattachement. Un manager ne doit pas automatiquement accéder aux données de toutes les entités simplement parce que son niveau est supérieur.

### Supabase SSR

Les cookies doivent être manipulés avec le même objet `NextResponse` créé au début du middleware. Remplacer la réponse après le rafraîchissement de session peut faire perdre les cookies mis à jour.

### Next.js moderne

Avec Next.js 16, les APIs dynamiques comme `params`, `searchParams`, `headers` et `cookies` doivent être traitées comme asynchrones dans les Server Components et Route Handlers lorsque le contexte l'exige.

### RLS

Ne pas ajouter une nouvelle page ou une nouvelle query sans vérifier la policy de la table correspondante. Une page masquée dans la navigation n'est pas une mesure de sécurité.

### Base et scripts

Ne pas exécuter tous les scripts SQL en bloc sans vérifier l'ordre et l'état courant de la base. Le dossier contient plusieurs corrections successives liées aux permissions, aux colonnes et aux triggers.

---

## 15. Ajouter une fonctionnalité

### Nouvelle page

1. Identifier le rôle concerné.
2. Créer la route dans `app/<portail>/.../page.tsx`.
3. Ajouter un `loading.tsx` si la page charge des données ou contient un tableau important.
4. Réutiliser le layout dashboard et les composants partagés.
5. Ajouter le lien dans `lib/navigation/nav-items.ts`.
6. Vérifier le middleware et les permissions serveur.
7. Ajouter les queries/actions nécessaires.
8. Ajouter ou modifier la policy RLS concernée.
9. Tester les états loading, empty, error et success.

### Nouveau rôle

1. Ajouter la valeur dans `ROLES`.
2. Ajouter son libellé et son niveau dans `roles.ts`.
3. Mettre à jour les types utilisateur et les providers.
4. Ajouter la navigation.
5. Créer le portail et son layout.
6. Ajouter le préfixe dans le middleware.
7. Ajouter les policies et les tests d'isolation.
8. Vérifier les redirections après connexion.

### Nouvelle table

1. Définir les relations et règles de suppression.
2. Ajouter les index utiles.
3. Ajouter `created_at` et `updated_at` si nécessaire.
4. Activer RLS.
5. Écrire des policies basées sur l'utilisateur et son scope.
6. Ajouter les types Supabase.
7. Créer les queries et actions serveur.
8. Tester les cas d'accès autorisé et refusé.

---

## 16. Checklist de validation

Avant de considérer une modification comme terminée :

- [ ] `pnpm lint` passe.
- [ ] `pnpm build` passe si la modification concerne le build, les routes ou la configuration.
- [ ] La page fonctionne en mode clair et sombre.
- [ ] La page est lisible sur desktop et mobile.
- [ ] Les états loading, empty et error existent lorsque nécessaire.
- [ ] Les contrôles ont des labels accessibles.
- [ ] Les permissions sont vérifiées côté serveur.
- [ ] Les queries filtrent le périmètre utilisateur.
- [ ] Les policies RLS sont cohérentes.
- [ ] Les données sensibles ne sont pas envoyées au client.
- [ ] Les mutations sont idempotentes ou protégées contre les doubles soumissions.
- [ ] Les routes sont cohérentes avec la navigation.
- [ ] Les dates, montants et pourcentages sont recalculés/validés côté serveur.

---

## 17. Résumé architectural

Trinity Front est un dashboard SaaS multi-rôles avec une forte dépendance à Supabase. La logique importante est distribuée entre les pages App Router, les layouts, le middleware, les queries/actions Supabase, les stores Zustand et les scripts SQL.

Les trois principes à préserver sont :

1. **La base est la source de vérité pour les données métier.**
2. **La présence d'un utilisateur connecté ne suffit pas : le rôle et le scope doivent être contrôlés.**
3. **Chaque évolution doit maintenir la cohérence entre routes, navigation, RLS, types et interface.**
