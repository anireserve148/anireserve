'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProReviews() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: 'Non autorisé' }
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return { success: false, error: 'Profil non trouvé' }
    }

    try {
        const reviews = await (prisma.review.findMany as any)({
            where: { proId: proProfile.id },
            include: {
                client: { select: { name: true, image: true } },
                reservation: {
                    include: {
                        service: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: reviews }
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}

export async function respondToReview(reviewId: string, response: string) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: 'Non autorisé' }
    }

    try {
        await prisma.review.update({
            where: { id: reviewId },
            data: {
                proResponse: response,
                respondedAt: new Date()
            }
        })

        revalidatePath('/dashboard/pro/reviews')
        return { success: true }
    } catch (error) {
        console.error('Respond review error:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}
