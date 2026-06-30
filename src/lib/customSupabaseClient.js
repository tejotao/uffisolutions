import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrnqwewmomlxhaiujrnd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybnF3ZXdtb21seGhhaXVqcm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjU5OTUsImV4cCI6MjA5NzU0MTk5NX0.RkplAVzmq1odJU9UaDqdTtI0bTtktPCjz5q5-Ue6AhA';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
