# Trinity Front — Spécification fonctionnelle détaillée

> Document de référence fonctionnel : ce que chaque rôle voit, peut faire, ne peut pas faire et comment chaque page doit se comporter. Ce document complète `PROJECT_DESCRIPTION.md` ; il ne décrit pas seulement les tables ou les routes.

## 1. Objet de l'application

Trinity Front est une plateforme SaaS de gestion d'affiliation. Elle orchestre les relations entre :

- les **affiliés**, qui proposent ou diffusent des opérations commerciales ;
- les **clients**, qui créent et financent des campagnes ;
- les **Account Managers**, qui pilotent un portefeuille ;
- les **managers**, qui supervisent une équipe d'Account Managers ;
- les **managers de pôle**, qui consolident plusieurs équipes ;
- les **admins d'entité**, qui administrent une entité organisationnelle ;
- le **Trinity Owner**, qui dispose d'une vision globale de la plateforme.

L'application ne doit pas être pensée comme une collection de routes indépendantes. Chaque page est une **vue métier filtrée par rôle et périmètre**. Une même donnée peut exister en base mais ne pas être envoyée au navigateur pour certains rôles.

## 2. Principes fonctionnels non négociables

1. Un rôle détermine à la fois la navigation, les colonnes, les statistiques, les boutons, les actions et les données retournées.
2. Un utilisateur ne voit que son périmètre : lui-même, son portefeuille, son équipe, son pôle, son entité ou la vision globale selon son rôle.
3. Masquer un bouton n'est pas une sécurité. Toute action doit être refusée côté serveur et par les policies RLS.
4. Les données financières, commissions, budgets et marges sont limitées au niveau hiérarchique autorisé.
5. Toute modification importante doit produire un historique ou une trace d'activité.
6. Les messages sont visibles uniquement par les parties du dossier concerné et les responsables autorisés.
7. Les fichiers sont protégés par le même périmètre que l'objet auquel ils sont attachés.
8. Les filtres et agrégations doivent être calculés côté serveur ; le client ne doit pas télécharger des données qui seront ensuite cachées.
9. Les états `loading`, `empty`, `error`, `success` et `forbidden` sont nécessaires sur les pages de données.
10. La base Supabase est la source de vérité. Zustand sert à l'état d'interface, aux formulaires temporaires et à l'optimisme, pas au remplacement de la base.

## 3. Rôles et limites

### 3.1 Affilié

**Mission :** consulter ses partenariats, ses enseignes, les opérations accessibles et les plans qui le concernent.

**Peut :** consulter son profil, ses enseignes, les opérations disponibles, ses plans, son historique, ses notifications et les commissions qui lui sont attribuées ; répondre à une proposition ou envoyer une contre-proposition lorsque le workflow le permet ; envoyer et recevoir des messages sur un plan dont il est partie ; télécharger les documents explicitement partagés avec lui.

**Ne peut pas :** voir les autres affiliés, les clients non liés, le portefeuille d'un AM, les marges internes, les commissions globales, les budgets consolidés, les objectifs internes, les utilisateurs, la configuration, les tickets internes ou les règles de rémunération d'autres partenaires.

### 3.2 Client

**Mission :** gérer ses campagnes annonceur, suivre ses affiliés et analyser ses résultats.

**Peut :** gérer ses campagnes ; consulter les affiliés liés à ses campagnes ; consulter et négocier les plans auxquels il participe ; échanger dans les discussions concernées ; consulter ses rapports ; télécharger les contrats et documents partagés ; modifier ses informations de compte.

**Ne peut pas :** voir les campagnes d'un autre client ; voir les portefeuilles internes ; voir les objectifs ou commissions d'un AM ; voir les données d'administration ; consulter les marges globales ou les informations privées d'un affilié ; administrer les utilisateurs.

### 3.3 Account Manager

**Mission :** gérer son portefeuille de clients et d'affiliés et faire avancer les plans commerciaux.

