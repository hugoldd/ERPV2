import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

import type { Section } from "./types/app";
import { SECTIONS } from "./types/app";

import { useSession } from "./hooks/useSession";
import { AppShell } from "./components/AppShell";

import { HomePage } from "./pages/Home";
import { ClientsPage } from "./pages/Clients";
import { WipPage } from "./pages/Wip";

export default function App() {
  const { session, loading } = useSession();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("home");

  // actions injectées par une page (ex: Clients)
  const [topActions, setTopActions] = useState<React.ReactNode>(null);

  const userId = session?.user.id ?? null;

  const userLabel = useMemo(() => {
    if (!session) return "";
    return session.user.email ?? session.user.id;
  }, [session]);

  // --- Profile: last_section (Supabase) ---
  useEffect(() => {
    if (!userId) {
      setSection("home");
      return;
    }

    let cancelled = false;

    async function loadProfile(uid: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("last_section")
        .eq("id", uid)
        .maybeSingle();

      if (!cancelled && (!data || error)) {
        await supabase.from("profiles").upsert({ id: uid, last_section: "home" });
        if (!cancelled) setSection("home");
      } else if (!cancelled) {
        setSection(((data?.last_section as Section | undefined) ?? "home"));
      }
    }

    loadProfile(userId);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").update({ last_section: section }).eq("id", userId);
  }, [section, userId]);

  const login = async (email: string, password: string) => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
  };

  const logout = async () => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signOut();
    if (error) setErrorMsg(error.message);
  };

  if (loading) {
    return (
      <main className="page">
        <div className="card">Chargement…</div>
      </main>
    );
  }

  // --- Login screen ---
  if (!session) {
    return <LoginScreen errorMsg={errorMsg} onLogin={login} />;
  }

  const title = section === "home"
    ? "Accueil"
    : SECTIONS.find((s) => s.key === section)?.label ?? "Module";

  const subtitle = section === "home"
    ? "Sélectionnez un module pour commencer."
    : section === "clients"
      ? "Recherche, liste et fiche client (Supabase)."
      : "Écran en cours de construction.";

  return (
    <AppShell
      section={section}
      onNavigate={(s) => {
        setErrorMsg(null);
        setSection(s);
      }}
      userLabel={userLabel}
      onLogout={logout}
      title={title}
      subtitle={subtitle}
      topActions={topActions}
      errorMsg={errorMsg}
    >
      {section === "home" ? (
        <HomePage onOpen={(s) => setSection(s)} />
      ) : section === "clients" ? (
        <ClientsPage
          onError={setErrorMsg}
          setTopActions={setTopActions}
        />
      ) : (
        <WipPage title={title} />
      )}
    </AppShell>
  );
}

/** Login séparé pour garder App.tsx propre */
function LoginScreen(props: {
  errorMsg: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="page">
      <div className="card">
        <h1>Portail ERP</h1>
        <p>Connexion e-mail / mot de passe (Supabase).</p>

        {props.errorMsg && <div className="error">Erreur : {props.errorMsg}</div>}

        <label className="label">E-mail</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="label">Mot de passe</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="row">
          <button onClick={() => props.onLogin(email, password)}>Se connecter</button>
        </div>
      </div>
    </main>
  );
}
