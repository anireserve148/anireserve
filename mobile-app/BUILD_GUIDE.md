# 🚀 Guide de Build Production - AniReserve Mobile

## Prérequis

1. **Compte Expo** : https://expo.dev/signup
2. **EAS CLI installé** : `npm install -g eas-cli`
3. **Authentification** : `eas login`

## Configuration

### 1. Créer app.json

Si pas déjà fait, créer `/mobile-app/app.json` :

```json
{
  "expo": {
    "name": "AniReserve",
    "slug": "anireserve",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.anireserve.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "com.anireserve.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "VOTRE_PROJECT_ID"
      }
    }
  }
}
```

### 2. Configurer EAS

```bash
cd mobile-app
eas build:configure
```

Cela créera `eas.json` :

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Build iOS

### Développement (Simulateur)
```bash
cd mobile-app
eas build --platform ios --profile development
```

### Production (App Store)
```bash
cd mobile-app
eas build --platform ios --profile production
```

**Note** : Pour iOS, vous aurez besoin :
- Apple Developer Account ($99/an)
- Certificats et provisioning profiles (EAS les gère automatiquement)

## Build Android

### APK pour Tests
```bash
cd mobile-app
eas build --platform android --profile preview
```

### Production (Play Store)
```bash
cd mobile-app
eas build --platform android --profile production
```

## Submission aux Stores

### iOS App Store
```bash
cd mobile-app
eas submit --platform ios
```

### Google Play Store
```bash
cd mobile-app
eas submit --platform android
```

## Testing Local

### Installation sur Device

1. **Télécharger Expo Go** : 
   - iOS: App Store
   - Android: Google Play

2. **Lancer le serveur** :
```bash
cd mobile-app
npm start
```

3. **Scanner le QR Code** avec Expo Go

## Variables d'Environnement

Créer `.env` dans `/mobile-app` :

```
API_URL=https://anireserve.com
```

## Checklist Avant Build

- [x] Toutes les fonctionnalités testées
- [ ] Icônes et splash screen créés
- [ ] Version et buildNumber mis à jour
- [ ] Permissions configurées (camera, notifications)
- [ ] API_URL pointe vers production
- [ ] Tests sur iOS et Android
- [ ] Screenshots pour stores préparés

## Assets Nécessaires

### iOS
- **Icon** : 1024x1024px PNG
- **Splash** : 2732x2732px PNG

### Android
- **Adaptive Icon Foreground** : 1024x1024px PNG (zone safe 432x432px)
- **Splash** : 2732x2732px PNG

## Commandes Utiles

```bash
# Voir les builds
eas build:list

# Télécharger un build
eas build:download --id BUILD_ID

# Version locale de production
npx expo start --no-dev --minify

# Nettoyer cache
npx expo start -c
```

## Troubleshooting

### Erreur "Metro bundler failed"
```bash
cd mobile-app
rm -rf node_modules
npm install
npx expo start -c
```

### Erreur iOS Simulator
```bash
# Réinstaller pods
cd ios
pod install
```

### Build Android trop gros
- Activer Proguard
- Optimiser les images
- Supprimer dépendances inutilisées

## Support

- **Expo Docs** : https://docs.expo.dev
- **EAS Build** : https://docs.expo.dev/build/introduction
- **Forums** : https://forums.expo.dev

---

**Good Luck! 🚀**
