"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateClientProfile } from "@/app/lib/profile-actions"
import { Loader2, Camera, User } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ClientProfileEditProps {
    user: {
        name: string
        email: string
        phoneNumber?: string | null
        address?: string | null
        image?: string | null
    }
}

export function ClientProfileEdit({ user }: ClientProfileEditProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        image: user.image || ''
    })
    const [imagePreview, setImagePreview] = useState<string | null>(user.image || null)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Veuillez sélectionner une image")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("L'image ne doit pas dépasser 5MB")
            return
        }

        setIsUploading(true)

        // Show preview immediately
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to server
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            setFormData(prev => ({ ...prev, image: data.url }))
            toast.success("Photo téléchargée avec succès")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Erreur lors du téléchargement")
            setImagePreview(user.image || null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const result = await updateClientProfile(formData)

            if (result.success) {
                toast.success('Profil mis à jour avec succès')
                setIsEditing(false)
            } else {
                toast.error(result.error || 'Erreur lors de la mise à jour')
            }
        } catch (error) {
            toast.error('Une erreur inattendue est survenue')
        } finally {
            setIsSaving(false)
        }
    }

    const ProfileAvatar = ({ editable = false }: { editable?: boolean }) => (
        <div className="relative w-20 h-20 mx-auto mb-4">
            {imagePreview ? (
                <Image
                    src={imagePreview}
                    alt="Photo de profil"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                />
            ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
            )}
            {editable && (
                <label className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 rounded-full cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            )}
            {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
            )}
        </div>
    )

    if (!isEditing) {
        return (
            <Card>
                <CardHeader>
                    <ProfileAvatar />
                    <CardTitle>Mon Profil</CardTitle>
                    <CardDescription>Gérez vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Nom</div>
                        <div>{user.name || "Non renseigné"}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                        <div>{user.email}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Téléphone</div>
                        <div>{user.phoneNumber || "Non renseigné"}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Adresse</div>
                        <div>{user.address || "Non renseigné"}</div>
                    </div>
                    <Button variant="outline" className="w-full mt-2" onClick={() => setIsEditing(true)}>
                        Modifier le profil
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <ProfileAvatar editable />
                <CardTitle>Modifier le Profil</CardTitle>
                <CardDescription>Mettez à jour vos informations</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="+972..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Tel Aviv..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSaving || isUploading} className="flex-1">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false)
                                setFormData({
                                    name: user.name || '',
                                    email: user.email,
                                    phoneNumber: user.phoneNumber || '',
                                    address: user.address || '',
                                    image: user.image || ''
                                })
                                setImagePreview(user.image || null)
                            }}
                            disabled={isSaving}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
