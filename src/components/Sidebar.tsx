import { SECTIONS, type Section } from "../types/app";

export function Sidebar(props: {
  section: Section;
  onNavigate: (s: Section) => void;
  userLabel: string;
  onLogout: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandTitle">ERP</div>
        <div className="brandSub">Gestion de projet</div>
      </div>

      <nav className="nav">
        <button
          className={`navItem ${props.section === "home" ? "navItemActive" : ""}`}
          onClick={() => props.onNavigate("home")}
        >
          🏠 Accueil
        </button>

        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={`navItem ${props.section === s.key ? "navItemActive" : ""}`}
            onClick={() => props.onNavigate(s.key)}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </nav>

      <div className="sidebarFooter">
        <div className="pill">{props.userLabel}</div>
        <button className="secondary full" onClick={props.onLogout}>Se déconnecter</button>
      </div>
    </aside>
  );
}