**Peut :** consulter son portefeuille ; créer et modifier les plans de son périmètre ; préparer une proposition ; envoyer une contre-proposition ; suivre les validations ; consulter les performances, objectifs, commissions et rapports de son portefeuille ; communiquer avec clients et affiliés ; déposer des documents liés à ses plans ; créer des rapports autorisés.

**Ne peut pas :** modifier les utilisateurs ; voir le portefeuille d'un autre AM ; modifier la configuration de l'entité ; valider seul une action réservée au manager ; voir les résultats consolidés hors de son portefeuille ; consulter les secrets ou paramètres techniques.

### 3.4 Manager

**Mission :** superviser une équipe d'Account Managers et la performance de son périmètre.

**Peut :** voir les AM rattachés, leurs clients et affiliés ; créer, modifier et superviser les campagnes et plans ; valider les plans selon le workflow ; gérer commissions, objectifs, documents, contrats, media kits, templates d'e-mails, activité et support ; répondre aux tickets ; produire des rapports d'équipe ; envoyer des messages aux parties d'un dossier.

**Ne peut pas :** administrer les autres entités ; modifier les règles système ; gérer les secrets ; voir un autre pôle sans rattachement ; changer les droits globaux ; supprimer une donnée sensible sans confirmation et audit.

### 3.5 Manager de Pôle

**Mission :** superviser plusieurs managers et consolider les résultats du pôle.

**Peut :** voir les managers et AM descendants ; comparer les équipes ; consulter les KPI, rapports, alertes et performances du pôle ; coordonner et commenter ; superviser les plans selon les règles déléguées ; consulter les données descendantes nécessaires à l'analyse.

**Ne peut pas :** voir les autres pôles ; agir comme Owner ; modifier la configuration système ; gérer les utilisateurs de toute l'organisation ; accéder aux secrets ou aux données non rattachées au pôle.

### 3.6 Admin d'Entité

**Mission :** administrer les utilisateurs, rattachements et paramètres d'une entité.

**Peut :** créer, désactiver ou rattacher les utilisateurs de son entité ; gérer les pôles et managers ; consulter les rapports et audits de l'entité ; modifier la configuration autorisée ; contrôler les accès et la qualité des données.

**Ne peut pas :** administrer une autre entité ; modifier les secrets d'infrastructure ; changer les règles Owner ; intervenir dans un périmètre non rattaché ; modifier les données métier uniquement réservées au workflow opérationnel sans droit explicite.

### 3.7 Trinity Owner

**Mission :** piloter l'ensemble de la plateforme et toutes les entités.

**Peut :** consulter et administrer toutes les entités, utilisateurs, rôles, configurations, rapports, performances et événements de sécurité ; intervenir sur les données métier ; gérer les paramètres globaux.

**Obligation :** toute action sensible doit être confirmée, journalisée et idéalement réversible. Le Owner ne doit pas contourner l'audit sous prétexte qu'il a tous les droits.

## 4. Matrice globale des fonctionnalités

| Fonction | Affilié | Client | AM | Manager | Pôle | Admin entité | Owner |
|---|---|---|---|---|---|---|---|
| Voir ses propres données | Oui | Oui | Oui | Oui | Oui | Oui | Oui |
| Voir son périmètre descendant | Non | Campagnes liées | Portefeuille | Équipe | Pôle | Entité | Global |
| Créer une campagne | Non | Oui | Préparer | Oui | Superviser | Selon règle | Oui |
| Créer un plan | Participer | Selon campagne | Oui | Oui | Superviser | Non métier | Oui |
| Répondre à un plan | Oui | Oui si partie | Oui | Oui | Oui | Non métier | Oui |
| Valider un plan | Non | Selon workflow | Préparer | Oui | Superviser | Non métier | Oui, audité |
| Voir commissions personnelles | Oui si publiée | Non | Oui | Oui | Agrégées | Selon rapport | Oui |
| Voir commissions consolidées | Non | Non | Non | Équipe | Pôle | Entité | Global |
| Gérer documents | Documents partagés | Documents liés | Ses plans | Tous son périmètre | Consultation | Administration | Global |
| Envoyer messages métier | Plans concernés | Plans/campagnes concernés | Portefeuille | Tous dossiers du périmètre | Coordination | Administration | Global |
| Gérer utilisateurs | Non | Non | Non | Équipe limitée | Managers du pôle | Entité | Global |
| Modifier configuration | Profil | Profil | Profil | Paramètres métier | Pôle | Entité | Système |
| Voir audit | Non | Non | Limité | Équipe | Pôle | Entité | Global |

