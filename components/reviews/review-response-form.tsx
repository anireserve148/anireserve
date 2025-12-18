"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Loader2 } from "lucide-react"
import { addReviewResponse } from "@/app/lib/review-actions"
import { toast } from "sonner"

interface ReviewResponseFormProps {
    reviewId: string
    clientName: string
    rating: number
    comment: string | null
    onSuccess?: () => void
}

export function ReviewResponseForm({ reviewId, clientName, rating, comment, onSuccess }: ReviewResponseFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState("")

    const handleSubmit = async () => {
        if (!response.trim()) {
            toast.error("Veuillez écrire une réponse")
            return
        }

        setIsLoading(true)
        try {
            const result = await addReviewResponse({ reviewId, proResponse: response.trim() })
            if (result.success) {
                toast.success("Réponse publiée !")
                setOpen(false)
                setResponse("")
                if (onSuccess) onSuccess()
            } else {
                toast.error(result.error || "Erreur lors de la publication")
            }
        } catch (error) {
            toast.error("Une erreur inattendue est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Répondre
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Répondre à l'avis de {clientName}</DialogTitle>
                    <DialogDescription>
                        Votre réponse sera visible publiquement sur votre profil.
                    </DialogDescription>
                </DialogHeader>

                {/* Show the review */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
                                ★
                            </span>
                        ))}
                    </div>
                    {comment && (
                        <p className="text-sm text-gray-600 italic">"{comment}"</p>
                    )}
                </div>

                {/* Response textarea */}
                <div className="grid gap-2">
                    <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Écrivez votre réponse..."
                        rows={4}
                        maxLength={500}
                        className="resize-none"
                    />
                    <p className="text-xs text-gray-500 text-right">
                        {response.length}/500 caractères
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-navy hover:bg-navy-light">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publier la réponse
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
