"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ClientData {
    client: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    totalSpend: number
    bookingsCount: number
    lastBooking: Date | string
}

interface ProClientsTableProps {
    clients: ClientData[]
}

export function ProClientsTable({ clients }: ProClientsTableProps) {
    const [search, setSearch] = useState("")

    const filteredClients = clients.filter(c =>
        c.client.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.client.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes Clients Fidèles ({clients.length})</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Rechercher un client..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Dernière visite</TableHead>
                                <TableHead className="text-center">Réservations</TableHead>
                                <TableHead className="text-right">Total dépensé</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                        Aucun client trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClients.map((data) => (
                                    <TableRow key={data.client.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={data.client.image || ''} />
                                                    <AvatarFallback>{data.client.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-navy">{data.client.name}</div>
                                                    <div className="text-xs text-gray-500">{data.client.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(data.lastBooking).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                {data.bookingsCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-navy">
                                            {data.totalSpend}€
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