## 5. Règle de sortie des données

Chaque query doit produire une vue métier :

- `affiliate`: lignes dont l'affilié est l'utilisateur connecté ou dont le partage est explicitement publié ;
- `client`: lignes liées au client connecté ;
- `am`: lignes liées aux clients, affiliés et plans de son portefeuille ;
- `manager`: lignes appartenant aux AM rattachés à son équipe ;
- `pole_manager`: lignes appartenant aux managers du pôle ;
- `entity_admin`: lignes de l'entité ;
- `owner`: lignes globales.

Les colonnes sensibles sont également filtrées. Par exemple, un affilié peut recevoir le statut d'un plan mais pas la marge interne ; un AM peut recevoir sa commission mais pas celle des autres AM ; un manager peut recevoir une consolidation mais pas nécessairement les détails privés d'un autre pôle.

## 6. Spécification page par page

### 6.1 Authentification

#### `/login`

**Objectif :** connecter un utilisateur avec Supabase Auth.

**Affiche :** email, mot de passe, état de chargement, erreur d'authentification, lien d'inscription ou d'aide si prévu.

**Après connexion :** redirige vers le portail correspondant au rôle et charge la navigation de ce rôle.

**Ne doit pas :** révéler si un email existe ; exposer le rôle avant authentification ; stocker le mot de passe ; afficher les données d'un autre utilisateur.

#### `/signup`

**Objectif :** créer un compte si l'inscription publique est activée.

**Affiche :** formulaire d'identité, email, mot de passe, confirmation et état de validation.

**Règle :** le rôle initial ne doit pas être choisi librement par un visiteur si cela donne accès à des fonctions internes. Le rôle doit être attribué ou validé côté serveur.

### 6.2 Portail Affilié

#### `/affiliate` — Tableau de bord affilié

**Affiche :** résumé des enseignes suivies, opérations accessibles, plans en attente de réponse, plans actifs, commissions publiées, notifications non lues et activités récentes.

**Actions :** ouvrir une enseigne, ouvrir une opération, ouvrir un plan, répondre à une proposition, consulter les notifications, accéder au profil.

**Masque :** chiffres consolidés Trinity, autres affiliés, marge client, objectifs AM, commissions d'équipe et administration.

#### `/affiliate/brands` — Mes enseignes

**Affiche :** cartes ou tableau des enseignes accessibles, nom, logo, statut de relation, opérations disponibles, dernière activité.

**Actions :** rechercher, filtrer, ouvrir le détail.

**Masque :** enseignes privées non publiées ou appartenant à un autre périmètre.

#### `/affiliate/brand/[id]` — Détail enseigne

**Affiche :** identité de l'enseigne, présentation, campagnes/opérations publiées, conditions visibles, documents partagés et plans existants de l'affilié.

**Actions :** ouvrir une opération, consulter un plan, participer si autorisé.

**Interdit :** afficher la liste complète des affiliés partenaires, les marges ou les informations internes du client.

#### `/affiliate/op/[id]` — Détail opération

**Affiche :** campagne, description, période, conditions, rémunération visible, statut de disponibilité, documents et bouton de participation.

**Actions :** demander à participer, consulter ou répondre au plan, envoyer un message si l'affilié est partie prenante.

**Ne doit pas permettre :** modifier la campagne client, modifier un taux imposé, accéder à une opération non publiée.

#### `/affiliate/history` — Historique

**Affiche :** plans passés, opérations terminées, réponses, changements de statut, commissions publiées et dates.

**Actions :** filtrer par période/statut, ouvrir un élément, télécharger les documents accessibles.

