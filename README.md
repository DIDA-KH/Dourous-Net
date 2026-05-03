# 🎓 Dourous-Net — Plateforme de Partage Éducatif Asynchrone

> **Projet de Fin de Module · Architecture Cloud & Vibe Programming · 2CP 2026**  
> **Thème #4 : Éducation**

Dourous-Net est notre projet de plateforme éducative moderne. L'idée est simple : permettre aux enseignants de publier leurs cours facilement, et aux étudiants de les consulter et d'interagir avec. Notre but est d'offrir un espace fluide et sécurisé pour que le partage de connaissances se fasse naturellement à distance.

---

## ✨ Fonctionnalités Principales

### 👨‍🏫 Pour les Enseignants
- **Création de Cours :** Publication de modules éducatifs interactifs (Tables B) incluant des descriptions riches et des fichiers joints (PDF/Images).
- **Tableau de Bord :** Suivi en temps réel des statistiques d'engagement (compteur de vues, liste des étudiants inscrits).
- **Gestion de Profil :** Mise en avant des spécialités, du niveau d'expérience, et de la notation (rating) globale.

### 👨‍🎓 Pour les Étudiants
- **Exploration & Recherche :** Moteur de recherche avancé pour trouver des enseignants par nom complet ou par spécialité.
- **Suivi des Cours :** Consultation des supports pédagogiques et historique des cours validés (Tables C).
- **Interactions :** Soumission de devoirs ou de documents en réponse aux cours, et système d'évaluation (rating) des enseignants.
- **Espace Personnel :** Profil utilisateur dédié avec gestion du niveau scolaire et des informations de contact.

### 🎨 Interface & Expérience Utilisateur
- **Design Moderne & Premium :** Interface épurée, utilisation de micro-animations, palettes de couleurs harmonieuses et intégration d'un mode sombre/clair (Dark/Light Mode).
- **Support Multilingue (i18n) :** Basculement dynamique entre le Français, l'Anglais et l'Arabe (avec gestion du RTL).
- **Performances (SPA) :** Transitions fluides sans rechargement de page grâce à l'architecture Next.js App Router.

---

## 🛠️ Stack Technologique

- **Front-end :** Next.js 14 (React), TypeScript, Tailwind CSS.
- **Back-end (BaaS) :** Supabase (Base de données PostgreSQL, Authentification JWT, Storage, Edge Functions RPC).
- **Déploiement :** Vercel (CI/CD automatique, infrastructure Serverless Edge).
- **Sécurité :** Row Level Security (RLS) strictes garantissant l'isolation absolue des données de chaque utilisateur.

---

## 🚀 Installation & Lancement (Localhost)

