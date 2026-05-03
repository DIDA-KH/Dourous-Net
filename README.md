Dourous-Net : Plateforme Éducative Asynchrone
Dourous-Net est un projet de fin de module (2CP 2026) conçu pour fluidifier et sécuriser le partage de connaissances à distance. L'objectif est de connecter facilement les enseignants (créateurs de contenu) et les étudiants à travers une interface moderne, fluide (SPA) et multilingue.

✨ L'expérience Utilisateur

Côté Enseignants : Ils créent des modules de cours enrichis de fichiers (PDF, images), gèrent leur profil public (spécialité, notation) et suivent l'engagement des étudiants via un tableau de bord.

Côté Étudiants : Ils utilisent un moteur de recherche pour trouver des professeurs, suivent les cours, soumettent leurs devoirs et évaluent les enseignants.

🛠️ Choix Techniques & Base de Données (Mission 4)
L'application repose sur le combo Next.js 14 (déployé sur Vercel) et Supabase (PostgreSQL, Auth, Storage). La donnée est soigneusement cartographiée :

Table A (Profils) : Centralise les utilisateurs selon leur rôle (étudiant/prof).

Table B (Cours) : Contient les ressources pédagogiques structurées.

Table C (Interactions) : Le cœur du système reliant les étudiants aux cours pour suivre les devoirs et l'historique d'apprentissage.
Les fichiers lourds (données non-structurées comme les PDF) sont stockés dans des buckets Supabase, avec des règles de sécurité (RLS) garantissant une isolation totale des données.

🏗️ Justification de l'Architecture Cloud
Plutôt que d'investir dans des serveurs physiques coûteux et contraignants (CAPEX), le choix du duo Vercel/Supabase repose sur un modèle à l'usage (OPEX). Cela permet un lancement sans risque financier (Pay-as-you-go). De plus, l'infrastructure Serverless Edge gère automatiquement la scalabilité : en cas de pic de trafic (ex. veille d'examens), la plateforme alloue instantanément les ressources nécessaires, sans intervention humaine.
