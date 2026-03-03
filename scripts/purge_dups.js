const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeDupLogs() {
    const { data: logs, error } = await supabase
        .from('user_logs')
        .select('id, details, created_at')
        .eq('action_type', 'Expiration')
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    const seen = new Set();
    let dels = 0;

    for (const l of logs) {
        if (seen.has(l.details)) {
            await supabase.from('user_logs').delete().eq('id', l.id);
            dels++;
        } else {
            seen.add(l.details);
        }
    }

    console.log(`Deleted ${dels} duplicate expiration logs.`);
}
purgeDupLogs();
