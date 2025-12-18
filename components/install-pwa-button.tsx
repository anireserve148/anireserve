"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Share } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [showIOSInstructions, setShowIOSInstructions] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
        setIsStandalone(isInStandaloneMode)

        // Check if dismissed in this session
        const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
        if (dismissed) {
            setIsDismissed(true)
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // Listen for beforeinstallprompt (Android/Chrome)
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (isIOS) {
            // Show iOS instructions
            setShowIOSInstructions(true)
            return
        }

        if (!deferredPrompt) {
            return
        }

        // Show native install prompt (Android/Chrome)
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setIsInstallable(false)
        }

        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setIsDismissed(true)
        sessionStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    // Don't show if already installed or dismissed
    // Show on iOS OR if installable (Android)
    if (isStandalone || isDismissed) {
        return null
    }

    // Don't show on desktop browsers (neither iOS nor Android)
    if (!isIOS && !isInstallable) {
        return null
    }

    return (
        <>
            {/* Install Button */}
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-500">
                <div className="relative">
                    <Button
                        onClick={handleInstallClick}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl px-6 py-6 rounded-2xl font-semibold text-base flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold">Installer l'app</div>
                            <div className="text-xs opacity-90">Accès rapide</div>
                        </div>
                    </Button>

                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* iOS Instructions Dialog */}
            <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            📱 Installer AniReserve
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Pour installer l'application sur votre iPhone :
                        </p>

                        <ol className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 font-bold">1</span>
                                </div>
                                <div>
                                    Appuyez sur le bouton <strong>Partager</strong>
                                    <div className="mt-1 flex items-center gap-1 text-blue-600">
                                        <Share className="w-4 h-4" />
                                        <span className="text-xs">(en bas de Safari)</span>
                                    </div>
                                </div>
                            </li>

                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 font-bold">2</span>
                                </div>
                                <div>
                                    Sélectionnez <strong>"Sur l'écran d'accueil"</strong>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        (faites défiler vers le bas si besoin)
                                    </div>
                                </div>
                            </li>

                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 font-bold">3</span>
                                </div>
                                <div>
                                    Appuyez sur <strong>"Ajouter"</strong>
                                    <div className="mt-1 text-xs text-green-600">
                                        ✓ L'icône apparaîtra sur votre écran d'accueil !
                                    </div>
                                </div>
                            </li>
                        </ol>
                    </div>
                    <Button onClick={() => setShowIOSInstructions(false)} className="w-full">
                        Compris
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}
