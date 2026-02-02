import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
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
        const decoded = verify(token, getJWTSecret()) as any;

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
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Format for mobile
        const formatted = conversations.map(conv => {
            const otherUser = conv.clientId === decoded.userId
                ? { id: conv.pro.user.id, name: conv.pro.user.name, image: conv.pro.user.image }
                : conv.client;
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
                createdAt: conv.createdAt,
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
        const decoded = verify(token, getJWTSecret()) as any;

        const body = await request.json();
        const { otherUserId } = body;

        // Determine who is client and who is pro
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { proProfile: true },
        });

        const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            include: { proProfile: true },
        });

        if (!currentUser || !otherUser) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Determine client and pro
        // If current user is Pro and other user is Client: current=pro, other=client
        // If current user is Client and other user is Pro: current=client, other=pro
        let clientId: string;
        let proProfileId: string;

        if (currentUser.role === 'PRO' && currentUser.proProfile) {
            // Current user is the Pro, other user is the Client
            clientId = otherUserId;
            proProfileId = currentUser.proProfile.id;
        } else if (otherUser.role === 'PRO' && otherUser.proProfile) {
            // Other user is the Pro, current user is the Client
            clientId = decoded.userId;
            proProfileId = otherUser.proProfile.id;
        } else {
            return NextResponse.json(
                { error: 'Une des deux parties doit être un professionnel' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if conversation already exists
        const existing = await prisma.conversation.findFirst({
            where: {
                clientId: clientId,
                proId: proProfileId,
            },
        });

        if (existing) {
            return NextResponse.json({ id: existing.id }, { headers: corsHeaders });
        }

        const conversation = await prisma.conversation.create({
            data: {
                clientId: clientId,
                proId: proProfileId,
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
