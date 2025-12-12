
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔌 Connecting to database to force-create storage bucket...')

    try {
        // 1. Create the bucket if it doesn't exist
        console.log('📦 Creating "applications" bucket...')
        await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('applications', 'applications', true)
      ON CONFLICT (id) DO NOTHING;
    `)
        console.log('✅ Bucket created or already exists.')

        // 1.5 Enable public access to buckets (so listBuckets works)
        console.log('👀 Setting up Bucket Visibility Policy...')
        try {
            await prisma.$executeRawUnsafe(`
        DROP POLICY IF EXISTS "Public Bucket Access" ON storage.buckets;
        `)
            await prisma.$executeRawUnsafe(`
        CREATE POLICY "Public Bucket Access" 
        ON storage.buckets FOR SELECT 
        USING (true);
        `)
        } catch (e) {
            console.warn('⚠️ Could not set bucket visibility policy:', e)
        }

        // 2. Enable public uploads (Policy)
        // We drop existing policy first to avoid conflicts if we re-run
        console.log('🔓 Setting up Upload Policy...')
        try {
            await prisma.$executeRawUnsafe(`
        DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
        `)
            await prisma.$executeRawUnsafe(`
        CREATE POLICY "Public Uploads" 
        ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id = 'applications');
        `)
        } catch (e) {
            // Ignore if it fails slightly (e.g. if objects table doesn't exist? Unlikely on Supabase)
            console.warn('⚠️ Could not set upload policy (might need to enable RLS first or check permissions):', e)
        }

        // 3. Enable public reads (Policy)
        console.log('👀 Setting up Read Policy...')
        try {
            await prisma.$executeRawUnsafe(`
        DROP POLICY IF EXISTS "Public Reads" ON storage.objects;
        `)
            await prisma.$executeRawUnsafe(`
        CREATE POLICY "Public Reads" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'applications');
        `)
        } catch (e) {
            console.warn('⚠️ Could not set read policy:', e)
        }

        console.log('✨ Storage setup attempt complete.')

    } catch (error) {
        console.error('❌ Fatal error during SQL execution:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
