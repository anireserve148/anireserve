-- ============================================
-- CONVERSATIONS ET MESSAGES DE TEST
-- ============================================
-- Créer des conversations réalistes entre clients et pros
-- ============================================

-- 1. CONVERSATION : Client Test <-> Pro Test
INSERT INTO "Conversation" (id, "clientId", "proId", "lastMessageAt", "createdAt")
VALUES (
  'conv-test-1',
  'u-client-test',
  'pp-test-pro',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT ("clientId", "proId") DO UPDATE 
SET "lastMessageAt" = EXCLUDED."lastMessageAt";

-- Messages de cette conversation
INSERT INTO "Message" (id, "conversationId", "senderId", content, "isRead", "createdAt")
VALUES 
  -- Message 1 : Client demande info
  (
    gen_random_uuid(),
    'conv-test-1',
    'u-client-test',
    'Bonjour ! Je cherche un professionnel pour un service de beauté. Êtes-vous disponible cette semaine ?',
    true,
    NOW() - INTERVAL '3 days'
  ),
  
  -- Message 2 : Pro répond
  (
    gen_random_uuid(),
    'conv-test-1',
    'u-pro-test',
    'Bonjour Sophie ! Oui bien sûr, je suis disponible. Quel jour vous conviendrait le mieux ?',
    true,
    NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'
  ),
  
  -- Message 3 : Client propose date
  (
    gen_random_uuid(),
    'conv-test-1',
    'u-client-test',
    'Mercredi après-midi serait parfait pour moi, vers 14h si possible ?',
    true,
    NOW() - INTERVAL '2 days'
  ),
  
  -- Message 4 : Pro confirme
  (
    gen_random_uuid(),
    'conv-test-1',
    'u-pro-test',
    'Parfait ! Mercredi 14h c''est noté. Je vous envoie une demande de réservation. À bientôt ! 😊',
    true,
    NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
  ),
  
  -- Message 5 : Client remercie (récent, non lu par le pro)
  (
    gen_random_uuid(),
    'conv-test-1',
    'u-client-test',
    'Super, merci beaucoup ! J''ai hâte 🙏',
    false,
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. CRÉER UN DEUXIÈME CLIENT POUR PLUS DE CONVERSATIONS
-- ============================================

INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'u-client-2',
  'marie@test.com',
  'Marie Dupont',
  '$2b$10$.9YU//x.1zgRZuL/xHwkmuv0dVuvfqJjS.w0QDcWg1r00h/kbBTcq',
  'CLIENT',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Conversation 2 : Marie <-> Pro Test
INSERT INTO "Conversation" (id, "clientId", "proId", "lastMessageAt", "createdAt")
VALUES (
  'conv-test-2',
  'u-client-2',
  'pp-test-pro',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT ("clientId", "proId") DO UPDATE 
SET "lastMessageAt" = EXCLUDED."lastMessageAt";

-- Messages conversation 2
INSERT INTO "Message" (id, "conversationId", "senderId", content, "isRead", "createdAt")
VALUES 
  -- Message 1
  (
    gen_random_uuid(),
    'conv-test-2',
    'u-client-2',
    'Bonjour, je viens de m''installer en Israël et je cherche un bon professionnel francophone. Vous avez de bons avis !',
    true,
    NOW() - INTERVAL '5 days'
  ),
  
  -- Message 2
  (
    gen_random_uuid(),
    'conv-test-2',
    'u-pro-test',
    'Bienvenue en Israël Marie ! 🇮🇱 Merci pour votre confiance. Je serais ravi de vous aider. Vous cherchez quel type de service ?',
    true,
    NOW() - INTERVAL '5 days' + INTERVAL '1 hour'
  ),
  
  -- Message 3
  (
    gen_random_uuid(),
    'conv-test-2',
    'u-client-2',
    'J''aurais besoin d''un soin complet. Vous êtes à Tel Aviv ?',
    true,
    NOW() - INTERVAL '4 days'
  ),
  
  -- Message 4
  (
    gen_random_uuid(),
    'conv-test-2',
    'u-pro-test',
    'Oui exactement, je suis basé à Tel Aviv centre. Je peux vous proposer un rendez-vous la semaine prochaine si vous voulez ?',
    false,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  'Conversations créées' as info, 
  COUNT(*) as count 
FROM "Conversation"
UNION ALL
SELECT 
  'Messages créés', 
  COUNT(*) 
FROM "Message"
UNION ALL
SELECT 
  'Clients créés', 
  COUNT(*) 
FROM "User" 
WHERE role = 'CLIENT';
