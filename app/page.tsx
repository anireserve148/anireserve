import { SearchHero } from "@/components/search-hero"
import { ProGrid, ProCardData } from "@/components/pro-grid"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()
  console.log("Prisma Client Keys:", Object.keys(prisma));

  // Fetch Data
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })
  const categories = await prisma.serviceCategory.findMany({ orderBy: { name: 'asc' } })

  const prosData = await prisma.proProfile.findMany({
    take: 9,
    include: {
      user: true,
      city: true,
      serviceCategories: true,
      reviews: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Transform to Card Data
  const pros: ProCardData[] = prosData.map(p => ({
    id: p.id,
    name: p.user.name || "Pro",
    bio: p.bio,
    imageUrl: p.user.image,
    city: p.city.name,
    category: p.serviceCategories.map(c => c.name).join(", "),
    priceRange: null, // Add if in schema
    rating: p.reviews.length > 0
      ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
      : undefined
  }))

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header / Auth Buttons */}
      <div className="absolute top-0 w-full z-50 flex justify-between items-center p-6 px-8">
        <div className="text-xl font-bold tracking-tight text-foreground/80">AniReserve</div>

        <div className="flex gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button variant="outline" className="bg-background/80 backdrop-blur">
                Mon Tableau de bord
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/10">
                  Connexion Client
                </Button>
              </Link>
              <Link href="/login?role=pro">
                <Button className="font-semibold shadow-lg">
                  Espace Pro
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <SearchHero cities={cities} categories={categories} />

      <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Professionnels Disponibles</h2>
        <ProGrid pros={pros} />
      </section>
    </main>
  )
}
