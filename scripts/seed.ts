import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 1. Define Cities
const CITIES = [
    { name: 'Tel Aviv', zip: '61000', region: 'Center' },
    { name: 'Jerusalem', zip: '91000', region: 'Jerusalem' },
    { name: 'Haïfa', zip: '31000', region: 'North' },
    { name: 'Rishon LeZion', zip: '75000', region: 'Center' },
    { name: 'Petah Tikva', zip: '49000', region: 'Center' },
    { name: 'Ashdod', zip: '77000', region: 'South' },
    { name: 'Netanya', zip: '42000', region: 'Center' },
    { name: 'Beer-Sheva', zip: '84000', region: 'South' },
    { name: 'Holon', zip: '58000', region: 'Center' },
    { name: 'Ramat Gan', zip: '52000', region: 'Center' },
    { name: 'Bat Yam', zip: '59000', region: 'Center' },
    { name: 'Rehovot', zip: '76000', region: 'Center' },
    { name: 'Ashkelon', zip: '78000', region: 'South' },
    { name: 'Herzliya', zip: '46000', region: 'Center' },
    { name: 'Kfar Saba', zip: '44000', region: 'Center' },
    { name: 'Hadera', zip: '38000', region: 'North' },
    { name: 'Ra\'anana', zip: '43000', region: 'Center' },
    { name: 'Modiin', zip: '71700', region: 'Center' },
    { name: 'Nazareth', zip: '16000', region: 'North' },
    { name: 'Eilat', zip: '88000', region: 'South' },
    { name: 'Tiberias', zip: '14100', region: 'North' },
    { name: 'Acre (Akko)', zip: '24000', region: 'North' },
    { name: 'Nahariya', zip: '22000', region: 'North' },
    { name: 'Karmiel', zip: '21000', region: 'North' },
    { name: 'Hod HaSharon', zip: '45000', region: 'Center' },
    { name: 'Ramat HaSharon', zip: '47000', region: 'Center' },
    { name: 'Givatayim', zip: '53000', region: 'Center' },
    { name: 'Kiryat Gat', zip: '82000', region: 'South' },
    { name: 'Safed', zip: '13000', region: 'North' },
    { name: 'Dimona', zip: '86000', region: 'South' },
];

// 2. Define Ultimate Service Categories
const SERVICE_CATEGORIES = [
    {
        name: 'Enfance & Famille',
        icon: 'Baby',
        subs: ['Babysitting', 'Nounou', 'Soutien scolaire', 'Aide aux seniors', 'Crèche familiale', 'Animation enfant', 'Consultant sommeil bébé']
    },
    {
        name: 'Santé & Médecine',
        icon: 'Stethoscope',
        subs: ['Médecin Généraliste', 'Dentiste', 'Ostéopathe', 'Kinésithérapeute', 'Psychologue', 'Ophtalmologue', 'Pédiatre', 'Dermatologue', 'Nutritionniste', 'Orthophoniste']
    },
    {
        name: 'Droit & Administratif',
        icon: 'Scale',
        subs: ['Avocat', 'Notaire', 'Comptable', 'Huissier', 'Conseiller Juridique', 'Traducteur Assermenté', 'Expert Immobilier']
    },
    {
        name: 'Maison & Travaux',
        icon: 'Hammer',
        subs: ['Plombier', 'Électricien', 'Serrurier', 'Peintre', 'Ménage', 'Jardinier', 'Déménagement', 'Architecte', 'Décorateur d\'intérieur', 'Handyman', 'Climatisation']
    },
    {
        name: 'Beauté & Bien-être',
        icon: 'Sparkles',
        subs: ['Coiffure', 'Barbier', 'Manucure', 'Pédicure', 'Esthéticienne', 'Massage', 'Tatoueur', 'Maquillage', 'Épilation', 'Spa']
    },
    {
        name: 'Sport & Loisirs',
        icon: 'Dumbbell',
        subs: ['Coach Sportif', 'Yoga', 'Pilates', 'Tennis', 'Natation', 'Cours de Musique', 'Cours de Danse', 'Guide Touristique', 'Cours de Cuisine']
    },
    {
        name: 'Animaux',
        icon: 'Dog',
        subs: ['Vétérinaire', 'Toilettage', 'Promeneur de chien', 'Comportementaliste', 'Pension animaux']
    },
    {
        name: 'Auto & Moto',
        icon: 'Car',
        subs: ['Mécanicien', 'Lavage Auto', 'Carrosserie', 'Dépannage', 'Auto-école', 'Inspection véhicule']
    },
    {
        name: 'Tech & Digital',
        icon: 'Laptop',
        subs: ['Développeur Web', 'Graphiste', 'Photographe', 'Consultant Marketing', 'Réparation Smartphone/PC', 'Community Manager', 'Montage Vidéo']
    },
    {
        name: 'Événementiel',
        icon: 'PartyPopper',
        subs: ['DJ', 'Traiteur', 'Wedding Planner', 'Fleuriste', 'Photomaton', 'Salle de réception', 'Photographe Mariage']
    }
];

