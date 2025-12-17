"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { submitProApplication } from "@/app/lib/application-actions"
import { ChevronRight, ChevronLeft, Upload, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { BackButton } from "@/components/ui/back-button"

interface ProRegisterFormProps {
    cities: { id: string; name: string }[]
    categories: { id: string; name: string }[]
    allCategories: { id: string; name: string; parentId: string | null }[]
}

export function ProRegisterForm({ cities, categories, allCategories }: ProRegisterFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        cityIds: [] as string[],
        categoryIds: [] as string[],
        idPhotoUrl: ""
    })

    const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Veuillez sélectionner une image")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("L'image ne doit pas dépasser 5MB")
            return
        }

        setIsUploading(true)
        // Set preview immediately for better UX, but show loading overlay
        const reader = new FileReader()
        reader.onloadend = () => {
            setIdPhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to server
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            setFormData(prev => ({ ...prev, idPhotoUrl: data.url }))
            toast.success("Photo téléchargée avec succès")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Erreur lors du téléchargement. Veuillez réessayer.")
            setIdPhotoPreview(null) // Clear preview on failure so user knows it failed
            // Reset file input value if possible (ref would be better but simple state reset is enough to force re-select)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async () => {
        // Validation - checking all fields at once
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
            toast.error("Veuillez remplir vos informations personnelles")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas")
            return
        }

        if (formData.cityIds.length === 0) {
            toast.error("Sélectionnez au moins une ville")
            return
        }

        if (formData.categoryIds.length === 0) {
            toast.error("Sélectionnez au moins une catégorie")
            return
        }

        if (!formData.idPhotoUrl) {
            toast.error("La photo d'identité est requise")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitProApplication({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                cityIds: formData.cityIds,
                categoryIds: formData.categoryIds,
                idPhotoUrl: formData.idPhotoUrl
            })

            if (result.success) {
                router.push('/register/pro/pending')
            } else {
                toast.error(result.error || "Erreur lors de la soumission")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleCity = (cityId: string) => {
        setFormData(prev => ({
            ...prev,
            cityIds: prev.cityIds.includes(cityId)
                ? prev.cityIds.filter(id => id !== cityId)
                : [...prev.cityIds, cityId]
        }))
    }

    const toggleCategory = (categoryId: string) => {
        const isSelected = formData.categoryIds.includes(categoryId)

        // If unchecking a parent, uncheck all its children too
        const subcategories = allCategories.filter(c => c.parentId === categoryId)
        let newIds = isSelected
            ? formData.categoryIds.filter(id => id !== categoryId && !subcategories.find(s => s.id === id))
            : [...formData.categoryIds, categoryId]

        setFormData(prev => ({ ...prev, categoryIds: newIds }))
    }

    const toggleSubCategory = (subId: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(subId)
                ? prev.categoryIds.filter(id => id !== subId)
                : [...prev.categoryIds, subId]
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Back Button */}
                <BackButton href="/" label="Retour à l'accueil" />


                {/* 1. Informations Personnelles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                            <span className="bg-navy text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Informations Personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">Prénom *</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Nom *</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="phone">Téléphone *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="05X-XXX-XXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Mot de passe *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirmer *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Villes & Services */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                            <span className="bg-navy text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            Villes & Services
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="mb-3 block font-semibold">Villes de travail *</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4 bg-white/50">
                                {cities.map(city => (
                                    <div key={city.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`city-${city.id}`}
                                            checked={formData.cityIds.includes(city.id)}
                                            onCheckedChange={() => toggleCity(city.id)}
                                        />
                                        <label htmlFor={`city-${city.id}`} className="text-sm cursor-pointer select-none">
                                            {city.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-3 block font-semibold">Catégories de service *</Label>
                            <div className="space-y-2 border rounded-lg p-4 bg-white/50">
                                {categories.map(category => {
                                    const subcategories = allCategories.filter(c => c.parentId === category.id)
                                    const hasSubcategories = subcategories.length > 0
                                    const isSelected = formData.categoryIds.includes(category.id)
                                    // Show subs if selected OR specifically opened (though logic binds them)
                                    const showSubs = isSelected && hasSubcategories

                                    return (
                                        <div key={category.id} className={`rounded-lg transition-all ${isSelected ? 'bg-navy/5 p-2' : ''}`}>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${category.id}`}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleCategory(category.id)}
                                                />
                                                <label htmlFor={`cat-${category.id}`} className="text-sm font-medium cursor-pointer flex-1 select-none">
                                                    {category.name}
                                                </label>
                                            </div>

                                            {/* Subcategories - Only visible if parent is checked */}
                                            {showSubs && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                                    {subcategories.map(sub => (
                                                        <div key={sub.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`cat-${sub.id}`}
                                                                checked={formData.categoryIds.includes(sub.id)}
                                                                onCheckedChange={() => toggleSubCategory(sub.id)}
                                                            />
                                                            <label htmlFor={`cat-${sub.id}`} className="text-sm cursor-pointer text-gray-600 select-none">
                                                                {sub.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Document d'Identité */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                            <span className="bg-navy text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            Document d'Identité
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label className="mb-3 block text-gray-600">Photo de votre Teoudat Zehut *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                            {idPhotoPreview ? (
                                <div className="space-y-4">
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={idPhotoPreview}
                                            alt="Teoudat Zehut"
                                            fill
                                            className="object-contain rounded"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIdPhotoPreview(null)
                                            setFormData(prev => ({ ...prev, idPhotoUrl: "" }))
                                        }}
                                    >
                                        Changer la photo
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Cliquez pour télécharger ou glissez une image
                                    </p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="max-w-xs mx-auto text-xs"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-navy hover:bg-navy-light text-lg py-6 shadow-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Traitement en cours...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Soumettre ma candidature
                            </>
                        )}
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        En soumettant ce formulaire, vous acceptez nos conditions générales d'utilisation pour les professionnels.
                    </p>
                </div>

            </div>
        </div>
    )
}
