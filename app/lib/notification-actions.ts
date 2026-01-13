'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function getUnreadCount() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return 0
        }

        const count = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false
            }
        })

        return count
    } catch (error) {
        console.error('Error getting unread count:', error)
        return 0
    }
}

export async function getNotifications(limit = 20) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        })

        return { success: true, data: notifications }
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return { success: false, error: 'Failed to fetch notifications' }
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.user.id // Security: only update own notifications
            },
            data: {
                read: true
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: 'Failed to mark as read' }
    }
}

export async function markAllAsRead() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false
            },
            data: {
                read: true
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error marking all as read:', error)
        return { success: false, error: 'Failed to mark all as read' }
    }
}

export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
    relatedMessageId,
    relatedReservationId,
    relatedReviewId
}: {
    userId: string
    type: string
    title: string
    message: string
    link?: string
    relatedMessageId?: string
    relatedReservationId?: string
    relatedReviewId?: string
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
                relatedMessageId,
                relatedReservationId,
                relatedReviewId
            }
        })

        return { success: true, data: notification }
    } catch (error) {
        console.error('Error creating notification:', error)
        return { success: false, error: 'Failed to create notification' }
    }
}