// 3. Define Mock Professionals (Diverse list)
const PROFESSIONALS = [
    // Santé
    { name: 'Dr. Sarah Cohen', email: 'sarah.doc@anireserve.com', city: 'Tel Aviv', service: 'Médecin Généraliste', rate: 400, bio: 'Médecin de famille dévouée. Visites à domicile et consultations au cabinet.' },
    { name: 'Dr. David Levi', email: 'david.dentiste@anireserve.com', city: 'Jerusalem', service: 'Dentiste', rate: 350, bio: 'Chirurgien-dentiste spécialisé en esthétique et implantologie.' },
    { name: 'Julie Ostéo', email: 'julie.osteo@anireserve.com', city: 'Haïfa', service: 'Ostéopathe', rate: 300, bio: 'Ostéopathe D.O. Soulage vos maux de dos, migraines et douleurs articulaires.' },

    // Droit
    { name: 'Me. Benjamin Haim', email: 'ben.avocat@anireserve.com', city: 'Tel Aviv', service: 'Avocat', rate: 800, bio: 'Avocat au barreau. Spécialiste en droit de la famille et droit immobilier.' },
    { name: 'Cabinet Ruth & Co', email: 'ruth.compta@anireserve.com', city: 'Ramat Gan', service: 'Comptable', rate: 450, bio: 'Expert-comptable pour entreprises et indépendants. Optimisation fiscale.' },

    // Enfance
    { name: 'Léa Nounou', email: 'lea.nounou@anireserve.com', city: 'Rishon LeZion', service: 'Babysitting', rate: 60, bio: 'Étudiante sérieuse en éducation. Expérience avec nouveaux-nés et aide aux devoirs.' },
    { name: 'Tom Prof', email: 'tom.prof@anireserve.com', city: 'Holon', service: 'Soutien scolaire', rate: 120, bio: 'Professeur de mathématiques certifié. Cours particuliers du collège au lycée.' },

    // Maison
    { name: 'Yossi Plombier', email: 'yossi.plombier@anireserve.com', city: 'Ashdod', service: 'Plombier', rate: 250, bio: 'Urgence 24/7. Fuites, débouchages, chauffe-eau. Travail rapide et propre.' },
    { name: 'Dan Élec', email: 'dan.elec@anireserve.com', city: 'Netanya', service: 'Électricien', rate: 280, bio: 'Installation, rénovation et mise aux normes électriques. Devis gratuit.' },
    { name: 'Maria Clean', email: 'maria.clean@anireserve.com', city: 'Tel Aviv', service: 'Ménage', rate: 70, bio: 'Service de ménage méticuleux pour particuliers et bureaux. Produits écologiques.' },

    // Beauté
    { name: 'Salon Prestige', email: 'salon.prestige@anireserve.com', city: 'Tel Aviv', service: 'Coiffure', rate: 200, bio: 'Stylistes visagistes. Coupes modernes, balayages californiens et soins profonds.' },
    { name: 'Rachel Nails', email: 'rachel.nails@anireserve.com', city: 'Bat Yam', service: 'Manucure', rate: 100, bio: 'Nail art, semi-permanent et gel. Vos mains méritent le meilleur.' },

    // Tech
    { name: 'Alex Dev', email: 'alex.dev@anireserve.com', city: 'Remote', service: 'Développeur Web', rate: 350, bio: 'Freelance Fullstack. Création de sites e-commerce et applications sur mesure.' },
    { name: 'Sophie Design', email: 'sophie.design@anireserve.com', city: 'Tel Aviv', service: 'Graphiste', rate: 250, bio: 'Identité visuelle, logos et supports marketing qui marquent les esprits.' },

    // Sport
    { name: 'Mike Coach', email: 'mike.coach@anireserve.com', city: 'Herzliya', service: 'Coach Sportif', rate: 180, bio: 'Transformation physique, perte de poids et prise de masse. Coaching privé ou en groupe.' },
    { name: 'Anna Yoga', email: 'anna.yoga@anireserve.com', city: 'Tel Aviv', service: 'Yoga', rate: 150, bio: 'Vinyasa et Hatha Yoga. Retrouvez équilibre et sérénité.' },
];

