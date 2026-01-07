import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

// POST /api/mobile/pro/clients/[id]/tags - Add a tag to a client
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
        const { tag } = await request.json();

        if (!tag || tag.trim().length === 0) {
            return Response.json({ error: 'Le tag est requis' }, { status: 400 });
        }

        // Validate tag format (uppercase, no spaces)
        const normalizedTag = tag.toUpperCase().trim();
        const validTags = ['VIP', 'NOUVEAU', 'INACTIF', 'FIDELE', 'A_RELANCER'];

        if (!validTags.includes(normalizedTag)) {
            return Response.json({ error: 'Tag invalide' }, { status: 400 });
        }

        // Check if tag already exists
        const existingTag = await prisma.clientTag.findUnique({
            where: {
                proProfileId_clientId_tag: {
                    proProfileId: proProfile.id,
                    clientId: clientId,
                    tag: normalizedTag
                }
            }
        });

        if (existingTag) {
            return Response.json({ error: 'Tag déjà existant pour ce client' }, { status: 409 });
        }

        // Create the tag
        const clientTag = await prisma.clientTag.create({
            data: {
                proProfileId: proProfile.id,
                clientId: clientId,
                tag: normalizedTag
            }
        });

        return Response.json({ success: true, data: clientTag }, { status: 201 });
    } catch (error) {
        console.error('Error adding client tag:', error);
        return Response.json(
            { error: 'Erreur lors de l\'ajout du tag' },
            { status: 500 }
        );
    }
}

// DELETE /api/mobile/pro/clients/[id]/tags?tag=VIP - Remove a tag from a client
export async function DELETE(
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
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get('tag');

        if (!tag) {
            return Response.json({ error: 'Le tag est requis' }, { status: 400 });
        }

        const normalizedTag = tag.toUpperCase().trim();

        // Delete the tag
        await prisma.clientTag.deleteMany({
            where: {
                proProfileId: proProfile.id,
                clientId: clientId,
                tag: normalizedTag
            }
        });

        return Response.json({ success: true, message: 'Tag supprimé' });
    } catch (error) {
        console.error('Error deleting client tag:', error);
        return Response.json(
            { error: 'Erreur lors de la suppression du tag' },
            { status: 500 }
        );
    }
}
