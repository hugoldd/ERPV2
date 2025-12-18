import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Toast } from "../components/Toast";
import { ManageCompetenceModal } from "../components/modals/ManageCompetenceModal";

import type { Competence } from "../types";
import {
  createCompetence,
  deleteCompetence,
  fetchCompetences,
  updateCompetence,
} from "../api/competences";

export function CompetencesPage() {
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Competence | undefined>();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const c = await fetchCompetences();
      setCompetences(c);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors du chargement des compétences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return competences;
    return competences.filter((c) => c.name.toLowerCase().includes(term));
  }, [competences, searchTerm]);

  const handleAdd = async (payload: { name: string }) => {
    await createCompetence(payload.name);
    await refresh();
    setToastMessage("Compétence ajoutée");
    setShowToast(true);
  };

  const handleEdit = async (payload: { name: string }) => {
    if (!editing) return;
    await updateCompetence(editing.id, payload.name);
    await refresh();
    setToastMessage("Compétence mise à jour");
    setShowToast(true);
    setEditing(undefined);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Supprimer cette compétence ? Elle sera aussi retirée des articles et consultants qui l'utilisent."
      )
    ) {
      return;
    }
    await deleteCompetence(id);
    await refresh();
    setToastMessage("Compétence supprimée");
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
            onClick={() => void refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header (même logique que Ressources) */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une compétence</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Compétence</th>
                <th className="px-6 py-3 text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{c.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(c)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="py-12 text-center text-gray-500">
            Aucune compétence trouvée
          </div>
        )}
      </div>

      {/* Create */}
      <ManageCompetenceModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} />

      {/* Edit */}
      {editing && (
        <ManageCompetenceModal
          isOpen={!!editing}
          onClose={() => setEditing(undefined)}
          onSave={handleEdit}
          competence={editing}
        />
      )}

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
}
