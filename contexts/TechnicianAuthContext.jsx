"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TechnicianAuthContext = createContext(null);

export function TechnicianAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (sessionUser) => {
    if (!sessionUser) {
      setIsTechnician(false);
      setIsAdmin(false);
      setTechnician(null);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("is_technician, is_admin").eq("id", sessionUser.id).maybeSingle();
    setIsTechnician(!!profile?.is_technician);
    setIsAdmin(!!profile?.is_admin);
    if (profile?.is_technician) {
      const { data: tech } = await supabase.from("technicians").select("*").eq("user_id", sessionUser.id).maybeSingle();
      setTechnician(tech || null);
    } else {
      setTechnician(null);
    }
  };

  const refreshTechnician = async () => {
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    if (!sessionUser) return;
    const { data: tech } = await supabase.from("technicians").select("*").eq("user_id", sessionUser.id).maybeSingle();
    setTechnician(tech || null);
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
    <TechnicianAuthContext.Provider
      value={{ user, technician, isTechnician, isAdmin, loading, signIn, signOut, refreshTechnician, supabaseReady: !!supabase }}
    >
      {children}
    </TechnicianAuthContext.Provider>
  );
}

export const useTechnicianAuth = () => useContext(TechnicianAuthContext);
