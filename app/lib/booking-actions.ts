'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createReservationSchema } from '@/lib/validations'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    type ActionResponse
} from '@/lib/errors'
import { sendReservationAccepted, sendReservationRejected, sendNewReservationToPro } from '@/lib/mail'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function createReservation(data: {
    proId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number,
    serviceId?: string
}): Promise<ActionResponse<void>> {
    try {
        // Validate input
        const validated = createReservationSchema.parse({
            proId: data.proId,
            startDate: data.startDate,
            endDate: data.endDate
        });

        // Check authentication
        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError('Vous devez être connecté pour réserver');
        }

        const clientId = session.user.id;

        // Get pro profile with user info
        const proProfile = await prisma.proProfile.findUnique({
            where: { id: validated.proId },
            include: { user: true }
        });

        if (!proProfile) {
            throw new Error('Professionnel non trouvé');
        }

        // Validate end date is after start date
        if (validated.endDate <= validated.startDate) {
            throw new Error('La date de fin doit être après la date de début');
        }

        // Check for overlapping reservations (from old platform logic)
        const overlapping = await prisma.reservation.findFirst({
            where: {
                proId: validated.proId,
                status: { in: ['CONFIRMED', 'PENDING'] },
                startDate: { lt: validated.endDate },
                endDate: { gt: validated.startDate },
            },
        });

        if (overlapping) {
            throw new Error('Ce créneau est déjà réservé. Veuillez choisir un autre horaire.');
        }

        // Create reservation
        const reservation = await prisma.reservation.create({
            data: {
                clientId: session.user.id,
                proId: validated.proId,
                startDate: validated.startDate,
                endDate: validated.endDate,
                totalPrice: data.totalPrice,
                status: 'PENDING',
            }
        });

        // Send notification email to pro
        if (proProfile.user.email) {
            const emailData = {
                clientName: session.user.name || 'Client',
                proName: proProfile.user.name || 'Professionnel',
                date: format(validated.startDate, 'd MMMM yyyy', { locale: fr }),
                time: format(validated.startDate, 'HH:mm'),
                service: 'Prestation',
                price: `${data.totalPrice} ₪`,
                reservationId: reservation.id
            };
            await sendNewReservationToPro(proProfile.user.email, emailData);
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function acceptReservation(reservationId: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Accès réservé aux professionnels');
        }

        // Get reservation with client info
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                client: true,
                pro: { include: { user: true } }
            }
        });

        if (!reservation) {
            throw new Error('Réservation non trouvée');
        }

        // Update status to CONFIRMED
        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: 'CONFIRMED' }
        });

        // Send confirmation email to client
        if (reservation.client.email) {
            const emailData = {
                clientName: reservation.client.name || 'Client',
                proName: reservation.pro.user.name || 'Professionnel',
                date: format(reservation.startDate, 'd MMMM yyyy', { locale: fr }),
                time: format(reservation.startDate, 'HH:mm'),
                service: 'Prestation', // TODO: Get actual service name
                price: `${reservation.totalPrice} ₪`,
                reservationId: reservation.id
            };
            await sendReservationAccepted(reservation.client.email, emailData);
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function rejectReservation(reservationId: string, reason?: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Accès réservé aux professionnels');
        }

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                client: true,
                pro: { include: { user: true } }
            }
        });

        if (!reservation) {
            throw new Error('Réservation non trouvée');
        }

        // Update status to REJECTED/CANCELLED
        await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: 'CANCELLED',
                notes: reason || 'Refusé par le professionnel'
            }
        });

        // Send rejection email to client
        if (reservation.client.email) {
            const emailData = {
                clientName: reservation.client.name || 'Client',
                proName: reservation.pro.user.name || 'Professionnel',
                date: format(reservation.startDate, 'd MMMM yyyy', { locale: fr }),
                time: format(reservation.startDate, 'HH:mm'),
                service: 'Prestation',
                price: `${reservation.totalPrice} ₪`,
                reservationId: reservation.id,
                reason: reason
            };
            await sendReservationRejected(reservation.client.email, emailData);
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function cancelReservation(reservationId: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError('Vous devez être connecté');
        }

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!reservation) {
            throw new Error('Réservation non trouvée');
        }

        // Only client who made the reservation or the pro can cancel
        if (reservation.clientId !== session.user.id && session.user.role !== 'PRO') {
            throw new Error('Vous ne pouvez pas annuler cette réservation');
        }

        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: 'CANCELLED' }
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
