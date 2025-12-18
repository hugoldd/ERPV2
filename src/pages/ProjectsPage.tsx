import { useEffect, useMemo, useState } from "react";
import { Edit, Eye, Filter, Plus, Search, Trash2 } from "lucide-react";
import { Toast } from "../components/Toast";
import { ManageProjectModal } from "../components/modals/ManageProjectModal";
import type { Article, Consultant, Project, ProjectStatus } from "../types";
import { deleteProject, fetchProjects } from "../api/projects";
import { fetchArticles } from "../api/articles";
import { fetchConsultants } from "../api/consultants";
import { ProjectDetailModal } from "../components/modals/ProjectDetailModal";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  devis_en_cours: "Devis en cours",
  commande_receptionnee: "Commande réceptionnée",
  attente_affectation_dp: "En attente d'affectation de DP",
  en_cours_deploiement: "En cours de déploiement",
  facture: "Facturé",
  paye: "Payé",
  termine: "Terminé",
};

function statusBadge(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    devis_en_cours: "bg-gray-100 text-gray-700",
    commande_receptionnee: "bg-blue-50 text-blue-700",
    attente_affectation_dp: "bg-amber-50 text-amber-700",
    en_cours_deploiement: "bg-indigo-50 text-indigo-700",
    facture: "bg-purple-50 text-purple-700",
    paye: "bg-green-50 text-green-700",
    termine: "bg-green-100 text-green-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "">("");

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>(undefined);
  const [viewing, setViewing] = useState<Project | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [p, a, c] = await Promise.all([fetchProjects(), fetchArticles(), fetchConsultants()]);
      setProjects(p);
      setArticles(a);
      setConsultants(c);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term) ||
        (p.clientNumber ?? "").toLowerCase().includes(term) ||
        (p.projectManagerName ?? "").toLowerCase().includes(term) ||
        (p.commercialName ?? "").toLowerCase().includes(term);
      const matchesStatus = !filterStatus || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    await deleteProject(id);
    await refresh();
    setToastMessage("Projet supprimé");
    setShowToast(true);
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet, client, commercial…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau projet</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Projet</th>
                <th className="px-6 py-3 text-left text-gray-700">Client</th>
                <th className="px-6 py-3 text-left text-gray-700">Commercial</th>
                <th className="px-6 py-3 text-left text-gray-700">DP</th>
                <th className="px-6 py-3 text-left text-gray-700">Commande</th>
                <th className="px-6 py-3 text-left text-gray-700">État</th>
                <th className="px-6 py-3 text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="text-gray-900">{p.clientNumber}</div>
                    <div className="text-sm text-gray-500">{p.clientName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{p.commercialName || "—"}</td>
                  <td className="px-6 py-4 text-gray-700">{p.projectManagerName || "Non affecté"}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div>{p.orderDate || "—"}</div>
                    <div className="text-sm text-gray-500">{p.salesType || "—"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${statusBadge(p.status)}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewing(p)}
                        className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="Ouvrir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(p.id)}
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

        {filtered.length === 0 && <div className="py-12 text-center text-gray-500">Aucun projet trouvé</div>}
      </div>

      <ManageProjectModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={async () => {
          await refresh();
          setToastMessage("Projet créé");
          setShowToast(true);
        }}
      />

      {editing && (
        <ManageProjectModal
          isOpen={!!editing}
          onClose={() => setEditing(undefined)}
          project={editing}
          onSaved={async () => {
            await refresh();
            setToastMessage("Projet mis à jour");
            setShowToast(true);
          }}
        />
      )}

      {viewing && (
        <ProjectDetailModal
          isOpen={!!viewing}
          onClose={() => setViewing(undefined)}
          project={viewing}
          articles={articles}
          consultants={consultants}
        />
      )}

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
}
