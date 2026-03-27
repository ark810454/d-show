# API distante D_Show

## Recommandation

Pour `D_Show`, une cible fiable est `Render`, pour trois raisons:

- le backend est un vrai serveur NestJS
- l'application utilise `Socket.IO`
- Prisma a besoin d'une base MySQL durable

Le projet contient maintenant un blueprint Render complet dans [render.yaml](/C:/Users/afric/OneDrive/Documents/D_Show/render.yaml).

## Ce qui est prepare

- image Docker backend: [apps/backend/Dockerfile](/C:/Users/afric/OneDrive/Documents/D_Show/apps/backend/Dockerfile)
- script de demarrage Render: [apps/backend/scripts/start-render.sh](/C:/Users/afric/OneDrive/Documents/D_Show/apps/backend/scripts/start-render.sh)
- exclusions Docker: [/.dockerignore](/C:/Users/afric/OneDrive/Documents/D_Show/.dockerignore)
- env backend de prod: [apps/backend/.env.example](/C:/Users/afric/OneDrive/Documents/D_Show/apps/backend/.env.example)
- blueprint infra: [render.yaml](/C:/Users/afric/OneDrive/Documents/D_Show/render.yaml)

Le conteneur:

1. installe les dependances du monorepo
2. build `packages/shared`
3. genere Prisma
4. build le backend NestJS
5. applique `prisma migrate deploy`
6. demarre `node dist/main.js`

## Variables a definir sur le serveur

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL=15m`
- `JWT_REFRESH_TTL=7d`
- `HOST=0.0.0.0`
- `PORT=4000`
- `FRONTEND_URLS=https://votre-frontend.vercel.app,https://votre-domaine.com`

Pour le mobile natif, CORS n'est pas bloquant, mais le backend doit rester accessible publiquement en HTTPS.

## Deploiement conseille sur Render

### 1. Pousser le projet sur GitHub

Le plus simple est de deployer depuis un depot GitHub.

### 2. Creer un Blueprint Render

Dans Render:

1. ouvrir `New > Blueprint`
2. connecter le repo GitHub `D_Show`
3. choisir la branche principale
4. laisser `render.yaml` a la racine

Le blueprint va creer:

- `dshow-mysql`
- `dshow-api`
- `dshow-web`

### 3. Renseigner les variables demandees

Render vous demandera au minimum:

- `FRONTEND_URLS` pour `dshow-api`
- `NEXT_PUBLIC_API_URL` pour `dshow-web`

Au premier passage, vous pouvez mettre temporairement:

```text
FRONTEND_URLS=https://dshow-web.onrender.com
NEXT_PUBLIC_API_URL=https://dshow-api.onrender.com/api
```

Puis remplacer par les vraies URLs Render apres creation des services.

### 4. URL publique obtenue

Render donnera des URLs du type:

- `https://dshow-api.onrender.com`
- `https://dshow-web.onrender.com`

L'API publique unique sera donc:

```env
NEXT_PUBLIC_API_URL=https://dshow-api.onrender.com/api
```

### 5. Rebrancher le POS mobile

Dans l'application mobile POS, l'URL API a enregistrer sera:

```text
https://dshow-api.onrender.com/api
```

### 6. Base de donnees

La base MySQL sera desormais hebergee sur Render comme service prive, accessible par le backend via le reseau interne Render.

## Verification apres deploiement

Verifier:

- `https://votre-api/api/health`
- login web
- login POS
- websocket Socket.IO
- connexion Prisma a MySQL
