
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@anireserve.com';
    console.log(`Checking admin user ${email}...`);

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found. Creating admin user...');
        // Password hash for 'password123' (bcrypt)
        const passwordHash = '$2a$10$YourHashHere...'; // Ideally use bcrypt.hash but for recovery we might need a known hash or reset. 
        // actually for simplicity let's just update if exists, or warn if not. 
        // If I can't import bcrypt easily here without require issues, I'll assume seed ran.
        console.log('❌ Admin user DOES NOT EXIST. Please run seed or register.');
    } else {
        console.log(`User found. Role: ${user.role}`);
        if (user.role !== 'ADMIN') {
            console.log('Promoting to ADMIN...');
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log('✅ Promoted to ADMIN.');
        } else {
            console.log('✅ User is already ADMIN.');
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
