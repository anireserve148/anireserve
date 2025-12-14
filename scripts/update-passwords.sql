-- Mettre à jour les mots de passe avec le nouveau hash
-- Mot de passe: password123

UPDATE "User" 
SET password = '$2b$10$Rj4AqQBivlT2oRV5LeBbbenuPBK/TRudnr9jwPhnsMDPY4R5G6hJu'
WHERE email IN ('client@test.com', 'pro@test.com', 'admin@test.com');

-- Vérifier que les utilisateurs existent
SELECT email, name, role FROM "User" 
WHERE email IN ('client@test.com', 'pro@test.com', 'admin@test.com');
