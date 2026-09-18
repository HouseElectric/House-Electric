import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await supabase.from("services").select("*").eq("slug", "annual-maintenance-contract-amc").maybeSingle();
console.log(JSON.stringify(data, null, 2));
process.exit(0);
