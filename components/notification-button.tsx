"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function NotificationButton() {
    const [permission, setPermission] = useState<NotificationPermission>("default")
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("Les notifications ne sont pas supportées par votre navigateur")
            return
        }

        if (!("serviceWorker" in navigator)) {
            toast.error("Service Worker non supporté")
            return
        }

        setIsLoading(true)

        try {
            const result = await Notification.requestPermission()
            setPermission(result)

            if (result === "granted") {
                // Register service worker and subscribe
                const registration = await navigator.serviceWorker.ready

                // For now, just show a success message
                // In production, you would subscribe to push and save to server
                toast.success("Notifications activées ! Vous recevrez des alertes pour vos réservations.")

                // Show a test notification
                new Notification("AniReserve", {
                    body: "Les notifications sont maintenant activées !",
                    icon: "/icon-192.png"
                })
            } else if (result === "denied") {
                toast.error("Notifications refusées. Vous pouvez les activer dans les paramètres de votre navigateur.")
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error)
            toast.error("Erreur lors de l'activation des notifications")
        } finally {
            setIsLoading(false)
        }
    }

    const disableNotifications = () => {
        toast.info("Pour désactiver les notifications, allez dans les paramètres de votre navigateur")
    }

    if (!mounted) {
        return null
    }

    if (!("Notification" in window)) {
        return null
    }

    if (permission === "granted") {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={disableNotifications}
                className="gap-2"
            >
                <Bell className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Notifications activées</span>
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={requestPermission}
            disabled={isLoading || permission === "denied"}
            className="gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : permission === "denied" ? (
                <BellOff className="h-4 w-4 text-red-500" />
            ) : (
                <Bell className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {permission === "denied" ? "Notifications bloquées" : "Activer les notifications"}
            </span>
        </Button>
    )
}
