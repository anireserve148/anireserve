import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Get Pro's reservations for a date range
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const reservations = await prisma.reservation.findMany({
        where: {
            proId: proProfile.id,
            ...(startDate && endDate ? {
                startDate: { gte: new Date(startDate), lte: new Date(endDate) }
            } : {})
        },
        include: {
            client: { select: { id: true, name: true, email: true, phoneNumber: true } },
            service: { select: { name: true, duration: true, customPrice: true } }
        },
        orderBy: { startDate: 'desc' }
    })

    return NextResponse.json(reservations)
}

// Create a manual reservation
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    const body = await req.json()
    const { clientName, clientEmail, clientPhone, startDate, endDate, serviceId, totalPrice } = body

    // Find or create client
    let client = await prisma.user.findUnique({
        where: { email: clientEmail }
    })

    if (!client) {
        const randomPassword = Math.random().toString(36).substring(2, 15)
        const hashedPassword = await bcrypt.hash(randomPassword, 10)

        client = await prisma.user.create({
            data: {
                email: clientEmail,
                name: clientName,
                phoneNumber: clientPhone || null,
                password: hashedPassword,
                role: 'CLIENT'
            }
        })
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
        data: {
            clientId: client.id,
            proId: proProfile.id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            serviceId: serviceId || null,
            totalPrice: totalPrice || 0,
            status: 'CONFIRMED'
        },
        include: {
            client: { select: { id: true, name: true, email: true } },
            service: { select: { name: true } }
        }
    })

    return NextResponse.json(reservation)
}

// Update reservation status
export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    const body = await req.json()
    const { reservationId, status } = body

    // Verify the reservation belongs to this pro
    const reservation = await prisma.reservation.findFirst({
        where: {
            id: reservationId,
            proId: proProfile.id
        }
    })

    if (!reservation) {
        return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: { status },
        include: {
            client: { select: { id: true, name: true, email: true } },
            service: { select: { name: true } }
        }
    })

    return NextResponse.json(updated)
}
