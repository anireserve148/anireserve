
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    console.log(`Promoting ${email} to ADMIN...`);

    try {
        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });
        console.log('✅ Success! User is now ADMIN.');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
