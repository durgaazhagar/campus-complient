"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { getDemoSession } from "@/lib/demo-auth";

export type Role = "student" | "admin" | null;

export function useRole() {
  const [role, setRoleState] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;

    const demoSession = getDemoSession();
    if (demoSession) {
      setUserId(demoSession.userId ?? null);
      setRoleState(demoSession.role);
      setLoading(false);
      return;
    }

    function applySession(session: Session | null) {
      if (!active) return;
      setUserId(session?.user.id ?? null);
      const accountRole =
        session?.user.app_metadata?.role ??
        session?.user.user_metadata?.role ??
        session?.user.user_metadata?.["role"] ??
        null;

      setRoleState(
        !session
          ? null
          : accountRole === undefined || accountRole === "student"
            ? "student"
            : accountRole === "admin"
              ? "admin"
              : null,
      );
      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      applySession(session);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authEventReceived) return;
      if (error) {
        console.error("Could not load the current session:", error);
        applySession(null);
        return;
      }
      applySession(data.session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { role, userId, loading };
}
