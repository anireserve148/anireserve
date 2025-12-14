# 🔑 Identifiants de Test - AniReserve

## Comptes Pré-configurés

### CLIENT
```
Email: client@test.com
Mot de passe: password123
```

### PROFESSIONNEL
```
Email: pro@test.com
Mot de passe: password123
```

### ADMINISTRATEUR
```
Email: admin@test.com
Mot de passe: password123
```

---

## Comment créer ces comptes

### Option 1 : Via Prisma Studio (Recommandé)

```bash
npx prisma studio
```

1. Ouvrir `http://localhost:5555`
2. Aller dans la table `User`
3. Cliquer "Add record"
4. Remplir :
   - `email`: `client@test.com`
   - `name`: `Test Client`
   - `password`: Utiliser un hash bcrypt (voir ci-dessous)
   - `role`: `CLIENT`
5. Répéter pour PRO et ADMIN

### Générer un hash bcrypt

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```

Copier le résultat dans le champ `password`.

---

## Option 2 : Via l'inscription (Plus simple)

1. Aller sur `http://localhost:3000/register`
2. S'inscrire normalement
3. Aller dans Prisma Studio
4. Changer le `role` de `CLIENT` à `PRO` ou `ADMIN`

---

## Tester les Dashboards

### Dashboard Client
```
http://localhost:3000/dashboard/client
```

### Dashboard Pro
```
http://localhost:3000/dashboard/pro
```

### Dashboard Admin
```
http://localhost:3000/dashboard/admin
OU
http://localhost:3000/secret-admin-login
```

---

## Bugs Trouvés à Corriger

1. ❌ Boutons Connexion/Inscription manquants dans header
2. ❌ Erreur 404 sur certaines pages
3. ❌ Sous-titre page d'accueil
4. ❌ Calendrier de réservation
5. ❌ Page inscription (404)

**En cours de correction...**
