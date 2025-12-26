import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Accepted image MIME types and their extensions
const ACCEPTED_TYPES: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: 'Fichier trop volumineux. Maximum 10MB.'
            }, { status: 400 })
        }

        // Check file type and get extension
        const mimeType = file.type.toLowerCase()
        let extension = ACCEPTED_TYPES[mimeType]

        if (!extension) {
            // Try to get extension from filename as fallback
            const originalExt = file.name.split('.').pop()?.toLowerCase()
            if (originalExt && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif', 'svg', 'bmp', 'tiff'].includes(originalExt)) {
                extension = `.${originalExt === 'jpeg' ? 'jpg' : originalExt}`
            } else {
                return NextResponse.json({
                    error: `Format non supporté: ${mimeType}. Formats acceptés: JPG, PNG, WebP, GIF, HEIC, AVIF, SVG, BMP, TIFF`
                }, { status: 400 })
            }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'portfolio')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Directory might already exist
        }

        // Generate clean filename with UUID + proper extension
        const fileName = `${uuidv4()}${extension}`
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
        return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
    }
}
