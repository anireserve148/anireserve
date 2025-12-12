import { Award, Zap, Shield, Star, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProBadgesProps {
    reviewCount: number
    averageRating: number
    isVerified?: boolean
}

export function ProBadges({ reviewCount, averageRating, isVerified = false }: ProBadgesProps) {
    const badges = []

    // Top Pro: 50+ reviews with 4.8+ rating
    if (reviewCount >= 50 && averageRating >= 4.8) {
        badges.push({
            icon: Award,
            label: "Top Pro",
            color: "bg-yellow-100 text-yellow-700 border-yellow-200"
        })
    }

    // Fast Response (placeholder - would need response time data)
    if (reviewCount >= 20) {
        badges.push({
            icon: Zap,
            label: "Réponse rapide",
            color: "bg-blue-100 text-blue-700 border-blue-200"
        })
    }

    // Verified
    if (isVerified) {
        badges.push({
            icon: Shield,
            label: "Vérifié",
            color: "bg-green-100 text-green-700 border-green-200"
        })
    }

    // Excellent Reviews
    if (averageRating >= 4.5 && reviewCount >= 10) {
        badges.push({
            icon: Star,
            label: "Avis excellents",
            color: "bg-purple-100 text-purple-700 border-purple-200"
        })
    }

    if (badges.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((badge, index) => {
                const Icon = badge.icon
                return (
                    <Badge key={index} variant="outline" className={`${badge.color} border px-2 py-1`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {badge.label}
                    </Badge>
                )
            })}
        </div>
    )
}
