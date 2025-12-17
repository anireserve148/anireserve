"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { addProService } from "@/app/lib/service-actions"

interface Category {
    id: string
    name: string
}

export function ServiceForm({ categories, existingCategoryIds }: {
    categories: Category[]
    existingCategoryIds: string[]
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        categoryId: "",
        description: "",
        customPrice: "",
        duration: "60"
    })

    const availableCategories = categories.filter(
        cat => !existingCategoryIds.includes(cat.id)
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await addProService({
                categoryId: formData.categoryId,
                description: formData.description || undefined,
                customPrice: formData.customPrice ? parseFloat(formData.customPrice) : undefined,
                duration: parseInt(formData.duration)
            })

            if (result.success) {
                toast.success("Service ajouté avec succès !")
                setFormData({ categoryId: "", description: "", customPrice: "", duration: "60" })
            } else {
                toast.error(result.error || "Erreur lors de l'ajout")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (availableCategories.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p>Toutes les catégories sont déjà utilisées.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
                <Label htmlFor="category">Catégorie de service *</Label>
                <Select
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-2">
                    <Label htmlFor="price">Prix personnalisé (₪)</Label>
                    <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Laisser vide = tarif horaire"
                        value={formData.customPrice}
                        onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
                    />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes) *</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        step="15"
                        placeholder="60"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                    id="description"
                    placeholder="Décrivez votre service..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={isSubmitting || !formData.categoryId}
                className="w-full bg-primary hover:bg-primary/90"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ajout...
                    </>
                ) : (
                    "Ajouter le service"
                )}
            </Button>
        </form>
    )
}

