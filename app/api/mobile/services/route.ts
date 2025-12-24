import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileAuth, getCorsHeaders, getProProfileFromUser } from '@/app/lib/mobile-auth';

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

    return NextResponse.json(proProfile.services, { headers: corsHeaders });
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
        const service = await prisma.proService.create({
            data: {
                proProfileId: proProfile.id,
                name: body.name,
                description: body.description,
                customPrice: parseFloat(body.price),
                duration: parseInt(body.duration),
                isActive: true
            }
        });

        return NextResponse.json(service, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders });
    }
}

export async function DELETE(request: NextRequest) {
    const user = await verifyMobileAuth(request);
    if (!user || user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400, headers: corsHeaders });

        await prisma.proService.delete({
            where: { id }
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders });
    }
}
