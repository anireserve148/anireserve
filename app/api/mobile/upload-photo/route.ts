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
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'Image requise' },
                { status: 400, headers: corsHeaders }
            );
        }

        // For now, we'll store the base64 directly
        // In production, you'd upload to S3/Cloudinary
        const imageUrl = imageBase64.substring(0, 100000); // Limit size

        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: { image: imageUrl },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                phoneNumber: true,
            },
        });

        return NextResponse.json({ user }, { headers: corsHeaders });
    } catch (error) {
        console.error('Upload photo error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload' },
            { status: 500, headers: corsHeaders }
        );
    }
}
