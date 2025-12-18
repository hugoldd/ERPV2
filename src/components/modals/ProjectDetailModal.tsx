import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2, SplitSquareVertical, Mail, Phone, MapPin, Users } from "lucide-react";
import { Modal } from "./Modal";
import type { Article, Consultant, Project, ProjectLine, Client } from "../../types";
import {
  createProjectLine,
  deleteProjectLine,
  fetchProjectLines,
  reportProjectLineRemainder,
  updateProjectLine,
  type ProjectLineUpsertInput,
} from "../../api/projects";
import { fetchClientWithContacts } from "../../api/clients";
import { Toast } from "../Toast";
import { ManageProjectLineModal } from "./ManageProjectLineModal";

type MinimalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FullProps = MinimalProps & {
  project: Project;
  articles: Article[];
  consultants: Consultant[];
};

type Props = MinimalProps | FullProps;
function formatMoneyEUR(n: number): string {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n || 0);
  } catch {
    return `${(n || 0).toFixed(2)} €`;
  }
}

function statusLabel(status: Project["status"]): string {
  const map: Record<Project["status"], string> = {
    devis_en_cours: "Devis en cours",
    commande_receptionnee: "Commande réceptionnée",
    attente_affectation_dp: "En attente d'affectation de DP",
    en_cours_deploiement: "En cours de déploiement",
    facture: "Facturé",
    paye: "Payé",
    termine: "Terminé",
  };
  return map[status] ?? status;
}

