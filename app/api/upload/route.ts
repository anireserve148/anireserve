import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: NextRequest) {
    try {
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Use type assertion to bypass the incorrect FormData type
        const formData = await request.formData() as unknown as globalThis.FormData
        const file = formData.get('file')

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Now file is a File/Blob
        const uploadFile = file as File

        // Validate file type
        if (!uploadFile.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
        }

        // Validate file size (5MB max)
        if (uploadFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
        }

        const bytes = await uploadFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const ext = uploadFile.name.split('.').pop() || 'jpg'
        const filename = `${randomUUID()}.${ext}`
        const filePath = `applications/${filename}`

        // Upload to Supabase Storage
        const { error } = await supabase
            .storage
            .from('applications')
            .upload(filePath, buffer, {
                contentType: uploadFile.type,
                upsert: false
            })

        if (error) {
            console.error('Supabase storage error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('applications')
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl })
    } catch (error: unknown) {
        console.error('Upload error:', error)
        const message = error instanceof Error ? error.message : 'Upload failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
