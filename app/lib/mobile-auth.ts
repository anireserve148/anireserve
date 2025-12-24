import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from './prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function getCorsHeaders() {
    return corsHeaders;
}

export async function verifyMobileAuth(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function getProProfileFromUser(userId: string) {
    return await prisma.proProfile.findUnique({
        where: { userId },
        include: { availability: true, services: true }
    });
}
