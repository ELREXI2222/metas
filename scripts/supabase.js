/**
 * Supabase Client Module
 * Initializes the connection to the Supabase project.
 */

const SUPABASE_URL = 'https://pmllimjguabfknotzxfw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kjW215FHDCsmK-2RJafihw_oBDwnPu8';

export const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!supabase) {
    console.error('Supabase library not loaded. Make sure to include the CDN in index.html');
}
