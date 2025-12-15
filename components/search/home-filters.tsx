"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Search } from "lucide-react"

interface HomeSearchFiltersProps {
  cities: { id: string, name: string }[]
  categories: { id: string, name: string, children?: { id: string, name: string }[] }[]
}

export function HomeSearchFilters({ cities, categories }: HomeSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    cityId: searchParams.get("city") || "all",
    categoryId: searchParams.get("category") || "all",
    query: searchParams.get("q") || "",
    sort: searchParams.get("sort") || "recommended",
    availableToday: searchParams.get("today") === "true"
  })

  // Sync state with URL params when they change (e.g. back button)
  useEffect(() => {
    setFilters({
      cityId: searchParams.get("city") || "all",
      categoryId: searchParams.get("category") || "all",
      query: searchParams.get("q") || "",
      sort: searchParams.get("sort") || "recommended",
      availableToday: searchParams.get("today") === "true"
    })
  }, [searchParams])

  const executeSearch = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams()
    if (newFilters.cityId && newFilters.cityId !== "all") params.set("city", newFilters.cityId)
    if (newFilters.categoryId && newFilters.categoryId !== "all") params.set("category", newFilters.categoryId)
    if (newFilters.query) params.set("q", newFilters.query)
    if (newFilters.sort && newFilters.sort !== "recommended") params.set("sort", newFilters.sort)
    if (newFilters.availableToday) params.set("today", "true")

    router.push(`/?${params.toString()}`, { scroll: false })
  }, [router])

  // Instant update handlers
  const handleCityChange = (val: string) => {
    const newFilters = { ...filters, cityId: val }
    setFilters(newFilters)
    executeSearch(newFilters)
  }

  const handleCategoryChange = (val: string) => {
    const newFilters = { ...filters, categoryId: val }
    setFilters(newFilters)
    executeSearch(newFilters)
  }

  const handleSortChange = (val: string) => {
    const newFilters = { ...filters, sort: val }
    setFilters(newFilters)
    executeSearch(newFilters)
  }

  const handleTodayChange = (checked: boolean) => {
    const newFilters = { ...filters, availableToday: checked }
    setFilters(newFilters)
    executeSearch(newFilters)
  }

  const handleManualSearch = () => {
    executeSearch(filters)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch()
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/50 h-fit sticky top-24">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-5 h-5 text-navy" />
        <h2 className="text-xl font-bold font-poppins text-navy">Trouver un professionnel</h2>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Choisis ta ville et le service dont tu as besoin ✨
      </p>

      <div className="space-y-6">
        {/* Ville */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-semibold text-navy">Ville</Label>
          <Select
            value={filters.cityId}
            onValueChange={handleCityChange}
          >
            <SelectTrigger id="city" className="h-12 rounded-xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="Toutes les villes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les villes</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label htmlFor="service" className="text-sm font-semibold text-navy">Type de service</Label>
          <Select
            value={filters.categoryId}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="service" className="h-12 rounded-xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="Tous les services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les services</SelectItem>
              {categories.map((cat) => (
                <React.Fragment key={cat.id}>
                  <SelectItem value={cat.id} className="font-semibold">
                    {cat.name}
                  </SelectItem>
                  {cat.children?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id} className="pl-6 text-gray-600">
                      → {sub.name}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mots-clés */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-sm font-semibold text-navy">Recherche par mots-clés</Label>
          <Input
            id="keywords"
            placeholder="Ex: spécialisé, expérimenté, moderne..."
            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyDown={handleKeyDown}
          />
          <p className="text-xs text-gray-400">Appuyez sur Entrée pour rechercher</p>
        </div>

        {/* Tri */}
        <div className="space-y-2">
          <Label htmlFor="sort" className="text-sm font-semibold text-navy">Trier par</Label>
          <Select
            value={filters.sort}
            onValueChange={handleSortChange}
          >
            <SelectTrigger id="sort" className="h-12 rounded-xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="Recommandés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommandés</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="rating">Note (Mieux notés)</SelectItem>
              <SelectItem value="name">Nom (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Checkbox */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="today"
            checked={filters.availableToday}
            onCheckedChange={(checked) => handleTodayChange(checked as boolean)}
          />
          <Label htmlFor="today" className="text-sm text-gray-600 font-medium cursor-pointer">
            Disponible aujourd'hui
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-12 bg-[#3DBAA2] hover:bg-[#34a08b] text-white rounded-xl font-semibold text-base shadow-lg shadow-[#3DBAA2]/20 hover:shadow-[#3DBAA2]/40 transition-all duration-300 mt-4"
          onClick={handleManualSearch}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Rechercher des professionnels
        </Button>
      </div>
    </div>
  )
}
