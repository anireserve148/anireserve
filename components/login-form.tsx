'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
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
                setErrorMessage("Email ou mot de passe incorrect.")
                setIsPending(false)
            } else {
                // Login success - determine redirect based on email (hack for demo/admin)
                // In production, user fetching data would decide, but here we can hint.
                // Or just go to generic /dashboard and let middleware handle it.
                router.push('/dashboard')
                router.refresh()
            }
        } catch (error) {
            setErrorMessage("Une erreur est survenue.")
            setIsPending(false)
        }
    }

    return (
        <Card className="w-full max-w-sm mx-auto shadow-2xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
                <CardTitle className="text-2xl text-center text-primary font-bold tracking-tight">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" name="email" placeholder="votre@email.com" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-turquoise hover:text-turquoise-dark font-medium"
                            >
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
                                className="bg-background/50 pr-10"
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
                                <span className="sr-only">
                                    {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                </span>
                            </Button>
                        </div>
                    </div>
                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Se connecter
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center text-xs text-muted-foreground">
                AniReserve Premium Access
            </CardFooter>
        </Card>
    )
}
