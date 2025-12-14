const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUsers() {
    console.log('🔧 Création des utilisateurs de test...\n')

    // Hash du mot de passe "password123"
    const hashedPassword = await bcrypt.hash('password123', 10)

    try {
        // 1. CLIENT
        const client = await prisma.user.upsert({
            where: { email: 'client@test.com' },
            update: {},
            create: {
                email: 'client@test.com',
                name: 'Test Client',
                password: hashedPassword,
                role: 'CLIENT',
            },
        })
        console.log('✅ CLIENT créé:', client.email)

        // 2. PRO
        const pro = await prisma.user.upsert({
            where: { email: 'pro@test.com' },
            update: {},
            create: {
                email: 'pro@test.com',
                name: 'Test Pro',
                password: hashedPassword,
                role: 'PRO',
            },
        })
        console.log('✅ PRO créé:', pro.email)

        // Créer le profil pro
        const proProfile = await prisma.proProfile.upsert({
            where: { userId: pro.id },
            update: {},
            create: {
                userId: pro.id,
                bio: 'Professionnel de test avec 10 ans d\'expérience',
                hourlyRate: 50,
                cityId: (await prisma.city.findFirst())?.id || '',
                verificationStatus: 'VERIFIED',
            },
        })
        console.log('✅ Profil PRO créé')

        // 3. ADMIN
        const admin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN',
            },
        })
        console.log('✅ ADMIN créé:', admin.email)

        console.log('\n🎉 Tous les utilisateurs de test ont été créés !')
        console.log('\n📝 Identifiants:')
        console.log('CLIENT: client@test.com / password123')
        console.log('PRO: pro@test.com / password123')
        console.log('ADMIN: admin@test.com / password123')
    } catch (error) {
        console.error('❌ Erreur:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTestUsers()
