"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createReview } from "@/app/lib/review-actions"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormProps {
    reservationId: string
    proName: string
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function ReviewForm({ reservationId, proName, trigger, onSuccess }: ReviewFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez sélectionner une note")
            return
        }

        setIsLoading(true)
        try {
            const result = await createReview({ reservationId, rating, comment })
            if (result.success) {
                toast.success("Merci pour votre avis !")
                setOpen(false)
                if (onSuccess) onSuccess()
            } else {
                toast.error(result.error || "Erreur lors de l'envoi de l'avis")
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
                {trigger || <Button variant="outline" size="sm">Laisser un avis</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Noter votre expérience</DialogTitle>
                    <DialogDescription>
                        Partagez votre avis sur votre rendez-vous avec {proName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label>Votre note</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300 fill-gray-100"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="comment">Commentaire (optionnel)</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Dites-nous ce que vous avez pensé du service..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-navy text-white hover:bg-navy-light">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publier mon avis
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
