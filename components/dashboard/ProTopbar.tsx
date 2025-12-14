'use client'

import { useState } from 'react'
import { Search, Bell, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProTopbarProps {
    userName?: string
    userRole?: string
    onNewSlot?: () => void
    onMenuClick?: () => void
}

export function ProTopbar({
    userName = 'Professionnel',
    userRole = 'Pro',
    onNewSlot,
    onMenuClick
}: ProTopbarProps) {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Search */}
                <div className="hidden md:flex relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un client, un service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-muted/50 border-0 focus-visible:ring-turquoise"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-[10px] font-bold flex items-center justify-center text-navy">
                            3
                        </span>
                    </Button>

                    {/* New Slot Button */}
                    <Button
                        onClick={onNewSlot}
                        className="hidden sm:flex gap-2 bg-turquoise hover:bg-turquoise/90"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau créneau
                    </Button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-turquoise to-turquoise/70 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-medium">{userName}</p>
                            <p className="text-xs text-muted-foreground">{userRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
