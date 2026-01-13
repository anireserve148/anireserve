'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProTopbarProps {
    userName?: string
    userRole?: string
    unreadCount?: number
    onMenuClick?: () => void
}

export function ProTopbar({
    userName = 'Professionnel',
    userRole = 'Pro',
    unreadCount = 0,
    onMenuClick
}: ProTopbarProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')

    const handleNewSlot = () => {
        // Navigate to agenda page where they can add new slots
        router.push('/dashboard/pro/agenda')
    }

    return (
        <header className="sticky top-0 z-40 border-b border-[#2A2A4A] bg-[#0F0F23]">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-[#1A1A2E]"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Search */}
                <div className="hidden md:flex relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C6C8A]" />
                    <Input
                        placeholder="Rechercher un client, un service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-[#1A1A2E] border-[#2A2A4A] text-white placeholder:text-[#6C6C8A] focus-visible:ring-[#2EB190] focus-visible:border-[#2EB190]"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-white hover:bg-[#1A1A2E]"
                        onClick={() => router.push('/dashboard/messages')}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E74C3C] text-[10px] font-bold flex items-center justify-center text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* New Slot Button - now navigates to agenda */}
                    <Button
                        onClick={handleNewSlot}
                        className="hidden sm:flex gap-2 bg-[#2EB190] hover:bg-[#238B70] text-white"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau créneau
                    </Button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2EB190] to-[#7B68EE] flex items-center justify-center ring-2 ring-[#2A2A4A]">
                            <span className="text-white text-sm font-semibold">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-medium text-white">{userName}</p>
                            <p className="text-xs text-[#6C6C8A]">{userRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
