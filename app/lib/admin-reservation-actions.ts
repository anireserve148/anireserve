'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AuthorizationError } from '@/lib/errors'

export type ReservationFilter = {
    status?: string
    search?: string
    page?: number
}

export async function getGlobalReservations({ status, search, page = 1 }: ReservationFilter) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new AuthorizationError()
    }

    const pageSize = 20
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (status && status !== 'ALL') {
        where.status = status
    }

    if (search) {
        where.OR = [
            { id: { contains: search, mode: 'insensitive' } },
            { client: { name: { contains: search, mode: 'insensitive' } } },
            { client: { email: { contains: search, mode: 'insensitive' } } },
            { pro: { user: { name: { contains: search, mode: 'insensitive' } } } }
        ]
    }

    const [reservations, total] = await Promise.all([
        prisma.reservation.findMany({
            where,
            include: {
                client: { select: { name: true, email: true, image: true } },
                pro: {
                    include: {
                        user: { select: { name: true, email: true, image: true } },
                        city: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize
        }),
        prisma.reservation.count({ where })
    ])

    return { reservations, total, totalPages: Math.ceil(total / pageSize) }
}
