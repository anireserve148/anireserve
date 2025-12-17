"use client"

import { useState } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/app/lib/category-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, FolderOpen, Folder } from "lucide-react"

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

export function CategoryManager({ categories: initialCategories }: CategoryManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [name, setName] = useState("")
    const [parentId, setParentId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    // Organize categories into hierarchy
    const parentCategories = initialCategories.filter(c => !c.parentId)

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const handleSubmit = async () => {
        if (!name.trim()) return

        setLoading(true)
        try {
            if (editingCategory) {
                const res = await updateCategory(editingCategory.id, { name, parentId })
                if (!res.success) throw new Error(res.error)
                toast.success("Catégorie mise à jour")
            } else {
                const res = await createCategory({ name, parentId })
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

    const openCreate = (parentCategoryId?: string) => {
        resetForm()
        setParentId(parentCategoryId || null)
        setIsDialogOpen(true)
    }

    const openEdit = (cat: Category) => {
        setEditingCategory(cat)
        setName(cat.name)
        setParentId(cat.parentId)
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingCategory(null)
        setName("")
        setParentId(null)
    }

    const renderCategory = (cat: Category, depth: number = 0) => {
        const hasChildren = cat.children && cat.children.length > 0
        const isExpanded = expandedIds.has(cat.id)
        const indent = depth * 24

        return (
            <div key={cat.id}>
                {/* Category Row */}
                <div
                    className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors group"
                    style={{ paddingLeft: `${indent + 12}px` }}
                >
                    <div className="flex items-center gap-3 flex-1">
                        {/* Expand/Collapse Button */}
                        {hasChildren ? (
                            <button
                                onClick={() => toggleExpand(cat.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                            </button>
                        ) : (
                            <div className="w-6" />
                        )}

                        {/* Icon */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${depth === 0 ? 'bg-navy/10 text-navy' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                            {hasChildren || depth === 0 ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                        </div>

                        {/* Name & Count */}
                        <div className="flex-1">
                            <h4 className={`font-semibold ${depth === 0 ? 'text-navy text-base' : 'text-gray-700 text-sm'}`}>
                                {cat.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {cat._count?.proServices || 0} services actifs
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {depth === 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => openCreate(cat.id)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Sous-catégorie
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            onClick={() => openEdit(cat)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            onClick={() => handleDelete(cat.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Children (if expanded) */}
                {isExpanded && hasChildren && (
                    <div>
                        {cat.children!.map(child => renderCategory(child, depth + 1))}
                    </div>
                )}
            </div>
        )
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
                        <Button onClick={() => openCreate()} className="bg-navy hover:bg-navy/90 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Nouvelle Catégorie
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="name">Nom de la catégorie</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Toilettage"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="parent">Catégorie parente (optionnel)</Label>
                                <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? null : v)}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Aucune (catégorie principale)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Aucune (catégorie principale)</SelectItem>
                                        {parentCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                <div className="border rounded-lg overflow-hidden bg-white">
                    {parentCategories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune catégorie pour le moment</p>
                            <p className="text-sm">Cliquez sur "Nouvelle Catégorie" pour en ajouter une</p>
                        </div>
                    ) : (
                        parentCategories.map(cat => renderCategory(cat))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
