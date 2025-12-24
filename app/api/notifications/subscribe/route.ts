import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { subscription } = await request.json()

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 })
        }

        // Store the subscription in the database
        // Create or update the push subscription for this user
        await prisma.pushSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId: session.user.id,
                    endpoint: subscription.endpoint
                }
            },
            update: {
                p256dh: subscription.keys?.p256dh || '',
                auth: subscription.keys?.auth || '',
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys?.p256dh || '',
                auth: subscription.keys?.auth || ''
            }
        })

        return NextResponse.json({ success: true, message: 'Subscription enregistrée' })
    } catch (error) {
        console.error('Error saving push subscription:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { endpoint } = await request.json()

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint manquant' }, { status: 400 })
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                userId: session.user.id,
                endpoint
            }
        })

        return NextResponse.json({ success: true, message: 'Subscription supprimée' })
    } catch (error) {
        console.error('Error deleting push subscription:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
