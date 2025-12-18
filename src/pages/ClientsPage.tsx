import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Toast } from "../components/Toast";
import { ManageClientModal } from "../components/modals/ManageClientModal";
import type { Client } from "../types";
import { createClient, deleteClient, fetchClients, updateClient } from "../api/clients";
import type { ClientUpsertInput } from "../api/clients";

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const tiers = useMemo(() => ["Tier 1", "Tier 2", "Tier 3"], []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return clients.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        (c.clientNumber ?? "").toLowerCase().includes(term) ||
        (c.phone ?? "").toLowerCase().includes(term);

      const matchesTier = !filterTier || c.tier === filterTier;
      return matchesSearch && matchesTier;
    });
  }, [clients, searchTerm, filterTier]);

  // ✅ Important : payload sans clientNumber (généré en DB et non modifiable)
  const handleCreate = async (payload: ClientUpsertInput) => {
    await createClient(payload);
    await refresh();
    setToastMessage("Client ajouté");
    setShowToast(true);
  };

  const handleUpdate = async (payload: ClientUpsertInput) => {
    if (!editing) return;
    await updateClient(editing.id, payload);
    await refresh();
    setEditing(undefined);
    setToastMessage("Client mis à jour");
    setShowToast(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce client ?")) return;
    await deleteClient(id);
    await refresh();
    setToastMessage("Client supprimé");
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
          Chargement…
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-red-600 mb-3">{errorMsg}</div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const tierBadge = (tier: Client["tier"]) => {
    const map: Record<Client["tier"], string> = {
      "Tier 1": "bg-green-100 text-green-700",
      "Tier 2": "bg-blue-100 text-blue-700",
      "Tier 3": "bg-gray-100 text-gray-700",
    };
    return map[tier];
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les tiers</option>
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un client</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">N° client</th>
                <th className="px-6 py-3 text-left text-gray-700">Nom</th>
                <th className="px-6 py-3 text-left text-gray-700">Tier</th>
                <th className="px-6 py-3 text-left text-gray-700">Téléphone</th>
                <th className="px-6 py-3 text-left text-gray-700">Adresse</th>
                <th className="px-6 py-3 text-left text-gray-700">Contacts</th>
                <th className="px-6 py-3 text-right text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{c.clientNumber}</td>
                  <td className="px-6 py-4 text-gray-900">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${tierBadge(c.tier)}`}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{c.phone || "—"}</td>
                  <td className="px-6 py-4 text-gray-700">{c.address || "—"}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {c.contacts?.length ? (
                      <span>
                        {c.contacts.length} contact{c.contacts.length > 1 ? "s" : ""}{" "}
                        <span className="text-gray-400">
                          • {c.contacts[0].name}
                          {c.contacts.length > 1 ? "…" : ""}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">Aucun client trouvé</div>
        )}
      </div>

      <ManageClientModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleCreate}
      />

      {editing && (
        <ManageClientModal
          isOpen={!!editing}
          onClose={() => setEditing(undefined)}
          onSave={handleUpdate}
          client={editing}
        />
      )}

      {showToast && (
        <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
