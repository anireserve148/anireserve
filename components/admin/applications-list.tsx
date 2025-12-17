"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { approveApplication, rejectApplication, requestDocuments } from "@/app/lib/application-actions"
import { CheckCircle, XCircle, FileQuestion, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Application {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    cityIds: string
    categoryIds: string
    idPhotoUrl: string
    status: string
    adminNotes: string | null
    createdAt: Date
}

interface CityCategory {
    id: string
    name: string
}

interface ApplicationsListProps {
    applications: Application[]
    cities: CityCategory[]
    categories: CityCategory[]
}

export function ApplicationsList({ applications, cities, categories }: ApplicationsListProps) {
    const [filter, setFilter] = useState("all")
    const [selectedApp, setSelectedApp] = useState<Application | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [docMessage, setDocMessage] = useState("")
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [showDocsDialog, setShowDocsDialog] = useState(false)

    // Create lookup maps for fast ID -> name conversion
    const cityMap = new Map(cities.map(c => [c.id, c.name]))
    const categoryMap = new Map(categories.map(c => [c.id, c.name]))

    const filtered = applications.filter(app => {
        if (filter === "all") return true
        return app.status === filter.toUpperCase()
    })

    const handleApprove = async (appId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir approuver cette demande ?")) return

        setIsLoading(true)
        try {
            const result = await approveApplication(appId)
            if (result.success) {
                toast.success("Demande approuvée ! Le compte pro a été créé.")
                window.location.reload()
            } else {
                toast.error(result.error || "Erreur")
            }
        } catch (error) {
            toast.error("Erreur")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedApp || !rejectReason.trim()) {
            toast.error("Veuillez indiquer une raison")
            return
        }

        setIsLoading(true)
        try {
            const result = await rejectApplication(selectedApp.id, rejectReason)
            if (result.success) {
                toast.success("Demande rejetée")
                setShowRejectDialog(false)
                setRejectReason("")
                window.location.reload()
            } else {
                toast.error(result.error || "Erreur")
            }
        } catch (error) {
            toast.error("Erreur")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRequestDocs = async () => {
        if (!selectedApp || !docMessage.trim()) {
            toast.error("Veuillez indiquer les documents requis")
            return
        }

        setIsLoading(true)
        try {
            const result = await requestDocuments(selectedApp.id, docMessage)
            if (result.success) {
                toast.success("Demande de documents envoyée")
                setShowDocsDialog(false)
                setDocMessage("")
                window.location.reload()
            } else {
                toast.error(result.error || "Erreur")
            }
        } catch (error) {
            toast.error("Erreur")
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-700" },
            APPROVED: { label: "Approuvée", className: "bg-green-100 text-green-700" },
            REJECTED: { label: "Rejetée", className: "bg-red-100 text-red-700" },
            NEEDS_DOCUMENTS: { label: "Docs requis", className: "bg-blue-100 text-blue-700" },
        }
        const variant = variants[status] || variants.PENDING
        return <Badge className={variant.className}>{variant.label}</Badge>
    }

    return (
        <div>
            {/* Filter */}
            <div className="mb-6">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvées</SelectItem>
                        <SelectItem value="rejected">Rejetées</SelectItem>
                        <SelectItem value="needs_documents">Docs requis</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Applications */}
            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            Aucune demande trouvée
                        </CardContent>
                    </Card>
                ) : (
                    filtered.map(app => {
                        const cityIds: string[] = JSON.parse(app.cityIds)
                        const categoryIds: string[] = JSON.parse(app.categoryIds)

                        // Convert IDs to names
                        const cityNames = cityIds.map(id => cityMap.get(id) || id)
                        const categoryNames = categoryIds.map(id => categoryMap.get(id) || id)

                        return (
                            <Card key={app.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {app.firstName} {app.lastName}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">{app.email}</p>
                                        </div>
                                        {getStatusBadge(app.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Info */}
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                                                <p>{app.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Villes ({cityNames.length})</p>
                                                <p className="text-sm">{cityNames.slice(0, 3).join(", ")}{cityNames.length > 3 && "..."}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Catégories ({categoryNames.length})</p>
                                                <p className="text-sm">{categoryNames.slice(0, 3).join(", ")}{categoryNames.length > 3 && "..."}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Date de demande</p>
                                                <p className="text-sm">{new Date(app.createdAt).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                        </div>

                                        {/* ID Photo */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-2">Teoudat Zehut</p>
                                            <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                                                <Image
                                                    src={app.idPhotoUrl}
                                                    alt="ID"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {app.status === 'PENDING' && (
                                        <div className="flex gap-3 mt-6 pt-6 border-t">
                                            <Button
                                                onClick={() => handleApprove(app.id)}
                                                disabled={isLoading}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                                Approuver
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedApp(app)
                                                    setShowRejectDialog(true)
                                                }}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Rejeter
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedApp(app)
                                                    setShowDocsDialog(true)
                                                }}
                                            >
                                                <FileQuestion className="h-4 w-4 mr-2" />
                                                Demander docs
                                            </Button>
                                        </div>
                                    )}

                                    {app.adminNotes && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded">
                                            <p className="text-sm font-medium text-gray-700">Notes admin:</p>
                                            <p className="text-sm text-gray-600 mt-1">{app.adminNotes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeter la demande</DialogTitle>
                        <DialogDescription>
                            Indiquez la raison du rejet. Un email sera envoyé au candidat.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Raison du rejet..."
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Rejeter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Docs Dialog */}
            <Dialog open={showDocsDialog} onOpenChange={setShowDocsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Demander des documents</DialogTitle>
                        <DialogDescription>
                            Indiquez les documents supplémentaires requis.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={docMessage}
                        onChange={(e) => setDocMessage(e.target.value)}
                        placeholder="Documents requis..."
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDocsDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleRequestDocs} disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Envoyer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
