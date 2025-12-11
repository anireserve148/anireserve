import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


const CITIES = [
    { name: 'Tel Aviv', zip: '6100000', region: 'Centre (Gush Dan)' },
    { name: 'Jérusalem', zip: '9100000', region: 'Judée' },
    { name: 'Haïfa', zip: '3100000', region: 'Nord' },
    { name: 'Rishon LeZion', zip: '7500000', region: 'Centre (Gush Dan)' },
    { name: 'Petah Tikva', zip: '4900000', region: 'Centre (Gush Dan)' },
    { name: 'Ashdod', zip: '7700000', region: 'Sud' },
    { name: 'Netanya', zip: '4200000', region: 'Centre (Sharon)' },
    { name: 'Beer Sheva', zip: '8400000', region: 'Sud (Néguev)' },
    { name: 'Holon', zip: '5800000', region: 'Centre (Gush Dan)' },
    { name: 'Ramat Gan', zip: '5200000', region: 'Centre (Gush Dan)' },
    { name: 'Rehovot', zip: '7600000', region: 'Centre' },
    { name: 'Bat Yam', zip: '5900000', region: 'Centre (Gush Dan)' },
    { name: 'Ashkelon', zip: '7800000', region: 'Sud' },
    { name: 'Herzliya', zip: '4600000', region: 'Centre (Sharon)' },
    { name: 'Kfar Saba', zip: '4410000', region: 'Centre (Sharon)' },
    { name: 'Hadera', zip: '3800000', region: 'Nord (Sharon)' },
    { name: 'Modiin', zip: '7170000', region: 'Centre' },
    { name: 'Nazareth', zip: '1610000', region: 'Nord (Galilée)' },
    { name: 'Lod', zip: '7110000', region: 'Centre' },
    { name: 'Raanana', zip: '4390000', region: 'Centre (Sharon)' },
];

const SERVICES = [
    { name: 'Cosplay Maker', icon: 'Scissors' },
    { name: 'Photographer', icon: 'Camera' },
    { name: 'Event Organizer', icon: 'Calendar' },
    { name: 'Makeup Artist', icon: 'Palette' },
    { name: 'Prop Builder', icon: 'Hammer' },
    { name: 'Voice Actor', icon: 'Mic' },
    { name: 'Illustrator', icon: 'PenTool' },
    { name: 'Streamer Support', icon: 'Twitch' },
    { name: 'Merchandiser', icon: 'ShoppingBag' },
    { name: 'Videographer', icon: 'Video' },
];

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Cleaner
    await prisma.review.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.proProfile.deleteMany();
    await prisma.user.deleteMany(); // Cascade deletes are tricky in SQLite without foreign keys sometimes, but ProProfile has Cascade
    await prisma.city.deleteMany();
    await prisma.serviceCategory.deleteMany();

    // 2. Seed Cities
    console.log('📍 Seeding Cities...');
    for (const city of CITIES) {
        await prisma.city.create({ data: city });
    }

    // 3. Seed Services
    console.log('🛠️ Seeding Services...');
    for (const service of SERVICES) {
        await prisma.serviceCategory.create({ data: service });
    }

    // 4. Seed Users (Client & Pro)
    const password = await bcrypt.hash('password123', 10);

    // Client
    await prisma.user.create({
        data: {
            email: 'client@anireserve.com',
            name: 'Alice Client',
            password,
            role: 'CLIENT',
        },
    });

    // Pro
    const telAviv = await prisma.city.findFirst({ where: { name: 'Tel Aviv' } });
    const photoService = await prisma.serviceCategory.findUnique({ where: { name: 'Photographer' } });

    const proUser = await prisma.user.create({
        data: {
            email: 'pro@anireserve.com',
            name: 'David Photographe',
            password,
            role: 'PRO',
        },
    });

    if (telAviv && photoService) {
        await prisma.proProfile.create({
            data: {
                userId: proUser.id,
                bio: 'Photographe professionnel spécialisé dans l\'anime et le cosplay basé à Tel Aviv.',
                cityId: telAviv.id,
                hourlyRate: 150,
                serviceCategories: {
                    connect: { id: photoService.id },
                },
                availability: {
                    create: [
                        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Mon
                        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Wed
                        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Fri
                    ]
                }
            },
        });
    }

    // Create Admin User
    console.log('👑 Creating Admin User...');
    const adminEmail = 'admin@anireserve.com';
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Super Admin',
            password: password, // Using the already hashed 'password' variable
            role: 'ADMIN',
        },
    });

    // Create Reviews for completed reservations
    console.log('⭐ Creating Reviews...');
    // Fetch a pro profile to attach reviews to
    const proUserWithProfile = await prisma.user.findUnique({
        where: { email: 'pro@anireserve.com' },
        include: { proProfile: true }
    });

    const clientUser = await prisma.user.findUnique({ where: { email: 'client@anireserve.com' } });

    if (proUserWithProfile?.proProfile && clientUser) {
        // Create a past reservation that is "COMPLETED"
        const pastReservation = await prisma.reservation.create({
            data: {
                clientId: clientUser.id,
                proId: proUserWithProfile.proProfile.id,
                startDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
                endDate: new Date(Date.now() - 86400000 * 5 + 3600000),
                status: 'COMPLETED',
                totalPrice: 50,
                notes: 'Super séance photo !',
            }
        });

        // Add a review for it
        await prisma.review.create({
            data: {
                rating: 5,
                comment: "Excellent photographe, très professionnel et patient. Je recommande vivement !",
                reservationId: pastReservation.id,
                clientId: clientUser.id,
                proId: proUserWithProfile.proProfile.id
            }
        });

        console.log('✅ Created mock review for Pro.');
    }

    console.log('✅ Seed complete!');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
