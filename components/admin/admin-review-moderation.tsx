"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react"
import { updateReviewStatus } from "@/app/lib/admin-actions"
import { toast } from "sonner"

interface AdminReviewModerationProps {
    reviews: any[]
}

export function AdminReviewModeration({ reviews }: AdminReviewModerationProps) {
    const [localReviews, setLocalReviews] = useState(reviews)

    const handleUpdateStatus = async (reviewId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
        const result = await updateReviewStatus(reviewId, status)
        if (result.success) {
            toast.success(`Avis ${status === 'APPROVED' ? 'approuvé' : 'rejeté'} avec succès`)
            setLocalReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r))
        } else {
            toast.error("Erreur lors de la mise à jour")
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        Modération des Avis ({localReviews.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {localReviews.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Aucun avis à modérer pour le moment.
                            </div>
                        ) : (
                            localReviews.map((review) => (
                                <div key={review.id} className="p-4 border rounded-2xl bg-white hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        review.status === 'APPROVED' ? 'text-green-600 border-green-200 bg-green-50' :
                                                            review.status === 'REJECTED' ? 'text-red-600 border-red-200 bg-red-50' :
                                                                'text-yellow-600 border-yellow-200 bg-yellow-50'
                                                    }
                                                >
                                                    {review.status}
                                                </Badge>
                                            </div>

                                            <div className="mb-3">
                                                <p className="font-bold text-navy text-sm">
                                                    {review.client.name} ➔ {review.pro.user.name}
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-start">
                                            {review.status !== 'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 hover:bg-green-600 text-white gap-1.5"
                                                    onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approuver
                                                </Button>
                                            )}
                                            {review.status !== 'REJECTED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                                                    onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                                                >
                                                    <XCircle className="w-4 h-4" /> Rejeter
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
