"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Calendar, Heart, ShieldCheck } from "lucide-react"
import Image from "next/image"

export function ModernNavbar({ user }: { user?: { name?: string | null; role?: string } | null }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'glass shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 hover-scale">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/logo.png"
                                alt="AniReserve"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-2xl font-bold gradient-text hidden sm:block">
                            AniReserve
                        </span>
                    </Link>

                    {/* Right Section (Buttons as requested) */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* 1. Mes Réservations (Visible to everyone, redirects to login if needed handled by page) */}
                        <Link href={user ? "/dashboard" : "/login"}>
                            <Button variant="ghost" className="rounded-full text-navy hover:bg-turquoise/10 hover:text-turquoise font-medium">
                                <Calendar className="w-5 h-5 mr-2" />
                                Mes réservations
                            </Button>
                        </Link>

                        {/* 2. Favoris */}
                        <Link href={user ? "/dashboard/favorites" : "/login"}>
                            <Button variant="ghost" className="rounded-full text-navy hover:bg-yellow-400/10 hover:text-yellow-600 font-medium">
                                <Heart className="w-5 h-5 mr-2" />
                                Favoris
                            </Button>
                        </Link>

                        {/* User State */}
                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                <Link href={user.role === 'ADMIN' ? "/dashboard/admin" : user.role === 'PRO' ? "/dashboard/pro" : "/dashboard"}>
                                    <Button className="rounded-full bg-navy text-white hover:bg-navy/90 shadow-lg shadow-navy/20">
                                        <User className="w-4 h-4 mr-2" />
                                        {user.role === 'ADMIN' ? 'Admin Panel' : user.role === 'PRO' ? 'Tableau de bord Pro' : 'Mon Espace'}
                                    </Button>
                                </Link>
                                <form action="/api/auth/signout" method="POST">
                                    <Button variant="ghost" size="icon" className="rounded-full text-red-500 hover:bg-red-50">
                                        <LogOut className="w-5 h-5" />
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <>
                                {/* 3. Connexion Client */}
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-full text-navy hover:bg-navy/5 font-medium">
                                        Connexion Client
                                    </Button>
                                </Link>

                                {/* 4. Connexion Pro */}
                                <Link href="/login?role=pro">
                                    <Button variant="outline" className="rounded-full border-navy/20 text-navy hover:bg-navy/5 font-semibold">
                                        Connexion Pro
                                    </Button>
                                </Link>

                                {/* 5. Espace Pro (Inscription) */}
                                <Link href="/register?role=pro">
                                    <Button className="rounded-full bg-turquoise text-white hover:bg-turquoise-dark hover:scale-105 transition-all shadow-lg shadow-turquoise/20">
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        Inscription Pro
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-navy hover:bg-gray-100 rounded-full transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t animate-slide-up">
                    <div className="px-4 py-6 space-y-4">
                        <Link href={user ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-lg">
                                <Calendar className="w-5 h-5 mr-3" />
                                Mes réservations
                            </Button>
                        </Link>

                        <Link href={user ? "/dashboard/favorites" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-lg">
                                <Heart className="w-5 h-5 mr-3" />
                                Favoris
                            </Button>
                        </Link>

                        <div className="h-px bg-gray-100 my-2" />

                        {user ? (
                            <>
                                <Link href={user.role === 'PRO' ? "/dashboard/pro" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full bg-navy text-white">
                                        {user.role === 'PRO' ? 'Tableau de bord Pro' : 'Mon compte'}
                                    </Button>
                                </Link>
                                <form action="/api/auth/signout" method="POST">
                                    <Button variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50">
                                        Déconnexion
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-navy text-navy">
                                        Connexion Client
                                    </Button>
                                </Link>
                                <Link href="/register?role=pro" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full bg-turquoise text-white">
                                        Espace Pro
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
