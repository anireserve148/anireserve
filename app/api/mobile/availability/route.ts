import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileAuth, getCorsHeaders, getProProfileFromUser } from '@/app/lib/mobile-auth';
import { z } from 'zod';

const corsHeaders = getCorsHeaders();

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    const user = await verifyMobileAuth(request);
    if (!user || user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders });
    }

    const proProfile = await getProProfileFromUser(user.userId);
    if (!proProfile) {
        return NextResponse.json({ error: 'Profil Pro non trouvé' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(proProfile.availability, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    const user = await verifyMobileAuth(request);
    if (!user || user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders });
    }

    const proProfile = await getProProfileFromUser(user.userId);
    if (!proProfile) {
        return NextResponse.json({ error: 'Profil Pro non trouvé' }, { status: 404, headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const slots = body.slots; // Array of { dayOfWeek, isAvailable, startTime, endTime }

        // Delete existing
        await prisma.availability.deleteMany({
            where: { proProfileId: proProfile.id }
        });

        // Create new
        await prisma.availability.createMany({
            data: slots.map((s: any) => ({
                proProfileId: proProfile.id,
                dayOfWeek: s.dayOfWeek,
                isAvailable: s.isAvailable,
                startTime: s.startTime,
                endTime: s.endTime,
            }))
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders });
    }
}
