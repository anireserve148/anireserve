# 🎨 Design System AniReserve

> **Mission** : Garantir une expérience visuelle cohérente entre le Web et l'App Mobile

---

## 📋 Résumé Exécutif

**Problème identifié** : Le site Web et l'application mobile utilisent des couleurs légèrement différentes, créant une incohérence visuelle.

**Impact** : Confusion utilisateur, dilution de l'identité de marque.

**Solution** : Adopter UNE palette unique documentée dans ce fichier.

---

## 🎨 Palette de Couleurs Unifiée

### ⚠️ Incohérences Actuelles

| Couleur | Web (`globals.css`) | Mobile (`constants/index.ts`) | Décision |
|---------|---------------------|-------------------------------|----------|
| **Primary (Turquoise)** | `#2eb190` ✅ | `#2EB190` ✅ | **Identique** |
| **Secondary (Navy)** | `#18223b` | `#1E3A5F` ❌ | **⚠️ CHOISIR** |
| **Accent (Gold)** | `#FFBD59` | `#F4D03F` ❌ | **⚠️ CHOISIR** |

### 🎯 Palette Officielle (À Adopter Partout)

```css
/* Couleurs de Marque */
--primary: #2EB190;        /* Turquoise - Boutons, liens, accents */
--secondary: #18223b;      /* Navy - Textes forts, navigation */
--accent: #FFBD59;         /* Gold - Badges, promotions */

/* Neutres */
--white: #FFFFFF;
--black: #1A1A1A;
--background: #F5F7FA;
--card: #FFFFFF;

/* Gris */
--gray-50: #F8FAFC;
--gray-100: #E2E8F0;
--gray-400: #94A3B8;
--gray-600: #475569;
--gray-800: #1E293B;

/* États */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;
```

**📝 Justification du choix** :
- **Navy Web (`#18223b`)** : Plus professionnel, meilleur contraste avec le blanc
- **Gold Web (`#FFBD59`)** : Plus chaud, correspond mieux au logo

---

## 🔤 Typographie

### Police Système

**Web** : `SF Pro Display, Inter, system-ui, sans-serif`  
**Mobile** : `System` (SF Pro sur iOS, Roboto sur Android)

✅ **Cohérent** - Les deux utilisent la police native de l'OS

### Échelle Typographique

| Nom | Taille | Usage | Poids |
|-----|--------|-------|-------|
| **Display** | `32px` | Titres de page | 700 |
| **Heading 1** | `24px` | Titres de section | 700 |
| **Heading 2** | `20px` | Sous-titres | 600 |
| **Body** | `16px` | Texte principal | 400 |
| **Small** | `14px` | Texte secondaire | 400 |
| **Caption** | `12px` | Labels, timestamps | 500 |

---

## 📐 Espacements (Système 8px)

```css
--spacing-1: 4px;   /* xs */
--spacing-2: 8px;   /* sm */
--spacing-3: 12px;  /* md */
--spacing-4: 16px;  /* lg */
--spacing-6: 24px;  /* xl */
--spacing-8: 32px;  /* 2xl */
--spacing-12: 48px; /* 3xl */
```

✅ **Cohérent** - Identique sur Web et Mobile

---

## 🧩 Composants Standards

### Boutons

#### Primaire
```css
background: #2EB190;
color: #FFFFFF;
padding: 12px 24px;
border-radius: 12px;
font-weight: 600;
```

#### Secondaire (Outline)
```css
background: transparent;
border: 2px solid #2EB190;
color: #2EB190;
padding: 12px 24px;
border-radius: 12px;
font-weight: 600;
```

### Cards

```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 16px;
padding: 16px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
```

### Inputs

```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;

/* Focus State */
border-color: #2EB190;
box-shadow: 0 0 0 3px rgba(46, 177, 144, 0.1);
```

---

## 🌟 Ombres

```css
/* Small - Hover léger */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium - Cards */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);

/* Large - Modals */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
```

---

## ✅ Règles de Cohérence

### 1. Nomenclature Unifiée

| ❌ Éviter | ✅ Utiliser |
|-----------|-------------|
| "S'inscrire" / "Créer compte" | **"Créer un compte"** |
| "Réserver" / "Prendre RDV" | **"Réserver"** |
| "Pro" / "Professionnel" | **"Pro"** |

### 2. Iconographie

- **Bibliothèque** : Lucide Icons (Web) / Feather Icons (Mobile)
- **Taille par défaut** : 20px
- **Couleur** : Hérite du texte parent

### 3. États Interactifs

```css
/* Hover */
opacity: 0.9;
transform: translateY(-1px);

/* Active */
transform: translateY(0);
opacity: 1;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

---

## 🚀 Plan d'Action (Priorisation)

### 🔴 Priorité HAUTE (Cette Semaine)

- [ ] **Décision** : Valider le Navy `#18223b` et Gold `#FFBD59`
- [ ] Mettre à jour `mobile-app/constants/index.ts` :
  ```typescript
  secondary: '#18223b',  // était #1E3A5F
  accent: '#FFBD59',     // était #F4D03F
  ```
- [ ] Rebuild l'app mobile avec les nouvelles couleurs
- [ ] Tester visuellement sur iOS/Android

### 🟡 Priorité MOYENNE (Ce Mois)

- [ ] Uniformiser le wording (voir tableau Nomenclature)
- [ ] Créer un composant `Button` partagé (API commune)
- [ ] Documenter les flows utilisateurs (nombre d'étapes identiques)

### 🟢 Priorité BASSE (Futur)

- [ ] Extraire les couleurs dans un fichier `colors.ts` commun
- [ ] Créer un Storybook/Figma avec tous les composants
- [ ] Tests visuels automatisés (Percy, Chromatic)

---

## 📸 Audit Visuel (Fait le 11/01/2026)

### Résultats

| Composant | Web | Mobile | Statut |
|-----------|-----|--------|--------|
| Bouton CTA | Turquoise ✅ | Turquoise ✅ | Identique |
| Navbar | Navy `#18223b` | Navy `#1E3A5F` | ❌ Différent |
| Badge Gold | `#FFBD59` | `#F4D03F` | ❌ Différent |
| Cards | Blanc + ombre | Blanc + ombre | ✅ Identique |
| Espacements | 8px system | 8px system | ✅ Identique |

---

## 💡 Bonnes Pratiques

1. **Avant d'ajouter une couleur** : Vérifier si elle existe dans ce document
2. **Avant de nommer un élément** : Consulter la section Nomenclature
3. **Après chaque feature** : Vérifier la cohérence Web ↔ Mobile

---

**Version** : 1.0  
**Date** : 11 janvier 2026  
**Auteur** : Équipe AniReserve
