import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jokefaafwzctjdzvmpte.supabase.co";
const SUPABASE_KEY = "sb_publishable_FUVSjN8ePnNGUWolvEWjgA_t8ko768C";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
