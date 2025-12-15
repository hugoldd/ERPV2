import { SECTIONS, type Section } from "../types/app";

export function HomePage(props: { onOpen: (s: Section) => void }) {
  return (
    <section className="tiles">
      {SECTIONS.map((s) => (
        <button key={s.key} className="tile" onClick={() => props.onOpen(s.key)}>
          <div className="tileTop">
            <div className="tileEmoji">{s.emoji}</div>
            <div className="tileTitle">{s.label}</div>
          </div>
          <div className="tileDesc">{s.desc}</div>
          <div className="tileCta">Ouvrir →</div>
        </button>
      ))}
    </section>
  );
}

