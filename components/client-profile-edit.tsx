"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateClientProfile } from "@/app/lib/profile-actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ClientProfileEdit({ user }: { user: { name: string; email: string; phoneNumber?: string | null; address?: string | null } }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
    })

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

    if (!isEditing) {
        return (
            <Card>
                <CardHeader>
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
                        <Button type="submit" disabled={isSaving} className="flex-1">
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
                                    address: user.address || ''
                                })
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
