import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogs() {
    const { data, error } = await supabase.from('user_logs').select('*');
    if (error) {
        console.error('Error fetching logs:', error);
    } else {
        console.log(`Fetched ${data?.length} logs.`);
        if (data && data.length > 0) {
            console.log('Sample log:', data[0]);
        }
    }
}

testLogs();
