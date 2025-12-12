import { Star } from "lucide-react"

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
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-semibold text-navy">{review.client.name || "Client Anonyme"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    {review.comment && (
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-3 rounded-lg">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            ))}
        </div>
    )
}
