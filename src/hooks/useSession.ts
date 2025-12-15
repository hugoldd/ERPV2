import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session ?? null);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });

      if (mounted) setLoading(false);
      return () => sub.subscription.unsubscribe();
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return { session, loading };
}
