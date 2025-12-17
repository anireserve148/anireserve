"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { toast } from "sonner"
import { createEvent, EventAttributes } from "ics"

interface AddToCalendarButtonProps {
    reservation: {
        id: string
        startDate: Date
        endDate: Date
        proName: string
        proAddress?: string
        serviceDescription?: string
    }
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
}

export function AddToCalendarButton({
    reservation,
    variant = "outline",
    size = "sm"
}: AddToCalendarButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleAddToCalendar = () => {
        setIsGenerating(true)

        try {
            const start = new Date(reservation.startDate)
            const end = new Date(reservation.endDate)

            // Format for ics library: [year, month, day, hour, minute]
            const eventStart: [number, number, number, number, number] = [
                start.getFullYear(),
                start.getMonth() + 1, // ics months are 1-indexed
                start.getDate(),
                start.getHours(),
                start.getMinutes()
            ]

            const eventEnd: [number, number, number, number, number] = [
                end.getFullYear(),
                end.getMonth() + 1,
                end.getDate(),
                end.getHours(),
                end.getMinutes()
            ]

            const event: EventAttributes = {
                start: eventStart,
                end: eventEnd,
                title: `Réservation - ${reservation.proName}`,
                description: reservation.serviceDescription
                    ? `Service: ${reservation.serviceDescription}\n\nRéservé via AniReserve`
                    : "Réservation via AniReserve",
                location: reservation.proAddress || "",
                status: "CONFIRMED",
                busyStatus: "BUSY",
                alarms: [
                    {
                        action: "display",
                        description: `Rappel: Rendez-vous avec ${reservation.proName}`,
                        trigger: { hours: 24, before: true }
                    }
                ]
            }

            createEvent(event, (error, value) => {
                if (error) {
                    console.error("Error creating calendar event:", error)
                    toast.error("Erreur lors de la création de l'événement")
                    setIsGenerating(false)
                    return
                }

                // Create blob and download
                const blob = new Blob([value], { type: "text/calendar;charset=utf-8" })
                const link = document.createElement("a")
                link.href = URL.createObjectURL(blob)
                link.download = `reservation-${reservation.proName.replace(/\s+/g, "-").toLowerCase()}.ics`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                toast.success("Événement ajouté à votre calendrier !")
                setIsGenerating(false)
            })
        } catch (error) {
            console.error("Error generating calendar file:", error)
            toast.error("Erreur lors de la génération du fichier")
            setIsGenerating(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleAddToCalendar}
            disabled={isGenerating}
            className="gap-2"
        >
            {isGenerating ? (
                <Download className="w-4 h-4 animate-pulse" />
            ) : (
                <Calendar className="w-4 h-4" />
            )}
            {size !== "icon" && "Calendrier"}
        </Button>
    )
}
