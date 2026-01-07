import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

// GET /api/mobile/pro/analytics/revenue?period=week|month
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Check if user has a PRO profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            return Response.json({ error: 'Profil professionnel non trouvé' }, { status: 403 });
        }

        // Get period from query params (default: month)
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';
        const days = period === 'week' ? 7 : 30;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all completed reservations in the date range
        const reservations = await prisma.reservation.findMany({
            where: {
                proId: proProfile.id,
                status: 'COMPLETED',
                startDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                startDate: true,
                totalPrice: true
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        // Group by date and sum revenues
        const revenueByDate: Record<string, number> = {};

        // Initialize all days with 0
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            revenueByDate[dateKey] = 0;
        }

        // Add actual revenues
        reservations.forEach(res => {
            const dateKey = res.startDate.toISOString().split('T')[0];
            if (revenueByDate[dateKey] !== undefined) {
                revenueByDate[dateKey] += res.totalPrice;
            }
        });

        // Convert to arrays for charting
        const labels: string[] = [];
        const data: number[] = [];

        Object.keys(revenueByDate).sort().forEach(dateKey => {
            const date = new Date(dateKey);
            // Format: "15 Jan" or "15/01"
            const label = period === 'week'
                ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });

            labels.push(label);
            data.push(revenueByDate[dateKey]);
        });

        // Calculate statistics
        const totalRevenue = data.reduce((sum, val) => sum + val, 0);
        const averageRevenue = totalRevenue / days;

        // Calculate trend (compare first half vs second half)
        const halfPoint = Math.floor(days / 2);
        const firstHalfAvg = data.slice(0, halfPoint).reduce((sum, val) => sum + val, 0) / halfPoint;
        const secondHalfAvg = data.slice(halfPoint).reduce((sum, val) => sum + val, 0) / (days - halfPoint);
        const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

        return Response.json({
            success: true,
            data: {
                labels,
                data,
                stats: {
                    totalRevenue: Math.round(totalRevenue),
                    averageRevenue: Math.round(averageRevenue),
                    trend: Math.round(trend * 10) / 10, // 1 decimal
                    period: period,
                    days: days
                }
            }
        });
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        return Response.json(
            { error: 'Erreur lors de la récupération des analytics' },
            { status: 500 }
        );
    }
}
