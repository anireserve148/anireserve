"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, X, Star, DollarSign, Calendar } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"

interface SearchFiltersProps {
    cities: { id: string; name: string }[]
}

export function SearchFilters({ cities }: SearchFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Current filter values from URL
    const currentCity = searchParams.get('city') || 'all'
    const currentQuery = searchParams.get('q') || ''
    const currentMinPrice = searchParams.get('minPrice') || '0'
    const currentMaxPrice = searchParams.get('maxPrice') || '500'
    const currentMinRating = searchParams.get('minRating') || '0'

    // Local state for form
    const [city, setCity] = useState(currentCity)
    const [priceRange, setPriceRange] = useState([
        parseInt(currentMinPrice),
        parseInt(currentMaxPrice)
    ])
    const [minRating, setMinRating] = useState(currentMinRating)
    const [isOpen, setIsOpen] = useState(false)

    // Count active filters
    const activeFiltersCount = [
        city !== 'all',
        parseInt(currentMinPrice) > 0 || parseInt(currentMaxPrice) < 500,
        parseInt(currentMinRating) > 0
    ].filter(Boolean).length

    const applyFilters = () => {
        const params = new URLSearchParams()

        if (currentQuery) params.set('q', currentQuery)
        if (city !== 'all') params.set('city', city)
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
        if (priceRange[1] < 500) params.set('maxPrice', priceRange[1].toString())
        if (parseInt(minRating) > 0) params.set('minRating', minRating)

        router.push(`/search?${params.toString()}`)
        setIsOpen(false)
    }

    const clearFilters = () => {
        setCity('all')
        setPriceRange([0, 500])
        setMinRating('0')

        const params = new URLSearchParams()
        if (currentQuery) params.set('q', currentQuery)
        router.push(`/search?${params.toString()}`)
        setIsOpen(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtrer les résultats
                    </SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* City Filter */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            📍 Ville
                        </Label>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Toutes les villes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les villes</SelectItem>
                                {cities.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price Filter */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Prix (₪/heure)
                        </Label>
                        <div className="px-2">
                            <Slider
                                value={priceRange}
                                onValueChange={setPriceRange}
                                min={0}
                                max={500}
                                step={10}
                                className="w-full"
                            />
                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                <span>{priceRange[0]}₪</span>
                                <span>{priceRange[1]}₪</span>
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Note minimum
                        </Label>
                        <div className="flex gap-2">
                            {['0', '3', '4', '4.5'].map((rating) => (
                                <Button
                                    key={rating}
                                    variant={minRating === rating ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMinRating(rating)}
                                    className={minRating === rating ? "bg-navy" : ""}
                                >
                                    {rating === '0' ? 'Tous' : (
                                        <span className="flex items-center gap-1">
                                            {rating}
                                            <Star className="w-3 h-3 fill-current" />
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter className="flex gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                        <X className="w-4 h-4 mr-2" />
                        Réinitialiser
                    </Button>
                    <Button onClick={applyFilters} className="flex-1 bg-navy hover:bg-navy-light">
                        Appliquer
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
