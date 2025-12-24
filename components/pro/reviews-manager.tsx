'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, MessageCircle, Reply, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { getProReviews, respondToReview } from '@/app/lib/review-actions'

export function ReviewsManager() {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [respondingTo, setRespondingTo] = useState<string | null>(null)
    const [responseText, setResponseText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadReviews()
    }, [])

    const loadReviews = async () => {
        setLoading(true)
        const result = await getProReviews()
        if (result.success) setReviews(result.data || [])
        setLoading(false)
    }

    const handleRespond = async (reviewId: string) => {
        if (!responseText.trim()) return

        setIsSubmitting(true)
        const result = await respondToReview(reviewId, responseText)
        if (result.success) {
            toast.success('Réponse envoyée !')
            setRespondingTo(null)
            setResponseText('')
            loadReviews()
        } else {
            toast.error(result.error)
        }
        setIsSubmitting(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#2EB190] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reviews.length === 0 ? (
                <Card className="bg-[#1A1A2E] border-[#2A2A4A] border-dashed">
                    <CardContent className="p-12 text-center">
                        <Star className="w-12 h-12 text-[#2A2A4A] mx-auto mb-4" />
                        <p className="text-[#A0A0B8]">Vous n'avez pas encore d'avis clients.</p>
                    </CardContent>
                </Card>
            ) : (
                reviews.map((review) => (
                    <Card key={review.id} className="bg-[#1A1A2E] border-[#2A2A4A]">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#16162D] flex items-center justify-center">
                                    <User className="w-6 h-6 text-[#A0A0B8]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-white font-bold">{review.client?.name || 'Client Anonyme'}</h3>
                                        <div className="flex bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-500 text-xs font-bold items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            {review.rating}
                                        </div>
                                    </div>
                                    <p className="text-[#6C6C8A] text-sm">
                                        {review.reservation?.service?.name || 'Service'} • {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-white italic">"{review.comment}"</p>

                            {review.proResponse ? (
                                <div className="ml-8 p-4 bg-[#16162D] rounded-xl border-l-4 border-[#2EB190]">
                                    <p className="text-sm font-bold text-[#2EB190] mb-1 flex items-center gap-2">
                                        <Reply className="w-4 h-4" />
                                        Votre réponse
                                    </p>
                                    <p className="text-white text-sm">{review.proResponse}</p>
                                    <p className="text-[#6C6C8A] text-xs mt-2">
                                        Répondu le {new Date(review.respondedAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            ) : (
                                respondingTo === review.id ? (
                                    <div className="mt-4 space-y-3">
                                        <Textarea
                                            placeholder="Écrivez votre réponse ici..."
                                            className="bg-[#16162D] border-[#2A2A4A] text-white"
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                className="bg-[#2EB190] hover:bg-[#238B70]"
                                                disabled={isSubmitting}
                                                onClick={() => handleRespond(review.id)}
                                            >
                                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Envoyer la réponse
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="text-[#6C6C8A]"
                                                onClick={() => setRespondingTo(null)}
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="border-[#7B68EE]/30 text-[#7B68EE] hover:bg-[#7B68EE]/10"
                                        onClick={() => setRespondingTo(review.id)}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Répondre à cet avis
                                    </Button>
                                )
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}
