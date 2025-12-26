'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar,
    ClipboardList,
    Users,
    Clock,
    ShoppingBag,
    Image,
    Ticket,
    Star,
    MessageCircle,
    MessageSquare,
    BarChart3,
    Settings,
    Home,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
    { label: 'Tableau de bord', icon: Home, href: '/dashboard/pro' },
    { label: 'Agenda', icon: Calendar, href: '/dashboard/pro/agenda' },
    { label: 'Demandes', icon: ClipboardList, href: '/dashboard/pro/requests' },
    { label: 'Clients', icon: Users, href: '/dashboard/pro/clients' },
    { label: 'Disponibilités', icon: Clock, href: '/dashboard/pro/availability' },
    { label: 'Services', icon: ShoppingBag, href: '/dashboard/pro/services' },
    { label: 'Portfolio', icon: Image, href: '/dashboard/pro/portfolio' },
    { label: 'Promotions', icon: Ticket, href: '/dashboard/pro/promos' },
    { label: 'Avis Clients', icon: Star, href: '/dashboard/pro/reviews' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { label: 'Statistiques', icon: BarChart3, href: '/dashboard/pro/stats' },
    { label: 'Paramètres', icon: Settings, href: '/dashboard/pro/settings' },
    { label: 'Passer en vue client', icon: Home, href: '/dashboard' },
]

interface ProSidebarProps {
    userName?: string
    userEmail?: string
}

export function ProSidebar({ userName = 'Compte Pro', userEmail = '' }: ProSidebarProps) {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-[#2A2A4A] bg-[#0F0F23]">
            {/* Logo */}
            <div className="p-6 border-b border-[#2A2A4A]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2EB190] to-[#7B68EE] flex items-center justify-center shadow-lg shadow-[#2EB190]/20">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                        <span className="font-bold text-lg text-white block">AniReserve</span>
                        <span className="text-[10px] text-[#7B68EE] font-semibold uppercase tracking-wider">Pro Dashboard</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard/pro' && pathname?.startsWith(item.href))

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-[#2EB190]/20 text-[#2EB190] border border-[#2EB190]/30"
                                    : "text-[#A0A0B8] hover:bg-[#1A1A2E] hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-[#2A2A4A]">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2EB190] to-[#7B68EE] flex items-center justify-center">
                        <span className="text-white font-semibold">
                            {userName?.charAt(0).toUpperCase() || 'P'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{userName}</p>
                        <p className="text-xs text-[#6C6C8A] truncate">{userEmail}</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