**Masque :** historique interne, notes privées et activités d'autres utilisateurs.

#### `/affiliate/notifications` — Notifications

**Affiche :** notifications adressées à l'affilié, type, message, date, statut lu/non lu et lien vers l'objet.

**Actions :** marquer comme lu, ouvrir l'objet, filtrer.

**Règle :** une notification d'un autre utilisateur ne doit jamais être retournée.

#### `/affiliate/profile` et `/affiliate/settings`

**Affiche :** identité, avatar, coordonnées autorisées, préférences d'affichage et notification.

**Actions :** modifier ses informations, préférences et mot de passe selon le flux Auth.

**Interdit :** modifier son rôle, son rattachement ou ses droits.

### 6.3 Portail Client

#### `/client` — Tableau de bord client

**Affiche :** campagnes actives, plans en attente, affiliés liés, budget de ses campagnes, performance, rapports récents et messages non lus.

**Actions :** ouvrir une campagne, ouvrir un plan, consulter un rapport, contacter les parties autorisées.

**Masque :** données des autres clients, commissions internes AM, marges globales et configuration Trinity.

#### `/client/campaigns` — Mes campagnes

**Affiche :** tableau avec nom, période, statut, budget, affiliés liés, performance et dernière activité.

**Actions :** créer/modifier une campagne selon le workflow ; rechercher ; filtrer ; ouvrir le détail ; archiver si autorisé.

**Règle :** toute campagne créée est automatiquement rattachée au client connecté, jamais à un client envoyé par le navigateur.

#### `/client/affiliates` — Affiliés

**Affiche :** affiliés liés à ses campagnes, statut de relation, campagnes communes, performance partagée et contact autorisé.

**Actions :** filtrer, ouvrir un profil public/partagé, initier un échange dans le contexte d'une campagne.

**Masque :** informations privées, rémunérations d'autres plans et affiliés non liés.

#### `/client/reports` — Rapports

**Affiche :** rapports de ses campagnes, période, type, statut, indicateurs et auteur.

**Actions :** ouvrir, filtrer, télécharger, demander un rapport si le workflow le prévoit.

**Interdit :** modifier un rapport finalisé d'un autre auteur ou voir un rapport d'un client différent.

#### `/client/profile` et `/client/settings`

Même logique que l'affilié : modification de ses informations et préférences, sans modification du rôle ou des rattachements.

### 6.4 Portail Account Manager

#### `/am` — Dashboard portefeuille

**Affiche :** nombre de clients, affiliés et plans du portefeuille ; plans à traiter ; performance ; objectifs ; commissions personnelles ; alertes et activité récente.

**Calcul :** toutes les cartes, graphiques et compteurs excluent les portefeuilles des autres AM.

**Actions :** ouvrir un client, un affilié, un plan, une performance ou un rapport ; créer un plan si les parties sont dans son périmètre.

#### `/am/affiliates`

**Affiche :** affiliés du portefeuille, statut, clients liés, campagnes, performance, dernière activité et contact.

**Actions :** rechercher, filtrer, ouvrir le détail et initier une action métier autorisée.

**Interdit :** réassigner un affilié à un autre AM sans droit de délégation.

#### `/am/clients`

**Affiche :** clients du portefeuille, statut, campagnes, plans, budget autorisé, performance et dernière activité.

**Actions :** ouvrir, filtrer, créer un plan avec ce client, consulter les dossiers associés.

#### `/am/plans` et `/am/plans/[id]`

**Liste :** plans du portefeuille avec client, affilié, campagne, période, statut, rémunération autorisée et dernière mise à jour.

**Détail :** informations du plan, timeline, historique, commentaires/messages, contre-propositions, documents et actions autorisées.

**Actions AM :** créer, préparer, modifier avant validation, envoyer une proposition, répondre à une contre-proposition, joindre un document, commenter et relancer.

**Limite :** l'AM prépare ou pilote ; la validation finale dépend du workflow et du niveau requis. Il ne doit pas valider une décision qui exige un manager.

#### `/am/performance`

