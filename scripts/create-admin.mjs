import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env).");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@houseelectric.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "House@0302";

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing } = await supabase.auth.admin.listUsers();
const already = existing?.users?.find((u) => u.email === ADMIN_EMAIL);

if (already) {
  console.log(`Admin user already exists: ${ADMIN_EMAIL} (id: ${already.id})`);
  process.exit(0);
}

const { data, error } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
});

if (error) {
  console.error("Failed to create admin user:", error.message);
  process.exit(1);
}

console.log(`Admin user created: ${data.user.email} (id: ${data.user.id})`);
