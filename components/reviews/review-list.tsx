import { Star, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    client: {
        name: string | null
    }
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-muted-foreground">Aucun avis pour le moment.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                {review.client.name?.[0] || "C"}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-navy">{review.client.name || "Client"}</p>
                                    {/* Verified Badge */}
                                    <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Vérifié
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed pl-13">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}
