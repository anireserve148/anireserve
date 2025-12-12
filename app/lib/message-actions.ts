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

const sendMessageSchema = z.object({
    recipientId: z.string(),
    content: z.string().min(1, "Le message ne peut pas être vide"),
    isProRecipient: z.boolean()
})

export async function sendMessage(
    data: z.infer<typeof sendMessageSchema>
): Promise<ActionResponse<void>> {
    try {
        const validated = sendMessageSchema.parse(data);
        const session = await auth();

        if (!session?.user?.id) {
            throw new AuthenticationError("Connectez-vous pour envoyer des messages");
        }

        const senderId = session.user.id;

        // Determine conversation participants
        let clientId: string;
        let proId: string;

        if (validated.isProRecipient) {
            // Current user is client, recipient is pro
            clientId = senderId;
            proId = validated.recipientId;
        } else {
            // Current user is pro, recipient is client
            proId = senderId;
            clientId = validated.recipientId;
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                clientId_proId: {
                    clientId,
                    proId
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    clientId,
                    proId,
                    lastMessageAt: new Date()
                }
            });
        }

        // Create message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId,
                content: validated.content
            }
        });

        // Update conversation last message time
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });

        revalidatePath('/dashboard/messages');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getConversations(): Promise<ActionResponse<any[]>> {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new AuthenticationError("Non autorisé");
        }

        const userId = session.user.id;
        const userRole = session.user.role;

        // Fetch conversations based on role
        const conversations = await prisma.conversation.findMany({
            where: userRole === 'PRO'
                ? { proId: userId }
                : { clientId: userId },
            include: {
                client: true,
                pro: { include: { user: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        return createSuccessResponse(conversations);
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getMessages(conversationId: string): Promise<ActionResponse<any[]>> {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new AuthenticationError("Non autorisé");
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                isRead: false
            },
            data: { isRead: true }
        });

        return createSuccessResponse(messages);
    } catch (error) {
        return handleActionError(error);
    }
}
