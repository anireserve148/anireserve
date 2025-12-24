
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'audit_pro_test_1766509475@yopmail.com';
    console.log(`Updating password for: ${email}`);

    try {
        const hashedPassword = await bcrypt.hash('Password123!', 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword
            }
        });

        console.log('Password updated to hashed version.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
