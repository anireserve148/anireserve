import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"
import { HomeSearchFilters } from "@/components/search/home-filters"
import { HomeResults, ProResult } from "@/components/search/home-results"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react"

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
    // Fallback to empty arrays - site will still work
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
    // Fallback to empty array
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

  const hasSearchParams = city || category || q;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <ModernNavbar user={session?.user} />

      {!hasSearchParams ? (
        <>
          {/* Premium Hero Section - Apple/Tesla Style */}
          <section className="relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

            {/* Animated Orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

            <div className="relative container mx-auto px-4 py-24 md:py-32">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Plateforme Premium</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                  <span className="text-gradient">Trouvez Votre Pro</span>
                  <br />
                  <span className="text-foreground">en Israël 🇮🇱</span>
                </h1>

                {/* Subheading */}
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  La plateforme qui connecte les francophones avec les meilleurs professionnels en Israël. Simple, rapide, en français.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Link href="#search">
                    <Button size="lg" className="gradient-primary text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group">
                      Trouver un Pro
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/register/pro">
                    <Button size="lg" variant="outline" className="font-bold px-8 py-6 text-lg border-2 hover:bg-primary/5">
                      Devenir Professionnel
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>100% Sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    <span>Réponse Rapide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>Service en Français</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gradient-to-b from-background to-muted/10">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                  {
                    icon: Shield,
                    title: "Professionnels Vérifiés",
                    description: "Tous nos professionnels sont certifiés et parlent français pour faciliter vos échanges"
                  },
                  {
                    icon: Zap,
                    title: "Réservation Instantanée",
                    description: "Trouvez et réservez en quelques clics. Simple, rapide et efficace, directement en ligne"
                  },
                  {
                    icon: Sparkles,
                    title: "Communauté Francophone",
                    description: "Une plateforme pensée pour les francophones en Israël, par des francophones"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                    <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6">
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {/* Search Section */}
      <section id="search" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass-effect rounded-3xl p-8 border border-border/50 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {hasSearchParams ? 'Résultats de recherche' : 'Trouvez votre professionnel'}
              </h2>
              <HomeSearchFilters
                cities={cities}
                categories={categories}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {pros.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <HomeResults pros={pros} />
          </div>
        </section>
      )}

      <ModernFooter />
    </div>
  )
}
