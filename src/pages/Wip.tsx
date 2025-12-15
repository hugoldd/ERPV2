export function WipPage(props: { title: string }) {
  return (
    <section className="moduleCard">
      <h2 className="moduleTitle">{props.title}</h2>
      <p className="moduleText">WIP. Prochaine étape : CRUD Supabase.</p>
    </section>
  );
}

