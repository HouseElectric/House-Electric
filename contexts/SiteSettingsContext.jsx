"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_SETTINGS = {
  phone: "+91 97736 44275",
  whatsapp: "919773644275",
  email: "office.houseelectric@gmail.com",
  address: "Kh No. 307/202, 1st Floor, Plot No. 174, Street Number 4, Block-B, New Delhi, North Delhi, Delhi 110042",
  city: "New Delhi",
  state: "Delhi",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

const SiteSettingsContext = createContext(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.from("site_settings").select("data").eq("key", "contact").maybeSingle();
      if (data?.data) setSettings((s) => ({ ...s, ...data.data }));
    })();
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
