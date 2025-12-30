import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Coordonnées approximatives des villes principales pour le seed
const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'Tel Aviv': { lat: 32.0853, lng: 34.7818 },
    'Jérusalem': { lat: 31.7683, lng: 35.2137 },
    'Haïfa': { lat: 32.7940, lng: 34.9896 },
    'Rishon LeZion': { lat: 31.9730, lng: 34.7925 },
    'Petah Tikva': { lat: 32.0840, lng: 34.8878 },
    'Ashdod': { lat: 31.8044, lng: 34.6553 },
    'Netanya': { lat: 32.3214, lng: 34.8532 },
    'Beer-Sheva': { lat: 31.2520, lng: 34.7915 },
    'Holon': { lat: 32.0158, lng: 34.7871 },
    'Bnei Brak': { lat: 32.0841, lng: 34.8258 },
    'Ramat Gan': { lat: 32.0684, lng: 34.8248 },
    'Herzliya': { lat: 32.1624, lng: 34.8446 },
    'Ashkelon': { lat: 31.6688, lng: 34.5743 },
    'Modiin': { lat: 31.8903, lng: 35.0104 },
}

async function main() {
    console.log('🌍 Seeding coordinates for professionals...')

    const pros = await prisma.proProfile.findMany({
        select: {
            id: true,
            city: {
                select: { name: true }
            }
        }
    })

    for (const pro of pros) {
        const cityBase = cityCoords[pro.city.name] || cityCoords['Tel Aviv']

        // Ajouter un peu de variation aléatoire autour de la ville
        const latitude = cityBase.lat + (Math.random() - 0.5) * 0.05
        const longitude = cityBase.lng + (Math.random() - 0.5) * 0.05

        await prisma.proProfile.update({
            where: { id: pro.id },
            data: { latitude, longitude }
        })
        console.log(`✓ Updated ${pro.id} in ${pro.city.name} at (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
    }

    console.log('✅ Coordinates seed completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
