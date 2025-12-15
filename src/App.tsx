import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Section =
  | "home"
  | "catalogue"
  | "articles"
  | "consultants"
  | "planning"
  | "projects"
  | "settings";

const SECTIONS: { key: Exclude<Section, "home">; label: string; desc: string; emoji: string }[] = [
  { key: "catalogue", label: "Catalogue", desc: "Structure des offres & catégories", emoji: "🗂️" },
  { key: "articles", label: "Articles", desc: "Référentiel des articles & unités", emoji: "📦" },
  { key: "consultants", label: "Consultants", desc: "Ressources, compétences, disponibilité", emoji: "👥" },
  { key: "planning", label: "Planning", desc: "Calendrier, affectations, jalons", emoji: "🗓️" },
  { key: "projects", label: "Projets", desc: "Commandes → projets → prestations", emoji: "📁" },
  { key: "settings", label: "Paramètres", desc: "Organisation, droits, préférences", emoji: "⚙️" },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("home");

  const userId = session?.user.id ?? null;

  const userLabel = useMemo(() => {
    if (!session) return "";
    return session.user.email ?? session.user.id;
  }, [session]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setErrorMsg(null);

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

  // Charger / initialiser le profil à la connexion
  useEffect(() => {
    if (!userId) {
      setSection("home");
      return;
    }

    let cancelled = false;

    async function loadProfile(uid: string) {
      setAppLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("last_section")
        .eq("id", uid)
        .maybeSingle();

      if (!cancelled && (!data || error)) {
        const { error: upsertErr } = await supabase
          .from("profiles")
          .upsert({ id: uid, last_section: "home" });

        if (!cancelled && upsertErr) setErrorMsg(upsertErr.message);
        if (!cancelled) setSection("home");
      } else if (!cancelled) {
        const last = (data?.last_section as Section | undefined) ?? "home";
        setSection(last);
      }

      if (!cancelled) setAppLoading(false);
    }

    loadProfile(userId);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persister le dernier écran ouvert
  useEffect(() => {
    if (!userId) return;
    if (appLoading) return;

    supabase.from("profiles").update({ last_section: section }).eq("id", userId);
  }, [section, userId, appLoading]);

  const login = async () => {
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

  // --- Écran de connexion ---
  if (!session) {
    return (
      <main className="page">
        <div className="card">
          <h1>Portail ERP</h1>
          <p>Connexion e-mail / mot de passe (Supabase).</p>

          {errorMsg && <div className="error">Erreur : {errorMsg}</div>}

          <label className="label">E-mail</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            autoComplete="email"
          />

          <label className="label">Mot de passe</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="row">
            <button onClick={login}>Se connecter</button>
          </div>
        </div>
      </main>
    );
  }

  // --- Shell applicatif ---
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandTitle">ERP</div>
          <div className="brandSub">Gestion de projet</div>
        </div>

        <nav className="nav">
          <button
            className={`navItem ${section === "home" ? "navItemActive" : ""}`}
            onClick={() => setSection("home")}
          >
            🏠 Accueil
          </button>

          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`navItem ${section === s.key ? "navItemActive" : ""}`}
              onClick={() => setSection(s.key)}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </nav>

        <div className="sidebarFooter">
          <div className="pill">{userLabel}</div>
          <button className="secondary full" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <div className="topTitle">
              {section === "home"
                ? "Accueil"
                : SECTIONS.find((s) => s.key === section)?.label ?? "Module"}
            </div>
            <div className="topSub">
              {section === "home"
                ? "Sélectionnez un module pour commencer."
                : "Écran en cours de construction — prochaine étape : CRUD Supabase."}
            </div>
          </div>

          {appLoading && <div className="pill">Sync…</div>}
        </header>

        {errorMsg && <div className="error wide">Erreur : {errorMsg}</div>}

        {section === "home" ? (
          <section className="tiles">
            {SECTIONS.map((s) => (
              <button key={s.key} className="tile" onClick={() => setSection(s.key)}>
                <div className="tileTop">
                  <div className="tileEmoji">{s.emoji}</div>
                  <div className="tileTitle">{s.label}</div>
                </div>
                <div className="tileDesc">{s.desc}</div>
                <div className="tileCta">Ouvrir →</div>
              </button>
            ))}
          </section>
        ) : (
          <section className="moduleCard">
            <h2 className="moduleTitle">
              {SECTIONS.find((s) => s.key === section)?.emoji}{" "}
              {SECTIONS.find((s) => s.key === section)?.label}
            </h2>
            <p className="moduleText">
              WIP. 
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
