import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TEST_PROS = [
    {
        name: 'Sarah Cohen',
        email: 'sarah.cohen@test.com',
        bio: 'Coiffeuse professionnelle avec 10 ans d\'expérience. Spécialisée en colorations et coupes modernes.',
        hourlyRate: 150,
        city: 'Tel Aviv',
        categories: ['Coiffure']
    },
    {
        name: 'David Levy',
        email: 'david.levy@test.com',
        bio: 'Plombier certifié, intervention rapide 7j/7. Dépannage et installation.',
        hourlyRate: 200,
        city: 'Tel Aviv',
        categories: ['Plomberie']
    },
    {
        name: 'Rachel Ben David',
        email: 'rachel.bd@test.com',
        bio: 'Esthéticienne diplômée. Soins du visage, épilation, manucure/pédicure.',
        hourlyRate: 120,
        city: 'Jérusalem',
        categories: ['Esthétique']
    },
    {
        name: 'Moshe Goldstein',
        email: 'moshe.g@test.com',
        bio: 'Électricien agréé. Installations, dépannages, mise aux normes.',
        hourlyRate: 180,
        city: 'Haïfa',
        categories: ['Électricité']
    },
    {
        name: 'Yael Mizrahi',
        email: 'yael.m@test.com',
        bio: 'Professeur de yoga et méditation. Cours particuliers et en groupe.',
        hourlyRate: 100,
        city: 'Tel Aviv',
        categories: ['Sport & Bien-être']
    },
    {
        name: 'Avi Shapira',
        email: 'avi.s@test.com',
        bio: 'Photographe professionnel. Mariages, événements, portraits.',
        hourlyRate: 300,
        city: 'Tel Aviv',
        categories: ['Photographie']
    },
    {
        name: 'Noa Peretz',
        email: 'noa.p@test.com',
        bio: 'Coach en développement personnel. Accompagnement vie pro et perso.',
        hourlyRate: 250,
        city: 'Netanya',
        categories: ['Coaching']
    },
    {
        name: 'Yonatan Katz',
        email: 'yonatan.k@test.com',
        bio: 'Développeur web freelance. Sites, applications, e-commerce.',
        hourlyRate: 350,
        city: 'Tel Aviv',
        categories: ['Informatique']
    }
]

async function createTestPros() {
    console.log('🚀 Creating test professionals...\n')

    const hashedPassword = await bcrypt.hash('Test123!', 10)

    for (const pro of TEST_PROS) {
        try {
            // Find city
            const city = await prisma.city.findFirst({
                where: { name: { contains: pro.city } }
            })

            if (!city) {
                console.log(`❌ City "${pro.city}" not found, skipping ${pro.name}`)
                continue
            }

            // Find or create category
            let category = await prisma.serviceCategory.findFirst({
                where: { name: pro.categories[0] }
            })

            if (!category) {
                category = await prisma.serviceCategory.create({
                    data: { name: pro.categories[0] }
                })
                console.log(`📁 Created category: ${pro.categories[0]}`)
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: pro.email }
            })

            if (existingUser) {
                console.log(`⏭️  ${pro.name} already exists, skipping`)
                continue
            }

            // Create user and pro profile
            const user = await prisma.user.create({
                data: {
                    email: pro.email,
                    name: pro.name,
                    password: hashedPassword,
                    role: 'PRO',
                    proProfile: {
                        create: {
                            bio: pro.bio,
                            hourlyRate: pro.hourlyRate,
                            cityId: city.id,
                            verificationStatus: 'VERIFIED',
                            slug: pro.name.toLowerCase().replace(/\s+/g, '-'),
                            serviceCategories: {
                                connect: { id: category.id }
                            },
                            availability: {
                                create: [
                                    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
                                    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
                                    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
                                    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
                                    { dayOfWeek: 4, startTime: '09:00', endTime: '14:00' },
                                ]
                            }
                        }
                    }
                }
            })

            console.log(`✅ Created: ${pro.name} (${pro.city}) - ${pro.hourlyRate}₪/h`)
        } catch (error) {
            console.error(`❌ Error creating ${pro.name}:`, error)
        }
    }

    console.log('\n🎉 Done!')
    await prisma.$disconnect()
}

createTestPros()
