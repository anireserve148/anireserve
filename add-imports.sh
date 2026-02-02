#!/bin/bash

# Liste des fichiers à modifier
files=(
  "app/api/mobile/apple-login/route.ts"
  "app/api/mobile/clients/route.ts"
  "app/api/mobile/conversations/[id]/route.ts"
  "app/api/mobile/conversations/route.ts"
  "app/api/mobile/favorites/route.ts"
  "app/api/mobile/google-login/route.ts"
  "app/api/mobile/login/route.ts"
  "app/api/mobile/notifications/route.ts"
  "app/api/mobile/pro-profile/route.ts"
  "app/api/mobile/pro-reservations/route.ts"
  "app/api/mobile/profile/route.ts"
  "app/api/mobile/push-token/route.ts"
  "app/api/mobile/register/route.ts"
  "app/api/mobile/reservations/route.ts"
  "app/api/mobile/reviews/route.ts"
  "app/api/mobile/upload-photo/route.ts"
  "app/api/mobile/pro/reservations/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Vérifier si l'import existe déjà
    if ! grep -q "import { getJWTSecret }" "$file"; then
      # Ajouter l'import après la première ligne d'import
      sed -i '' '1a\
import { getJWTSecret } from '"'"'@/lib/jwt-secret'"'"';
' "$file"
    fi
  fi
done

echo "Imports ajoutés!"
