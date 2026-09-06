import { supabase } from "./supabase";

const DEFAULTS = {
  phone: "+91 97736 44275",
  whatsapp: "919773644275",
  email: "office.houseelectric@gmail.com",
  address: "Kh No. 307/202, 1st Floor, Plot No. 174, Street Number 4, Block-B, New Delhi, North Delhi, Delhi 110042",
  city: "New Delhi",
  state: "Delhi",
};

export async function getContactSettings() {
  if (!supabase) return DEFAULTS;
  const { data } = await supabase.from("site_settings").select("data").eq("key", "contact").maybeSingle();
  return { ...DEFAULTS, ...(data?.data || {}) };
}

export function telHref(phone) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function waHref(whatsapp, message = "") {
  return `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
