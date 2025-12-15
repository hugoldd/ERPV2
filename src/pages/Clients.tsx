import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Modal } from "../components/Modal";

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

export function ClientsPage(props: { onError: (m: string | null) => void; setTopActions: (node: JSX.Element | null) => void }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<ClientListRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPostal, setNewPostal] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newContact, setNewContact] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTyping, setDeleteTyping] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    const query = q.trim().replace(/,/g, " ");
    setListLoading(true);
    props.onError(null);

    let req = supabase
      .from("clients")
      .select("id,client_no,name,postal_code,city,phone,contact_name,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (query.length > 0) {
      if (isDigits(query)) req = req.or(`name.ilike.%${query}%,client_no.eq.${query}`);
      else req = req.ilike("name", `%${query}%`);
    }

    const { data, error } = await req;
    if (error) props.onError(error.message);
    setRows((data ?? []) as ClientListRow[]);
    setListLoading(false);
  }

  useEffect(() => {
    const t = window.setTimeout(refresh, 200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setDetailLoading(true);
      props.onError(null);

      const { data, error } = await supabase
        .from("clients")
        .select("id,client_no,name,address_line,postal_code,city,phone,contact_name,created_at")
        .eq("id", selectedId)
        .single();

      if (!cancelled) {
        if (error) props.onError(error.message);
        setDetail((data ?? null) as ClientDetail | null);
        setDetailLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Topbar actions (injectées dans le shell)
  useEffect(() => {
    props.setTopActions(
      <div className="topActions">
        <button className="secondary" onClick={() => {
          props.onError(null);
          setCreateOpen(true);
          setNewName(""); setNewAddress(""); setNewPostal(""); setNewCity(""); setNewPhone(""); setNewContact("");
        }}>
          + Nouveau client
        </button>
        <button className="danger" disabled={!selectedId} onClick={() => {
          props.onError(null);
          setDeleteTyping("");
          setDeleteOpen(true);
        }}>
          Supprimer
        </button>
      </div>
    );

    return () => props.setTopActions(null);
  }, [selectedId]);

  async function createClient() {
    const name = newName.trim();
    if (!name) {
      props.onError("Le nom du client est obligatoire.");
      return;
    }

    setCreating(true);
    props.onError(null);

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name,
        address_line: newAddress.trim() || null,
        postal_code: newPostal.trim() || null,
        city: newCity.trim() || null,
        phone: newPhone.trim() || null,
        contact_name: newContact.trim() || null,
      })
      .select("id")
      .single();

    setCreating(false);

    if (error) {
      props.onError(error.message);
      return;
    }

    setCreateOpen(false);
    await refresh();
    if (data?.id) setSelectedId(data.id);
  }

  async function deleteClient() {
    if (!selectedId) return;

    if (deleteTyping.trim().toUpperCase() !== "SUPPRIMER") {
      props.onError("Veuillez saisir SUPPRIMER pour confirmer.");
      return;
    }

    setDeleting(true);
    props.onError(null);

    const { error } = await supabase.from("clients").delete().eq("id", selectedId);

    setDeleting(false);

    if (error) {
      props.onError(error.message);
      return;
    }

    setDeleteOpen(false);
    setSelectedId(null);
    setDetail(null);
    await refresh();
  }

  return (
    <>
      <section className="clientsGrid">
        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Clients</div>
              <div className="panelSub">Recherche par nom ou numéro</div>
            </div>
            {listLoading && <div className="pill">Chargement…</div>}
          </div>

          <input className="input" placeholder="Ex: Dupont ou 1024" value={q} onChange={(e) => setQ(e.target.value)} />

          <div className="list">
            {rows.map((c) => {
              const active = c.id === selectedId;
              return (
                <button key={c.id} className={`listItem ${active ? "listItemActive" : ""}`} onClick={() => setSelectedId(c.id)}>
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

            {!listLoading && rows.length === 0 && <div className="emptyState">Aucun client trouvé.</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Fiche client</div>
              <div className="panelSub">Informations principales</div>
            </div>
            {detailLoading && <div className="pill">Chargement…</div>}
          </div>

          {!selectedId ? (
            <div className="emptyState">Sélectionnez un client dans la liste.</div>
          ) : !detail ? (
            <div className="emptyState">Aucune donnée.</div>
          ) : (
            <div className="detailsGrid">
              <div className="kvKey">Numéro</div>
              <div className="kvVal">#{detail.client_no}</div>

              <div className="kvKey">Nom</div>
              <div className="kvVal">{detail.name}</div>

              <div className="kvKey">Adresse</div>
              <div className="kvVal">{detail.address_line || "—"}</div>

              <div className="kvKey">Code postal</div>
              <div className="kvVal">{detail.postal_code || "—"}</div>

              <div className="kvKey">Ville</div>
              <div className="kvVal">{detail.city || "—"}</div>

              <div className="kvKey">Téléphone</div>
              <div className="kvVal">{detail.phone || "—"}</div>

              <div className="kvKey">Contact</div>
              <div className="kvVal">{detail.contact_name || "—"}</div>

              <div className="kvKey">Créé le</div>
              <div className="kvVal">{formatDate(detail.created_at)}</div>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={createOpen}
        title="Nouveau client"
        subtitle="Création rapide"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button className="secondary" onClick={() => setCreateOpen(false)}>Annuler</button>
            <button onClick={createClient} disabled={creating}>{creating ? "Création…" : "Créer"}</button>
          </>
        }
      >
        <div className="formGrid">
          <div>
            <label className="label">Nom *</label>
            <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <label className="label">Contact</label>
            <input className="input" value={newContact} onChange={(e) => setNewContact(e.target.value)} />
          </div>

          <div className="span2">
            <label className="label">Adresse</label>
            <input className="input" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
          </div>

          <div>
            <label className="label">Code postal</label>
            <input className="input" value={newPostal} onChange={(e) => setNewPostal(e.target.value)} />
          </div>
          <div>
            <label className="label">Ville</label>
            <input className="input" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
          </div>

          <div className="span2">
            <label className="label">Téléphone</label>
            <input className="input" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Supprimer le client"
        subtitle="Action définitive"
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <button className="secondary" onClick={() => setDeleteOpen(false)}>Annuler</button>
            <button className="danger" onClick={deleteClient} disabled={deleting}>
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          </>
        }
      >
        <div className="dangerBox">
          Pour confirmer, saisissez <strong>SUPPRIMER</strong>.
        </div>
        <input className="input" placeholder="SUPPRIMER" value={deleteTyping} onChange={(e) => setDeleteTyping(e.target.value)} />
      </Modal>
    </>
  );
}

