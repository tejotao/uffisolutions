import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qrnqwewmomlxhaiujrnd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DZIAZcX4GJjVl-uvn_pgWQ_NDWfhu8Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);