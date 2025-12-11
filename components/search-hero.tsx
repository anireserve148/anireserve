"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { MapPin, Search } from "lucide-react"

interface SearchHeroProps {
    cities: { id: string; name: string }[]
    categories: { id: string; name: string }[]
}

export function SearchHero({ cities, categories }: SearchHeroProps) {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [city, setCity] = useState("")
    const [category, setCategory] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        if (city && city !== "all") params.set("city", city)
        if (category && category !== "all") params.set("category", category)

        router.push(`/search?${params.toString()}`)
    }

    return (
        <div className="relative py-24 sm:py-32 overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                    Trouvez le <span className="text-primary">Talent Parfait</span> pour Votre Événement
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto mb-10">
                    Des cosplayeurs aux photographes, réservez les meilleurs professionnels pour vos conventions, shootings et fêtes en Israël.
                </p>

                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto p-2 bg-card rounded-xl border shadow-lg">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                            className="pl-10 border-0 shadow-none focus-visible:ring-0 text-lg py-6"
                            placeholder="Mots-clés..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-px bg-border hidden md:block" />

                    <div className="md:w-[200px]">
                        <select
                            className="w-full h-full bg-transparent border-0 outline-none text-lg px-4 py-2 appearance-none cursor-pointer"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Catégorie</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="w-px bg-border hidden md:block" />

                    <div className="md:w-[200px]">
                        <select
                            className="w-full h-full bg-transparent border-0 outline-none text-lg px-4 py-2 appearance-none cursor-pointer"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        >
                            <option value="">Ville</option>
                            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <Button size="lg" type="submit" className="md:w-32 py-6 text-lg font-semibold shadow-primary/25 shadow-xl">
                        Rechercher
                    </Button>
                </form>
            </div>
        </div>
    )
}