**Affiche :** performance du portefeuille par client, affilié, campagne et période ; objectifs et progression.

**Actions :** filtrer par période, client, campagne ; consulter le détail ; exporter si autorisé.

**Masque :** données des autres portefeuilles et comparaisons contenant des informations confidentielles hors périmètre.

#### `/am/commissions` et `/am/reports`

**Commissions :** uniquement les commissions de l'AM ou celles nécessaires au portefeuille autorisé, avec statut `pending`, `calculated`, `approved` ou `paid`.

**Rapports :** création/consultation de rapports du portefeuille, export et partage selon droit.

#### `/am/profile` et `/am/settings`

Profil et préférences personnelles. Le rattachement au manager, le rôle et les droits sont administrés par un niveau supérieur.

### 6.5 Portail Manager

#### `/manager` — Dashboard équipe

**Affiche :** AM actifs, clients, affiliés, campagnes, plans à valider, performance, commissions, tickets, documents récents et alertes.

**Agrégation :** par AM, client, affilié, campagne et période, uniquement pour l'équipe rattachée.

**Actions :** accéder à toutes les pages métier du périmètre, traiter les alertes et valider les objets autorisés.

#### `/manager/ams` et `/manager/ams/[id]`

**Liste :** AM rattachés, portefeuille, objectifs, performance, plans ouverts, activité et statut.

**Détail :** portefeuille complet autorisé, objectifs, délégations, performance, commissions d'équipe et activité.

**Actions :** assigner ou réassigner dans le périmètre, suivre les objectifs, déléguer, consulter les détails et accompagner.

**Interdit :** modifier un AM d'un autre manager/pôle ou les règles globales.

#### `/manager/clients`, `/manager/clients/new`, `/manager/clients/[id]`

**Liste :** clients de l'équipe, AM responsable, campagnes, plans, statut et performance.

**Création :** formulaire validé, rattachement à un AM autorisé, création des relations nécessaires et journalisation.

**Détail :** campagnes, plans, affiliés, rapports, documents, contrats, activité et messages du client.

**Actions :** créer, modifier, rattacher dans le périmètre, ouvrir un dossier et communiquer.

#### `/manager/affiliates`, `/manager/affiliates/new`, `/manager/affiliates/[id]`

Même structure que les clients, avec en plus les enseignes, opérations, plans et media kits. Les informations privées de l'affilié doivent rester limitées aux utilisateurs qui en ont besoin.

#### `/manager/campaigns`, `/manager/campaigns/new`, `/manager/campaigns/[id]`

**Liste :** campagnes de l'équipe, client, période, budget, statut, affiliés, performance et plans.

**Création/modification :** nom, description, dates, budget, conditions, ciblage, statut et affiliés autorisés.

**Détail :** résumé, affiliés, plans, performance, documents, activité et messages.

**Actions :** créer, modifier, publier/archiver, gérer les affiliés et ouvrir les plans associés.

#### `/manager/plans`, `/manager/plans/[id]`

Page centrale de supervision. Le manager voit les plans de son équipe, les états, les contre-propositions, l'historique, les documents et les messages.

**Actions :** valider, rejeter, demander une modification, répondre, modifier les éléments autorisés, joindre un document et déclencher les notifications.

**Obligation :** chaque transition de statut conserve l'auteur, la date, l'ancien statut, le nouveau statut et un commentaire si nécessaire.

#### `/manager/objectifs`

**Affiche :** objectifs des AM, cibles, période, progression, écart et statut.

**Actions :** créer, modifier, valider et suivre les objectifs de l'équipe.

**Masque :** objectifs d'une autre équipe ou données individuelles non nécessaires à un niveau supérieur.

#### `/manager/performance` et `/manager/performance/analysis`

**Affiche :** KPI de l'équipe, comparaisons par AM/client/campagne, évolution temporelle, conversions, budgets, revenus et alertes.

**Actions :** filtrer, comparer, analyser, exporter et ouvrir le dossier source.

**Règle :** les graphiques doivent utiliser les mêmes filtres de périmètre que les tableaux.

