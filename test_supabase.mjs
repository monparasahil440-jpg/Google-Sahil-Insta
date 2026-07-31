import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rcjksdklfisxtignxevj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mw6Mqy3a8aY0tJKoCQpRDA_Xipjk4hk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log("Testing Supabase connection with valid UUID vs string...");
  // Test with valid UUID format
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const { data, error } = await supabase.from('profiles').upsert([{
    id: validUuid,
    username: 'sahil_valid_uuid',
    full_name: 'Sahil Monpara',
    bio: 'Testing valid UUID'
  }]).select();

  console.log("Result error:", error);
  console.log("Result data:", data);
}

test();
