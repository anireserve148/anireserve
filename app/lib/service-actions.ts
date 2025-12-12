'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    NotFoundError,
    type ActionResponse
} from '@/lib/errors'

const addServiceSchema = z.object({
    categoryId: z.string(),
    customPrice: z.number().positive().optional(),
    description: z.string().optional(),
    duration: z.number().int().positive().optional(),
})

export async function addProService(
    data: z.infer<typeof addServiceSchema>
): Promise<ActionResponse<void>> {
    try {
        const validated = addServiceSchema.parse(data);

        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Seuls les professionnels peuvent ajouter des services');
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            throw new NotFoundError('Profil professionnel non trouvé');
        }

        // Check if service already exists
        const existing = await prisma.proService.findUnique({
            where: {
                proProfileId_categoryId: {
                    proProfileId: proProfile.id,
                    categoryId: validated.categoryId
                }
            }
        });

        if (existing) {
            throw new Error('Ce service est déjà dans votre liste');
        }

        await prisma.proService.create({
            data: {
                proProfileId: proProfile.id,
                categoryId: validated.categoryId,
                customPrice: validated.customPrice,
                description: validated.description,
                duration: validated.duration,
                isActive: true
            }
        });

        revalidatePath('/dashboard/pro');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function removeProService(categoryId: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Non autorisé');
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            throw new NotFoundError('Profil non trouvé');
        }

        await prisma.proService.delete({
            where: {
                proProfileId_categoryId: {
                    proProfileId: proProfile.id,
                    categoryId
                }
            }
        });

        revalidatePath('/dashboard/pro');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function updateProService(
    categoryId: string,
    data: { customPrice?: number; description?: string; duration?: number; isActive?: boolean }
): Promise<ActionResponse<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Non autorisé');
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            throw new NotFoundError('Profil non trouvé');
        }

        await prisma.proService.update({
            where: {
                proProfileId_categoryId: {
                    proProfileId: proProfile.id,
                    categoryId
                }
            },
            data
        });

        revalidatePath('/dashboard/pro');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
