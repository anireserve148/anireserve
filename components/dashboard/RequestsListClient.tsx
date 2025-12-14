'use client'

import { RequestsList } from './RequestsList'
import { acceptReservation, rejectReservation } from '@/app/lib/booking-actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

interface RequestsListClientProps {
    requests: RequestItem[]
}

export function RequestsListClient({ requests }: RequestsListClientProps) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleAccept = async (id: string) => {
        setIsProcessing(true)
        try {
            const result = await acceptReservation(id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Erreur lors de l\'acceptation')
            }
        } catch (error) {
            console.error('Error accepting reservation:', error)
            alert('Une erreur est survenue')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async (id: string) => {
        const reason = prompt('Raison du refus (optionnel):')
        setIsProcessing(true)
        try {
            const result = await rejectReservation(id, reason || undefined)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Erreur lors du refus')
            }
        } catch (error) {
            console.error('Error rejecting reservation:', error)
            alert('Une erreur est survenue')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <RequestsList
            requests={requests}
            onAccept={handleAccept}
            onReject={handleReject}
        />
    )
}
