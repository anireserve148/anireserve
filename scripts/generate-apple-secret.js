// Script pour générer le Apple Client Secret (JWT)
// Exécute avec: node generate-apple-secret.js

const jwt = require('jsonwebtoken');
const fs = require('fs');

// ========= CONFIGURATION =========
// Remplace ces valeurs par les tiennes

const TEAM_ID = '4CCGFJVBG9';           // Ton Apple Team ID
const KEY_ID = '33UBJ3UT98';            // Ton Key ID
const CLIENT_ID = 'com.anireserve.webapp'; // Ton Services ID pour le web
const KEY_FILE = './AuthKey_33UBJ3UT98.p8'; // Chemin vers ton fichier .p8

// ==================================

try {
    const privateKey = fs.readFileSync(KEY_FILE, 'utf8');

    const now = Math.floor(Date.now() / 1000);
    const expiration = now + (86400 * 180); // 6 mois

    const payload = {
        iss: TEAM_ID,
        iat: now,
        exp: expiration,
        aud: 'https://appleid.apple.com',
        sub: CLIENT_ID
    };

    const secret = jwt.sign(payload, privateKey, {
        algorithm: 'ES256',
        header: {
            alg: 'ES256',
            kid: KEY_ID,
            typ: 'JWT'
        }
    });

    console.log('\n========================================');
    console.log('✅ APPLE CLIENT SECRET GÉNÉRÉ !');
    console.log('========================================\n');
    console.log('Ajoute cette variable à ton .env :\n');
    console.log(`APPLE_CLIENT_SECRET=${secret}`);
    console.log('\n========================================');
    console.log(`Expire dans 6 mois`);
    console.log('========================================\n');

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`\n❌ Fichier non trouvé: ${KEY_FILE}`);
        console.error('Place ton fichier .p8 dans ce dossier ou modifie KEY_FILE');
    } else {
        console.error('Erreur:', error.message);
    }
}
