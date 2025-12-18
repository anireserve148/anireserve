# 📱 AniReserve Mobile App

Application mobile React Native pour AniReserve.

## 🚀 Installation

```bash
cd mobile-app
npm install
```

## 🏃 Lancer l'application

### Mode Développement

```bash
# Sur iOS (nécessite macOS + Xcode)
npm run ios

# Sur Android (nécessite Android Studio)
npm run android

# Sur Web
npm run web

# Expo Go (sur téléphone)
npm start
# Scan le QR code avec Expo Go app
```

## 📂 Structure

```
mobile-app/
├── app/                    # Écrans (Expo Router)
│   ├── (tabs)/            # Navigation tabs
│   │   ├── index.tsx      # Home (liste pros)
│   │   ├── reservations.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # Layout racine
│   └── index.tsx          # Login
├── components/            # Composants réutilisables
├── services/             # API & Storage
│   ├── api.ts           # Appels API vers backend
│   └── storage.ts       # AsyncStorage
├── types/               # TypeScript types
├── constants/           # Config, couleurs, etc.
└── app.json            # Config Expo
```

## 🔗 Backend

L'app se connecte au backend Next.js :
- **Dev** : `http://localhost:3000`
- **Prod** : `https://anireserve.com`

## ✅ Fonctionnalités Implémentées

- ✅ Login/Logout
- ✅ Liste des professionnels
- ✅ Recherche
- ✅ Réservations
- ✅ Profil utilisateur
- ✅ Navigation tabs

## 🚧 À Faire

- [ ] Détail professionnel
- [ ] Création de réservation
- [ ] Inscription
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Photos de profil

## 📱 Build Production

### iOS
1. Créer un compte Apple Developer ($99/an)
2. Configurer dans Xcode
3. `expo build:ios`

### Android
1. Créer un compte Google Play ($25 une fois)
2. `expo build:android`

## 🎨 Design

Couleurs AniReserve :
- Primary: `#2eb190` (Turquoise)
- Secondary: `#18223b` (Navy)
- Accent: `#FFBD59` (Gold)
