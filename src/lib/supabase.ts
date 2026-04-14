import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzoqanqcviwpbzvvubrq.supabase.co';
const supabaseAnonKey = 'sb_publishable_uySdUkEiRhrFxZOlgDgsRQ_-_B_hozl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
