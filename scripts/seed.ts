import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Toutes les villes d'Israël
const cities = [
    { name: 'Tel Aviv', zip: '6100000', region: 'Centre' },
    { name: 'Jérusalem', zip: '9100000', region: 'Jérusalem' },
    { name: 'Haïfa', zip: '3100000', region: 'Nord' },
    { name: 'Rishon LeZion', zip: '7500000', region: 'Centre' },
    { name: 'Petah Tikva', zip: '4900000', region: 'Centre' },
    { name: 'Ashdod', zip: '7700000', region: 'Sud' },
    { name: 'Netanya', zip: '4200000', region: 'Centre' },
    { name: 'Beer-Sheva', zip: '8400000', region: 'Sud' },
    { name: 'Holon', zip: '5800000', region: 'Centre' },
    { name: 'Bnei Brak', zip: '5100000', region: 'Centre' },
    { name: 'Ramat Gan', zip: '5200000', region: 'Centre' },
    { name: 'Bat Yam', zip: '5900000', region: 'Centre' },
    { name: 'Ashkelon', zip: '7800000', region: 'Sud' },
    { name: 'Herzliya', zip: '4600000', region: 'Centre' },
    { name: 'Kfar Saba', zip: '4400000', region: 'Centre' },
    { name: 'Raanana', zip: '4300000', region: 'Centre' },
    { name: 'Hadera', zip: '3800000', region: 'Nord' },
    { name: 'Modiin', zip: '7170000', region: 'Centre' },
    { name: 'Beit Shemesh', zip: '9900000', region: 'Jérusalem' },
    { name: 'Eilat', zip: '8800000', region: 'Sud' },
    { name: 'Nahariya', zip: '2200000', region: 'Nord' },
    { name: 'Tibériade', zip: '1400000', region: 'Nord' },
    { name: 'Nazareth', zip: '1600000', region: 'Nord' },
    { name: 'Kiryat Gat', zip: '8200000', region: 'Sud' },
    { name: 'Akko', zip: '2400000', region: 'Nord' },
    { name: 'Lod', zip: '7100000', region: 'Centre' },
    { name: 'Ramleh', zip: '7200000', region: 'Centre' },
    { name: 'Réhovot', zip: '7600000', region: 'Centre' },
    { name: 'Givatayim', zip: '5300000', region: 'Centre' },
    { name: 'Zichron Yaakov', zip: '3090000', region: 'Nord' },
]

