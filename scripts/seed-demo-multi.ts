import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    console.log('--- Starting Seeding ---')

    // 1. Categories & Cities
    const catCoiffure = await prisma.serviceCategory.upsert({
        where: { name: 'Coiffure' },
        update: {},
        create: { name: 'Coiffure', icon: 'Scissors' }
    })
    const catBarbe = await prisma.serviceCategory.upsert({
        where: { name: 'Barbe' },
        update: {},
        create: { name: 'Barbe', icon: 'User' }
    })
    const catSoin = await prisma.serviceCategory.upsert({
        where: { name: 'Soin' },
        update: {},
        create: { name: 'Soin', icon: 'Sparkles' }
    })

    // Get first available city or create one
    let city = await prisma.city.findFirst()
    if (!city) {
        city = await prisma.city.create({
            data: { name: 'Tel Aviv', zip: '61000', region: 'Centre' }
        })
    }

    // 2. Pro with multiple services
    const proEmail = 'jean.multi@example.com'
    const proUser = await prisma.user.upsert({
        where: { email: proEmail },
        update: { role: 'PRO' },
        create: {
            email: proEmail,
            name: 'Jean Multi-Services',
            password,
            role: 'PRO',
            image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400'
        }
    })

    const proProfile = await prisma.proProfile.upsert({
        where: { userId: proUser.id },
        update: {},
        create: {
            userId: proUser.id,
            bio: "Expert polyvalent : coiffure, barbe et soins du visage. Venez découvrir mes prestations variées.",
            hourlyRate: 60,
            cityId: city.id,
            verificationStatus: 'APPROVED'
        }
    })

    // Link categories to profile
    await prisma.proProfile.update({
        where: { id: proProfile.id },
        data: {
            serviceCategories: {
                connect: [
                    { id: catCoiffure.id },
                    { id: catBarbe.id },
                    { id: catSoin.id }
                ]
            }
        }
    })

    // Clear old services to avoid duplicates in demo
    await prisma.proService.deleteMany({
        where: { proProfileId: proProfile.id }
    })

    // Add services
    await prisma.proService.createMany({
        data: [
            {
                proProfileId: proProfile.id,
                name: 'Coupe Elegance',
                customPrice: 120,
                duration: 45,
                description: 'Une coupe moderne adaptée à votre visage.',
                categoryId: catCoiffure.id
            },
            {
                proProfileId: proProfile.id,
                name: 'Taille de Barbe VIP',
                customPrice: 60,
                duration: 20,
                description: 'Entretien complet de la barbe avec serviette chaude.',
                categoryId: catBarbe.id
            },
            {
                proProfileId: proProfile.id,
                name: 'Soin Visage Express',
                customPrice: 80,
                duration: 30,
                description: 'Nettoyage et hydratation pour un teint frais.',
                categoryId: catSoin.id
            }
        ]
    })

    // 3. Client
    const clientEmail = 'marie.client@example.com'
    const clientUser = await prisma.user.upsert({
        where: { email: clientEmail },
        update: {},
        create: {
            email: clientEmail,
            name: 'Marie Client',
            password,
            role: 'CLIENT',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
        }
    })

    // 4. Conversation
    const conversation = await prisma.conversation.upsert({
        where: {
            clientId_proId: {
                clientId: clientUser.id,
                proId: proProfile.id
            }
        },
        update: { lastMessageAt: new Date() },
        create: {
            clientId: clientUser.id,
            proId: proProfile.id,
            lastMessageAt: new Date()
        }
    })

    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                senderId: clientUser.id,
                content: "Bonjour Jean, j'aimerais savoir si vous proposez aussi des soins pour enfants ?"
            },
            {
                conversationId: conversation.id,
                senderId: proUser.id,
                content: "Bonjour Marie ! Oui tout à fait, j'ai une prestation 'Coupe Enfant' non listée encore, mais on peut s'arranger."
            },
            {
                conversationId: conversation.id,
                senderId: clientUser.id,
                content: "Super, je vais prendre rendez-vous pour mon mari en attendant !"
            }
        ]
    })

    // 5. Past Reservation & Review
    try {
        const pastRes = await prisma.reservation.create({
            data: {
                clientId: clientUser.id,
                proId: proProfile.id,
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60000),
                status: 'COMPLETED',
                totalPrice: 120,
                serviceName: 'Coupe Elegance'
            }
        })

        await prisma.review.upsert({
            where: { reservationId: pastRes.id },
            update: {},
            create: {
                rating: 5,
                comment: "Superbe expérience, Jean est très professionnel et à l'écoute. Je recommande vivement !",
                reservationId: pastRes.id,
                clientId: clientUser.id,
                proId: proProfile.id
            }
        })
    } catch (err) {
        console.warn('Could not create past reservation or review, skipping...', err)
    }

    console.log('--- Demo data seeded successfully! ---')
    console.log(`Pro: ${proEmail} / password123`)
    console.log(`Client: ${clientEmail} / password123`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
