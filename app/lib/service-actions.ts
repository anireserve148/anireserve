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
    name: z.string().min(1, "Le nom est obligatoire"),
    categoryId: z.string().optional(),
    customPrice: z.number().positive("Le prix doit être positif"),
    description: z.string().optional(),
    duration: z.number().int().positive("La durée doit être positive"),
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

        await prisma.proService.create({
            data: {
                proProfileId: proProfile.id,
                name: validated.name,
                categoryId: validated.categoryId || null,
                customPrice: validated.customPrice,
                description: validated.description,
                duration: validated.duration,
                isActive: true
            }
        });

        revalidatePath('/dashboard/pro/services');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function removeProService(serviceId: string): Promise<ActionResponse<void>> {
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

        // Verify the service belongs to this pro
        const service = await prisma.proService.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.proProfileId !== proProfile.id) {
            throw new NotFoundError('Service non trouvé');
        }

        await prisma.proService.delete({
            where: { id: serviceId }
        });

        revalidatePath('/dashboard/pro/services');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function updateProService(
    serviceId: string,
    data: { name?: string; customPrice?: number; description?: string; duration?: number; isActive?: boolean }
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

        // Verify the service belongs to this pro
        const service = await prisma.proService.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.proProfileId !== proProfile.id) {
            throw new NotFoundError('Service non trouvé');
        }

        await prisma.proService.update({
            where: { id: serviceId },
            data
        });

        revalidatePath('/dashboard/pro/services');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function toggleServiceActive(serviceId: string): Promise<ActionResponse<void>> {
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

        const service = await prisma.proService.findUnique({
            where: { id: serviceId }
        });

        if (!service || service.proProfileId !== proProfile.id) {
            throw new NotFoundError('Service non trouvé');
        }

        await prisma.proService.update({
            where: { id: serviceId },
            data: { isActive: !service.isActive }
        });

        revalidatePath('/dashboard/pro/services');
        revalidatePath(`/pros/${proProfile.id}`);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
