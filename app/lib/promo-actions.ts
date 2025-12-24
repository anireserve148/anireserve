'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPromoCodes() {
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
        const codes = await prisma.promoCode.findMany({
            where: { proProfileId: proProfile.id },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: codes }
    } catch (error) {
        console.error('Error fetching promo codes:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}

export async function createPromoCode(data: {
    code: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
    usageLimit?: number
    description?: string
}) {
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
        const exists = await prisma.promoCode.findUnique({
            where: {
                proProfileId_code: {
                    proProfileId: proProfile.id,
                    code: data.code.toUpperCase()
                }
            }
        })

        if (exists) {
            return { success: false, error: 'Ce code existe déjà pour votre profil' }
        }

        const promo = await prisma.promoCode.create({
            data: {
                ...data,
                code: data.code.toUpperCase(),
                proProfileId: proProfile.id
            }
        })

        revalidatePath('/dashboard/pro/promos')
        return { success: true, data: promo }
    } catch (error) {
        console.error('Create promo error:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}

export async function togglePromoCode(id: string, isActive: boolean) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: 'Non autorisé' }
    }

    try {
        await prisma.promoCode.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/dashboard/pro/promos')
        return { success: true }
    } catch (error) {
        console.error('Toggle promo error:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}
