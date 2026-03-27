# POS Mobile Android

## Emplacement du projet

- Projet MAUI Android : [apps/mobile-pos](/C:/Users/afric/OneDrive/Documents/D_Show/apps/mobile-pos)
- Fichier projet : [DShow.PosMobile.csproj](/C:/Users/afric/OneDrive/Documents/D_Show/apps/mobile-pos/DShow.PosMobile.csproj)

## Ce qui est deja implemente

- login mobile avec URL API configurable
- selection entreprise
- selection activite
- hub POS selon l'activite
- POS Restaurant
- POS Terrasse
- POS Boutique / Shop
- file locale de synchronisation offline
- centre de synchronisation
- configuration imprimante Bluetooth
- impression ticket ESC/POS Android
- demande explicite des permissions Bluetooth Android

## Flux actuel

1. Ouvrir l'application
2. Saisir l'URL API NestJS
3. Se connecter
4. Choisir l'entreprise
5. Choisir l'activite
6. Aller dans le module POS
7. Choisir l'imprimante Bluetooth
8. Encaisser et imprimer

## Build Android

Depuis la racine du projet :

```powershell
.\scripts\build-mobile-pos.ps1
```

## Lancer sur un terminal POS Android

### 1. Activer le mode developpeur

- activer `Options developpeur`
- activer `Debogage USB`

### 2. Verifier que le terminal est visible

```powershell
adb devices
```

### 3. Installer l'application en debug

```powershell
.\scripts\install-mobile-pos-android.ps1
```

## Impression Bluetooth

### Prerequis

- appairer l'imprimante thermique dans Android avant ouverture de l'app
- imprimante compatible ESC/POS
- Bluetooth active

### Dans l'application

1. Ouvrir `Impression Bluetooth`
2. Taper `Autoriser le Bluetooth`
3. Rafraichir les imprimantes
4. Choisir l'imprimante appairee
5. Imprimer un ticket test

## URL API

Sur terminal Android physique, utiliser en general l'IP locale du PC qui heberge le backend NestJS :

```text
http://192.168.x.x:4000/api
```

Exemple :

```text
http://192.168.1.50:4000/api
```

Le backend doit autoriser le terminal sur le meme reseau Wi-Fi.

## Ce qu'il reste a brancher ensuite

- client Socket.IO mobile natif pour le vrai temps reel
- scan code-barres / QR
- gestion detaillee des remises et taxes en POS
- reprise automatique des paiements files offline
- tickets plus riches avec logo et formatage avance
- gestion multi-imprimantes par activite
