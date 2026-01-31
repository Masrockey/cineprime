
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setAdminRole() {
    const email = 'admin@admin.com';
    console.log(`Searching for user: ${email}...`);

    // 1. Find user by email (using listUsers for simplicity as there is no straight getUserByEmail in admin api sometimes depending on version, but listUsers is safe)
    // Actually getUserByEmail exists in newer versions but listUsers is robust.
    // Let's try listUsers with filter if possible, or just list all.

    // In @supabase/supabase-js v2, listUsers doesn't support email filter directly in all versions cleanly, so we'll fetch and find.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error.message);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User ${email} not found! Please run the create-admin script first or sign up.`);
        return;
    }

    console.log(`Found user ${user.id}. Setting role to 'admin'...`);

    // 2. Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { app_metadata: { role: 'admin' } }
    );

    if (updateError) {
        console.error('Error updating user role:', updateError.message);
    } else {
        console.log(`Success! User ${email} is now an admin.`);
        console.log('App Metadata:', updatedUser.user.app_metadata);
    }
}

setAdminRole();
