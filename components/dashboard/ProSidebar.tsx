'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar,
    ClipboardList,
    BarChart3,
    Settings,
    MessageSquare,
    Home,
    Users,
    Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
    { label: 'Tableau de bord', icon: Home, href: '/dashboard/pro' },
    { label: 'Agenda', icon: Calendar, href: '/dashboard/pro/agenda' },
    { label: 'Demandes', icon: ClipboardList, href: '/dashboard/pro/requests' },
    { label: 'Clients', icon: Users, href: '/dashboard/pro/clients' },
    { label: 'Disponibilités', icon: Clock, href: '/dashboard/pro/availability' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { label: 'Statistiques', icon: BarChart3, href: '/dashboard/pro/stats' },
    { label: 'Paramètres', icon: Settings, href: '/dashboard/pro/settings' },
]

export function ProSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Logo */}
            <div className="p-6 border-b border-border/40">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-turquoise to-turquoise/80 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="font-semibold text-lg">AniReserve Pro</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard/pro' && pathname?.startsWith(item.href))

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-turquoise/10 text-turquoise"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-border/40">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-turquoise/20 flex items-center justify-center">
                        <span className="text-turquoise font-semibold">P</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Compte Pro</p>
                        <p className="text-xs text-muted-foreground truncate">pro@test.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
