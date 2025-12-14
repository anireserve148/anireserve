const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
    console.log('Creating test users...');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hash:', hashedPassword);

    const users = [
        { email: 'client@test.com', name: 'Sophie Martin', role: 'CLIENT' },
        { email: 'pro@test.com', name: 'David Cohen', role: 'PRO' },
        { email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' }
    ];

    for (const user of users) {
        try {
            const existing = await prisma.user.findUnique({
                where: { email: user.email }
            });

            if (existing) {
                // Update password
                await prisma.user.update({
                    where: { email: user.email },
                    data: { password: hashedPassword }
                });
                console.log(`Updated: ${user.email}`);
            } else {
                // Create new user
                await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name,
                        password: hashedPassword,
                        role: user.role
                    }
                });
                console.log(`Created: ${user.email}`);
            }
        } catch (error) {
            console.error(`Error with ${user.email}:`, error.message);
        }
    }

    // Create pro profile if needed
    const proUser = await prisma.user.findUnique({
        where: { email: 'pro@test.com' }
    });

    if (proUser) {
        const existingProfile = await prisma.proProfile.findUnique({
            where: { userId: proUser.id }
        });

        if (!existingProfile) {
            // Get first city
            const city = await prisma.city.findFirst();
            if (city) {
                await prisma.proProfile.create({
                    data: {
                        userId: proUser.id,
                        cityId: city.id,
                        bio: 'Professionnel de test'
                    }
                });
                console.log('Created pro profile');
            }
        }
    }

    console.log('Done!');
    await prisma.$disconnect();
}

createTestUsers().catch(console.error);
