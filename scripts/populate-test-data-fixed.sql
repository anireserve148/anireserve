-- ============================================
-- SCRIPT SQL CORRIGÉ - AniReserve
-- ============================================
-- Colonnes corrigées selon le schéma Prisma
-- ============================================

-- 1. VILLES
INSERT INTO "City" (id, name, zip, region)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'Tel Aviv', '61000', 'Centre'),
  ('c2222222-2222-2222-2222-222222222222', 'Jérusalem', '91000', 'Jérusalem'),
  ('c3333333-3333-3333-3333-333333333333', 'Haifa', '31000', 'Nord'),
  ('c4444444-4444-4444-4444-444444444444', 'Beer Sheva', '84100', 'Sud'),
  ('c5555555-5555-5555-5555-555555555555', 'Netanya', '42000', 'Centre')
ON CONFLICT (id) DO NOTHING;

-- 2. CATÉGORIES
INSERT INTO "ServiceCategory" (id, name, icon, "parentId")
VALUES 
  ('cat11111-1111-1111-1111-111111111111', 'Beauté Bien-être', '💆', NULL),
  ('cat22222-2222-2222-2222-222222222222', 'Santé', '🏥', NULL),
  ('cat33333-3333-3333-3333-333333333333', 'Maison Jardin', '🏡', NULL),
  ('cat44444-4444-4444-4444-444444444444', 'Éducation', '📚', NULL),
  ('cat55555-5555-5555-5555-555555555555', 'Événements', '🎉', NULL)
ON CONFLICT (name) DO NOTHING;

-- 3. UTILISATEURS
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES 
  ('u-client-test', 'client@test.com', 'Sophie Martin', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'CLIENT', NOW(), NOW()),
  ('u-pro-test', 'pro@test.com', 'David Cohen', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'PRO', NOW(), NOW()),
  ('u-admin-test', 'admin@test.com', 'Admin AniReserve', '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- 4. PROFIL PRO
INSERT INTO "ProProfile" (id, "userId", bio, "hourlyRate", "cityId", "verificationStatus", "createdAt", "updatedAt")
VALUES (
  'pp-test-pro',
  'u-pro-test',
  'Professionnel expérimenté avec 10 ans d''expérience. Services de qualité pour la communauté francophone en Israël.',
  80,
  'c1111111-1111-1111-1111-111111111111',
  'VERIFIED',
  NOW(),
  NOW()
)
ON CONFLICT ("userId") DO UPDATE SET
  bio = EXCLUDED.bio,
  "hourlyRate" = EXCLUDED."hourlyRate",
  "verificationStatus" = EXCLUDED."verificationStatus";

-- 5. LIER PRO AUX CATÉGORIES
INSERT INTO "_ProProfileToServiceCategory" ("A", "B")
VALUES 
  ('pp-test-pro', 'cat11111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- 6. DISPONIBILITÉS (Lundi à Vendredi, 9h-17h)
INSERT INTO "Availability" (id, "proProfileId", "dayOfWeek", "startTime", "endTime", "isAvailable")
VALUES 
  (gen_random_uuid(), 'pp-test-pro', 1, '09:00', '17:00', true),
  (gen_random_uuid(), 'pp-test-pro', 2, '09:00', '17:00', true),
  (gen_random_uuid(), 'pp-test-pro', 3, '09:00', '17:00', true),
  (gen_random_uuid(), 'pp-test-pro', 4, '09:00', '17:00', true),
  (gen_random_uuid(), 'pp-test-pro', 5, '09:00', '17:00', true)
ON CONFLICT DO NOTHING;

-- 7. RÉSERVATION DE TEST
INSERT INTO "Reservation" (id, "clientId", "proId", "startDate", "endDate", "totalPrice", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'u-client-test',
  'pp-test-pro',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
  80,
  'PENDING',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 
  'Users' as table_name, 
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM "User"
WHERE email LIKE '%test.com'
UNION ALL
SELECT 'Cities', COUNT(*), STRING_AGG(name, ', ') FROM "City"
UNION ALL
SELECT 'Categories', COUNT(*), STRING_AGG(name, ', ') FROM "ServiceCategory"
UNION ALL
SELECT 'ProProfiles', COUNT(*), STRING_AGG(id, ', ') FROM "ProProfile"
UNION ALL
SELECT 'Reservations', COUNT(*), NULL FROM "Reservation";
