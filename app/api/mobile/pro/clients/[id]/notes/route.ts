import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

// GET /api/mobile/pro/clients/[id]/notes - Get all notes for a client
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const clientId = params.id;

        // Get all notes for this client
        const notes = await prisma.clientNote.findMany({
            where: {
                proProfileId: proProfile.id,
                clientId: clientId
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return Response.json({ success: true, data: notes });
    } catch (error) {
        console.error('Error fetching client notes:', error);
        return Response.json(
            { error: 'Erreur lors de la récupération des notes' },
            { status: 500 }
        );
    }
}

// POST /api/mobile/pro/clients/[id]/notes - Create a new note
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const clientId = params.id;
        const { content } = await request.json();

        if (!content || content.trim().length === 0) {
            return Response.json({ error: 'Le contenu de la note est requis' }, { status: 400 });
        }

        // Verify client exists
        const client = await prisma.user.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            return Response.json({ error: 'Client non trouvé' }, { status: 404 });
        }

        // Create the note
        const note = await prisma.clientNote.create({
            data: {
                proProfileId: proProfile.id,
                clientId: clientId,
                content: content.trim()
            }
        });

        return Response.json({ success: true, data: note }, { status: 201 });
    } catch (error) {
        console.error('Error creating client note:', error);
        return Response.json(
            { error: 'Erreur lors de la création de la note' },
            { status: 500 }
        );
    }
}
