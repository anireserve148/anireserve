'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    type ActionResponse
} from '@/lib/errors'

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
})

export async function updateClientProfile(
    data: { name: string; email: string; phoneNumber?: string; address?: string; image?: string }
): Promise<ActionResponse<void>> {
    try {
        const validated = updateProfileSchema.parse(data);

        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError();
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: validated.name,
                email: validated.email,
                image: validated.image || undefined,
            }
        });

        revalidatePath('/dashboard');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

const updateProProfileSchema = z.object({
    name: z.string().min(2),
    bio: z.string().max(1000).optional(),
    hourlyRate: z.number().min(0).max(10000),
})

export async function updateProProfile(formData: FormData): Promise<ActionResponse<void>> {
    try {
        const name = formData.get('name') as string || '';
        const bio = formData.get('bio') as string || '';
        const hourlyRate = parseFloat(formData.get('hourlyRate') as string);
        const gallery = JSON.parse(formData.get('gallery') as string || '[]');

        const validated = updateProProfileSchema.parse({ name, bio, hourlyRate });

        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError();
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            throw new Error('Profil professionnel non trouvé');
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: { name: validated.name }
            }),
            prisma.proProfile.update({
                where: { id: proProfile.id },
                data: {
                    bio: validated.bio,
                    hourlyRate: validated.hourlyRate,
                }
            })
        ]);

        // Handle gallery separately if needed
        if (gallery.length > 0) {
            await prisma.proProfileGallery.deleteMany({
                where: { proProfileId: proProfile.id }
            });
            await prisma.proProfileGallery.createMany({
                data: gallery.map((url: string, index: number) => ({
                    proProfileId: proProfile.id,
                    imageUrl: url,
                    order: index
                }))
            });
        }

        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
