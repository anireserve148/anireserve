"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Calendar, Heart, MessageSquare, Home } from "lucide-react"
import Image from "next/image"
import { LogoutButton } from "@/components/logout-button"

export function ModernNavbar({ user }: { user?: { name?: string | null; role?: string } | null }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close menu when clicking outside
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 dark:bg-navy/95 backdrop-blur-md shadow-lg'
                    : 'bg-white/80 dark:bg-navy/80 backdrop-blur-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                                <Image
                                    src="/logo.png"
                                    alt="AniReserve"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
                                AniReserve
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-2">
                            {user ? (
                                <>
                                    <Link href="/dashboard">
                                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-navy">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Réservations
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/messages">
                                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-navy">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Messages
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/favorites">
                                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-navy">
                                            <Heart className="w-4 h-4 mr-2" />
                                            Favoris
                                        </Button>
                                    </Link>
                                    <div className="h-6 w-px bg-gray-200 mx-2" />
                                    <Link href={user.role === 'ADMIN' ? "/dashboard/admin" : user.role === 'PRO' ? "/dashboard/pro" : "/dashboard"}>
                                        <Button className="bg-navy text-white hover:bg-navy/90">
                                            <User className="w-4 h-4 mr-2" />
                                            {user.role === 'PRO' ? 'Espace Pro' : 'Mon compte'}
                                        </Button>
                                    </Link>
                                    <LogoutButton />
                                </>
                            ) : (
                                <>
                                    <Link href="/login?mode=client">
                                        <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                                            Connexion Client
                                        </Button>
                                    </Link>
                                    <Link href="/login?mode=pro">
                                        <Button className="bg-[#18223b] text-white hover:bg-[#18223b]/90">
                                            Connexion Pro
                                        </Button>
                                    </Link>
                                    <div className="h-6 w-px bg-gray-200 mx-1" />
                                    <Link href="/register/pro">
                                        <Button className="bg-primary text-white hover:bg-primary/90">
                                            Devenir Pro
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-navy hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[10000] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute top-16 left-0 right-0 bg-white border-t shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top duration-200">
                        <div className="p-4 space-y-2">
                            {/* Main Navigation */}
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-base py-3">
                                    <Home className="w-5 h-5 mr-3" />
                                    Accueil
                                </Button>
                            </Link>

                            {user && (
                                <>
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-base py-3">
                                            <Calendar className="w-5 h-5 mr-3" />
                                            Mes réservations
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/messages" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-base py-3">
                                            <MessageSquare className="w-5 h-5 mr-3" />
                                            Messages
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-base py-3">
                                            <Heart className="w-5 h-5 mr-3" />
                                            Favoris
                                        </Button>
                                    </Link>
                                </>
                            )}

                            <div className="h-px bg-gray-100 my-3" />

                            {/* Auth Section */}
                            {user ? (
                                <div className="space-y-2">
                                    <Link
                                        href={user.role === 'ADMIN' ? "/dashboard/admin" : user.role === 'PRO' ? "/dashboard/pro" : "/dashboard"}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Button className="w-full bg-navy text-white py-3">
                                            <User className="w-5 h-5 mr-3" />
                                            {user.role === 'PRO' ? 'Tableau de bord Pro' : 'Mon compte'}
                                        </Button>
                                    </Link>
                                    <LogoutButton fullWidth showText />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-navy text-navy py-3">
                                            Connexion
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full py-3">
                                            Inscription Client
                                        </Button>
                                    </Link>
                                    <Link href="/register/pro" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-primary text-white py-3">
                                            Devenir Professionnel
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed navbar */}
            <div className="h-16 sm:h-20" />
        </>
    )
}
