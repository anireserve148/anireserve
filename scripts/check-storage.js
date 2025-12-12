const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env file not found');
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase keys missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('🔍 Checking Supabase Storage connection...');
    console.log(`URL: ${supabaseUrl}`);

    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('❌ Error listing buckets:', error.message);
        return;
    }

    console.log('✅ Connected successfully.');
    console.log('📦 Buckets found:', data.length);

    const buckets = data.map(b => b.name);
    console.log('names:', buckets);

    if (buckets.includes('applications')) {
        console.log('✅ "applications" bucket exists.');
    } else {
        console.error('❌ "applications" bucket MISSING.');
        console.log('⚙️ Attemping to create bucket...');

        const { data, error } = await supabase.storage.createBucket('applications', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/*']
        });

        if (error) {
            console.error('❌ Failed to create bucket:', error.message);
            console.log('⚠️  ACTION REQUIRED: Go to Supabase Dashboard > Storage > Create a new public bucket named "applications".');
        } else {
            console.log('✅ Bucket "applications" created successfully!');
        }
    }
}

checkStorage();
