'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function getPortfolioItems() {
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
        const items = await prisma.proProfileGallery.findMany({
            where: { proProfileId: proProfile.id },
            orderBy: { order: 'asc' }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error('Error fetching portfolio:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}

export async function deletePortfolioItem(id: string) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: 'Non autorisé' }
    }

    try {
        const item = await prisma.proProfileGallery.findUnique({
            where: { id }
        })

        if (!item) return { success: false, error: 'Élément non trouvé' }

        // Remove file from disk
        if (item.imageUrl.startsWith('/uploads/portfolio/')) {
            const filePath = join(process.cwd(), 'public', item.imageUrl)
            try {
                await unlink(filePath)
            } catch (e) {
                console.warn('File already deleted or unreachable:', e)
            }
        }

        await prisma.proProfileGallery.delete({
            where: { id }
        })

        revalidatePath('/dashboard/pro/portfolio')
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Erreur serveur' }
    }
}
