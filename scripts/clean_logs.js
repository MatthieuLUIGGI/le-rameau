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

async function cleanLogs() {
    console.log('Fetching log IDs...');
    const { data: ids, error } = await supabase.from('user_logs').select('id');

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    console.log(`Found ${ids.length} logs. Processing one by one...`);
    let upCount = 0;
    let delCount = 0;

    for (const row of ids) {
        const { data, error: err2 } = await supabase.from('user_logs').select('id, old_data, new_data').eq('id', row.id).single();
        if (err2 || !data) {
            console.error(`Failed to fetch log ${row.id}`);
            continue;
        }

        const log = data;
        let changed = false;
        let cOld = log.old_data;
        let cNew = log.new_data;

        const trunc = (obj) => {
            if (!obj || typeof obj !== 'object') return false;
            let res = false;
            for (const k of ['image_url', 'pdf_url', 'url', 'photo_url', 'contenu']) {
                if (obj[k] && typeof obj[k] === 'string' && obj[k].length > 500) {
                    obj[k] = obj[k].substring(0, 100) + '... [TRINC]';
                    res = true;
                }
            }
            return res;
        };

        if (trunc(cOld)) changed = true;
        if (trunc(cNew)) changed = true;

        if (changed) {
            console.log(`Truncating huge fields for log ${log.id}`);
            const { error: upErr } = await supabase.from('user_logs').update({ old_data: cOld, new_data: cNew }).eq('id', log.id);
            if (upErr) {
                console.error('Update err, deleting...', upErr);
                await supabase.from('user_logs').delete().eq('id', log.id);
                delCount++;
            } else {
                upCount++;
            }
        }
    }
    console.log(`Done. Updated ${upCount}, Deleted ${delCount}`);
}

cleanLogs();
