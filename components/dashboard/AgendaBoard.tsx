import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock } from "lucide-react"

interface ScheduleItem {
    id: string
    startDate: Date
    endDate: Date
    status: string
    client: {
        name: string | null
    }
}

interface AgendaBoardProps {
    schedule: ScheduleItem[]
}

export function AgendaBoard({ schedule }: AgendaBoardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            CONFIRMED: 'Confirmé',
            PENDING: 'En attente',
            COMPLETED: 'Terminé',
            CANCELLED: 'Annulé'
        }
        return labels[status] || status
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Planning de la semaine
                </CardTitle>
            </CardHeader>
            <CardContent>
                {schedule.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun rendez-vous prévu cette semaine</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedule.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        {/* Client Name */}
                                        <div className="font-semibold text-foreground">
                                            {item.client.name || 'Client'}
                                        </div>

                                        {/* Date & Time */}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {format(new Date(item.startDate), 'EEEE d MMMM', { locale: fr })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {format(new Date(item.startDate), 'HH:mm')} -{' '}
                                                    {format(new Date(item.endDate), 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <Badge className={getStatusColor(item.status)} variant="outline">
                                        {getStatusLabel(item.status)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
