'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, Briefcase, ArrowLeft, Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ProLoginPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setErrorMessage(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setErrorMessage("Email ou mot de passe incorrect. Si vous venez de vous inscrire, votre compte doit d'abord être validé par l'administrateur.")
                setIsPending(false)
            } else {
                // Fetch the session to check the user's role
                const session = await getSession()

                if (session?.user?.role === 'PRO') {
                    // User is a PRO - redirect to pro dashboard
                    router.push('/dashboard/pro')
                    router.refresh()
                } else {
                    // User is not a PRO - show error and redirect to client dashboard
                    setErrorMessage("Ce compte n'est pas un compte professionnel. Redirection vers l'espace client...")
                    setTimeout(() => {
                        router.push('/dashboard')
                        router.refresh()
                    }, 2000)
                }
            }
        } catch (error) {
            setErrorMessage("Une erreur est survenue.")
            setIsPending(false)
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A2E] to-[#16162B] p-4">
            <div className="w-full max-w-md space-y-4">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Retour à l'accueil</span>
                </Link>

                <Card className="w-full shadow-2xl border-[#2A2A4A] bg-[#1A1A2E] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6B] p-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#7B68EE]/20 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
                                <Briefcase className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="bg-[#7B68EE] text-white text-xs font-bold px-3 py-1 rounded-full">
                                    ESPACE PRO
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Connexion Professionnels</h1>
                            <p className="text-white/70 text-sm mt-1">Gérez vos réservations et clients</p>
                        </div>
                    </div>

                    <CardContent className="space-y-4 p-6">
                        {/* Warning */}
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-amber-200">
                                Les nouveaux pros doivent attendre la validation admin avant de pouvoir se connecter.
                            </p>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email professionnel</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="votre@email.com"
                                    required
                                    className="h-11 bg-[#16162D] border-[#2A2A4A] text-white placeholder:text-gray-500"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                                    <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-300">
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        minLength={6}
                                        className="h-11 pr-10 bg-[#16162D] border-[#2A2A4A] text-white"
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
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="text-sm text-red-400 font-medium text-center bg-red-500/10 p-3 rounded border border-red-500/30 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full font-semibold h-11 bg-[#1E3A5F] hover:bg-[#2C4A6B] text-white"
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Se connecter
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pb-6 px-6 bg-[#16162D] border-t border-[#2A2A4A]">
                        <p className="text-center text-sm text-gray-400">
                            Pas encore enregistré ?{' '}
                            <Link href="/register/pro" className="text-[#7B68EE] font-semibold hover:underline">
                                Faire une demande d'inscription
                            </Link>
                        </p>
                        <div className="w-full border-t border-[#2A2A4A] pt-3">
                            <p className="text-center text-sm text-gray-500">
                                Vous êtes un client ?{' '}
                                <Link href="/login/client" className="text-emerald-400 font-semibold hover:underline">
                                    ← Connexion Client
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}
