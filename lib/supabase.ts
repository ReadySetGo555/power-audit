import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Single-user mode — replace with auth user id once login is added
export const DEFAULT_USER_ID = "436b9b52-0097-4953-8966-e1a99ce51609";
