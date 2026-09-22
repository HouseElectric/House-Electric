"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (sessionUser) => {
    if (!sessionUser) {
      setIsAdmin(false);
      setIsTechnician(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("is_admin, is_technician").eq("id", sessionUser.id).maybeSingle();
    setIsAdmin(!!data?.is_admin);
    setIsTechnician(!!data?.is_technician);
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
    <AdminAuthContext.Provider value={{ user, isAdmin, isTechnician, loading, signIn, signOut, supabaseReady: !!supabase }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
