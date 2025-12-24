import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Get Pro's reservations
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

        // Get the pro profile for this user
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: decoded.userId },
        });

        if (!proProfile) {
            return NextResponse.json(
                { error: 'Profil pro non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        const reservations = await prisma.reservation.findMany({
            where: { proId: proProfile.id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        phoneNumber: true,
                    },
                },
                service: true,
            },
            orderBy: { startDate: 'desc' },
        });

        return NextResponse.json(reservations, { headers: corsHeaders });
    } catch (error) {
        console.error('Get pro reservations error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des réservations' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Create a manual reservation (Pro creates for a client)
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

        // Get the pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: decoded.userId },
        });

        if (!proProfile) {
            return NextResponse.json(
                { error: 'Profil pro non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { clientName, clientEmail, clientPhone, startDate, endDate, serviceId, totalPrice, notes } = body;

        // Find or create client
        let client = await prisma.user.findUnique({
            where: { email: clientEmail },
        });

        if (!client) {
            // Create a new client user with a random password (they can reset it later)
            const randomPassword = Math.random().toString(36).substring(2, 15);
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            client = await prisma.user.create({
                data: {
                    email: clientEmail,
                    name: clientName,
                    phoneNumber: clientPhone || null,
                    password: hashedPassword,
                    role: 'CLIENT',
                },
            });
        }

        // Create the reservation
        const reservation = await prisma.reservation.create({
            data: {
                clientId: client.id,
                proId: proProfile.id,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                serviceId: serviceId || null,
                totalPrice: totalPrice || 0,
                status: 'CONFIRMED', // Manual reservations are auto-confirmed
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                service: true,
            },
        });

        return NextResponse.json(reservation, { headers: corsHeaders });
    } catch (error) {
        console.error('Create manual reservation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la réservation' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Update reservation status (confirm, cancel, complete)
export async function PATCH(request: NextRequest) {
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

        // Get the pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: decoded.userId },
        });

        if (!proProfile) {
            return NextResponse.json(
                { error: 'Profil pro non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        const body = await request.json();
        const { reservationId, status } = body;

        // Verify the reservation belongs to this pro
        const reservation = await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                proId: proProfile.id,
            },
        });

        if (!reservation) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Update the reservation
        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                service: true,
            },
        });

        return NextResponse.json(updated, { headers: corsHeaders });
    } catch (error) {
        console.error('Update reservation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500, headers: corsHeaders }
        );
    }
}
