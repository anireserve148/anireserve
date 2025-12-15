import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import { ServiceCategory } from "@prisma/client"

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params

    const pro = await prisma.proProfile.findFirst({
        where: { slug },
        include: { user: true, city: true, serviceCategories: true }
    })

    if (!pro) {
        return {
            title: "Professionnel non trouvé",
        }
    }

    const categories = pro.serviceCategories.map((c: ServiceCategory) => c.name).join(", ")

    return {
        title: `${pro.user.name} - ${categories || "Professionnel"}`,
        description: pro.bio || `${pro.user.name}, professionnel à ${pro.city.name}. Réservez en ligne sur AniReserve.`,
        openGraph: {
            title: `${pro.user.name} | AniReserve`,
            description: pro.bio || `Réservez ${pro.user.name} à ${pro.city.name}`,
            type: "profile",
        },
        alternates: {
            canonical: `/pro/${slug}`,
        },
    }
}

export default async function ProSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Find pro by slug
    const pro = await prisma.proProfile.findFirst({
        where: { slug }
    })

    if (!pro) notFound()

    // Redirect to the main profile page with ID
    // This way we keep a single source of truth for the profile page
    redirect(`/pros/${pro.id}`)
}
