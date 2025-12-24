'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Upload, Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { getPortfolioItems, deletePortfolioItem } from '@/app/lib/portfolio-actions'

export function PortfolioEditor() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showUpload, setShowUpload] = useState(false)
    const [caption, setCaption] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        setLoading(true)
        const result = await getPortfolioItems()
        if (result.success) {
            setItems(result.data || [])
        }
        setLoading(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('caption', caption)

        try {
            const response = await fetch('/api/pro/portfolio/upload', {
                method: 'POST',
                body: formData
            })
            const result = await response.json()

            if (result.success) {
                toast.success('Image ajoutée avec succès !')
                setSelectedFile(null)
                setPreviewUrl(null)
                setCaption('')
                setShowUpload(false)
                loadItems()
            } else {
                toast.error(result.error || 'Erreur lors de l’upload')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Une erreur est survenue')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette image ?')) return

        const result = await deletePortfolioItem(id)
        if (result.success) {
            toast.success('Image supprimée')
            setItems(items.filter(item => item.id !== id))
        } else {
            toast.error(result.error)
        }
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
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Ma Galerie</h2>
                <Button
                    onClick={() => setShowUpload(true)}
                    className="bg-[#2EB190] hover:bg-[#238B70]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une photo
                </Button>
            </div>

            {showUpload && (
                <Card className="bg-[#1A1A2E] border-[#2A2A4A] relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-[#6C6C8A]"
                        onClick={() => {
                            setShowUpload(false)
                            setPreviewUrl(null)
                            setSelectedFile(null)
                        }}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-poppins">Ajouter au portfolio</CardTitle>
                        <CardDescription className="text-[#6C6C8A]">Partagez vos meilleures réalisations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#2A2A4A] rounded-xl p-8 hover:border-[#2EB190] transition-colors bg-[#16162D]">
                            {previewUrl ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <label className="flex flex-col items-center cursor-pointer">
                                    <Upload className="w-10 h-10 text-[#2EB190] mb-2" />
                                    <span className="text-white font-medium">Cliquez pour choisir une photo</span>
                                    <span className="text-[#6C6C8A] text-sm mt-1">PNG, JPG ou WEBP (Max 5Mo)</span>
                                    <Input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-[#A0A0B8]">Légende (Optionnelle)</label>
                            <Input
                                placeholder="Ex: Coupe dégradée, Maquillage soirée..."
                                className="bg-[#16162D] border-[#2A2A4A] text-white"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full bg-[#2EB190] hover:bg-[#238B70]"
                            disabled={!selectedFile || uploading}
                            onClick={handleUpload}
                        >
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {uploading ? 'Envoi en cours...' : 'Publier sur mon profil'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.length === 0 && !showUpload && (
                    <div className="col-span-full border-2 border-dashed border-[#2A2A4A] rounded-2xl p-12 text-center">
                        <ImageIcon className="w-12 h-12 text-[#2A2A4A] mx-auto mb-4" />
                        <p className="text-[#A0A0B8] mb-4">Votre portfolio est vide</p>
                        <Button
                            variant="outline"
                            className="border-[#2EB190] text-[#2EB190] hover:bg-[#2EB190]/10"
                            onClick={() => setShowUpload(true)}
                        >
                            Ajouter ma première réalisation
                        </Button>
                    </div>
                )}
                {items.map((item) => (
                    <Card key={item.id} className="bg-[#1A1A2E] border-[#2A2A4A] overflow-hidden group">
                        <div className="relative aspect-square">
                            <Image
                                src={item.imageUrl}
                                alt={item.caption || 'Photo Portfolio'}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        {item.caption && (
                            <CardContent className="p-3">
                                <p className="text-sm text-white truncate">{item.caption}</p>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
