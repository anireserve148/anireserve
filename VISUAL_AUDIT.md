# 📊 Audit Visuel - Web vs Mobile

> Analyse comparative détaillée réalisée le 11 janvier 2026

---

## 🎯 Objectif

Identifier **toutes** les incohérences visuelles entre le site Web et l'application mobile pour créer une expérience unifiée.

---

## 🔴 Incohérences Critiques (À Corriger Immédiatement)

### 1. Couleurs de Marque

| Élément | Web | Mobile | Impact | Priorité |
|---------|-----|--------|--------|----------|
| **Navy (Secondary)** | `#18223b` | `#1E3A5F` | Navigation, titres | 🔴 HAUTE |
| **Gold (Accent)** | `#FFBD59` | `#F4D03F` | Badges, promotions | 🔴 HAUTE |
| **Turquoise (Primary)** | `#2EB190` | `#2EB190` | ✅ Identique | - |

**Fix Recommandé** :
```typescript
// mobile-app/constants/index.ts
export const Colors = {
    primary: '#2EB190',    // ✅ Déjà correct
    secondary: '#18223b',  // ❌ Changer de #1E3A5F à #18223b
    accent: '#FFBD59',     // ❌ Changer de #F4D03F à #FFBD59
    // ...
};
```

---

## 🟡 Différences Mineures (À Harmoniser)

### 2. Tailles de Texte

| Composant | Web | Mobile | Recommandation |
|-----------|-----|--------|----------------|
| Bouton CTA | `16px` | `17px` | Adopter `17px` (mobile) |
| Texte corps | `16px` | `15px` | Uniformiser à `16px` |
| Petit texte | `14px` | `13px` | Uniformiser à `14px` |

### 3. Wording / Nomenclature

| Page | Web | Mobile | Fix |
|------|-----|--------|-----|
| Inscription | "S'inscrire" | "Créer un compte" | Adopter "Créer un compte" |
| Réservation | "Réserver" | "Prendre RDV" | Adopter "Réserver" |
| Navigation | "Connexion Pro" | "Pro Login" | Adopter "Connexion Pro" |

---

## ✅ Points de Cohérence (Déjà Alignés)

| Élément | Status |
|---------|--------|
| Turquoise (#2EB190) | ✅ Identique |
| Espacements (système 8px) | ✅ Identique |
| Border Radius des cards (16px) | ✅ Identique |
| Police (système native) | ✅ Identique |
| Ombres des cards | ✅ Comparable |

---

## 🔧 Plan de Correction (Étape par Étape)

### Étape 1 : Corriger les Couleurs (30 min)

```bash
# 1. Modifier le fichier de constantes mobile
nano mobile-app/constants/index.ts

# 2. Changer les valeurs :
# - secondary: '#1E3A5F' → '#18223b'
# - accent: '#F4D03F' → '#FFBD59'

# 3. Restart du dev server
cd mobile-app
npm start -- --reset-cache
```

### Étape 2 : Uniformiser le Wording (1h)

```bash
# Rechercher et remplacer dans mobile-app/
# "S'inscrire" → "Créer un compte"
# "Prendre RDV" → "Réserver"
# "Pro Login" → "Connexion Pro"
```

### Étape 3 : Rebuild et Test (30 min)

```bash
cd mobile-app
eas build --platform ios --profile preview
# Tester visuellement sur TestFlight
```

### Étape 4 : Validation Visuelle

- [ ] Ouvrir le site web sur desktop
- [ ] Ouvrir l'app sur iPhone
- [ ] Comparer côte à côte :
  - [ ] Navbar → Même Navy ?
  - [ ] Boutons CTA → Même Turquoise ?
  - [ ] Badges Gold → Même couleur ?

---

## 📸 Screenshots de Référence

### Homepage Web
![Homepage Web](#)
*À ajouter : Screenshot de anireserve.com*

### Homepage Mobile
![Homepage Mobile](#)
*À ajouter : Screenshot de l'app iOS*

### Comparaison Navbar
![Navbar Comparison](#)
*À ajouter : Side-by-side Web vs Mobile*

---

## 💡 Recommandations Long Terme

1. **Créer un Token System** : Extraire toutes les couleurs dans un fichier `design-tokens.json` importé par Web ET Mobile
2. **Storybook Partagé** : Documenter tous les composants visuellement
3. **Tests Visuels** : Utiliser Percy.io pour détecter les régressions visuelles
4. **Figma Sync** : Maintenir un fichier Figma avec les composants Web et Mobile

---

**Prochaine Action** : Appliquer l'Étape 1 (correction des couleurs) et rebuild l'app mobile.

---

**Version** : 1.0  
**Date** : 11 janvier 2026
