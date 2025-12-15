import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReservationReminder, sendReviewRequest } from '@/lib/mail'

// This endpoint should be called by a cron job every hour
// Example: curl -X POST https://anireserve.com/api/cron/reminders -H "Authorization: Bearer YOUR_CRON_SECRET"

export async function POST(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowStart = new Date(tomorrow)
    tomorrowStart.setHours(0, 0, 0, 0)
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    let remindersSent = 0
    let reviewRequestsSent = 0
    const errors: string[] = []

    try {
        // 1. Send reminders for appointments tomorrow (24h before)
        const upcomingReservations = await prisma.reservation.findMany({
            where: {
                startDate: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd
                },
                status: 'CONFIRMED',
                reminderSent: false
            },
            include: {
                client: true,
                pro: {
                    include: {
                        user: true
                    }
                }
            }
        })

        for (const reservation of upcomingReservations) {
            try {
                const emailData = {
                    clientName: reservation.client.name || 'Client',
                    proName: reservation.pro.user.name || 'Professionnel',
                    date: reservation.startDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    }),
                    time: reservation.startDate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    service: reservation.notes || 'Rendez-vous',
                    price: `${reservation.totalPrice || 0} ₪`,
                    reservationId: reservation.id
                }

                // Send reminder to client
                await sendReservationReminder(reservation.client.email, emailData)

                // Mark as sent
                await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: { reminderSent: true }
                })

                remindersSent++
            } catch (err) {
                errors.push(`Reminder failed for ${reservation.id}: ${err}`)
            }
        }

        // 2. Send review requests for completed appointments (24h after)
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const yesterdayStart = new Date(yesterday)
        yesterdayStart.setHours(0, 0, 0, 0)
        const yesterdayEnd = new Date(yesterday)
        yesterdayEnd.setHours(23, 59, 59, 999)

        const completedReservations = await prisma.reservation.findMany({
            where: {
                startDate: {
                    gte: yesterdayStart,
                    lte: yesterdayEnd
                },
                status: 'COMPLETED',
                reviewRequested: false
            },
            include: {
                client: true,
                pro: {
                    include: {
                        user: true
                    }
                }
            }
        })

        for (const reservation of completedReservations) {
            try {
                await sendReviewRequest(reservation.client.email, {
                    clientName: reservation.client.name || 'Client',
                    proName: reservation.pro.user.name || 'Professionnel',
                    service: reservation.notes || 'Rendez-vous',
                    reservationId: reservation.id
                })

                await prisma.reservation.update({
                    where: { id: reservation.id },
                    data: { reviewRequested: true }
                })

                reviewRequestsSent++
            } catch (err) {
                errors.push(`Review request failed for ${reservation.id}: ${err}`)
            }
        }

    } catch (err) {
        return NextResponse.json({
            error: 'Database error',
            details: String(err)
        }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        remindersSent,
        reviewRequestsSent,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString()
    })
}

// GET endpoint for health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'AniReserve Cron Reminders'
    })
}
