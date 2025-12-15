import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setErrorMsg(null);
      setMessage(null);

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

  const login = async () => {
    setErrorMsg(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setErrorMsg(error.message);
  };

  const logout = async () => {
    setErrorMsg(null);
    setMessage(null);

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
          <h1>Meilleur logiciel de gestion de projet pour la meilleure équipe de DP certifiées en plus :)</h1>

          {errorMsg && <div className="error">Erreur : {errorMsg}</div>}
          {message && <div className="info">{message}</div>}

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

  // --- Écran WIP ---
  return (
    <main className="page">
      <div className="card">
        <div className="row">
          <h1>WIP</h1>
          <button className="secondary" onClick={logout}>
            Se déconnecter
          </button>
        </div>

        <p>
          Connecté : <strong>{session.user.email ?? session.user.id}</strong>
        </p>

        {errorMsg && <div className="error">Erreur : {errorMsg}</div>}
        {message && <div className="info">{message}</div>}

        <div className="wip">Zone de travail en cours.</div>
      </div>
    </main>
  );
}
