# AniReserve Mobile

Application mobile native pour iOS et Android.

## Stack Technique

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: React Query + Context
- **Styling**: NativeWind (Tailwind)
- **API**: Axios
- **Auth**: AsyncStorage + JWT

## Installation

```bash
cd mobile
npm install
```

## Développement

```bash
# Démarrer le serveur Expo
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (pour tester rapidement)
npm run web
```

## Structure

```
mobile/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Main app tabs
│   ├── (pro)/             # Pro dashboard
│   └── (admin)/           # Admin dashboard
├── components/            # Reusable components
├── services/              # API calls
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── constants/             # Constants & config
```

## Configuration

Créer un fichier `.env` :

```env
EXPO_PUBLIC_API_URL=https://api.anireserve.com
```

## Build Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Les deux
eas build --platform all
```

## Publication

```bash
# App Store
eas submit --platform ios

# Google Play
eas submit --platform android
```

## Prochaines Étapes

1. [ ] Installer les dépendances
2. [ ] Configurer la navigation
3. [ ] Créer les écrans de base
4. [ ] Intégrer l'API
5. [ ] Tester sur iOS et Android
