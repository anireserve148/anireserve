import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push-notifications';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Get messages in a conversation
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, getJWTSecret()) as any;
        const params = await props.params;
        const { id } = params;

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                OR: [
                    { clientId: decoded.userId },
                    { proId: decoded.userId },
                ],
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation non trouvée' },
                { status: 404, headers: corsHeaders }
            );
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId: id,
                senderId: { not: decoded.userId },
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json(messages, { headers: corsHeaders });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des messages' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Send a message
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, getJWTSecret()) as any;
        const params = await props.params;
        const { id } = params;

        const body = await request.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Message vide' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                OR: [
                    { clientId: decoded.userId },
                    { proId: decoded.userId },
                ],
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation non trouvée' },
                { status: 404, headers: corsHeaders }
            );
        }

        const message = await prisma.message.create({
            data: {
                conversationId: id,
                senderId: decoded.userId,
                content: content.trim(),
            },
        });

        // 🔔 Send push notification to recipient
        try {
            const sender = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { name: true },
            });

            // Determine recipient (the other person in the conversation)
            const recipientId = conversation.clientId === decoded.userId
                ? conversation.proId
                : conversation.clientId;

            // Get recipient's userId (if recipientId is a proProfile, get the userId)
            let recipientUserId = recipientId;

            // Check if recipientId is a proProfile ID
            if (conversation.proId === recipientId) {
                const proProfile = await prisma.proProfile.findUnique({
                    where: { id: recipientId },
                    select: { userId: true },
                });
                recipientUserId = proProfile?.userId || recipientId;
            }

            const messagePreview = content.trim().substring(0, 100);

            await sendPushNotification(
                recipientUserId,
                `💬 ${sender?.name || 'Quelqu\'un'} vous a écrit`,
                messagePreview
            );
        } catch (notifError) {
            console.error('Failed to send push notification:', notifError);
            // Don't fail the message if notification fails
        }

        return NextResponse.json(message, { headers: corsHeaders });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi du message' },
            { status: 500, headers: corsHeaders }
        );
    }
}
