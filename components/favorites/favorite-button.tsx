"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/app/lib/favorite-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
    proId: string
    isFavorite: boolean
    className?: string
}

export function FavoriteButton({ proId, isFavorite: initialIsFavorite, className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation if inside a card
        e.stopPropagation()

        // Optimistic update
        setIsFavorite(!isFavorite)
        setIsLoading(true)

        try {
            const result = await toggleFavorite(proId)

            if (result.success) {
                if (result.data) {
                    setIsFavorite(result.data.isFavorite) // Sync with server
                    toast.success(result.data.isFavorite ? "Ajouté aux favoris" : "Retiré des favoris")
                }
            } else {
                setIsFavorite(!isFavorite) // Revert
                if (result.error?.includes("Connectez-vous")) {
                    toast.error("Veuillez vous connecter pour ajouter des favoris")
                } else {
                    toast.error("Erreur lors de la mise à jour")
                }
            }
        } catch (error) {
            setIsFavorite(!isFavorite) // Revert
            toast.error("Une erreur est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full hover:bg-red-50 hover:text-red-500 transition-colors", className)}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart
                className={cn("h-5 w-5 transition-all", isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-400")}
            />
            <span className="sr-only">
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </span>
        </Button>
    )
}