#### `/manager/commissions` et `/manager/recapitulatif`

**Commissions :** suivi des calculs, validations, montants, statuts et paiements de l'équipe.

**Récapitulatif :** synthèse financière, période, totaux, ventilation et écarts.

**Interdit :** considérer une valeur envoyée par l'interface comme un montant définitif ; tout montant est recalculé côté serveur.

#### `/manager/reports`

Création, consultation, filtrage, publication et export des rapports de l'équipe. Un rapport peut être brouillon, publié ou archivé. Les données incluses dépendent du périmètre au moment de la génération.

#### `/manager/documents`

**Affiche :** documents accessibles de l'équipe, type, propriétaire, relation métier, taille, auteur, date et statut.

**Actions :** rechercher, filtrer, télécharger, archiver et ouvrir l'objet lié.

#### `/manager/contracts`

**Affiche :** contrats, parties, type, valeur, dates, statut de signature et documents associés.

**Actions :** créer, joindre, suivre la signature et télécharger dans le périmètre.

#### `/manager/media-kits`

**Affiche :** kits média destinés aux affiliés, version, fichier, statut de publication et téléchargements.

**Actions :** créer, remplacer, publier, dépublier et contrôler les accès.

#### `/manager/email-templates`

**Affiche :** modèles, sujet, catégorie, variables, statut actif et dernière modification.

**Actions :** créer, modifier, prévisualiser, activer/désactiver et utiliser un modèle autorisé.

**Sécurité :** les variables doivent être validées ; aucun secret ne doit être placé dans le corps du template.

#### `/manager/activity`

**Affiche :** timeline des actions de l'équipe : création, modification, statut, document, message, connexion sensible et erreur métier.

**Actions :** filtrer par acteur, objet, type et période ; ouvrir l'objet source.

**Règle :** l'audit est en lecture seule pour le manager.

#### `/manager/notifications`

Centre de notifications du manager et alertes de son équipe si elles sont explicitement agrégées. Les notifications privées d'autres utilisateurs restent privées.

#### `/manager/support/tickets` et `/manager/support/tickets/[id]`

**Liste :** sujet, demandeur, priorité, statut, date, dernier message et responsable.

**Détail :** conversation, historique des statuts, pièces jointes, notes internes séparées et actions.

**Actions :** répondre, assigner, changer la priorité/statut, fermer ou rouvrir selon workflow.

**Interdit :** exposer une note interne au demandeur ou mélanger deux tickets.

#### `/manager/profile` et `/manager/settings`

Profil et préférences du manager. Les réglages métier ne doivent pas permettre de contourner les droits d'un pôle ou d'une entité.

### 6.6 Portail Manager de Pôle

La navigation historique utilise `/pole/...`, tandis que certaines pages présentes utilisent `/pole-manager`. Cette divergence doit être résolue avant de considérer le portail comme final.

#### Tableau de bord, managers, AM, overview, performance et reports

**Affiche :** managers du pôle, AM descendants, volume de clients/affiliés/plans, performance consolidée, comparaison des équipes, alertes et rapports.

**Actions :** ouvrir les équipes, filtrer par manager, analyser les écarts, commenter, superviser et produire des consolidations.

**Ne doit pas afficher :** données d'un autre pôle, secrets, configuration système, notes privées sans nécessité, décisions Owner.

**Ne doit pas faire :** administrer tous les utilisateurs, modifier la structure d'une autre entité, supprimer des données globales ou changer les règles système.

### 6.7 Portail Admin d'Entité

Le rôle canonique est `entity_admin`, mais l'ancienne navigation contient aussi `admin`. Le code doit utiliser une seule convention.

#### `/entity-admin`

Dashboard d'administration : utilisateurs actifs, pôles, managers, alertes d'accès, activité et performance de l'entité.

#### `/entity-admin/poles`

Gestion des pôles de l'entité : nom, responsable, statut, managers rattachés, indicateurs. Création/modification selon droit d'administration.

#### `/entity-admin/managers`