async function main() {
    console.log('🌱 Starting ULTIME seed...');

    // 1. Clean database
    console.log('🧹 Cleaning database...');
    // Delete in order to respect foreign keys
    await prisma.review.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.proProfileGallery.deleteMany();
    await prisma.proProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.city.deleteMany();

    // 2. Seed Cities
    console.log('📍 Seeding Cities...');
    for (const city of CITIES) {
        await prisma.city.create({ data: city });
    }

    // 3. Seed Service Categories & Subcategories
    console.log('🛠️ Seeding Categories...');
    for (const category of SERVICE_CATEGORIES) {
        const parent = await prisma.serviceCategory.create({
            data: {
                name: category.name,
                icon: category.icon,
            }
        });

        for (const sub of category.subs) {
            await prisma.serviceCategory.create({
                data: {
                    name: sub, // Direct name for simplicity in search
                    parentId: parent.id,
                }
            });
        }
    }

    // 4. Create Users & Pros
    console.log('👥 Seeding Pros...');
    const password = await bcrypt.hash('password123', 10);
    const clients = [];
    const pros = [];

    // Create a few random clients
    for (let i = 0; i < 5; i++) {
        const client = await prisma.user.create({
            data: {
                email: `client${i} @test.com`,
                name: `Client Test ${i} `,
                password,
                role: 'CLIENT',
            }
        });
        clients.push(client);
    }

    // Create Professionals
    for (const proData of PROFESSIONALS) {
        const city = await prisma.city.findFirst({ where: { name: proData.city } });
        // Find subcategory first, if not find parent category
        let category = await prisma.serviceCategory.findFirst({ where: { name: proData.service } });

        // Fallback: search in parent categories if not found (though mocked data should match)
        if (!category) {
            const parent = await prisma.serviceCategory.findFirst({ where: { name: { contains: proData.service } } });
            if (parent) category = parent;
        }

        if (!city || !category) {
            console.log(`⚠️ Skipping ${proData.name}: City or Category not found`);
            continue;
        }

        const user = await prisma.user.create({
            data: {
                email: proData.email,
                name: proData.name,
                password,
                role: 'PRO',
            }
        });

        const proProfile = await prisma.proProfile.create({
            data: {
                userId: user.id,
                cityId: city.id,
                bio: proData.bio,
                hourlyRate: proData.rate,
                serviceCategories: {
                    connect: { id: category.id }
                },
                availability: {
                    create: [
                        { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' },
                        { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' },
                        { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' },
                        { dayOfWeek: 4, startTime: '09:00', endTime: '19:00' },
                        { dayOfWeek: 5, startTime: '09:00', endTime: '14:00' },
                    ]
                }
            }
        });
        pros.push({ user, proProfile });
    }

    // 5. Create Admin
    await prisma.user.create({
        data: {
            email: 'admin@anireserve.com',
            name: 'Super Admin',
            password,
            role: 'ADMIN',
        }
    });

    console.log('✅ Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
