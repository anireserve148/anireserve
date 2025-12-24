"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { addProService } from "@/app/lib/service-actions"

interface Category {
    id: string
    name: string
}

export function ServiceForm({ categories }: {
    categories: Category[]
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        description: "",
        customPrice: "",
        duration: "60"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("Le nom du service est obligatoire")
            return
        }

        if (!formData.customPrice) {
            toast.error("Le prix est obligatoire")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await addProService({
                name: formData.name.trim(),
                categoryId: formData.categoryId && formData.categoryId !== 'none' ? formData.categoryId : undefined,
                description: formData.description || undefined,
                customPrice: parseFloat(formData.customPrice),
                duration: parseInt(formData.duration)
            })

            if (result.success) {
                toast.success("Service ajouté avec succès !")
                setFormData({ name: "", categoryId: "", description: "", customPrice: "", duration: "60" })
            } else {
                toast.error(result.error || "Erreur lors de l'ajout")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Nom du service *</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Coupe + Brushing, Massage relaxant..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            {/* Category (optional) */}
            <div className="space-y-2">
                <Label htmlFor="category">Catégorie (optionnel)</Label>
                <Select
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Aucune catégorie</SelectItem>
                        {categories.map((cat) => (
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
                    <Label htmlFor="price">Prix (₪) *</Label>
                    <Input
                        id="price"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Ex: 150"
                        value={formData.customPrice}
                        onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
                        required
                    />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes) *</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="15"
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
                    placeholder="Décrivez votre service en détail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.customPrice}
                className="w-full bg-primary hover:bg-primary/90"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ajout...
                    </>
                ) : (
                    <>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter le service
                    </>
                )}
            </Button>
        </form>
    )
}
