"use client"

import { useState } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/app/lib/category-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react"

interface Category {
    id: string
    name: string
    parentId: string | null
    children?: Category[]
    _count?: {
        proServices: number
    }
}

interface CategoryManagerProps {
    categories: Category[]
}

export function CategoryManager({ categories }: CategoryManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim()) return

        setLoading(true)
        try {
            if (editingCategory) {
                const res = await updateCategory(editingCategory.id, { name })
                if (!res.success) throw new Error(res.error)
                toast.success("Catégorie mise à jour")
            } else {
                const res = await createCategory({ name })
                if (!res.success) throw new Error(res.error)
                toast.success("Catégorie créée")
            }
            setIsDialogOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error("Erreur", { description: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return

        try {
            const res = await deleteCategory(id)
            if (!res.success) throw new Error(res.error)
            toast.success("Catégorie supprimée")
        } catch (error: any) {
            toast.error("Erreur", { description: error.message })
        }
    }

    const openCreate = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const openEdit = (cat: Category) => {
        setEditingCategory(cat)
        setName(cat.name)
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingCategory(null)
        setName("")
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gestion des Catégories</CardTitle>
                    <CardDescription>Ajoutez ou modifiez les services disponibles sur la plateforme.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} className="bg-navy hover:bg-navy/90 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Nouvelle Catégorie
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Nom de la catégorie (ex: Toilettage)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FolderTree className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-navy">{cat.name}</h4>
                                    <p className="text-xs text-gray-500">
                                        {cat._count?.proServices || 0} services actifs
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => openEdit(cat)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(cat.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
