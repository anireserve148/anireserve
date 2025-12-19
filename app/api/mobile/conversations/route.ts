import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Get user conversations
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { clientId: decoded.userId },
                    { proId: decoded.userId },
                ],
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                pro: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Format for mobile
        const formatted = conversations.map(conv => {
            const otherUser = conv.clientId === decoded.userId ? conv.pro : conv.client;
            const lastMessage = conv.messages[0];

            return {
                id: conv.id,
                otherUser: {
                    id: otherUser.id,
                    name: otherUser.name,
                    image: otherUser.image,
                },
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    isRead: lastMessage.isRead,
                    senderId: lastMessage.senderId,
                } : null,
                updatedAt: conv.updatedAt,
            };
        });

        return NextResponse.json(formatted, { headers: corsHeaders });
    } catch (error) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des conversations' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Create new conversation
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;

        const body = await request.json();
        const { otherUserId } = body;

        // Check if conversation already exists
        const existing = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { clientId: decoded.userId, proId: otherUserId },
                    { clientId: otherUserId, proId: decoded.userId },
                ],
            },
        });

        if (existing) {
            return NextResponse.json({ id: existing.id }, { headers: corsHeaders });
        }

        // Determine who is client and who is pro
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
        });

        if (!currentUser || !otherUser) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        const isCurrentUserClient = currentUser.role === 'CLIENT';

        const conversation = await prisma.conversation.create({
            data: {
                clientId: isCurrentUserClient ? decoded.userId : otherUserId,
                proId: isCurrentUserClient ? otherUserId : decoded.userId,
            },
        });

        return NextResponse.json({ id: conversation.id }, { headers: corsHeaders });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la conversation' },
            { status: 500, headers: corsHeaders }
        );
    }
}
