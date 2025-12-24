'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportReservationsCSV } from '@/app/lib/stats-actions'
import { toast } from 'sonner'

export function ExportCSVButton() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const result = await exportReservationsCSV()
            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.setAttribute('href', url)
                link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success('Export CSV réussi !')
            } else {
                toast.error(result.error || 'Erreur lors de l’export')
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Une erreur est survenue lors de l’export')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[#2EB190] hover:bg-[#238B70] text-white"
        >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportation...' : 'Exporter en CSV'}
        </Button>
    )
}
