import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"
import { HomeSearchFilters } from "@/components/search/home-filters"
import { HomeResults, ProResult } from "@/components/search/home-results"
import { Sparkles, Shield, Zap } from "lucide-react"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string; q?: string; sort?: string }>
}) {
  const session = await auth()
  const { city, category, q, sort } = await searchParams

  // 1. Fetch Filters Data with error handling
  let cities: any[] = []
  let categories: any[] = []

  try {
    cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })
    categories = await prisma.serviceCategory.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
  }

  // 2. Build Where Clause
  const where: any = {}

  if (city && city !== 'all') {
    where.cityId = city
  }

  if (category && category !== 'all') {
    where.serviceCategories = {
      some: {
        id: category
      }
    }
  }

  if (q) {
    where.OR = [
      { bio: { contains: q } },
      { user: { name: { contains: q } } },
      { services: { some: { description: { contains: q } } } }
    ]
  }

  // 3. Determine Sorting
  let orderBy: any = { createdAt: 'desc' }

  if (sort === 'price_asc') {
    orderBy = { hourlyRate: 'asc' }
  } else if (sort === 'price_desc') {
    orderBy = { hourlyRate: 'desc' }
  } else if (sort === 'name') {
    orderBy = { user: { name: 'asc' } }
  }

  // 4. Fetch Pros with error handling
  let prosData: any[] = []

  try {
    prosData = await prisma.proProfile.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        user: true,
        city: true,
        serviceCategories: true,
        reviews: true
      }
    })
  } catch (error) {
    console.error('Error fetching professionals:', error)
  }

  // 5. Fetch Favorites if logged in
  const favoriteProIds = new Set<string>();
  if (session?.user?.id) {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: { proId: true }
      });
      favorites.forEach(f => favoriteProIds.add(f.proId));
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const pros: ProResult[] = prosData.map(p => ({
    id: p.id,
    name: p.user.name || '',
    image: p.user.image || null,
    city: p.city.name,
    hourlyRate: p.hourlyRate,
    categories: p.serviceCategories.map((c: { name: string }) => c.name),
    rating: p.reviews.length > 0
      ? p.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / p.reviews.length
      : 0,
    reviewCount: p.reviews.length,
    isFavorite: favoriteProIds.has(p.id)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
      <ModernNavbar user={session?.user} />

      {/* Hero Banner - Compact */}
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Plateforme Premium</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="text-gradient">Trouvez Votre Pro</span> en Israël 🇮🇱
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La plateforme qui connecte les francophones avec les meilleurs professionnels en Israël.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span>Réponse Rapide</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>En Français</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Split View */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Filters */}
            <div className="lg:col-span-4 xl:col-span-3">
              <HomeSearchFilters
                cities={cities}
                categories={categories}
              />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-8 xl:col-span-9">
              <HomeResults pros={pros} />
            </div>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  )
}