// Catégories et sous-catégories
const categories = [
    {
        name: 'Santé',
        icon: 'Heart',
        children: [
            { name: 'Médecin généraliste', icon: 'Stethoscope' },
            { name: 'Dentiste', icon: 'ScanFace' },
            { name: 'Kinésithérapeute', icon: 'Activity' },
            { name: 'Psychologue', icon: 'Brain' },
            { name: 'Nutritionniste', icon: 'Apple' },
            { name: 'Ostéopathe', icon: 'Bone' },
            { name: 'Ophtalmologue', icon: 'Eye' },
            { name: 'Dermatologue', icon: 'Hand' },
            { name: 'Pédiatre', icon: 'Baby' },
            { name: 'Gynécologue', icon: 'Heart' },
        ]
    },
    {
        name: 'Beauté & Bien-être',
        icon: 'Sparkles',
        children: [
            { name: 'Coiffeur', icon: 'Scissors' },
            { name: 'Esthéticienne', icon: 'Sparkle' },
            { name: 'Massage', icon: 'Hand' },
            { name: 'Manucure', icon: 'Palette' },
            { name: 'Maquillage', icon: 'Palette' },
            { name: 'Épilation', icon: 'Zap' },
            { name: 'Soins du visage', icon: 'SmilePlus' },
            { name: 'Barbier', icon: 'Scissors' },
        ]
    },
    {
        name: 'Sport & Fitness',
        icon: 'Dumbbell',
        children: [
            { name: 'Coach sportif', icon: 'Dumbbell' },
            { name: 'Yoga', icon: 'Flower' },
            { name: 'Pilates', icon: 'Circle' },
            { name: 'Personal trainer', icon: 'Target' },
            { name: 'Arts martiaux', icon: 'Swords' },
            { name: 'Natation', icon: 'Waves' },
            { name: 'Tennis', icon: 'Circle' },
            { name: 'Crossfit', icon: 'Flame' },
        ]
    },
    {
        name: 'Éducation',
        icon: 'GraduationCap',
        children: [
            { name: 'Cours de langues', icon: 'Languages' },
            { name: 'Soutien scolaire', icon: 'BookOpen' },
            { name: 'Cours de musique', icon: 'Music' },
            { name: 'Cours particuliers', icon: 'Users' },
            { name: 'Préparation examens', icon: 'FileText' },
            { name: 'Cours de Hébreu', icon: 'Goal' },
        ]
    },
    {
        name: 'Services à domicile',
        icon: 'Home',
        children: [
            { name: 'Ménage', icon: 'Sparkles' },
            { name: 'Garde d\'enfants', icon: 'Baby' },
            { name: 'Jardinage', icon: 'Flower' },
            { name: 'Bricolage', icon: 'Wrench' },
            { name: 'Plombier', icon: 'Droplet' },
            { name: 'Électricien', icon: 'Zap' },
            { name: 'Peinture', icon: 'PaintBucket' },
            { name: 'Déménagement', icon: 'Truck' },
        ]
    },
    {
        name: 'Business',
        icon: 'Briefcase',
        children: [
            { name: 'Avocat', icon: 'Scale' },
            { name: 'Comptable', icon: 'Calculator' },
            { name: 'Notaire', icon: 'FileSignature' },
            { name: 'Consultant', icon: 'LineChart' },
            { name: 'Coach business', icon: 'Target' },
            { name: 'Agent immobilier', icon: 'Building' },
            { name: 'Assurance', icon: 'Shield' },
        ]
    },
    {
        name: 'Tech & Digital',
        icon: 'Laptop',
        children: [
            { name: 'Développeur', icon: 'Code' },
            { name: 'Photographe', icon: 'Camera' },
            { name: 'Vidéaste', icon: 'Video' },
            { name: 'Graphiste', icon: 'Palette' },
            { name: 'Community manager', icon: 'Share2' },
            { name: 'Réparation tech', icon: 'Wrench' },
            { name: 'Création site web', icon: 'Globe' },
        ]
    },
    {
        name: 'Événements',
        icon: 'PartyPopper',
        children: [
            { name: 'DJ', icon: 'Music' },
            { name: 'Traiteur', icon: 'ChefHat' },
            { name: 'Décorateur', icon: 'Flower' },
            { name: 'Photographe événements', icon: 'Camera' },
            { name: 'Animateur', icon: 'Mic' },
            { name: 'Wedding planner', icon: 'Heart' },
        ]
    },
]

async function main() {
    console.log('🌱 Seeding database...')

    // Seed cities
    console.log('📍 Creating cities...')
    for (const city of cities) {
        const existing = await prisma.city.findFirst({ where: { name: city.name } })
        if (!existing) {
            await prisma.city.create({ data: city })
            console.log(`  ✓ Created city: ${city.name}`)
        } else {
            console.log(`  - City already exists: ${city.name}`)
        }
    }

    // Seed categories
    console.log('📂 Creating categories...')
    for (const category of categories) {
        // Create parent category
        let parentCategory = await prisma.serviceCategory.findUnique({
            where: { name: category.name }
        })

        if (!parentCategory) {
            parentCategory = await prisma.serviceCategory.create({
                data: {
                    name: category.name,
                    icon: category.icon,
                }
            })
            console.log(`  ✓ Created category: ${category.name}`)
        } else {
            console.log(`  - Category already exists: ${category.name}`)
        }

        // Create subcategories
        if (category.children) {
            for (const child of category.children) {
                const existing = await prisma.serviceCategory.findUnique({
                    where: { name: child.name }
                })

                if (!existing) {
                    await prisma.serviceCategory.create({
                        data: {
                            name: child.name,
                            icon: child.icon,
                            parentId: parentCategory.id,
                        }
                    })
                    console.log(`    ✓ Created subcategory: ${child.name}`)
                } else {
                    console.log(`    - Subcategory already exists: ${child.name}`)
                }
            }
        }
    }

    console.log('✅ Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
