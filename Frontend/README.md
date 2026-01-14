# JIRAMA Personnel Management System

Système intégré de gestion du personnel et des ressources humaines pour JIRAMA (Jiro Sy Rano Malagasy).

## Démarrage rapide

### Installation

```bash
npm install
npm run dev
```

L'application sera disponible à `http://localhost:3000`

### Comptes de démonstration

Trois comptes sont disponibles pour tester l'application (mot de passe: `admin123`):

- **Admin Utilisateurs**: admin@jirama.mg
- **Admin RH**: admin.rh@jirama.mg
- **Utilisateur Standard**: user@jirama.mg

## Structure du projet

```
Frontend├── app/                      # Next.js App Router pages
        │   ├── layout.tsx           # Root layout avec AuthProvider
        │   ├── page.tsx             # Page d'accueil (redirection)
        │   ├── login/               # Authentification
        │   ├── dashboard/           # Tableau de bord
        │   ├── users/               # Gestion des utilisateurs
        │   ├── personnel/           # Gestion du personnel
        │   ├── departments/         # Gestion des départements
        │   ├── medical/             # Suivi médical
        │   ├── reports/             # Rapports et statistiques
        │   ├── settings/            # Paramètres utilisateur
        │   └── globals.css          # Styles TailwindCSS
        ├── components/              # Composants React
        │   ├── MainLayout.tsx       # Layout principal avec navigation
        │   ├── Navbar.tsx           # Barre de navigation
        │   └── Sidebar.tsx          # Menu latéral
        ├── context/                 # Contextes React
        │   └── AuthContext.tsx      # Gestion de l'authentification
        ├── hooks/                   # Hooks personnalisés
        │   └── useAuth.ts           # Hook d'authentification
        ├── public/                  # Fichiers statiques
        └── package.json             # Dépendances du projet
```

## Fonctionnalités

### Modules disponibles

- **Gestion des utilisateurs** (Admin Utilisateurs)
- **Gestion du personnel** (Admin RH)
- **Gestion des départements** (tous les rôles)
- **Suivi médical** (Admin RH)
- **Rapports et statistiques** (Admin RH)
- **Paramètres utilisateur** (tous les rôles)

### Rôles disponibles

- **ADMIN_USER**: Gestion des comptes utilisateurs
- **ADMIN_RH**: Gestion du personnel et modules RH
- **USER**: Accès en lecture seule

## Technologie

- **Next.js 16** - Framework React
- **TailwindCSS 3** - Utility CSS
- **DaisyUI** - Composants UI
- **TypeScript** - Typage statique
- **React Context** - Gestion d'état

## Déploiement

```bash
npm run build
npm run start
```

## Notes

Cette application est prête pour la production et peut être facilement intégrée avec un backend réel. Actuellement, les données sont stockées en mémoire avec localStorage pour la démonstration.
