"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (sessionUser) => {
    if (!sessionUser) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", sessionUser.id).maybeSingle();
    setIsAdmin(!!data?.is_admin);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase?.auth.signInWithPassword({ email, password });
  const signOut = () => supabase?.auth.signOut();

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut, supabaseReady: !!supabase }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
