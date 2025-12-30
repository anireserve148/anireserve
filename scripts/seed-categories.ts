import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
    {
        name: 'Santé',
        icon: 'HeartPulse',
        children: [
            { name: 'Médecin Généraliste', icon: 'Stethoscope' },
            { name: 'Dentiste', icon: 'ScanFace' },
            { name: 'Kinésithérapeute', icon: 'Activity' },
            { name: 'Psychologue', icon: 'Brain' },
            { name: 'Nutritionniste', icon: 'Apple' },
            { name: 'Ostéopathe', icon: 'Bone' },
            { name: 'Ophtalmologue', icon: 'Eye' },
            { name: 'Dermatologue', icon: 'Hand' },
            { name: 'Pédiatre', icon: 'Baby' },
            { name: 'Gynécologue', icon: 'Heart' },
            { name: 'Orthodontiste', icon: 'Smile' },
            { name: 'Infirmier', icon: 'Syringe' },
        ]
    },
    {
        name: 'Beauté & Bien-être',
        icon: 'Sparkles',
        children: [
            { name: 'Coiffure Femme', icon: 'Scissors' },
            { name: 'Barbier & Coiffure Homme', icon: 'Scissors' },
            { name: 'Esthétique & Soins', icon: 'Sparkle' },
            { name: 'Massage & Spa', icon: 'Hand' },
            { name: 'Onglerie (Manucure/Pédicure)', icon: 'Palette' },
            { name: 'Maquillage Professionnel', icon: 'Palette' },
            { name: 'Épilation Laser/Cire', icon: 'Zap' },
            { name: 'Extension de Cils', icon: 'Eye' },
            { name: 'Tatouage & Piercing', icon: 'PenTool' },
        ]
    },
    {
        name: 'Maison & Travaux',
        icon: 'Home',
        children: [
            { name: 'Plomberie', icon: 'Droplet' },
            { name: 'Électricité', icon: 'Zap' },
            { name: 'Climatisation', icon: 'Wind' },
            { name: 'Peinture & Décoration', icon: 'PaintBucket' },
            { name: 'Rénovation Générale', icon: 'Layout' },
            { name: 'Serrurerie', icon: 'Key' },
            { name: 'Jardinage & Paysagiste', icon: 'Flower' },
            { name: 'Ménage & Nettoyage', icon: 'Sparkles' },
            { name: 'Désinsectisation', icon: 'Bug' },
            { name: 'Déménagement', icon: 'Truck' },
        ]
    },
    {
        name: 'Informatique & Digital',
        icon: 'Laptop',
        children: [
            { name: 'Développement Web/App', icon: 'Code' },
            { name: 'Réparation Ordinateur/Tel', icon: 'Smartphone' },
            { name: 'Graphisme & Design', icon: 'Palette' },
            { name: 'Marketing & Social Media', icon: 'Share2' },
            { name: 'Photographie', icon: 'Camera' },
            { name: 'Montage Vidéo', icon: 'Video' },
            { name: 'SEO & Publicité', icon: 'Search' },
        ]
    },
    {
        name: 'Business & Légal',
        icon: 'Briefcase',
        children: [
            { name: 'Avocat (Civil/Pénal)', icon: 'Scale' },
            { name: 'Expert Comptable', icon: 'Calculator' },
            { name: 'Conseil Fiscal', icon: 'Coins' },
            { name: 'Traduction Assermentée', icon: 'Languages' },
            { name: 'Notaire', icon: 'FileSignature' },
            { name: 'Agent Immobilier', icon: 'Building' },
            { name: 'Assurances', icon: 'ShieldCheck' },
        ]
    },
    {
        name: 'Éducation & Loisirs',
        icon: 'GraduationCap',
        children: [
            { name: 'Cours de Langues (Oulpan)', icon: 'Languages' },
            { name: 'Soutien Scolaire', icon: 'BookOpen' },
            { name: 'Cours de Musique', icon: 'Music' },
            { name: 'Coach Sportif', icon: 'Dumbbell' },
            { name: 'Yoga & Pilates', icon: 'Flower' },
            { name: 'Cuisine & Gastronomie', icon: 'ChefHat' },
        ]
    },
    {
        name: 'Animaux',
        icon: 'Dog',
        children: [
            { name: 'Vétérinaire', icon: 'HeartPulse' },
            { name: 'Toilettage', icon: 'Scissors' },
            { name: 'Éducation Canine', icon: 'Target' },
            { name: 'Garde d\'animaux', icon: 'Home' },
        ]
    },
    {
        name: 'Événementiel',
        icon: 'PartyPopper',
        children: [
            { name: 'Traiteur & Buffet', icon: 'Utensils' },
            { name: 'DJ & Animation', icon: 'Music' },
            { name: 'Location de matériel', icon: 'Box' },
            { name: 'Fleuriste', icon: 'Flower2' },
            { name: 'Organisation de Mariage', icon: 'Heart' },
        ]
    }
]

async function main() {
    console.log('🌱 Seeding new categories (upsert mode)...')
    for (const cat of categories) {
        const parent = await prisma.serviceCategory.upsert({
            where: { name: cat.name },
            update: { icon: cat.icon },
            create: {
                name: cat.name,
                icon: cat.icon
            }
        })
        console.log(`✓ Parent: ${cat.name}`)

        if (cat.children) {
            for (const child of cat.children) {
                await prisma.serviceCategory.upsert({
                    where: { name: child.name },
                    update: {
                        icon: child.icon,
                        parentId: parent.id
                    },
                    create: {
                        name: child.name,
                        icon: child.icon,
                        parentId: parent.id
                    }
                })
                console.log(`  └─ ${child.name}`)
            }
        }
    }
    console.log('✅ Done!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
