import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

// PATCH /api/mobile/pro/clients/[id]/notes/[noteId] - Update a note
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; noteId: string } }
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

        const { noteId } = params;
        const { content } = await request.json();

        if (!content || content.trim().length === 0) {
            return Response.json({ error: 'Le contenu de la note est requis' }, { status: 400 });
        }

        // Verify the note belongs to this pro
        const existingNote = await prisma.clientNote.findUnique({
            where: { id: noteId }
        });

        if (!existingNote) {
            return Response.json({ error: 'Note non trouvée' }, { status: 404 });
        }

        if (existingNote.proProfileId !== proProfile.id) {
            return Response.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Update the note
        const updatedNote = await prisma.clientNote.update({
            where: { id: noteId },
            data: {
                content: content.trim()
            }
        });

        return Response.json({ success: true, data: updatedNote });
    } catch (error) {
        console.error('Error updating client note:', error);
        return Response.json(
            { error: 'Erreur lors de la mise à jour de la note' },
            { status: 500 }
        );
    }
}

// DELETE /api/mobile/pro/clients/[id]/notes/[noteId] - Delete a note
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; noteId: string } }
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

        const { noteId } = params;

        // Verify the note belongs to this pro
        const existingNote = await prisma.clientNote.findUnique({
            where: { id: noteId }
        });

        if (!existingNote) {
            return Response.json({ error: 'Note non trouvée' }, { status: 404 });
        }

        if (existingNote.proProfileId !== proProfile.id) {
            return Response.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Delete the note
        await prisma.clientNote.delete({
            where: { id: noteId }
        });

        return Response.json({ success: true, message: 'Note supprimée' });
    } catch (error) {
        console.error('Error deleting client note:', error);
        return Response.json(
            { error: 'Erreur lors de la suppression de la note' },
            { status: 500 }
        );
    }
}
