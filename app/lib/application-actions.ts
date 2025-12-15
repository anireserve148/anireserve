'use server'

import { auth } from '@/auth'
import { sendPasswordResetEmail, sendApplicationSubmitted, sendApplicationApproved, sendApplicationRejected, sendApplicationDocumentsRequested, sendWelcomePro, sendAdminNewApplication } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    NotFoundError,
    type ActionResponse
} from '@/lib/errors'

const submitApplicationSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(9, "Numéro de téléphone invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    cityIds: z.array(z.string()).min(1, "Sélectionnez au moins une ville"),
    categoryIds: z.array(z.string()).min(1, "Sélectionnez au moins une catégorie"),
    idPhotoUrl: z.string().min(1, "La photo d'identité est requise"),
})

export async function submitProApplication(
    data: z.infer<typeof submitApplicationSchema>
): Promise<ActionResponse<void>> {
    try {
        const validated = submitApplicationSchema.parse(data);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email }
        });

        if (existingUser) {
            throw new Error("Cet email est déjà utilisé");
        }

        const existingApplication = await prisma.proApplication.findUnique({
            where: { email: validated.email }
        });

        if (existingApplication) {
            throw new Error("Une demande existe déjà pour cet email");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        // Create application
        const application = await prisma.proApplication.create({
            data: {
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email,
                phone: validated.phone,
                password: hashedPassword,
                cityIds: JSON.stringify(validated.cityIds),
                categoryIds: JSON.stringify(validated.categoryIds),
                idPhotoUrl: validated.idPhotoUrl,
                status: 'PENDING'
            }
        });

        // Send confirmation email
        try {
            const emailResult = await sendApplicationSubmitted(validated.email, {
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email
            });

            // Fetch names for Admin Email
            const cities = await prisma.city.findMany({
                where: { id: { in: validated.cityIds } },
                select: { name: true }
            });
            const categories = await prisma.serviceCategory.findMany({
                where: { id: { in: validated.categoryIds } },
                select: { name: true }
            });

            // Send Admin Notification
            await sendAdminNewApplication({
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email,
                idPhotoUrl: validated.idPhotoUrl,
                phone: validated.phone,
                cities: cities.map(c => c.name).join(', '),
                categories: categories.map(c => c.name).join(', ')
            });
        } catch (emailError) {
            // Silent fail - don't block registration if email fails
        }

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getApplications(status?: string): Promise<ActionResponse<any[]>> {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            throw new AuthenticationError("Accès réservé aux administrateurs");
        }

        const applications = await prisma.proApplication.findMany({
            where: status ? { status: status as any } : undefined,
            orderBy: { createdAt: 'desc' }
        });

        return createSuccessResponse(applications);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function approveApplication(applicationId: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            throw new AuthenticationError("Accès réservé aux administrateurs");
        }

        const application = await prisma.proApplication.findUnique({
            where: { id: applicationId }
        });

        if (!application) {
            throw new NotFoundError("Demande non trouvée");
        }

        // Create user and pro profile
        const user = await prisma.user.create({
            data: {
                email: application.email,
                name: `${application.firstName} ${application.lastName}`,
                password: application.password,
                role: 'PRO'
            }
        });

        const cityIds = JSON.parse(application.cityIds);
        const categoryIds = JSON.parse(application.categoryIds);

        await prisma.proProfile.create({
            data: {
                userId: user.id,
                cityId: cityIds[0], // Primary city
                serviceCategories: {
                    connect: categoryIds.map((id: string) => ({ id }))
                }
            }
        });

        // Update application status
        await prisma.proApplication.update({
            where: { id: applicationId },
            data: {
                status: 'APPROVED',
                reviewedBy: session.user.id,
                reviewedAt: new Date()
            }
        });

        // Send approval and welcome emails
        await sendApplicationApproved(application.email, {
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email
        });

        await sendWelcomePro(application.email, application.firstName);

        revalidatePath('/dashboard/admin/applications');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function rejectApplication(
    applicationId: string,
    reason: string
): Promise<ActionResponse<void>> {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            throw new AuthenticationError("Accès réservé aux administrateurs");
        }

        const application = await prisma.proApplication.findUnique({
            where: { id: applicationId }
        });

        if (!application) {
            throw new NotFoundError("Demande non trouvée");
        }

        await prisma.proApplication.update({
            where: { id: applicationId },
            data: {
                status: 'REJECTED',
                adminNotes: reason,
                reviewedBy: session.user.id,
                reviewedAt: new Date()
            }
        });

        // Send rejection email
        await sendApplicationRejected(application.email, {
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email,
            reason
        });

        revalidatePath('/dashboard/admin/applications');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function requestDocuments(
    applicationId: string,
    message: string
): Promise<ActionResponse<void>> {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            throw new AuthenticationError("Accès réservé aux administrateurs");
        }

        const application = await prisma.proApplication.findUnique({
            where: { id: applicationId }
        });

        if (!application) {
            throw new NotFoundError("Demande non trouvée");
        }

        await prisma.proApplication.update({
            where: { id: applicationId },
            data: {
                status: 'NEEDS_DOCUMENTS',
                adminNotes: message,
                reviewedBy: session.user.id,
                reviewedAt: new Date()
            }
        });

        // Send documents request email
        await sendApplicationDocumentsRequested(application.email, {
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email,
            message
        });

        revalidatePath('/dashboard/admin/applications');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
