-- ============================================
-- SCRIPT COMPLET : Données de Test AniReserve
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. NETTOYAGE (Optionnel - Décommenter si besoin)
-- DELETE FROM "Reservation";
-- DELETE FROM "ProProfile";
-- DELETE FROM "User" WHERE email LIKE '%test.com';
-- DELETE FROM "City";
-- DELETE FROM "ServiceCategory";

-- ============================================
-- 2. CRÉER LES VILLES
-- ============================================

INSERT INTO "City" (id, name, zip, region)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'Tel Aviv', '61000', 'Centre'),
  ('c2222222-2222-2222-2222-222222222222', 'Jérusalem', '91000', 'Jérusalem'),
  ('c3333333-3333-3333-3333-333333333333', 'Haifa', '31000', 'Nord'),
  ('c4444444-4444-4444-4444-444444444444', 'Beer Sheva', '84100', 'Sud'),
  ('c5555555-5555-5555-5555-555555555555', 'Netanya', '42000', 'Centre'),
  ('c6666666-6666-6666-6666-666666666666', 'Ashdod', '77000', 'Sud'),
  ('c7777777-7777-7777-7777-777777777777', 'Rishon LeZion', '75100', 'Centre')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. CRÉER LES CATÉGORIES
-- ============================================

INSERT INTO "ServiceCategory" (id, name, icon, "parentId")
VALUES 
  ('cat11111-1111-1111-1111-111111111111', 'Beauté & Bien-être', '💆', NULL),
  ('cat22222-2222-2222-2222-222222222222', 'Santé', '🏥', NULL),
  ('cat33333-3333-3333-3333-333333333333', 'Maison & Jardin', '🏡', NULL),
  ('cat44444-4444-4444-4444-444444444444', 'Éducation', '📚', NULL),
  ('cat55555-5555-5555-5555-555555555555', 'Événements', '🎉', NULL),
  ('cat66666-6666-6666-6666-666666666666', 'Technologie', '💻', NULL),
  ('cat77777-7777-7777-7777-777777777777', 'Sport & Fitness', '🏋️', NULL),
  ('cat88888-8888-8888-8888-888888888888', 'Animaux', '🐕', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CRÉER LES UTILISATEURS DE TEST
-- ============================================
-- Hash bcrypt pour "password123": $2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq

-- Client
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'u-client-1111-1111-1111-111111111111',
  'client@test.com',
  'Sophie Martin',
  '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq',
  'CLIENT',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Pro
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'u-pro-1111-1111-1111-111111111111',
  'pro@test.com',
  'David Cohen',
  '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq',
  'PRO',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Admin
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'u-admin-1111-1111-1111-111111111111',
  'admin@test.com',
  'Admin AniReserve',
  '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 5. CRÉER DES PROS SUPPLÉMENTAIRES
-- ============================================

INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES 
  ('u-pro-2222-2222-2222-222222222222', 'sarah.levy@test.com', 'Sarah Levy', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'PRO', NOW(), NOW()),
  ('u-pro-3333-3333-3333-333333333333', 'michael.ben@test.com', 'Michael Ben David', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'PRO', NOW(), NOW()),
  ('u-pro-4444-4444-4444-444444444444', 'rachel.cohen@test.com', 'Rachel Cohen', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'PRO', NOW(), NOW()),
  ('u-pro-5555-5555-5555-555555555555', 'yoni.israeli@test.com', 'Yoni Israeli', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'PRO', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 6. CRÉER LES PROFILS PRO
-- ============================================

INSERT INTO "ProProfile" (id, "userId", bio, "hourlyRate", "cityId", "verificationStatus", "createdAt", "updatedAt")
VALUES 
  (
    'pp-1111-1111-1111-111111111111',
    'u-pro-1111-1111-1111-111111111111',
    'Professionnel expérimenté avec 10 ans d''expérience. Spécialisé dans les services de qualité pour la communauté francophone en Israël.',
    80,
    'c1111111-1111-1111-1111-111111111111',
    'VERIFIED',
    NOW(),
    NOW()
  ),
  (
    'pp-2222-2222-2222-222222222222',
    'u-pro-2222-2222-2222-222222222222',
    'Esthéticienne diplômée, 8 ans d''expérience. Spécialiste soins du visage et manucure.',
    60,
    'c1111111-1111-1111-1111-111111111111',
    'VERIFIED',
    NOW(),
    NOW()
  ),
  (
    'pp-3333-3333-3333-333333333333',
    'u-pro-3333-3333-3333-333333333333',
    'Coach sportif certifié. Programmes personnalisés pour tous niveaux.',
    70,
    'c2222222-2222-2222-2222-222222222222',
    'VERIFIED',
    NOW(),
    NOW()
  ),
  (
    'pp-4444-4444-4444-444444444444',
    'u-pro-4444-4444-4444-444444444444',
    'Professeur particulier de français et mathématiques. 15 ans d''expérience.',
    50,
    'c3333333-3333-3333-3333-333333333333',
    'VERIFIED',
    NOW(),
    NOW()
  ),
  (
    'pp-5555-5555-5555-555555555555',
    'u-pro-5555-5555-5555-555555555555',
    'Développeur web freelance. Création de sites modernes et applications.',
    100,
    'c1111111-1111-1111-1111-111111111111',
    'VERIFIED',
    NOW(),
    NOW()
  )
ON CONFLICT ("userId") DO NOTHING;

-- ============================================
-- 7. LIER LES PROS AUX CATÉGORIES
-- ============================================

INSERT INTO "_ProProfileToServiceCategory" ("A", "B")
VALUES 
  ('pp-1111-1111-1111-111111111111', 'cat11111-1111-1111-1111-111111111111'),
  ('pp-2222-2222-2222-222222222222', 'cat11111-1111-1111-1111-111111111111'),
  ('pp-3333-3333-3333-333333333333', 'cat77777-7777-7777-7777-777777777777'),
  ('pp-4444-4444-4444-444444444444', 'cat44444-4444-4444-4444-444444444444'),
  ('pp-5555-5555-5555-555555555555', 'cat66666-6666-6666-6666-666666666666')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. CRÉER DES DISPONIBILITÉS (AVAILABILITY)
-- ============================================

INSERT INTO "Availability" (id, "proId", "dayOfWeek", "startTime", "endTime", "createdAt", "updatedAt")
VALUES 
  -- Pro 1 (Lundi à Vendredi, 9h-17h)
  (gen_random_uuid(), 'pp-1111-1111-1111-111111111111', 1, '09:00', '17:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-1111-1111-1111-111111111111', 2, '09:00', '17:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-1111-1111-1111-111111111111', 3, '09:00', '17:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-1111-1111-1111-111111111111', 4, '09:00', '17:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-1111-1111-1111-111111111111', 5, '09:00', '17:00', NOW(), NOW()),
  
  -- Pro 2 (Mardi à Samedi, 10h-18h)
  (gen_random_uuid(), 'pp-2222-2222-2222-222222222222', 2, '10:00', '18:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-2222-2222-2222-222222222222', 3, '10:00', '18:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-2222-2222-2222-222222222222', 4, '10:00', '18:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-2222-2222-2222-222222222222', 5, '10:00', '18:00', NOW(), NOW()),
  (gen_random_uuid(), 'pp-2222-2222-2222-222222222222', 6, '10:00', '18:00', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. CRÉER DES RÉSERVATIONS DE TEST
-- ============================================

INSERT INTO "Reservation" (id, "clientId", "proId", "startDate", "endDate", "totalPrice", status, "createdAt", "updatedAt")
VALUES 
  (
    gen_random_uuid(),
    'u-client-1111-1111-1111-111111111111',
    'pp-1111-1111-1111-111111111111',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
    80,
    'PENDING',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'u-client-1111-1111-1111-111111111111',
    'pp-2222-2222-2222-222222222222',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '1 hour',
    60,
    'CONFIRMED',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- ✅ SCRIPT TERMINÉ
-- ============================================

-- Vérification
SELECT 'Villes créées:' as info, COUNT(*) as count FROM "City"
UNION ALL
SELECT 'Catégories créées:', COUNT(*) FROM "ServiceCategory"
UNION ALL
SELECT 'Utilisateurs créés:', COUNT(*) FROM "User"
UNION ALL
SELECT 'Profils Pro créés:', COUNT(*) FROM "ProProfile"
UNION ALL
SELECT 'Réservations créées:', COUNT(*) FROM "Reservation";
