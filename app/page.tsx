import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"
import { HomeSearchFilters } from "@/components/search/home-filters"
import { HomeResults, ProResult } from "@/components/search/home-results"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string; q?: string; sort?: string }>
}) {
  const session = await auth()
  const { city, category, q, sort } = await searchParams

  // 1. Fetch Filters Data
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } })
  const categories = await prisma.serviceCategory.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' }
  })

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
      { bio: { contains: q } }, // Default case-insensitive in SQLite? usually no, but Prisma client might handle or we might need insensitive mode if Postgres. For SQLite, contains is usually case-insensitive for ASCII.
      { user: { name: { contains: q } } },
      // Search in service descriptions too
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
  // For 'rating' or 'recommended', we might need post-processing since average is computed.
  // We'll keep default sort for now and maybe handle rating sort later if needed or via raw query, 
  // but for MVP let's stick to simple Prisma sorts.

  // 4. Fetch Pros
  const prosData = await prisma.proProfile.findMany({
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

  // 3. Fetch Favorites if logged in
  const favoriteProIds = new Set<string>();
  if (session?.user?.id) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { proId: true }
    });
    favorites.forEach(f => favoriteProIds.add(f.proId));
  }

  // 4. Transform to props
  let results: ProResult[] = prosData.map(p => ({
    id: p.id,
    name: p.user.name || "Professionnel",
    bio: p.bio,
    imageUrl: p.user.image,
    city: p.city.name,
    category: p.serviceCategories[0]?.name || "Service",
    priceRange: `${p.hourlyRate}₪ /h`,
    rating: p.reviews.length > 0
      ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
      : undefined,
    reviewCount: p.reviews.length,
    isFavorite: favoriteProIds.has(p.id)
  }))

  // Handle rating sort manually since it's computed
  if (sort === 'rating') {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <ModernNavbar user={session?.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* En-tête de page (Optionnel, logo déjà dans la navbar) */}
        {/* <div className="mb-12">
            <h1 className="text-4xl font-bold font-poppins text-navy">
                Ani<span className="text-navy">RESERVE</span>
            </h1>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Search Filters (4 cols) */}
          <div className="lg:col-span-4">
            <HomeSearchFilters
              cities={cities}
              categories={categories}
            />
          </div>

          {/* Right Panel: Results (8 cols) */}
          <div className="lg:col-span-8">
            <HomeResults results={results} />
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  )
}
