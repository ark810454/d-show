# D_Show

Plateforme web professionnelle de gestion multi-activites pour un complexe commercial compose d'un restaurant, d'une terrasse, d'une boite de nuit, d'une boutique et d'une cordonnerie extensible.

## Stack retenue

- Frontend: Next.js 14, React 18, TypeScript, App Router, Tailwind CSS, Zustand, Axios
- Backend: NestJS, TypeScript, class-validator, JWT + refresh token, Socket.IO
- Data: MySQL + Prisma ORM
- Monorepo: npm workspaces avec packages partages
- Extension mobile future: architecture orientee API, modules metier stables, contrats partageables avec .NET MAUI

## Arborescence

```text
D_Show/
|-- apps/
|   |-- backend/
|   |   |-- prisma/
|   |   |   |-- schema.prisma
|   |   |   `-- seed.ts
|   |   |-- src/
|   |   |   |-- common/
|   |   |   |-- config/
|   |   |   |-- modules/
|   |   |   |   |-- activities/
|   |   |   |   |-- auth/
|   |   |   |   |-- companies/
|   |   |   |   |-- realtime/
|   |   |   |   |-- records/
|   |   |   |   `-- users/
|   |   |   |-- app.controller.ts
|   |   |   |-- app.module.ts
|   |   |   `-- main.ts
|   |   |-- .env.example
|   |   |-- nest-cli.json
|   |   |-- package.json
|   |   `-- tsconfig.json
|   `-- frontend/
|       |-- src/
|       |   |-- app/
|       |   |   |-- (dashboard)/
|       |   |   |   `-- dashboard/page.tsx
|       |   |   |-- api/health/route.ts
|       |   |   |-- globals.css
|       |   |   |-- layout.tsx
|       |   |   `-- page.tsx
|       |   |-- components/
|       |   |   |-- dashboard/
|       |   |   |-- layout/
|       |   |   `-- ui/
|       |   |-- hooks/
|       |   |-- lib/
|       |   |-- services/
|       |   `-- store/
|       |-- .env.example
|       |-- package.json
|       `-- tailwind.config.ts
|-- packages/
|   `-- shared/
|       |-- src/index.ts
|       |-- package.json
|       `-- tsconfig.json
|-- .env.example
|-- docker-compose.yml
|-- package.json
|-- README.md
`-- tsconfig.base.json
```

## Scenario metier impose

Le flux de saisie est structure pour garantir l'integrite des donnees:

1. Creation de l'entreprise
2. Creation des activites rattachees a cette entreprise
3. Saisie des operations, commandes, reservations, mouvements ou ventes dans une activite precise
4. Chaque enregistrement transporte toujours `companyId` et `activityId`

Dans Prisma, cela est impose par les relations `Company -> Activity -> ActivityRecord`.

## Architecture cible

### Frontend Next.js

- `app/`: routes App Router et API Routes legeres
- `components/`: UI reutilisable, dashboard, layout
- `services/`: appels Axios structures vers le backend NestJS
- `hooks/`: hooks de composition frontend
- `store/`: contexte applicatif global avec Zustand
- `lib/`: client API et utilitaires

### Backend NestJS

- `auth`: login, refresh, logout, profil courant
- `companies`: creation et listing d'entreprises
- `activities`: creation et listing d'activites par entreprise
- `records`: creation et listing des donnees operationnelles par activite
- `realtime`: diffusion temps reel via Socket.IO
- `users`: acces aux utilisateurs et rattachements societes

### Prisma

- schema MySQL centralise
- enums metier partages
- seed de demarrage
- structure prete pour futures migrations

## Strategie d'environnement

### Racine

Copier `.env.example` vers `.env` pour les variables communes:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXT_PUBLIC_API_URL`
- variables MySQL pour Docker

### Frontend

Copier [apps/frontend/.env.example](/C:/Users/afric/OneDrive/Documents/D_Show/apps/frontend/.env.example).

Variable exposee:

- `NEXT_PUBLIC_API_URL=http://localhost:4000/api`

### Backend

Copier [apps/backend/.env.example](/C:/Users/afric/OneDrive/Documents/D_Show/apps/backend/.env.example).

Variables principales:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`
- `PORT`
- `FRONTEND_URL`

## Conventions de nommage

- Dossiers backend par module metier au pluriel: `companies`, `activities`, `records`
- DTO NestJS suffixes par `Dto`
- Services suffixes par `Service`
- Components React en `PascalCase`
- Hooks frontend prefixes par `use`
- Store global centralise dans `store/app-store.ts`
- IDs techniques en `cuid()` avec Prisma
- Variables d'environnement en `UPPER_SNAKE_CASE`
- Codes activites courts et uniques par entreprise, exemple `RESTO`, `SHOP`

## Scripts npm principaux

### Racine

- `npm install`
- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

### Frontend

- `npm run dev --workspace frontend`
- `npm run build --workspace frontend`

### Backend

- `npm run start:dev --workspace backend`
- `npm run prisma:generate --workspace apps/backend`
- `npm run prisma:migrate --workspace apps/backend`
- `npm run prisma:seed --workspace apps/backend`

## Installation technique

### 1. Base de donnees MySQL

```bash
docker compose up -d
```

### 2. Variables d'environnement

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

Sous PowerShell, remplacer `cp` par `Copy-Item`.

### 3. Dependances

```bash
npm install
```

### 4. Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Lancer la plateforme

```bash
npm run dev
```

Acces:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000/api](http://localhost:4000/api)
- Health API: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- Health frontend route: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Compte seed initial:

- Email: `admin@dshow.app`
- Mot de passe: `Admin123!`

## Proposition UI/UX

### Dashboard admin

- Sidebar gauche persistante
- Header superieur avec utilisateur connecte, entreprise active, activite active
- Cartes KPI en haut
- Cartes d'activites par domaine
- Tableau operationnel central avec recherche, pagination, filtres et CTA
- Modale de creation rapide de saisie

### Codes couleur statuts

- `FREE`: gris
- `OCCUPIED`: ambre
- `RESERVED`: bleu
- `PAID`: vert
- `UNPAID`: rouge
- `READY`: violet
- `CANCELLED`: gris neutre

### Principes UX

- parcours rapide pour encaissements et prises de commande
- responsive desktop, tablette et mobile
- composants reutilisables pour les futures vues de stock, reservations, caisse et reporting
- base visuelle elegante, claire et premium

## Evolutions conseillees

- module stock par activite
- caisse multi-point avec impression tickets
- gestion des reservations avancees
- permissions fines par role
- audit log et journal de caisse
- API mobile dediee pour .NET MAUI avec versionning `/api/v1`

## Deploiement distant conseille

Pour une URL API publique stable utilisable par:

- le frontend web
- le POS Android
- la future app mobile

une architecture Render complete est maintenant preparee dans:

- [render.yaml](/C:/Users/afric/OneDrive/Documents/D_Show/render.yaml)

Elle cree:

- le frontend web
- l'API NestJS
- MySQL prive

Le guide complet est ici:

- [API_REMOTE_DEPLOY.md](/C:/Users/afric/OneDrive/Documents/D_Show/docs/API_REMOTE_DEPLOY.md)
