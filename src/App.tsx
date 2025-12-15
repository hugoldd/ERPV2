import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Section =
  | "home"
  | "clients"
  | "catalogue"
  | "articles"
  | "consultants"
  | "planning"
  | "projects"
  | "settings";

const SECTIONS: { key: Exclude<Section, "home">; label: string; desc: string; emoji: string }[] = [
  { key: "clients", label: "Clients", desc: "Répertoire & fiches clients", emoji: "🏢" },
  { key: "catalogue", label: "Catalogue", desc: "Structure des offres & catégories", emoji: "🗂️" },
  { key: "articles", label: "Articles", desc: "Référentiel des articles & unités", emoji: "📦" },
  { key: "consultants", label: "Consultants", desc: "Ressources, compétences, disponibilité", emoji: "👥" },
  { key: "planning", label: "Planning", desc: "Calendrier, affectations, jalons", emoji: "🗓️" },
  { key: "projects", label: "Projets", desc: "Commandes → projets → prestations", emoji: "📁" },
  { key: "settings", label: "Paramètres", desc: "Organisation, droits, préférences", emoji: "⚙️" },
];

type ClientListRow = {
  id: string;
  client_no: number;
  name: string;
  postal_code: string | null;
  city: string | null;
  phone: string | null;
  contact_name: string | null;
  created_at: string;
};

type ClientDetail = ClientListRow & {
  address_line: string | null;
};

