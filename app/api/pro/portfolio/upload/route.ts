import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'portfolio')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            console.error('Error creating directory:', e)
        }

        const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        const imageUrl = `/uploads/portfolio/${fileName}`

        // Save to database
        const galleryItem = await prisma.proProfileGallery.create({
            data: {
                proProfileId: proProfile.id,
                imageUrl,
                caption: formData.get('caption') as string || '',
                order: await prisma.proProfileGallery.count({ where: { proProfileId: proProfile.id } })
            }
        })

        return NextResponse.json({ success: true, item: galleryItem })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Erreur lors de l’upload' }, { status: 500 })
    }
}
