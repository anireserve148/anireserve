-- Script SQL pour créer les utilisateurs de test dans Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Générer un UUID pour chaque utilisateur
-- 2. Hash bcrypt du mot de passe "password123": $2a$10$rOZvkjhIK5AtQRgC5L5z1.xKJ4yqVQx7RqF8mN3pL5zK4yqVQx7Rq

-- CLIENT
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'client@test.com',
  'Test Client',
  '$2a$10$rOZvkjhIK5AtQRgC5L5z1.xKJ4yqVQx7RqF8mN3pL5zK4yqVQx7Rq',
  'CLIENT',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- PRO
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'pro@test.com',
  'Test Pro',
  '$2a$10$rOZvkjhIK5AtQRgC5L5z1.xKJ4yqVQx7RqF8mN3pL5zK4yqVQx7Rq',
  'PRO',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ADMIN
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  'Admin',
  '$2a$10$rOZvkjhIK5AtQRgC5L5z1.xKJ4yqVQx7RqF8mN3pL5zK4yqVQx7Rq',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Créer le profil Pro (nécessaire pour le dashboard pro)
INSERT INTO "ProProfile" (id, "userId", bio, "hourlyRate", "cityId", "verificationStatus", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Professionnel de test avec 10 ans d''expérience',
  50,
  (SELECT id FROM "City" LIMIT 1),
  'VERIFIED',
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'pro@test.com'
ON CONFLICT ("userId") DO NOTHING;

-- Vérifier que les utilisateurs ont été créés
SELECT email, name, role FROM "User" WHERE email IN ('client@test.com', 'pro@test.com', 'admin@test.com');
