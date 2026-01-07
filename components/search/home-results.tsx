"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, List, Map as MapIcon, LayoutGrid, MapPin, Clock, Check, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { QuickBookModal } from "@/components/quick-book-modal"
import dynamic from "next/dynamic"

// Dynamic import for MapResults to avoid Leaflet SSR issues
const MapResults = dynamic(() => import("./map-results").then(mod => mod.MapResults), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="text-gray-400 flex flex-col items-center gap-2">
                <MapPin className="w-8 h-8" />
                <p className="font-medium text-sm">Chargement de la carte...</p>
            </div>
        </div>
    )
})

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
                            <div className="grid grid-cols-1 gap-4">
                                {pros.map((pro, index) => (
                                    <motion.div
                                        key={pro.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        className="group relative bg-white border border-gray-100 hover:border-primary/30 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            {/* Photo de profil stylish */}
                                            <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 flex-shrink-0 border border-gray-50 shadow-inner">
                                                {pro.image ? (
                                                    <Image
                                                        src={pro.image}
                                                        alt={pro.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-primary/20 uppercase tracking-widest bg-emerald-50/30">
                                                        {pro.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3 text-primary" />
                                                    <span className="text-[10px] font-bold text-primary uppercase">Vérifié</span>
                                                </div>
                                            </div>

                                            {/* Contenu de la carte */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors truncate">
                                                                {pro.name}
                                                            </h3>
                                                            {pro.rating && pro.rating > 0 && (
                                                                <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                                                                    <Star className="w-3 h-3 text-accent fill-accent" />
                                                                    <span className="text-xs font-black text-accent-dark">{pro.rating.toFixed(1)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium mb-3">
                                                            <MapPin className="w-3.5 h-3.5 text-primary/60" />
                                                            {pro.city}
                                                        </div>
                                                    </div>

                                                    <div className="hidden sm:flex flex-col items-end gap-3">
                                                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-4 py-1.5 rounded-xl text-sm transition-all hover:bg-primary/10">
                                                            {pro.hourlyRate}₪/h
                                                        </Badge>
                                                        <FavoriteButton proId={pro.id} isFavorite={pro.isFavorite} />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {pro.categories.slice(0, 3).map((cat) => (
                                                        <span key={cat} className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 group-hover:bg-white group-hover:border-primary/10 group-hover:text-primary/60 transition-all">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <Link href={`/pros/${pro.id}`} className="group/link flex items-center text-sm font-bold text-gray-400 hover:text-primary transition-colors">
                                                        Voir les détails
                                                        <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                                                    </Link>

                                                    <div className="flex sm:hidden items-center gap-2">
                                                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-3 py-1 rounded-xl text-xs">
                                                            {pro.hourlyRate}₪/h
                                                        </Badge>
                                                        <FavoriteButton proId={pro.id} isFavorite={pro.isFavorite} />
                                                    </div>

                                                    <Button
                                                        onClick={() => handleBookClick(pro)}
                                                        className="hidden sm:flex bg-primary hover:bg-primary-dark text-white rounded-xl px-10 h-11 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        ✨ Réserver
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile: Bouton réserver en bas */}
                                        <div className="mt-4 sm:hidden">
                                            <Button
                                                onClick={() => handleBookClick(pro)}
                                                className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-12 font-bold shadow-lg shadow-primary/10"
                                            >
                                                ✨ Réserver Maintenant
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                        }
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
