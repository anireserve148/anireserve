import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"
import { HomeSearchFilters } from "@/components/search/home-filters"
import { HomeResults, ProResult } from "@/components/search/home-results"
import { InstallPWAButton } from "@/components/install-pwa-button"
import { Sparkles, Shield, Zap, Search, Calendar, MessageCircle, CheckCircle, Star, Users, TrendingUp } from "lucide-react"
import { unstable_cache } from 'next/cache'
import Link from "next/link"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string; q?: string; sort?: string; today?: string }>
}) {
  const session = await auth()
  const { city, category, q, sort, today } = await searchParams

  // Fetch stats
  const stats = {
    pros: await prisma.proProfile.count(),
    clients: await prisma.user.count({ where: { role: 'CLIENT' } }),
    reservations: await prisma.reservation.count(),
  }

  // 1. Fetch Filters Data
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
    where.OR = [
      { cityId: city },
      { workCities: { some: { id: city } } }
    ]
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

  // 4. Fetch Pros
  let prosData: any[] = []

  const cachedGetPros = unstable_cache(
    async (whereClause: any, orderByClause: any) => {
      return await prisma.proProfile.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: 50,
        include: {
          user: true,
          city: true,
          serviceCategories: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      })
    },
    ['pros-search'],
    { revalidate: 300, tags: ['pros'] }
  )

  try {
    prosData = await cachedGetPros(where, orderBy)
  } catch (error) {
    console.error('Error fetching professionals:', error)
  }

  // 5. Fetch Favorites
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
    isFavorite: favoriteProIds.has(p.id),
    latitude: p.latitude,
    longitude: p.longitude
  }));

  // Show hero only if no filters are applied
  const showHero = !city && !category && !q

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
      <ModernNavbar user={session?.user} />

      {showHero && (
        <>
          {/* Hero Section */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
            <div className="max-w-7xl mx-auto relative">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Plateforme N°1 en Israël</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
                  <span className="text-gradient">Trouvez Votre Pro</span>
                  <br />
                  <span className="text-foreground">en un Clic 🇮🇱</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  La plateforme qui connecte les francophones avec les meilleurs professionnels certifiés en Israël.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <Link
                    href="#search"
                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                  >
                    Trouver un Pro
                  </Link>
                  <Link
                    href="/register/pro"
                    className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all"
                  >
                    Devenir Pro
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary mb-2">{stats.pros}+</div>
                    <div className="text-sm text-muted-foreground">Professionnels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-accent mb-2">{stats.clients}+</div>
                    <div className="text-sm text-muted-foreground">Clients Satisfaits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary mb-2">{stats.reservations}+</div>
                    <div className="text-sm text-muted-foreground">Réservations</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4 bg-white/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Comment ça marche ?</h2>
                <p className="text-muted-foreground text-lg">Simple, rapide, efficace</p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">1. Cherchez</h3>
                  <p className="text-sm text-muted-foreground">Trouvez le pro parfait par ville ou catégorie</p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">2. Comparez</h3>
                  <p className="text-sm text-muted-foreground">Consultez les avis et tarifs</p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">3. Réservez</h3>
                  <p className="text-sm text-muted-foreground">Prenez RDV en quelques clics</p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">4. Profitez</h3>
                  <p className="text-sm text-muted-foreground">Service de qualité garanti</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Section */}
          <section className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 sm:p-12 border border-primary/20">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Shield className="h-12 w-12 text-primary" />
                    <h3 className="font-bold text-lg">100% Sécurisé</h3>
                    <p className="text-sm text-muted-foreground">Paiements et données protégés</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Zap className="h-12 w-12 text-accent" />
                    <h3 className="font-bold text-lg">Réponse Rapide</h3>
                    <p className="text-sm text-muted-foreground">Les pros répondent en 24h</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <Users className="h-12 w-12 text-primary" />
                    <h3 className="font-bold text-lg">Communauté</h3>
                    <p className="text-sm text-muted-foreground">100% francophone</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Phares Section */}
          <section className="py-16 px-4 bg-white/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Nos Services Phares</h2>
                <p className="text-muted-foreground text-lg">Trouvez le professionnel qu'il vous faut</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Ménage */}
                <Link
                  href="/?category=menage#search"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Ménage</h3>
                  <p className="text-xs text-muted-foreground">& Repassage</p>
                </Link>

                {/* Garde d'enfants */}
                <Link
                  href="/?category=garde#search"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">👶</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Babysitting</h3>
                  <p className="text-xs text-muted-foreground">Garde d'enfants</p>
                </Link>

                {/* Soutien scolaire */}
                <Link
                  href="/?category=soutien#search"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Soutien</h3>
                  <p className="text-xs text-muted-foreground">Scolaire</p>
                </Link>

                {/* Beauté */}
                <Link
                  href="/?category=beaute#search"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">💇</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Beauté</h3>
                  <p className="text-xs text-muted-foreground">& Coiffure</p>
                </Link>

                {/* Bien-être */}
                <Link
                  href="/?category=bien-etre#search"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">💆</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Bien-être</h3>
                  <p className="text-xs text-muted-foreground">& Massage</p>
                </Link>

                {/* Événementiel */}
                <Link
                  href="/?category=evenement#search"
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Événements</h3>
                  <p className="text-xs text-muted-foreground">& Traiteur</p>
                </Link>
              </div>
            </div>
          </section>

          {/* Pourquoi AniReserve Section */}
          <section className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-black mb-4">Pourquoi AniReserve ?</h2>
                <p className="text-muted-foreground text-lg">La plateforme pensée pour les francophones en Israël</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-4xl mb-4">🇫🇷</div>
                  <h3 className="font-bold mb-2">100% Francophone</h3>
                  <p className="text-sm text-muted-foreground">Tous les pros parlent français</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-bold mb-2">Pros Vérifiés</h3>
                  <p className="text-sm text-muted-foreground">Identité contrôlée</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="font-bold mb-2">Support WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">Aide rapide et efficace</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-4xl mb-4">🆓</div>
                  <h3 className="font-bold mb-2">Inscription Gratuite</h3>
                  <p className="text-sm text-muted-foreground">Sans engagement</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Search Section */}
      <section id="search" className={showHero ? "pb-16 px-4" : "py-8 px-4"}>
        <div className="max-w-7xl mx-auto">
          {showHero && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-2">Trouvez Votre Pro Maintenant</h2>
              <p className="text-muted-foreground">Plus de {stats.pros} professionnels à votre service</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filters */}
            <div className="lg:col-span-4 xl:col-span-3">
              <HomeSearchFilters
                cities={cities}
                categories={categories}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-8 xl:col-span-9">
              <HomeResults pros={pros} />
            </div>
          </div>
        </div>
      </section>

      <InstallPWAButton />
      <ModernFooter />
    </div>
  )
}