function isDigits(s: string) {
  return /^[0-9]+$/.test(s);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return iso;
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("home");

  // --- Clients module state ---
  const [clientQuery, setClientQuery] = useState("");
  const [clientRows, setClientRows] = useState<ClientListRow[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [clientDetailLoading, setClientDetailLoading] = useState(false);

  const userId = session?.user.id ?? null;

  const userLabel = useMemo(() => {
    if (!session) return "";
    return session.user.email ?? session.user.id;
  }, [session]);

  // --- Auth bootstrap ---
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

  // --- Clients: load list on entry + search ---
  useEffect(() => {
    if (section !== "clients") return;

    let cancelled = false;
    const q = clientQuery.trim().replace(/,/g, " "); // évite de casser .or()

    async function loadClients() {
      setClientsLoading(true);
      setErrorMsg(null);

      let query = supabase
        .from("clients")
        .select("id,client_no,name,postal_code,city,phone,contact_name,created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (q.length > 0) {
        if (isDigits(q)) {
          query = query.or(`name.ilike.%${q}%,client_no.eq.${q}`);
        } else {
          query = query.ilike("name", `%${q}%`);
        }
      }

      const { data, error } = await query;
      if (!cancelled) {
        if (error) setErrorMsg(error.message);
        setClientRows((data ?? []) as ClientListRow[]);
        setClientsLoading(false);
      }
    }

    // petit debounce
    const t = window.setTimeout(loadClients, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [section, clientQuery]);

  // --- Clients: load detail when selected ---
  useEffect(() => {
    if (section !== "clients") return;

    if (!selectedClientId) {
      setClientDetail(null);
      return;
    }

    let cancelled = false;

    async function loadClientDetail(id: string) {
      setClientDetailLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("clients")
        .select("id,client_no,name,address_line,postal_code,city,phone,contact_name,created_at")
        .eq("id", id)
        .single();

      if (!cancelled) {
        if (error) setErrorMsg(error.message);
        setClientDetail((data ?? null) as ClientDetail | null);
        setClientDetailLoading(false);
      }
    }

    loadClientDetail(selectedClientId);

    return () => {
      cancelled = true;
    };
  }, [section, selectedClientId]);

  const login = async () => {
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

  if (!session) {
    return (
      <main className="page">
        <div className="card">
          <h1>Portail ERP</h1>
          <p>Connexion e-mail / mot de passe (Supabase).</p>

          {errorMsg && <div className="error">Erreur : {errorMsg}</div>}

          <label className="label">E-mail</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="row">
            <button onClick={login}>Se connecter</button>
          </div>
        </div>
      </main>
    );
  }

  const sectionLabel = section === "home"
    ? "Accueil"
    : SECTIONS.find((s) => s.key === section)?.label ?? "Module";

  const sectionDesc = section === "home"
    ? "Sélectionnez un module pour commencer."
    : section === "clients"
      ? "Recherche, liste et fiche client (Supabase)."
      : "Écran en cours de construction.";

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandTitle">ERP</div>
          <div className="brandSub">Gestion de projet</div>
        </div>

        <nav className="nav">
          <button className={`navItem ${section === "home" ? "navItemActive" : ""}`} onClick={() => setSection("home")}>
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
          <button className="secondary full" onClick={logout}>Se déconnecter</button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <div className="topTitle">{sectionLabel}</div>
            <div className="topSub">{sectionDesc}</div>
          </div>
        </header>

        {errorMsg && <div className="error">Erreur : {errorMsg}</div>}

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
        ) : section === "clients" ? (
          <section className="clientsGrid">
            {/* Panel liste */}
            <div className="panel">
              <div className="panelHeader">
                <div>
                  <div className="panelTitle">Clients</div>
                  <div className="panelSub">Recherche par nom ou numéro</div>
                </div>
                {clientsLoading && <div className="pill">Chargement…</div>}
              </div>

              <input
                className="input"
                placeholder="Ex: Dupont ou 1024"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
              />

              <div className="list">
                {clientRows.map((c) => {
                  const active = c.id === selectedClientId;
                  return (
                    <button
                      key={c.id}
                      className={`listItem ${active ? "listItemActive" : ""}`}
                      onClick={() => setSelectedClientId(c.id)}
                    >
                      <div className="listTop">
                        <div className="listTitle">{c.name}</div>
                        <div className="pill">#{c.client_no}</div>
                      </div>
                      <div className="listMeta">
                        <span>{[c.postal_code, c.city].filter(Boolean).join(" ") || "—"}</span>
                        <span>•</span>
                        <span>{c.contact_name || "—"}</span>
                      </div>
                    </button>
                  );
                })}

                {!clientsLoading && clientRows.length === 0 && (
                  <div className="emptyState">
                    Aucun client trouvé.
                  </div>
                )}
              </div>
            </div>

            {/* Panel fiche */}
            <div className="panel">
              <div className="panelHeader">
                <div>
                  <div className="panelTitle">Fiche client</div>
                  <div className="panelSub">Informations principales</div>
                </div>
                {clientDetailLoading && <div className="pill">Chargement…</div>}
              </div>

              {!selectedClientId ? (
                <div className="emptyState">
                  Sélectionnez un client dans la liste.
                </div>
              ) : !clientDetail ? (
                <div className="emptyState">Aucune donnée.</div>
              ) : (
                <div className="detailsGrid">
                  <div className="kvKey">Numéro</div>
                  <div className="kvVal">#{clientDetail.client_no}</div>

                  <div className="kvKey">Nom</div>
                  <div className="kvVal">{clientDetail.name}</div>

                  <div className="kvKey">Adresse</div>
                  <div className="kvVal">{clientDetail.address_line || "—"}</div>

                  <div className="kvKey">Code postal</div>
                  <div className="kvVal">{clientDetail.postal_code || "—"}</div>

                  <div className="kvKey">Ville</div>
                  <div className="kvVal">{clientDetail.city || "—"}</div>

                  <div className="kvKey">Téléphone</div>
                  <div className="kvVal">{clientDetail.phone || "—"}</div>

                  <div className="kvKey">Contact</div>
                  <div className="kvVal">{clientDetail.contact_name || "—"}</div>

                  <div className="kvKey">Créé le</div>
                  <div className="kvVal">{formatDate(clientDetail.created_at)}</div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="moduleCard">
            <h2 className="moduleTitle">{sectionLabel}</h2>
            <p className="moduleText">WIP. Prochaine étape : CRUD Supabase.</p>
          </section>
        )}
      </main>
    </div>
  );
}
