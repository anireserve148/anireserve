import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Check, X, Clock, User } from "lucide-react"
import { useState } from "react"

interface RequestItem {
    id: string
    startDate: Date
    endDate: Date
    totalPrice: number
    client: {
        name: string | null
        email: string | null
    }
}

interface RequestsListProps {
    requests: RequestItem[]
    onAccept?: (id: string) => Promise<void>
    onReject?: (id: string) => Promise<void>
}

export function RequestsList({ requests, onAccept, onReject }: RequestsListProps) {
    const [processing, setProcessing] = useState<string | null>(null)

    const handleAccept = async (id: string) => {
        if (!onAccept) return
        setProcessing(id)
        try {
            await onAccept(id)
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (id: string) => {
        if (!onReject) return
        setProcessing(id)
        try {
            await onReject(id)
        } finally {
            setProcessing(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Demandes en attente
                    {requests.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                            {requests.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {requests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune demande en attente</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="p-4 border rounded-lg bg-orange-50/50 border-orange-200 space-y-3"
                            >
                                {/* Client Info */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-foreground">
                                            {request.client.name || 'Client'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {request.client.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Price */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-muted-foreground">
                                        {format(new Date(request.startDate), 'EEEE d MMM • HH:mm', { locale: fr })}
                                    </div>
                                    <div className="font-semibold text-primary">
                                        {request.totalPrice} ₪
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAccept(request.id)}
                                        disabled={processing === request.id}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Accepter
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleReject(request.id)}
                                        disabled={processing === request.id}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Refuser
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
