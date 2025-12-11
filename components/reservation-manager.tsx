"use client"

import { updateReservationStatus } from "@/app/lib/reservation-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X } from "lucide-react"
import { useState } from "react"

export function ReservationManager({ reservations }: { reservations: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleStatus = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
        setLoadingId(id)
        try {
            await updateReservationStatus(id, status)
        } catch (e) {
            console.error(e)
            alert("Action failed")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Demandes de Réservation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reservations.length === 0 ? (
                        <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
                    ) : (
                        reservations.map(res => (
                            <div key={res.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg bg-card/50">
                                <div className="mb-4 sm:mb-0">
                                    <div className="font-semibold text-lg">{res.client.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(res.startDate).toLocaleDateString()} • {new Date(res.startDate).toLocaleTimeString()} - {new Date(res.endDate).toLocaleTimeString()}
                                    </div>
                                    <div className="mt-1 font-medium">{res.totalPrice}€</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {res.status === 'PENDING' ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleStatus(res.id, 'CONFIRMED')}
                                                disabled={!!loadingId}
                                            >
                                                {loadingId === res.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                                Accepter
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleStatus(res.id, 'REJECTED')}
                                                disabled={!!loadingId}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Refuser
                                            </Button>
                                        </>
                                    ) : (
                                        <Badge variant={res.status === 'CONFIRMED' ? 'default' : 'destructive'}>
                                            {res.status}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