function statusBadge(status: Project["status"]): string {
  const map: Record<Project["status"], string> = {
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

export function ProjectDetailModal(props: Props) {
  if (!("project" in props)) {
    return (
      <Modal isOpen={props.isOpen} onClose={props.onClose} title="Détails du projet" size="xl">
        <div className="p-6">
          <div className="text-gray-900 font-medium">Cette vue a été remplacée par le module Projets.</div>
          <div className="mt-2 text-gray-600">
            Ouvrez un projet depuis la section Projets pour afficher la fiche complète (articles, planification, reliquats).
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={props.onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const { isOpen, onClose, project, articles, consultants } = props;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lines, setLines] = useState<ProjectLine[]>([]);

  const [showAddLine, setShowAddLine] = useState(false);
  const [editingLine, setEditingLine] = useState<ProjectLine | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Client + interlocuteurs (depuis Supabase)
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const projectClientId =
    (project as any).clientId ??
    (project as any).client_id ??
    (project as any).clientID ??
    null;

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchProjectLines(project.id);
      setLines(data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  const refreshClient = async () => {
    if (!projectClientId) {
      setClient(null);
      return;
    }
    setClientLoading(true);
    setClientError(null);
    try {
      const c = await fetchClientWithContacts(projectClientId);
      setClient(c);
    } catch (e: any) {
      setClientError(e?.message ?? "Impossible de charger les informations client.");
      setClient(null);
    } finally {
      setClientLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void refresh();
    void refreshClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project.id, projectClientId]);

  const totals = useMemo(() => {
    const amount = lines.reduce((s, l) => s + (l.amount || 0), 0);
    const sold = lines.reduce((s, l) => s + (l.soldQuantity || 0), 0);
    const planned = lines.reduce((s, l) => s + (l.plannedQuantity || 0), 0);
    const realized = lines.reduce((s, l) => s + (l.realizedQuantity || 0), 0);
    return {
      amount,
      sold,
      planned,
      realized,
      remaining: Math.max(0, sold - planned),
    };
  }, [lines]);

  const handleCreateLine = async (payload: ProjectLineUpsertInput) => {
    await createProjectLine(project.id, payload);
    await refresh();
    setToastMessage("Ligne ajoutée");
    setShowToast(true);
  };

  const handleUpdateLine = async (payload: ProjectLineUpsertInput) => {
    if (!editingLine) return;
    await updateProjectLine(editingLine.id, payload);
    await refresh();
    setEditingLine(undefined);
    setToastMessage("Ligne mise à jour");
    setShowToast(true);
  };

  const handleDeleteLine = async (id: string) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    await deleteProjectLine(id);
    await refresh();
    setToastMessage("Ligne supprimée");
    setShowToast(true);
  };

  const handleReport = async (line: ProjectLine) => {
    if (!confirm("Créer une nouvelle ligne avec le reliquat non planifié ?")) return;
    await reportProjectLineRemainder(line.id);
    await refresh();
    setToastMessage("Reliquat reporté");
    setShowToast(true);
  };

  const clientTitleNumber = client?.clientNumber ?? (project as any).clientNumber ?? "";
  const clientTitleName = client?.name ?? (project as any).clientName ?? "";

  const clientAddress = client?.address ?? (project as any).clientAddress ?? "";
  const clientPhone = client?.phone ?? "";
  const clientTier = (client as any)?.tier ?? (project as any).clientTier ?? null;

  const clientContacts = client?.contacts ?? [];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Zone principale : lignes (prioritaire) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-gray-900 font-medium">Articles du projet</div>
                  <div className="text-gray-500 text-sm">Planification, réalisation et reliquats (scission).</div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    Total&nbsp;{formatMoneyEUR(totals.amount)}
                  </span>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700">
                    Reste&nbsp;{totals.remaining}
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowAddLine(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-6 text-gray-600">Chargement…</div>
              ) : errorMsg ? (
                <div className="p-6 text-red-700 bg-red-50 border-t border-red-200">{errorMsg}</div>
              ) : (
                <div className="max-h-[60vh] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700">Article</th>
                        <th className="px-4 py-3 text-left text-gray-700">Affectation</th>
                        <th className="px-4 py-3 text-left text-gray-700">Quantités</th>
                        <th className="px-4 py-3 text-right text-gray-700">Montant</th>
                        <th className="px-4 py-3 text-right text-gray-700">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {lines.map((l) => {
                        const sold = l.soldQuantity || 0;
                        const planned = l.plannedQuantity || 0;
                        const realized = l.realizedQuantity || 0;
                        const remaining = Math.max(0, sold - planned);
                        const pct = sold > 0 ? Math.min(100, Math.round((planned / sold) * 100)) : 0;

                        const canReport = planned > 0 && remaining > 0;

                        return (
                          <tr key={l.id} className="hover:bg-gray-50 transition-colors align-top">
                            {/* Article */}
                            <td className="px-4 py-3">
                              <div className="text-gray-900 font-medium">{l.articleName}</div>
                              {l.articleService ? (
                                <div className="mt-1 text-xs text-gray-500">{l.articleService}</div>
                              ) : null}
                            </td>

                            {/* Affectation */}
                            <td className="px-4 py-3">
                              <div className="text-gray-900">{l.consultantName || "Non attribuée"}</div>
                              <div className="mt-1 text-xs text-gray-500">
                                {l.plannedStartDate ? (
                                  <span>
                                    {l.plannedStartDate}
                                    {l.plannedEndDate && l.plannedEndDate !== l.plannedStartDate
                                      ? ` → ${l.plannedEndDate}`
                                      : ""}
                                  </span>
                                ) : (
                                  "Dates non définies"
                                )}
                              </div>
                            </td>

                            {/* Quantités (chips + barre) */}
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">Vendu {sold}</span>
                                <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700">
                                  Planifié {planned}
                                </span>
                                <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">
                                  Réalisé {realized}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full ${
                                    remaining > 0 ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  Reste {remaining}
                                </span>
                              </div>

                              <div className="mt-2">
                                <div className="h-1.5 bg-gray-100 rounded">
                                  <div className="h-1.5 bg-orange-500 rounded" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="mt-1 text-xs text-gray-500">{pct}% planifié</div>
                              </div>
                            </td>

                            {/* Montant */}
                            <td className="px-4 py-3 text-right text-gray-900 whitespace-nowrap">
                              {formatMoneyEUR(l.amount)}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {canReport && (
                                  <button
                                    type="button"
                                    onClick={() => void handleReport(l)}
                                    className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                                    title="Scinder (reporter le reliquat)"
                                  >
                                    <SplitSquareVertical className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setEditingLine(l)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void handleDeleteLine(l.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {lines.length === 0 && (
                    <div className="py-10 text-center text-gray-500">Aucune ligne pour ce projet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panneau latéral : infos projet/client (compact, secondaire) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-500">Client</div>
                  <div className="text-gray-900 font-medium">
                    {(clientTitleNumber || "—") + (clientTitleName ? ` — ${clientTitleName}` : "")}
                  </div>
                  {clientTier != null && clientTier !== "" ? (
                    <div className="mt-1 inline-flex px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700">
                      Tier {clientTier}
                    </div>
                  ) : null}
                </div>

                <div className={`inline-flex px-3 py-1 rounded-full text-xs ${statusBadge(project.status)}`}>
                  {statusLabel(project.status)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Commercial</div>
                  <div className="text-gray-900">{(project as any).commercialName || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Directeur de projet</div>
                  <div className="text-gray-900">{(project as any).projectManagerName || "Non affecté"}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Date commande</div>
                    <div className="text-gray-900">{(project as any).orderDate || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Type de vente</div>
                    <div className="text-gray-900">{(project as any).salesType || "—"}</div>
                  </div>
                </div>

                {/* Coordonnées client (depuis fiche client / Supabase) */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    Coordonnées client
                  </div>

                  {clientLoading ? (
                    <div className="text-sm text-gray-600">Chargement des coordonnées…</div>
                  ) : clientError ? (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                      {clientError}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-900">{clientAddress || "—"}</div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{clientPhone || "—"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interlocuteurs multiples */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Users className="w-4 h-4" />
                    Interlocuteurs
                  </div>

                  {clientLoading ? (
                    <div className="text-sm text-gray-600">Chargement…</div>
                  ) : clientContacts.length === 0 ? (
                    <div className="text-sm text-gray-600">Aucun interlocuteur</div>
                  ) : (
                    <div className="space-y-2">
                      {clientContacts.map((c) => (
                        <div key={c.id} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-gray-900 font-medium">{c.name}</div>
                            {c.role ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{c.role}</span>
                            ) : null}
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{c.email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{c.phone || "—"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ManageProjectLineModal
        isOpen={showAddLine}
        onClose={() => setShowAddLine(false)}
        onSave={handleCreateLine}
        articles={articles}
        consultants={consultants}
      />

      {editingLine && (
        <ManageProjectLineModal
          isOpen={!!editingLine}
          onClose={() => setEditingLine(undefined)}
          onSave={handleUpdateLine}
          articles={articles}
          consultants={consultants}
          line={editingLine}
        />
      )}

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
}
