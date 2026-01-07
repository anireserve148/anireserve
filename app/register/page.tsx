'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { registerClient } from '@/app/lib/auth-actions'
import { BackButton } from '@/components/ui/back-button'

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setErrorMessage(null)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        // Validation
        if (password !== confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas")
            setIsPending(false)
            return
        }

        if (password.length < 6) {
            setErrorMessage("Le mot de passe doit contenir au moins 6 caractères")
            setIsPending(false)
            return
        }

        try {
            const result = await registerClient({ name, email, password })

            if (!result.success) {
                setErrorMessage(result.error || "Une erreur est survenue")
                setIsPending(false)
            } else {
                // Success - redirect to login
                router.push('/login?registered=true')
            }
        } catch (error) {
            setErrorMessage("Une erreur est survenue")
            setIsPending(false)
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
            <div className="w-full max-w-md space-y-4">
                <BackButton href="/" label="Retour à l'accueil" />
                <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur">
                    <CardHeader className="text-center">
                        {/* Logo */}
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#2EB190] to-[#1E3A5F] rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                                <span className="text-white text-2xl font-bold">A</span>
                            </div>
                            <span className="text-xl font-bold text-[#1E3A5F]">AniReserve</span>
                        </div>
                        <CardTitle className="text-2xl text-primary font-bold">Créez votre compte en 1 minute</CardTitle>
                        <CardDescription className="text-base">
                            Rejoignez la communauté francophone en Israël
                        </CardDescription>

                        {/* Benefits List */}
                        <div className="mt-4 text-left bg-primary/5 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-primary">✅</span>
                                <span>Réservez des pros francophones</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-primary">✅</span>
                                <span>Gérez vos rendez-vous facilement</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-primary">✅</span>
                                <span>Historique de vos réservations</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-primary">✅</span>
                                <span>100% gratuit, sans engagement</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                            {/* Nom complet */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Sophie Martin"
                                    required
                                    className="bg-background/50"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="votre@email.com"
                                    required
                                    className="bg-background/50"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Mot de passe */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        minLength={6}
                                        className="bg-background/50 pr-10"
                                        autoComplete="new-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Au moins 6 caractères</p>
                            </div>

                            {/* Confirmer mot de passe */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    minLength={6}
                                    className="bg-background/50"
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Error Message */}
                            <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                                {errorMessage && (
                                    <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Créer mon compte
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Se connecter
                            </Link>
                        </div>
                        <div className="text-sm text-center text-muted-foreground">
                            Vous êtes un professionnel ?{' '}
                            <Link href="/register/pro" className="text-primary hover:underline font-medium">
                                Devenir Pro
                            </Link>
                        </div>

                        {/* Mini FAQ */}
                        <div className="w-full pt-4 border-t space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Questions fréquentes</p>
                            <details className="text-sm group">
                                <summary className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
                                    L'inscription est-elle payante ?
                                </summary>
                                <p className="mt-2 text-muted-foreground pl-4 border-l-2 border-primary/20">
                                    Non, l'inscription client est 100% gratuite et sans engagement.
                                </p>
                            </details>
                            <details className="text-sm group">
                                <summary className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
                                    Puis-je annuler une réservation ?
                                </summary>
                                <p className="mt-2 text-muted-foreground pl-4 border-l-2 border-primary/20">
                                    Oui, vous pouvez annuler vos réservations depuis votre espace client.
                                </p>
                            </details>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}
