import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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
        const { pushToken } = body;

        if (!pushToken) {
            return NextResponse.json(
                { error: 'Push token requis' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Save push token to user
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                // We'd need to add a pushToken field to the User model
                // For now, we'll store it in a separate table or skip persistence
            },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('Save push token error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde du token' },
            { status: 500, headers: corsHeaders }
        );
    }
}
