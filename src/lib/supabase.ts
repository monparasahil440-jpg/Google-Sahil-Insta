import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rcjksdklfisxtignxevj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mw6Mqy3a8aY0tJKoCQpRDA_Xipjk4hk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
