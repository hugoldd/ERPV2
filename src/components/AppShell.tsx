import type React from "react";
import type { Section } from "../types/app";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell(props: {
  section: Section;
  onNavigate: (s: Section) => void;
  userLabel: string;
  onLogout: () => void;

  title: string;
  subtitle: string;
  topActions?: React.ReactNode;

  children: React.ReactNode;
  errorMsg?: string | null;
}) {
  return (
    <div className="appShell">
      <Sidebar
        section={props.section}
        onNavigate={props.onNavigate}
        userLabel={props.userLabel}
        onLogout={props.onLogout}
      />

      <main className="content">
        <Topbar title={props.title} subtitle={props.subtitle} actions={props.topActions} />
        {props.errorMsg && <div className="error">Erreur : {props.errorMsg}</div>}
        {props.children}
      </main>
    </div>
  );
}
