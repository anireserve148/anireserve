# 🚀 AniReserve - Monorepo 2 Apps

Architecture moderne avec 2 applications séparées :
- **AniReserve** (Client) - Pour réserver des services
- **AniReserve Pro** - Pour gérer son activité

## 📦 Structure

```
anireserve/
├── apps/
│   ├── mobile-client/      # App clients
│   └── mobile-pro/          # App pros
├── packages/
│   └── shared/              # Code partagé
├── backend/                 # API (Next.js)
└── web/                     # Site web
```

## 🚀 Démarrage Rapide

### 1. Installer les dépendances

```bash
# Shared package
cd packages/shared && npm install

# App Client
cd ../../apps/mobile-client && npm install

# App Pro
cd ../mobile-pro && npm install
```

### 2. Lancer les apps

**App Client :**
```bash
cd apps/mobile-client
npx expo start
```

**App Pro :**
```bash
cd apps/mobile-pro
npx expo start
```

## 🎨 Design System

Tout dans `packages/shared/src/constants.ts` :

- **Client** : Noir + Vert (#00D9A3)
- **Pro** : Violet (#5B21B6) + Orange (#F59E0B)

## 📱 Build Production

### App Client
```bash
cd apps/mobile-client
eas build --platform ios --profile production
```

### App Pro
```bash
cd apps/mobile-pro
eas build --platform ios --profile production
```

## 📄 Documentation

- [Walkthrough complet](brain/walkthrough.md)
- [Task checklist](brain/task.md)

---

**Made with 💚 & 💜**
