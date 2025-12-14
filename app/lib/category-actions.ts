'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSuccessResponse, handleActionError, AuthenticationError, AuthorizationError, type ActionResponse } from '@/lib/errors'

const categorySchema = z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    parentId: z.string().optional().nullable()
})

export async function createCategory(data: z.infer<typeof categorySchema>): Promise<ActionResponse<void>> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') throw new AuthorizationError()

        const validated = categorySchema.parse(data)

        await prisma.serviceCategory.create({
            data: {
                name: validated.name,
                parentId: validated.parentId || null
            }
        })

        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>): Promise<ActionResponse<void>> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') throw new AuthorizationError()

        const validated = categorySchema.parse(data)

        await prisma.serviceCategory.update({
            where: { id },
            data: {
                name: validated.name,
                parentId: validated.parentId || null
            }
        })

        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function deleteCategory(id: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') throw new AuthorizationError()

        // Check if category is used
        const proServicesCount = await prisma.proService.count({
            where: { categoryId: id }
        })

        if (proServicesCount > 0) {
            throw new Error(`Impossible de supprimer : cette catégorie est utilisée par ${proServicesCount} services.`)
        }

        const subCategoriesCount = await prisma.serviceCategory.count({
            where: { parentId: id }
        })

        if (subCategoriesCount > 0) {
            throw new Error(`Impossible de supprimer : cette catégorie contient ${subCategoriesCount} sous-catégories.`)
        }

        await prisma.serviceCategory.delete({
            where: { id }
        })

        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
