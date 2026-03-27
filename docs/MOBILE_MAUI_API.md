# API Web + Mobile MAUI

## Objectif

Cette API est preparee pour une consommation web Next.js et mobile .NET MAUI avec un backend central NestJS.

Chaque requete metier doit rester scopee par :

- `Authorization: Bearer <jwt>`
- `x-company-id: <companyId>`
- `x-activity-id: <activityId>` quand le module est lie a une activite

## Conventions REST

- Format JSON UTF-8
- Dates au format ISO 8601
- Pagination standard recommandee :
  - `page`
  - `limit`
  - `q`
  - `from`
  - `to`
- Reponse liste recommandee :

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

- Reponse erreur recommandee :

```json
{
  "statusCode": 400,
  "message": "Message lisible",
  "error": "Bad Request"
}
```

## Authentification mobile

### Login

`POST /api/auth/login`

```json
{
  "email": "admin@dshow.app",
  "password": "Admin123!"
}
```

### Refresh token

`POST /api/auth/refresh`

### Profil courant

`GET /api/auth/me`

Le mobile peut stocker :

- `accessToken`
- `refreshToken`
- `companyId`
- `activityId`

## Flux MAUI recommande

### 1. Login

- ecran email / mot de passe
- recuperer JWT

### 2. Selection entreprise

- `GET /api/companies`
- afficher les entreprises autorisees

### 3. Selection activite

- `GET /api/activities/company/:companyId`
- choisir une activite active

### 4. Ecrans metier

- prise de commande
- consultation stock
- encaissement simple

## Endpoints principaux pour MAUI

### Entreprises / Activites

- `GET /api/companies`
- `POST /api/companies`
- `PATCH /api/companies/:id`
- `GET /api/activities/company/:companyId`
- `POST /api/activities`

### Restaurant

- `GET /api/restaurant/tables`
- `GET /api/restaurant/menu`
- `POST /api/restaurant/orders`
- `GET /api/restaurant/orders`
- `GET /api/restaurant/kitchen`
- `PATCH /api/restaurant/kitchen/:id/status`
- `POST /api/restaurant/payments`

### Terrasse

- `GET /api/terrace/tables`
- `GET /api/terrace/menu`
- `POST /api/terrace/orders`
- `PATCH /api/terrace/orders/:id/status`
- `POST /api/terrace/payments`

### Boite de nuit

- `GET /api/nightclub/dashboard`
- `GET /api/nightclub/events`
- `POST /api/nightclub/tickets`
- `POST /api/nightclub/tickets/validate`
- `GET /api/nightclub/bookings`
- `POST /api/nightclub/bookings`
- `GET /api/nightclub/bottle-orders`

### Shop

- `GET /api/shop/products?q=`
- `GET /api/shop/categories`
- `GET /api/shop/alerts/low-stock`
- `POST /api/shop/sales`
- `GET /api/shop/sales`

### Finance

- `GET /api/finance/dashboard?from=&to=&activityId=&granularity=`
- `GET /api/finance/report?from=&to=&activityId=&granularity=`
- `GET /api/finance/expenses`
- `POST /api/finance/expenses`

## Evenements Socket.IO

Connexion :

- namespace par defaut
- auth possible via `auth.token`
- join de scope via `scope.join`

Payload join :

```json
{
  "companyId": "cmp_123",
  "activityId": "act_456"
}
```

Events generiques :

- `sync.order.created`
- `sync.order.updated`
- `sync.order.ready`
- `sync.payment.validated`
- `sync.stock.updated`
- `sync.ticket.validated`
- `sync.table.updated`
- `sync.reservation.updated`

Events metier existants :

- `restaurant.order.created`
- `restaurant.kitchen.status`
- `restaurant.dish.ready`
- `restaurant.payment.created`
- `restaurant.table.updated`
- `terrace.order.created`
- `terrace.order.status`
- `terrace.payment.created`
- `terrace.table.updated`
- `nightclub.ticket.validated`
- `nightclub.reservation.updated`
- `nightclub.bottle.updated`
- `shop.sale.created`
- `shop.stock.updated`

## Ecrans MAUI a prevoir

### Login

- email
- mot de passe
- refresh silent

### Selection entreprise

- cartes simples
- recherche si volume eleve

### Selection activite

- cartes avec type activite
- memorisation dernier choix

### Prise de commande

- mode tactile
- sync temps reel des commandes
- mode hors ligne futur via file locale

### Consultation stock

- recherche
- alertes stock faible
- lecture code-barres futur

### Encaissement simple

- montant
- mode paiement
- retour succes / echec

## Preparation hors ligne future

Structure recommandee cote mobile :

- file locale des actions a synchroniser
- identifiant local temporaire
- statut local :
  - `PENDING_SYNC`
  - `SYNCED`
  - `CONFLICT`
- replay vers le backend central quand le reseau revient

Le backend reste source de verite et notifie tous les autres clients connectes via Socket.IO.
