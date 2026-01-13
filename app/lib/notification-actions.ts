'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function getUnreadCount() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return 0
        }

        // Count unread messages in conversations where user is participant
        const count = await prisma.message.count({
            where: {
                conversation: {
                    OR: [
                        { clientId: session.user.id },
                        { proId: session.user.id }
                    ]
                },
                senderId: {
                    not: session.user.id // Messages not sent by current user
                },
                read: false
            }
        })

        return count
    } catch (error) {
        console.error('Error getting unread count:', error)
        return 0
    }
}
