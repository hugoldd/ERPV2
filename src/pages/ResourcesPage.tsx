import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { ResourcesTable } from "../components/ResourcesTable";
import { ResourcesCalendar } from "../components/ResourcesCalendar";
import { ManageConsultantModal } from "../components/modals/ManageConsultantModal";
import { Toast } from "../components/Toast";

import type { Consultant } from "../types";
import { fetchConsultants, createConsultant, updateConsultant, deleteConsultant } from "../api/consultants";
import { listCompetences } from "../api/refData";

export function ResourcesPage() {
  const [view, setView] = useState<"table" | "calendar">("table");

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [competences, setCompetences] = useState<{ id: string; name: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAddConsultant, setShowAddConsultant] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompetence, setFilterCompetence] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const competenceOptions = useMemo(() => competences.map((c) => c.name), [competences]);

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [c, comp] = await Promise.all([fetchConsultants(), listCompetences()]);
      setConsultants(c);
      setCompetences(comp);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const allCompetences = useMemo(
    () => Array.from(new Set(consultants.flatMap((c) => c.competences ?? []))).sort(),
    [consultants]
  );

  const allLocations = useMemo(
    () => Array.from(new Set(consultants.map((c) => c.location))).sort(),
    [consultants]
  );

  const filteredConsultants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return consultants.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        (c.email ?? "").toLowerCase().includes(term);

      const matchesCompetence = !filterCompetence || (c.competences ?? []).includes(filterCompetence);
      const matchesLocation = !filterLocation || c.location === filterLocation;

      return matchesSearch && matchesCompetence && matchesLocation;
    });
  }, [consultants, searchTerm, filterCompetence, filterLocation]);

  const handleCreate = async (payload: Omit<Consultant, "id">) => {
    try {
      await createConsultant(payload);
      await refresh();
      setToastMessage("Consultant ajouté");
      setShowToast(true);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors de la création.");
    }
  };

  const handleUpdate = async (payload: Omit<Consultant, "id">) => {
    if (!editingConsultant) return;
    try {
      await updateConsultant(editingConsultant.id, payload);
      await refresh();
      setEditingConsultant(undefined);
      setToastMessage("Consultant mis à jour");
      setShowToast(true);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors de la mise à jour.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce consultant ?")) return;
    try {
      await deleteConsultant(id);
      await refresh();
      setToastMessage("Consultant supprimé");
      setShowToast(true);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">Chargement…</div>
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un consultant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterCompetence}
              onChange={(e) => setFilterCompetence(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les compétences</option>
              {allCompetences.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les localisations</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                view === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Planning
            </button>
          </div>

          <button
            onClick={() => setShowAddConsultant(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un consultant</span>
          </button>
        </div>
      </div>

      {view === "table" ? (
        <ResourcesTable
          consultants={filteredConsultants}
          onEdit={(c) => setEditingConsultant(c)}
          onDelete={(id) => void handleDelete(id)}
        />
      ) : (
        <ResourcesCalendar consultants={filteredConsultants} />
      )}

      <ManageConsultantModal
        isOpen={showAddConsultant}
        onClose={() => setShowAddConsultant(false)}
        onSave={handleCreate}
        competenceOptions={competenceOptions}
      />

      {editingConsultant && (
        <ManageConsultantModal
          isOpen={!!editingConsultant}
          onClose={() => setEditingConsultant(undefined)}
          onSave={handleUpdate}
          consultant={editingConsultant}
          competenceOptions={competenceOptions}
        />
      )}

      {showToast && (
        <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
