import type React from "react";

export function Topbar(props: { title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div>
        <div className="topTitle">{props.title}</div>
        <div className="topSub">{props.subtitle}</div>
      </div>
      {props.actions ? <div className="topActions">{props.actions}</div> : null}
    </header>
  );
}