Gestion des managers : profil, pôle, statut, rattachement, équipe et accès. Ne pas modifier les données opérationnelles comme si l'admin était manager métier.

#### `/entity-admin/users`

Liste des utilisateurs de l'entité : identité, rôle, statut, rattachement, dernière activité. Actions : inviter, désactiver, réactiver, rattacher et contrôler les accès.

#### `/entity-admin/performance` et `/entity-admin/reports`

Consolidation de l'entité, rapports d'administration, tendances, équipes et alertes. Pas de données d'une autre entité.

#### `/entity-admin/config`

Configuration autorisée de l'entité : paramètres métier, statuts disponibles, préférences et règles non globales. Les secrets techniques et paramètres système restent Owner.

#### `/entity-admin/profile`

Profil personnel de l'administrateur.

### 6.8 Portail Trinity Owner

#### `/owner`

Dashboard global multi-entités : entités, utilisateurs, performance, chiffre consolidé, alertes, sécurité et activité critique.

#### `/owner/entities`

Vue des entités : statut, responsables, pôles, volumes et indicateurs. Actions sensibles confirmées et auditées.

#### `/owner/users`

Tous les utilisateurs, rôle, entité, statut, dernière activité et historique d'accès. Actions : gérer les rôles et accès selon procédure sécurisée.

#### `/owner/performance` et `/owner/reports`

Performance consolidée, comparaisons inter-entités, rapports globaux et exports. Les agrégations doivent éviter de divulguer des détails à un utilisateur inférieur.

#### `/owner/system` et `/owner/security`

Configuration système, sécurité, événements sensibles, policies, intégrations et paramètres globaux. Accès fortement protégé, actions confirmées, journalisation obligatoire.

#### `/owner/profile`

Profil personnel, distinct de la configuration système.

## 7. Plans, messages et contre-propositions

Le plan est l'objet central reliant affilié, client, campagne et Account Manager.

### Données minimales visibles

- parties du plan ;
- campagne ;
- dates de validité ;
- forfait fixe ;
- pourcentage `hdr_pct` ;
- budget estimé ;
- statut ;
- historique ;
- commentaires et messages ;
- documents ;
- rémunération visible selon rôle.

### Cycle de statut

```text
pending -> counter_proposal_sent -> pending
pending -> approved
pending -> rejected
```

Les transitions doivent vérifier le rôle, le périmètre, l'état précédent et les champs obligatoires. Une transition crée une entrée d'historique et une notification aux parties concernées.

### Messages

Un message contient au minimum : auteur, destinataires ou contexte, plan/campagne associé, contenu, date, statut de lecture et éventuelle pièce jointe.

- affilié/client : messages du dossier auquel ils participent ;
- AM : messages de son portefeuille ;
- manager : messages des dossiers de son équipe ;
- pôle/admin/owner : lecture ou intervention selon leur niveau et leur périmètre.

Les notes internes et messages privés ne doivent jamais être envoyés aux parties externes.

## 8. Tables et contenu métier

| Objet | Contenu concret | Sorties principales |
|---|---|---|
| profils | identité, email, avatar, rôle, statut, entité, rattachement | profil, utilisateurs, sélecteurs filtrés |
| account_managers | AM, manager, pôle, portefeuille, statut | dashboards AM/manager/pôle |
| am_delegations | délégant, bénéficiaire, dates, périmètre, statut | supervision et continuité |
| am_objectives | cible, période, progression, statut | objectifs et performance |
| affiliates | identité partenaire, enseignes, statut, contacts, performance | portails affilié/client/AM/manager |
| clients | annonceur, contacts, campagnes, budget, AM, statut | portails client/AM/manager |
| campaigns | nom, période, client, budget, statut, conditions | campagnes et dashboards |
| plans | client, affilié, AM, campagne, dates, rémunération, statut | négociation et validation |
| plan_history | auteur, date, ancienne/nouvelle valeur, événement | timeline et audit |
| plan_comments/messages | auteur, texte, contexte, lecture, pièce jointe | discussions de plan |
| commissions | plan, bénéficiaire, base, montant, statut paiement | commissions et rapports |
| reports | titre, type, période, auteur, statut, données calculées | rapports par périmètre |
| documents | fichier, type, taille, auteur, objet lié, tags | documents, contrats, plans |
| contracts | parties, numéro, type, valeur, dates, signature | contrats |
| media_kits | ressources publiées, version, statut, téléchargements | kit affilié |
| email_templates | sujet, corps, catégorie, variables, activation | communication manager |
| notifications | destinataire, type, contenu, lien, lu/non lu | centre de notifications |
| audit/activity | acteur, action, objet, ancienne/nouvelle valeur, date | activité, admin, sécurité |
| support_tickets | demandeur, priorité, statut, messages, assignation | support manager |

