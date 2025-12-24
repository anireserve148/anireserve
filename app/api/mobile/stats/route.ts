import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileAuth, getCorsHeaders, getProProfileFromUser } from '@/app/lib/mobile-auth';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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

    try {
        const now = new Date();
        const firstDayOfMonth = startOfMonth(now);

        // Revenue this month
        const monthlyReservations = await prisma.reservation.findMany({
            where: {
                proId: proProfile.id,
                startDate: { gte: firstDayOfMonth },
                status: 'CONFIRMED'
            },
            select: { totalPrice: true }
        });

        const monthlyRevenue = monthlyReservations.reduce((sum, res) => sum + res.totalPrice, 0);

        // Total bookings (all time)
        const totalBookings = await prisma.reservation.count({
            where: { proId: proProfile.id }
        });

        // Pending bookings
        const pendingBookings = await prisma.reservation.count({
            where: {
                proId: proProfile.id,
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            monthlyRevenue,
            totalBookings,
            pendingBookings,
            currency: '₪'
        }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders });
    }
}
