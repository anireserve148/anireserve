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

export async function toggleFavorite(proId: string): Promise<ActionResponse<{ isFavorite: boolean }>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError("Connectez-vous pour ajouter aux favoris");
        }

        const userId = session.user.id;

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_proId: {
                    userId,
                    proId
                }
            }
        });

        if (existing) {
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            revalidatePath('/dashboard/favorites');
            revalidatePath('/search'); // Update search results
            revalidatePath(`/pros/${proId}`); // Update profile
            return createSuccessResponse({ isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: {
                    userId,
                    proId
                }
            });
            revalidatePath('/dashboard/favorites');
            revalidatePath('/search');
            revalidatePath(`/pros/${proId}`);
            return createSuccessResponse({ isFavorite: true });
        }

    } catch (error) {
        return handleActionError(error);
    }
}