## 9. Documents et téléchargements

Les documents utilisent les routes `/api/plans/[id]/documents` et `/api/plans/[id]/documents/upload`, avec les métadonnées en base et le fichier binaire dans Vercel Blob.

Avant lecture, upload ou suppression : session, rôle, accès au plan, type MIME, taille, nom, relation métier et policy doivent être vérifiés. Un utilisateur ne doit jamais pouvoir obtenir un document simplement en connaissant un `plan_id`.

## 10. Authentification et sécurité

Les comptes de démonstration sont :

- `affiliate@trinity.com` — Affilié ;
- `client@trinity.com` — Client ;
- `am@trinity.com` — Account Manager ;
- `manager@trinity.com` — Manager ;
- `pole@trinity.com` — Manager de Pôle ;
- `admin@trinity.com` — Admin d'Entité ;
- `owner@trinity.com` — Trinity Owner.

Le middleware protège principalement la session. Il ne suffit pas à lui seul pour autoriser une page. Chaque layout, query, server action et route API doit vérifier le rôle et le périmètre.

L'avertissement `Browser Restriction Detected` vient de l'aperçu intégré lorsqu'une librairie d'authentification utilise des cookies/session que l'iframe ne peut pas gérer normalement. Il ne signifie pas que les fonctionnalités ont disparu. L'authentification réelle se teste dans un nouvel onglet.

## 11. Checklist page par page

Pour chaque page, vérifier :

- le rôle autorisé ;
- le périmètre exact ;
- les données réellement retournées ;
- les colonnes visibles par rôle ;
- les boutons visibles par rôle ;
- les actions serveur refusées si elles sont fabriquées ;
- les états loading, empty, error et forbidden ;
- les notifications déclenchées ;
- l'historique créé ;
- la cohérence des montants et dates ;
- les téléchargements et pièces jointes ;
- le responsive, le clavier et les labels accessibles.

## 12. Écarts actuels à traiter

1. Les routes `/pole/...` de la navigation ne correspondent pas partout aux pages `/pole-manager/...`.
2. La navigation utilise encore `admin` alors que le rôle canonique est `entity_admin`.
3. Certaines routes Owner/Admin sont déclarées mais ne possèdent pas encore de page concrète.
4. La hiérarchie numérique `hasPermission` ne remplace pas le contrôle de rattachement.
5. Les scripts SQL sont historiques et incrémentaux : leur ordre et leur idempotence doivent être vérifiés.
6. Les policies RLS doivent être auditées table par table avant production multi-entités.
7. Les pages doivent être testées avec les sept comptes de rôle, en vérifiant autant les absences que les présences.

## 13. Critère de complétude

Le produit est fonctionnellement complet lorsque chaque compte de démonstration peut :

- ouvrir son portail correct ;
- voir uniquement les cartes, tables, colonnes et données de son périmètre ;
- effectuer toutes les actions prévues pour son rôle ;
- être refusé pour chaque action interdite, même via URL ou appel direct ;
- recevoir les notifications et messages attendus ;
- consulter les historiques autorisés ;
- télécharger uniquement les documents partagés ;
- observer des états d'erreur et de chargement compréhensibles ;
- ne jamais voir de donnée d'un autre rôle, d'une autre équipe, d'un autre pôle ou d'une autre entité sans justification métier.
