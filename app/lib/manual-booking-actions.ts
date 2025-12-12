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
import bcrypt from 'bcryptjs'

const manualBookingSchema = z.object({
    clientName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    clientEmail: z.string().email("Email invalide"),
    clientPhone: z.string().optional(),
    startDate: z.string(), // ISO string
    endDate: z.string(),   // ISO string
    notes: z.string().optional(),
})

export async function createManualReservation(
    data: z.infer<typeof manualBookingSchema>
): Promise<ActionResponse<void>> {
    try {
        const validated = manualBookingSchema.parse(data);

        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Seuls les professionnels peuvent créer des réservations manuelles');
        }

        // Get pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            throw new NotFoundError('Profil professionnel non trouvé');
        }

        // Check if client exists by email
        let client = await prisma.user.findUnique({
            where: { email: validated.clientEmail }
        });

        // Create client if doesn't exist
        if (!client) {
            const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);
            client = await prisma.user.create({
                data: {
                    email: validated.clientEmail,
                    name: validated.clientName,
                    password: tempPassword, // They'll need to reset
                    role: 'CLIENT'
                }
            });
        }

        // Calculate duration and price
        const start = new Date(validated.startDate);
        const end = new Date(validated.endDate);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const totalPrice = durationHours * proProfile.hourlyRate;

        // Create reservation
        await prisma.reservation.create({
            data: {
                clientId: client.id,
                proId: proProfile.id,
                startDate: start,
                endDate: end,
                status: 'CONFIRMED', // Manual bookings are auto-confirmed
                totalPrice,
                notes: validated.notes
            }
        });

        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