### Étape 1 — Variables d'environnement
Créez un fichier `.env.local` à la racine du projet et ajoutez vos clés :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
```

### Étape 2 — Initialisation de la Base de Données
1. Ouvrez votre tableau de bord Supabase → **SQL Editor**.
2. Assurez-vous que les tables `profiles`, `courses`, et `interactions` sont créées.
3. Exécutez les scripts SQL de sécurité fournis à la racine (`supabase-fix-profiles.sql`, `supabase-rate-teacher.sql`, et `supabase-delete-user.sql`).
4. Dans **Storage**, créez deux buckets publics : `course-files` et `interaction-files`.

### Étape 3 — Lancement
```bash
npm install
npm run dev
# → Ouvrez http://localhost:3000
```

---

## 🗺️ Mission 4 : Mapping du Thème

**Thème de l'application :** Plateforme de partage de contenu éducatif asynchrone. L'objectif est de connecter des enseignants (créateurs de savoirs) et des étudiants, avec un suivi précis et granulaire de leurs interactions.

| Composant | Correspondance Base de Données | Description Détaillée |
|-----------|--------------------------------|-----------------------|
| **Table A** | `public.profiles` | Représente les **Utilisateurs**. Gérée automatiquement via les triggers Supabase Auth. Elle distingue les acteurs via la colonne `role` (`student` ou `teacher`) et centralise les données métiers (spécialité, bio, wilaya, notation). |
| **Table B** | `public.courses` | Représente les **Ressources (Cours)**. Créée par les enseignants, elle centralise les métadonnées de l'apprentissage (titre, sujet, description) et référence l'auteur de la ressource via une clé étrangère (`teacher_id`). |
| **Table C** | `public.interactions` | Représente l'**Activité**. C'est la table de jointure qui lie un étudiant (A) à un cours (B). Elle enregistre l'historique d'apprentissage (vues uniques) et référence les devoirs soumis par l'étudiant. |
| **Fichier** | **Supabase Storage** | Représente l'hébergement physique des **Documents**. L'architecture est divisée en deux buckets distincts : `course-files` (fichiers PDF originaux des enseignants) et `interaction-files` (réponses ou exercices téléversés par les étudiants). |

---

---

## 🔒 Architecture de la Base de Données (Schéma & RLS)

### Schéma de la table `interactions` (Table C)
Cette table est au cœur de la logique métier, reliant les étudiants aux cours :
- **Clé Primaire :** `id` (uuid)
- **Colonnes Principales :**
  - `user_id` (uuid) : *FK* vers `public.profiles.id`
  - `course_id` (uuid) : *FK* vers `public.courses.id`
  - `status` (text) : Statut (Contrainte Check : `pending | approved | rejected | cancelled | completed`), défaut : `'pending'`
  - `file_path` (text, nullable) : Fichier Storage.
  - `file_mime` (text, nullable) : Type MIME.
  - `interaction_date` & `created_at` (timestamptz) : Horodatage.

### Stratégie de Sécurité (Row Level Security - RLS)
- **`public.profiles` :** Lecture publique (`true`). Modification restreinte au propriétaire (`id = auth.uid()`).
- **`public.courses` :** Lecture publique. Insertion/Modification réservées aux enseignants (`teacher_id = auth.uid() AND role = 'teacher'`).
- **`public.interactions` :** Insertion/Lecture/Modification restreintes au créateur (`user_id = auth.uid()`).

---

## 🏗️ Mission 4 : Analyse d'Architecture (< 500 mots)

### 1. Pourquoi Vercel + Supabase plutôt qu'un serveur classique ?
Pour lancer Dourous-Net, on s'est vite rendu compte que monter ou louer un serveur classique nous coûterait beaucoup trop cher au départ. C'est ce qu'on appelle le **CAPEX** (Capital Expenditure) : les gros frais d'investissement pour acheter le matériel physique comme les serveurs, l'onduleur ou les routeurs. 

C'est là que le choix Vercel + Supabase prend tout son sens : on passe sur un modèle **OPEX** (Operational Expenditure, donc des dépenses à l'usage). Concrètement, on n'a rien à débourser au démarrage grâce aux plans gratuits. Et si un jour l'application cartonne, on paiera uniquement en fonction du trafic réel (*Pay-as-you-go*). Ça nous permet de lancer notre projet sans prendre de risques financiers liés à l'achat de serveurs qui prendraient la poussière si le projet ne marche pas.

### 2. Comment Vercel gère la scalabilité par rapport à un Data Center ?
Si on avait notre propre Data Center local et qu'on subissait un énorme pic de connexions (par exemple la veille des partiels), ça serait assez compliqué à gérer. Il faudrait acheter et brancher de nouveaux **serveurs rackables** en urgence, et surtout mettre la **climatisation** à fond pour éviter que la salle serveurs ne surchauffe avec toute cette nouvelle charge. C'est très manuel et stressant.

Avec Vercel, on se débarrasse de cette contrainte. Grâce à l'architecture *Serverless Edge*, Vercel s'occupe de tout derrière les rideaux. Lors d'un pic, la plateforme alloue automatiquement de nouvelles instances en quelques millisecondes pour absorber la charge, sans **aucune intervention humaine** de notre part. 

### 3. Les données structurées et non-structurées dans notre app
Dans notre plateforme, on gère les informations de deux façons différentes :
- **Les Données Structurées :** C'est tout ce qui est bien organisé dans notre base relationnelle **PostgreSQL** (les profils, les cours, les interactions). Ici, tout obéit à un schéma strict : on a des colonnes avec des types précis (UUID, `numeric`), et on utilise des clés étrangères pour lier les données entre elles. C'est parfait pour faire nos requêtes SQL (par exemple pour lister les profs par note).
- **Les Données Non-structurées :** Ce sont tous les vrais fichiers qu'on stocke dans **Supabase Storage** (les supports de cours en PDF, les devoirs des étudiants). Contrairement à nos tables, ces fichiers sont des "blobs" binaires (des données brutes). On ne peut pas les interroger ou les trier avec du SQL, c'est simplement du stockage de contenu lourd.
