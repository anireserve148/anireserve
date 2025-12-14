"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight, Star } from "lucide-react"

import { FavoriteButton } from "@/components/favorites/favorite-button"

// Types pour les props
export type ProResult = {
    id: string
    name: string
    image: string | null
    city: string
    hourlyRate: number
    categories: string[]
    rating?: number
    reviewCount?: number
    isFavorite: boolean
}

interface HomeResultsProps {
    pros: ProResult[]
}

export function HomeResults({ pros = [] }: HomeResultsProps) {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/50 h-full min-h-[600px]">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📋</span>
                <h2 className="text-xl font-bold font-poppins text-navy">Résultats de la recherche</h2>
            </div>
            <p className="text-sm text-gray-500 mb-8">
                Sélectionne un pro pour voir ses créneaux ✨
            </p>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '800px' }}>
                {pros.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        Aucun professionnel ne correspond à vos critères.
                    </div>
                ) : (
                    pros.map((pro) => (
                        <div
                            key={pro.id}
                            className="group relative bg-white border border-gray-100 hover:border-[#3DBAA2]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#3DBAA2]/5"
                        >
                            {/* Green vertical bar on hover */}
                            <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#3DBAA2] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-navy group-hover:text-[#3DBAA2] transition-colors">
                                                {pro.name}
                                            </h3>
                                            <div className="text-sm text-gray-500 font-medium mb-3">
                                                {pro.categories.join(', ')} · {pro.city}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <FavoriteButton proId={pro.id} isFavorite={pro.isFavorite} />
                                        </div>

                                        {/* Button Mobile: Hidden on desktop, shown on mobile */}
                                        <div className="sm:hidden flex gap-2">
                                            <FavoriteButton proId={pro.id} isFavorite={pro.isFavorite} />
                                            <Link href={`/pros/${pro.id}`}>
                                                <Button size="sm" className="bg-[#3DBAA2] hover:bg-[#34a08b] text-white rounded-full px-4">
                                                    Réserver
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                        Professionnel certifié · {pro.hourlyRate}₪/heure
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <Link href={`/pros/${pro.id}`} className="flex items-center hover:text-[#3DBAA2] transition-colors">
                                            Voir le profil <ArrowRight className="w-3 h-3 ml-1" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Desktop Button & Price */}
                                <div className="hidden sm:flex flex-col items-end justify-between min-w-[120px]">
                                    <Link href={`/pros/${pro.id}`}>
                                        <Button className="bg-[#78D0B5] hover:bg-[#3DBAA2] text-white rounded-full px-6 font-semibold shadow-md shadow-emerald-100 transition-all hover:scale-105">
                                            ✨ Réserver
                                        </Button>
                                    </Link>

                                    {pro.rating && (
                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                                            <span className="text-amber-700 font-bold text-sm">{pro.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
