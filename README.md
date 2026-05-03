🎓 Dourous-Net — Plateforme de Partage Éducatif Asynchrone
Projet de Fin de Module · Architecture Cloud & Vibe Programming · 2CP 2026
Thème #4 : Éducation

Plateforme moderne où les enseignants publient des cours et les étudiants les consultent et interagissent, avec suivi granulaire.

✨ Fonctionnalités Principales
👨‍🏫 Enseignants
Création de cours (contenu enrichi + fichiers PDF/images).

Tableau de bord (vues, inscrits).

Profil (spécialité, expérience, rating).

👨‍🎓 Étudiants
Recherche par nom/spécialité.

Consultation des supports, historique des cours validés.

Soumission de devoirs, évaluation des enseignants.

Profil personnel (niveau scolaire, contacts).

🎨 Interface & UX
Design épuré, micro-animations, mode sombre/clair.

Multilingue : Français, Anglais, Arabe (RTL).

SPA fluide via Next.js App Router.

🛠️ Stack Technologique
Front-end : Next.js 14, TypeScript, Tailwind CSS.

Back-end (BaaS) : Supabase (PostgreSQL, Auth JWT, Storage, Edge Functions).

Déploiement : Vercel (Serverless Edge, CI/CD).

Sécurité : Row Level Security stricte.

🚀 Installation & Lancement (Localhost)
Créez .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.

Dans Supabase : SQL Editor → créez tables profiles, courses, interactions et exécutez les scripts SQL fournis. Créez les buckets publics course-files et interaction-files.

bash
npm install
npm run dev
# → http://localhost:3000
🗺️ Mission 4 : Mapping du Thème
Composant	Base de Données	Détails
Table A	public.profiles	Utilisateurs (rôle student/teacher, spécialité, bio, rating)
Table B	public.courses	Cours créés par un enseignant (titre, sujet, description, FK teacher_id)
Table C	public.interactions	Activité : jointure étudiant-cours (statuts, fichiers, horodatage)
Fichiers	Supabase Storage	Buckets course-files (enseignants) et interaction-files (étudiants)
🔒 Architecture Base de Données (Résumé)
interactions : PK id, FK user_id, FK course_id, status (pending..completed), file_path, file_mime, interaction_date.
RLS : profiles lecture publique, écriture propriétaire ; courses lecture publique, insertion/modif réservée aux enseignants ; interactions accessible uniquement par le créateur (user_id = auth.uid()).

🏗️ Mission 4 : Analyse (< 500 mots)
CAPEX vs OPEX : Vercel + Supabase évitent l’achat de serveurs physiques (CAPEX). Modèle opérationnel (OPEX) gratuit au démarrage, mise à l’échelle selon l’usage.
Scalabilité : L’architecture Serverless Edge alloue automatiquement des instances lors des pics, sans intervention humaine, contrairement à un datacenter qui demanderait du matériel additionnel et de la climatisation.
Données structurées / non structurées : Les informations métier (profils, cours, interactions) sont stockées en PostgreSQL avec schéma strict, clés étrangères et types précis. Les fichiers (PDF, devoirs) sont des blobs binaires non structurés dans Supabase Storage, sans capacité d’interrogation relationnelle.
