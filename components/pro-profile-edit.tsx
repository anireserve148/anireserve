"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateProProfile } from "@/app/lib/profile-actions"
import { Loader2, Plus, Trash2, Save, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ProProfileEditProps {
    initialData: {
        userId: string
        bio: string | null
        hourlyRate: number
        gallery: { id: string, imageUrl: string }[]
    }
}

export function ProProfileEdit({ initialData }: ProProfileEditProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [bio, setBio] = useState(initialData.bio || "")
    const [hourlyRate, setHourlyRate] = useState(initialData.hourlyRate)
    const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData.gallery.map(g => g.imageUrl))
    const [newImageUrl, setNewImageUrl] = useState("")

    const handleAddImage = () => {
        if (!newImageUrl) return
        setGalleryUrls([...galleryUrls, newImageUrl])
        setNewImageUrl("")
    }

    const handleRemoveImage = (index: number) => {
        setGalleryUrls(galleryUrls.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append('bio', bio)
            formData.append('hourlyRate', hourlyRate.toString())
            formData.append('gallery', JSON.stringify(galleryUrls))

            const result = await updateProProfile(formData)

            if (result.success) {
                toast.success("Profil mis à jour avec succès !")
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour")
            }
        } catch (error) {
            console.error(error)
            toast.error("Une erreur inattendue est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle>Modifier mon Profil</CardTitle>
                <CardDescription>Mettez à jour vos informations publiques</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio & Présentation</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Présentez-vous aux clients..."
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Tarif Horaire (₪)</Label>
                        <Input
                            id="hourlyRate"
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                            min={0}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Galerie Photos (URLs)</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://exemple.com/image.jpg"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                            />
                            <Button type="button" variant="secondary" onClick={handleAddImage}>
                                <Plus className="w-4 h-4 mr-2" /> Ajouter
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            {galleryUrls.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {galleryUrls.length === 0 && (
                                <div className="col-span-full border-dashed border-2 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <p className="text-sm">Aucune image dans la galerie</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-navy hover:bg-navy-light text-white" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
