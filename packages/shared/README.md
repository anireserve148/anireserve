# @anireserve/shared

Code partagé entre les applications AniReserve Client et Pro.

## 📦 Contenu

- **API Client** - Requêtes backend
- **Types** - TypeScript definitions
- **Constants** - Design system (colors, spacing, etc.)
- **Utils** - Fonctions utilitaires

## 🎨 Design System

```typescript
import { Colors, Spacing, BorderRadius } from '@anireserve/shared';
```

## 🔧 API Client

```typescript
import { api } from '@anireserve/shared';

// Login
const response = await api.login(email, password);
api.setToken(response.data.token);

// Get pros
const pros = await api.getPros({ city: 'Paris' });
```

## 📘 Types

```typescript
import type { User, ProProfile, Reservation } from '@anireserve/shared';
```

## 🛠️ Development

```bash
npm install
npm run typecheck
```
