'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/mail'
import {
    handleActionError,
    createSuccessResponse,
    NotFoundError,
    type ActionResponse
} from '@/lib/errors'

export async function requestPasswordReset(email: string): Promise<ActionResponse<void>> {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // We return success even if user not found to prevent user enumeration
            return createSuccessResponse(undefined);
        }

        const token = randomUUID();
        // Expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiresAt
            }
        });

        await sendPasswordResetEmail(email, token);

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
})

export async function resetPassword(
    data: z.infer<typeof resetPasswordSchema>
): Promise<ActionResponse<void>> {
    try {
        const validated = resetPasswordSchema.parse(data);

        const user = await prisma.user.findFirst({
            where: {
                resetToken: validated.token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            throw new Error("Lien invalide ou expiré");
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
