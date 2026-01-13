'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageSquare, Calendar, DollarSign, Star, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getNotifications, markNotificationAsRead, markAllAsRead } from '@/app/lib/notification-actions'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string | null
    read: boolean
    createdAt: Date
}

const getIcon = (type: string) => {
    switch (type) {
        case 'MESSAGE':
            return <MessageSquare className="w-4 h-4" />
        case 'BOOKING':
        case 'STATUS_CHANGE':
            return <Calendar className="w-4 h-4" />
        case 'PAYMENT':
            return <DollarSign className="w-4 h-4" />
        case 'REVIEW':
            return <Star className="w-4 h-4" />
        default:
            return <Bell className="w-4 h-4" />
    }
}

const getIconColor = (type: string) => {
    switch (type) {
        case 'MESSAGE':
            return 'text-blue-500 bg-blue-500/10'
        case 'BOOKING':
            return 'text-green-500 bg-green-500/10'
        case 'STATUS_CHANGE':
            return 'text-orange-500 bg-orange-500/10'
        case 'PAYMENT':
            return 'text-emerald-500 bg-emerald-500/10'
        case 'REVIEW':
            return 'text-yellow-500 bg-yellow-500/10'
        default:
            return 'text-gray-500 bg-gray-500/10'
    }
}

interface NotificationDropdownProps {
    unreadCount: number
}

export function NotificationDropdown({ unreadCount: initialUnreadCount }: NotificationDropdownProps) {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            loadNotifications()
        }
    }, [open])

    const loadNotifications = async () => {
        setLoading(true)
        const result = await getNotifications(20)
        if (result.success && result.data) {
            setNotifications(result.data.map(n => ({
                ...n,
                createdAt: new Date(n.createdAt)
            })))
        }
        setLoading(false)
    }

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            await markNotificationAsRead(notification.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            )
        }

        // Navigate if link exists
        if (notification.link) {
            router.push(notification.link)
            setOpen(false)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-white hover:bg-[#1A1A2E]"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E74C3C] text-[10px] font-bold flex items-center justify-center text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-96 p-0 bg-[#1A1A2E] border-[#2A2A4A] text-white"
                align="end"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#2A2A4A]">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-[#2EB190] hover:text-[#238B70] hover:bg-[#2EB190]/10"
                        >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Tout marquer lu
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2EB190]"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-[#6C6C8A]">
                            <Bell className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left p-4 border-b border-[#2A2A4A] hover:bg-[#2A2A4A]/50 transition-colors ${!notification.read ? 'bg-[#2A2A4A]/30' : ''
                                    }`}
                            >
                                <div className="flex gap-3">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-sm truncate">
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#2EB190]" />
                                            )}
                                        </div>
                                        <p className="text-sm text-[#9CA3AF] line-clamp-2 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-[#6C6C8A] mt-1">
                                            {formatDistanceToNow(notification.createdAt, {
                                                addSuffix: true,
                                                locale: fr
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
