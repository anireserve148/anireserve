"use client"

import { useState, useEffect } from "react"
import { getGlobalReservations, type ReservationFilter } from "@/app/lib/admin-reservation-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"

export function AdminReservationsTable() {
    const [reservations, setReservations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData()
        }, 500)
        return () => clearTimeout(timer)
    }, [search, status, page])

    async function fetchData() {
        setLoading(true)
        try {
            const data = await getGlobalReservations({ search, status, page })
            setReservations(data.reservations)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.error("Failed to fetch reservations", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Toutes les Réservations</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Total pages: {totalPages}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Rechercher par ID, client ou pro..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tout voir</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                            <SelectItem value="COMPLETED">Terminé</SelectItem>
                            <SelectItem value="CANCELLED">Annulé</SelectItem>
                            <SelectItem value="REJECTED">Refusé</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Professionnel</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : reservations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        Aucune réservation trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reservations.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {new Date(res.startDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(res.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{res.client.name}</div>
                                            <div className="text-xs text-gray-500">{res.client.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{res.pro.user.name}</div>
                                            <div className="text-xs text-gray-500">{res.pro.city.name}</div>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {res.totalPrice}€
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    ${res.status === 'CONFIRMED' ? 'text-green-600 border-green-200 bg-green-50' :
                                                        res.status === 'PENDING' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                                                            res.status === 'REJECTED' || res.status === 'CANCELLED' ? 'text-red-600 border-red-200 bg-red-50' :
                                                                'text-blue-600 border-blue-200 bg-blue-50'}
                                                `}
                                            >
                                                {res.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Détails
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        Précédent
                    </Button>
                    <div className="text-sm text-gray-500">
                        Page {page} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        Suivant
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
