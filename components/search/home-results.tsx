"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, List, Map as MapIcon, LayoutGrid } from "lucide-react"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { QuickBookModal } from "@/components/quick-book-modal"
import { MapResults } from "./map-results"

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
    latitude?: number | null
    longitude?: number | null
}

interface HomeResultsProps {
    pros: ProResult[]
}

export function HomeResults({ pros = [] }: HomeResultsProps) {
    const [selectedPro, setSelectedPro] = useState<ProResult | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"list" | "map">("list")

    const handleBookClick = (pro: ProResult) => {
        setSelectedPro(pro)
        setModalOpen(true)
    }

    return (
        <>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-border/50 h-full min-h-[600px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">📋</span>
                            <h2 className="text-lg sm:text-xl font-bold font-poppins text-navy">Résultats de la recherche</h2>
                        </div>
                        <p className="text-sm text-gray-500">
                            {pros.length} professionnel{pros.length > 1 ? 's' : ''} trouvé{pros.length > 1 ? 's' : ''} ✨
                        </p>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className={`rounded-lg h-9 px-4 transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm hover:bg-white" : "text-gray-500 hover:bg-gray-200"}`}
                        >
                            <List className="w-4 h-4 mr-2" /> Liste
                        </Button>
                        <Button
                            variant={viewMode === "map" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("map")}
                            className={`rounded-lg h-9 px-4 transition-all ${viewMode === "map" ? "bg-white text-primary shadow-sm hover:bg-white" : "text-gray-500 hover:bg-gray-200"}`}
                        >
                            <MapIcon className="w-4 h-4 mr-2" /> Carte
                        </Button>
                    </div>
                </div>

                {viewMode === "map" ? (
                    <MapResults pros={pros} />
                ) : (
                    <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '800px' }}>
                        {pros.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-4xl text-primary/40">🔍</span>
                                </div>
                                <h3 className="text-xl font-bold text-navy mb-2">Aucun pro à l'horizon</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    Nous n'avons trouvé aucun professionnel correspondant à vos filtres actuels.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 rounded-full border-primary/20 text-primary hover:bg-primary/5"
                                    onClick={() => window.location.href = '/'}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        ) : (
                            pros.map((pro) => (
                                <div
                                    key={pro.id}
                                    className="group relative bg-white border border-gray-100 hover:border-[#3DBAA2]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#3DBAA2]/5"
                                >
                                    {/* Green vertical bar on hover */}
                                    <div className="absolute left-0 top-4 bottom-4 sm:top-6 sm:bottom-6 w-1 bg-[#3DBAA2] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-bold text-navy group-hover:text-[#3DBAA2] transition-colors">
                                                        {pro.name}
                                                    </h3>
                                                    <div className="text-xs sm:text-sm text-gray-500 font-medium mb-2 sm:mb-3">
                                                        {pro.categories.slice(0, 2).join(', ')} · {pro.city}
                                                    </div>
                                                </div>

                                                {/* Desktop: Favorite + Book */}
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <FavoriteButton proId={pro.id} isFavorite={pro.isFavorite} />
                                                    <Button
                                                        onClick={() => handleBookClick(pro)}
                                                        className="bg-[#78D0B5] hover:bg-[#3DBAA2] text-white rounded-full px-6 font-semibold shadow-md shadow-emerald-100 transition-all hover:scale-105"
                                                    >
                                                        ✨ Réserver
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                                                Professionnel certifié · {pro.hourlyRate}₪/heure
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <Link href={`/pros/${pro.id}`} className="flex items-center text-xs font-medium text-gray-500 hover:text-[#3DBAA2] transition-colors">
                                                    Voir le profil <ArrowRight className="w-3 h-3 ml-1" />
                                                </Link>

                                                {pro.rating && pro.rating > 0 && (
                                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                                                        <span className="text-amber-700 font-bold text-xs sm:text-sm">{pro.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mobile: Buttons at bottom */}
                                        <div className="flex sm:hidden items-center justify-between gap-2 pt-3 border-t border-gray-100">
                                            <FavoriteButton proId={pro.id} isFavorite={pro.isFavorite} />
                                            <Button
                                                onClick={() => handleBookClick(pro)}
                                                className="flex-1 bg-[#3DBAA2] hover:bg-[#34a08b] text-white rounded-full font-semibold"
                                            >
                                                Réserver maintenant
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Quick Book Modal */}
            {selectedPro && (
                <QuickBookModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    pro={selectedPro}
                />
            )}
        </>
    )
}
