const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding demo pros...')

    // Get necessary data
    const cities = await prisma.city.findMany()
    const categories = await prisma.serviceCategory.findMany()

    if (cities.length === 0 || categories.length === 0) {
        console.error('❌ No cities or categories found. Please add them first.')
        return
    }

    const demoPros = [
        {
            name: 'Sarah Cohen',
            email: 'sarah.coach@demo.com',
            phone: '054-123-4567',
            bio: 'Coach de vie certifiée avec 10 ans d\'expérience. Spécialisée dans le développement personnel et la gestion du stress.',
            hourlyRate: 200,
            cityId: cities[0].id,
            categoryIds: [categories[0].id],
            profileImage: 'https://i.pravatar.cc/300?img=47',
            galleryImages: [
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500',
                'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500',
            ]
        },
        {
            name: 'David Levi',
            email: 'david.electricien@demo.com',
            phone: '052-987-6543',
            bio: 'Électricien professionnel agréé. Installation, réparation et maintenance électrique pour particuliers et professionnels.',
            hourlyRate: 150,
            cityId: cities[0].id,
            categoryIds: [categories[1]?.id || categories[0].id],
            profileImage: 'https://i.pravatar.cc/300?img=12',
            galleryImages: [
                'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
                'https://images.unsplash.com/photo-1513828583688-c52646db42e1?w=500',
                'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500',
            ]
        },
        {
            name: 'Rachel Amsalem',
            email: 'rachel.coiffure@demo.com',
            phone: '050-555-7890',
            bio: 'Coiffeuse styliste passionnée. Coupes tendances, colorations et coiffures pour tous les événements.',
            hourlyRate: 120,
            cityId: cities.length > 1 ? cities[1].id : cities[0].id,
            categoryIds: [categories[2]?.id || categories[0].id],
            profileImage: 'https://i.pravatar.cc/300?img=32',
            galleryImages: [
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
                'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500',
                'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
            ]
        },
    ]

    for (const proData of demoPros) {
        try {
            // Create user
            const hashedPassword = await bcrypt.hash('Demo2024!', 10)
            const user = await prisma.user.upsert({
                where: { email: proData.email },
                update: {},
                create: {
                    email: proData.email,
                    name: proData.name,
                    password: hashedPassword,
                    role: 'PRO',
                    image: proData.profileImage,
                }
            })

            // Create pro profile
            const proProfile = await prisma.proProfile.upsert({
                where: { userId: user.id },
                update: {
                    bio: proData.bio,
                    hourlyRate: proData.hourlyRate,
                    cityId: proData.cityId,
                    verificationStatus: 'VERIFIED',
                },
                create: {
                    userId: user.id,
                    bio: proData.bio,
                    hourlyRate: proData.hourlyRate,
                    cityId: proData.cityId,
                    verificationStatus: 'VERIFIED',
                }
            })

            // Link categories
            await prisma.proProfile.update({
                where: { id: proProfile.id },
                data: {
                    serviceCategories: {
                        connect: proData.categoryIds.map(id => ({ id }))
                    }
                }
            })

            // Create gallery images
            for (const imageUrl of proData.galleryImages) {
                await prisma.proProfileGallery.create({
                    data: {
                        proProfileId: proProfile.id,
                        imageUrl,
                    }
                })
            }

            // Create availability (Mon-Fri 9h-18h)
            for (let day = 1; day <= 5; day++) {
                await prisma.proAvailability.upsert({
                    where: {
                        proProfileId_dayOfWeek: {
                            proProfileId: proProfile.id,
                            dayOfWeek: day
                        }
                    },
                    update: {},
                    create: {
                        proProfileId: proProfile.id,
                        dayOfWeek: day,
                        startTime: '09:00',
                        endTime: '18:00',
                        isAvailable: true
                    }
                })
            }

            console.log(`✅ Created pro: ${proData.name}`)
        } catch (error) {
            console.error(`❌ Error creating ${proData.name}:`, error.message)
        }
    }

    console.log('🎉 Demo pros seeded successfully!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
