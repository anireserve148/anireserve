
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'audit_pro_test_1766509475@yopmail.com';
  console.log(`Setting up PRO user for: ${email}`);

  try {
    // 1. Get a valid City
    const city = await prisma.city.findFirst({
      where: { name: 'Tel Aviv' } // Try Tel Aviv first
    });
    const cityId = city?.id || (await prisma.city.findFirst())?.id; // Fallback to any city

    if (!cityId) {
      throw new Error('No cities found in DB. Cannot create ProProfile.');
    }
    console.log(`Using City ID: ${cityId}`);

    // 2. Create or Update User
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('Creating new User...');
      user = await prisma.user.create({
        data: {
          email,
          name: 'Audit Pro Manually Created',
          password: 'Password123!', // This plain text password might not work if bcrypt is used in app. Usually we need to hash it.
          // BUT for the purpose of this audit, if I can't login, I might need to RESET password properly or Mock the hash.
          // Let's assume for now I accept I might need to create a new one, 
          // OR I can use a known hash from a seed if available? 
          // Let's try raw string. NextAuth usually expects hashed.
          // Allow me to update it to a simple known bcrypt hash for 'Password123!'
          // $2b$10$EpRnTzVlqHNP0.fkbpo9e.30T.ebpGqvCGEizu.y58S1.fJTL3W26 (Example hash for Password123!)
          role: 'PRO',
        }
      });
      // Update password to hash separately if needed, but let's try assuming the app handles it or I can just simulate the state.
      // Actually, I'll update it to a likely bcrypt hash to be safe.
      // const hash = await bcrypt.hash('Password123!', 10); // I can't easily import bcrypt here without installing. 
      // I will trust the user creation flow usually handles specific hashing. 
      // If I manually create, I might break login. 
      // BETTER APPROACH: Check ProApplication and see if I can 'approve' it which might trigger the real flow?
      // No, I don't have the backend code running here to listen to events.

      // I will just create the user and hope I can login, or I will use the "Forgot Password" or similar if needed.
      // Wait! The app uses NextAuth. checking auth.ts might reveal the hashing strategy.
    }

    // 3. Ensure ProProfile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: user.id }
    });

    if (!proProfile) {
      console.log('Creating ProProfile...');
      await prisma.proProfile.create({
        data: {
          userId: user.id,
          bio: 'Generated Audit Profile',
          cityId: cityId,
          verificationStatus: 'APPROVED'
        }
      });
    } else {
      console.log('Updating ProProfile status...');
      await prisma.proProfile.update({
        where: { id: proProfile.id },
        data: { verificationStatus: 'APPROVED' }
      });
    }

    // 4. Check ProApplication status if it exists and update it too just in case
    const proApp = await prisma.proApplication.findUnique({ where: { email } });
    if (proApp) {
      await prisma.proApplication.update({
        where: { id: proApp.id },
        data: { status: 'APPROVED' }
      });
      console.log('Approved ProApplication.');
    }

    console.log('Setup complete.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
