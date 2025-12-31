import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  AlertTriangle,
  Wrench,
  Settings2,
} from "lucide-react";
import { Modal } from "./Modal";
import type { Article, Consultant, Project, ProjectLine, Client, PlanningItem } from "../../types";
import {
  createProjectLine,
  deleteProjectLine,
  fetchProjectLines,
  reportProjectLineRemainder,
  updateProjectLine,
  type ProjectLineUpsertInput,
} from "../../api/projects";
import { fetchClientWithContacts } from "../../api/clients";
import { fetchPlanningItems } from "../../api/planning";
import { Toast } from "../Toast";
import { ManageProjectLineModal } from "./ManageProjectLineModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  articles: Article[];
  consultants: Consultant[];
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}
function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfMonth(d: Date): Date {
  const x = startOfMonth(d);
  x.setMonth(x.getMonth() + 1);
  x.setDate(0);
  x.setHours(0, 0, 0, 0);
  return x;
}
function overlapsDateRange(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return !(aEnd < bStart || aStart > bEnd);
}
function listIsoDaysInclusive(startIso: string, endIso: string): string[] {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const out: string[] = [];
  const cur = new Date(s);
  while (cur <= e) {
    out.push(isoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
function dayKeyFromDate(d: Date): "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" {
  const n = d.getDay();
  const map: any = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };
  return map[n];
}

function formatDateFR(iso?: string | null): string {
  if (!iso) return "—";
  // ISO attendu YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return iso;
}

function formatInterventionDatesFR(start?: string | null, end?: string | null): string {
  if (!start) return "—";
  if (!end || end === start) return formatDateFR(start);
  return `${formatDateFR(start)} → ${formatDateFR(end)}`;
}

function isCompetent(consultant: Consultant, required: string[]): boolean {
  if (!required.length) return true;
  const have = new Set((consultant.competences ?? []).filter(Boolean));
  return required.every((r) => have.has(r));
}

function shortBookingLabel(title: string): string {
  try {
    const afterDot = title.includes("•") ? title.split("•")[1].trim() : title;
    const parts = afterDot.split("—").map((s) => s.trim()).filter(Boolean);
    const client = parts.length ? parts[0] : afterDot;
    const prestation = parts.length ? parts[parts.length - 1] : "";
    const res = prestation ? `${client} — ${prestation}` : client;
    return res.length > 26 ? res.slice(0, 26).trim() + "…" : res;
  } catch {
    return title.length > 26 ? title.slice(0, 26).trim() + "…" : title;
  }
}

type LinePlanningStatus = "nouvelle" | "en_cours" | "planifiee";
function statusFromGroup(soldTotal: number, plannedTotal: number): { key: LinePlanningStatus; label: string; badge: string } {
  const remaining = Math.max(0, soldTotal - plannedTotal);
  if (plannedTotal <= 0) return { key: "nouvelle", label: "Nouvelle", badge: "bg-gray-100 text-gray-700" };
  if (remaining > 0) return { key: "en_cours", label: "En cours de planification", badge: "bg-amber-50 text-amber-700" };
  return { key: "planifiee", label: "Planifiée", badge: "bg-green-50 text-green-700" };
}

type ColumnKey = "status" | "affectation" | "date" | "vendu" | "reste" | "planifie" | "realise" | "actions";
const COL_STORAGE_KEY = "erpv3.projectDetail.columns.v1";

const DEFAULT_COLS: Record<ColumnKey, boolean> = {
  status: true,
  affectation: true,
  date: true,
  vendu: true,
  reste: true,
  planifie: true,
  realise: true,
  actions: true,
};

function readCols(): Record<ColumnKey, boolean> {
  try {
    const raw = localStorage.getItem(COL_STORAGE_KEY);
    if (!raw) return DEFAULT_COLS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COLS, ...(parsed ?? {}) };
  } catch {
    return DEFAULT_COLS;
  }
}

function writeCols(v: Record<ColumnKey, boolean>) {
  try {
    localStorage.setItem(COL_STORAGE_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

export function ProjectDetailModal({ isOpen, onClose, project, articles, consultants }: Props) {
  const visible = isOpen && !!project;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lines, setLines] = useState<ProjectLine[]>([]);

  const [showAddLine, setShowAddLine] = useState(false);
  const [editingLine, setEditingLine] = useState<ProjectLine | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Client + interlocuteurs
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  // État des groupes (chapeaux) : replié par défaut
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Planification
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);
  const [monthCursor, setMonthCursor] = useState<Date>(() => startOfMonth(new Date()));
  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [planningItems, setPlanningItems] = useState<PlanningItem[]>([]);

  const [planConsultantId, setPlanConsultantId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [planSaving, setPlanSaving] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Colonnes (afficher/masquer) avec mémorisation
  const [cols, setCols] = useState<Record<ColumnKey, boolean>>(() => readCols());

  // IMPORTANT : au chargement/à l’ouverture du projet -> tout replié
  useEffect(() => {
    if (!visible) return;
    setOpenGroups({});
    setExpandedLineId(null);
    setPlanConsultantId("");
    setSelectedDays([]);
    setPlanError(null);
  }, [visible, project?.id]);

  useEffect(() => {
    writeCols(cols);
  }, [cols]);

  const projectClientId =
    (project as any)?.clientId ??
    (project as any)?.client_id ??
    (project as any)?.clientID ??
    null;

  const refresh = async () => {
    if (!project?.id) return;
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
    if (!projectClientId) return;
    setClientLoading(true);
    setClientError(null);
    try {
      const c = await fetchClientWithContacts(String(projectClientId));
      setClient(c);
    } catch (e: any) {
      setClientError(e?.message ?? "Erreur lors du chargement du client.");
    } finally {
      setClientLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    void refresh();
    void refreshClient();
  }, [visible, project?.id]);

  // Grouping (chapeau + sous-lignes)
  type Group = {
    gid: string;
    header: ProjectLine | null;
    allocations: ProjectLine[];
    remainder: ProjectLine | null;
    soldTotal: number;
    plannedTotal: number;
    realizedTotal: number;
    remaining: number;
  };

  const groups = useMemo<Group[]>(() => {
    const byGid = new Map<string, ProjectLine[]>();

    for (const l of lines) {
      const gid =
        String((l as any).groupId ?? (l as any).group_id ?? l.id);

      const arr = byGid.get(gid) ?? [];
      arr.push(l);
      byGid.set(gid, arr);
    }

    const result: Group[] = [];

    for (const [gid, arr] of byGid.entries()) {
      const soldTotal =
        Number((arr[0] as any).soldTotal ?? (arr[0] as any).sold_total ?? arr[0].soldQuantity ?? 0) ||
        Math.max(...arr.map((x: any) => Number(x.soldQuantity ?? 0)));

      const lineQtyOf = (x: any) => Number(x.lineQuantity ?? x.line_quantity ?? 0);

      const isHeader = (x: any) =>
        lineQtyOf(x) >= soldTotal &&
        !x.consultantId &&
        !x.plannedStartDate &&
        !x.plannedEndDate;

      const isRemainder = (x: any) =>
        !x.consultantId &&
        !x.plannedStartDate &&
        !x.plannedEndDate &&
        Number(x.plannedQuantity ?? 0) === 0 &&
        lineQtyOf(x) > 0 &&
        lineQtyOf(x) < soldTotal;

      const header = arr.find(isHeader) ?? null;
      const remainder = arr.find(isRemainder) ?? null;

      const allocations = arr
        .filter((x: any) => x.id !== header?.id)
        .filter((x: any) => x.id !== remainder?.id)
        .filter((x: any) => Number(x.plannedQuantity ?? 0) > 0 || !!x.consultantId || !!x.plannedStartDate || !!x.plannedEndDate);

      const plannedTotal = allocations.reduce((s, x: any) => s + Number(x.plannedQuantity ?? 0), 0);
      const realizedTotal = allocations.reduce((s, x: any) => s + Number(x.realizedQuantity ?? 0), 0);
      const remaining = Math.max(0, soldTotal - plannedTotal);

      result.push({
        gid,
        header,
        remainder,
        allocations,
        soldTotal,
        plannedTotal,
        realizedTotal,
        remaining,
      });
    }

    // ordre stable : par nom d’article du header si possible
    result.sort((a, b) => {
      const an = a.header?.articleName ?? a.allocations[0]?.articleName ?? "";
      const bn = b.header?.articleName ?? b.allocations[0]?.articleName ?? "";
      return an.localeCompare(bn, "fr");
    });

    return result;
  }, [lines]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(monthCursor);
    const end = endOfMonth(monthCursor);
    const out: string[] = [];
    let cur = new Date(start);
    while (cur <= end) {
      out.push(isoDate(cur));
      cur = addDays(cur, 1);
    }
    return out;
  }, [monthCursor]);

  const monthLabel = useMemo(
    () => monthCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    [monthCursor]
  );

  // Planning du mois courant (si une ligne est ouverte)
  useEffect(() => {
    if (!visible) return;
    if (!expandedLineId) return;

    const start = isoDate(startOfMonth(monthCursor));
    const end = isoDate(endOfMonth(monthCursor));

    setPlanningLoading(true);
    setPlanningError(null);

    fetchPlanningItems(start, end)
      .then((items) => setPlanningItems(items))
      .catch((e: any) => setPlanningError(e?.message ?? "Erreur de chargement du planning."))
      .finally(() => setPlanningLoading(false));
  }, [visible, expandedLineId, monthCursor]);

  const selectedExpandedLine = useMemo(
    () => (expandedLineId ? lines.find((l) => l.id === expandedLineId) : undefined),
    [expandedLineId, lines]
  );

  const requiredCompetencesForExpanded = useMemo(() => {
    const l = selectedExpandedLine;
    if (!l) return [] as string[];
    return (l.articleCompetencesRequired ?? []).filter(Boolean);
  }, [selectedExpandedLine]);

  const competentConsultants = useMemo(() => {
    const req = requiredCompetencesForExpanded;
    return (consultants ?? []).filter((c) => isCompetent(c, req));
  }, [consultants, requiredCompetencesForExpanded]);

  const selectedConsultant = useMemo(() => {
    if (!planConsultantId) return null;
    return (consultants ?? []).find((c) => c.id === planConsultantId) ?? null;
  }, [planConsultantId, consultants]);

  // jours en vert = booking de la ligne sélectionnée
  const expandedLineBookingDays = useMemo(() => {
    const l = selectedExpandedLine;
    if (!l) return new Set<string>();

    const booking = (planningItems ?? []).find(
      (pi) => pi.kind === "booking" && (pi.notes || "").includes(`Ligne projet: ${l.id}`)
    );

    if (booking) return new Set(listIsoDaysInclusive(booking.startDate, booking.endDate));

    if (l.plannedStartDate && l.plannedEndDate) {
      return new Set(listIsoDaysInclusive(l.plannedStartDate, l.plannedEndDate));
    }

    return new Set<string>();
  }, [selectedExpandedLine, planningItems]);

  const isExpandedLinePlanned = useMemo(() => {
    const l = selectedExpandedLine;
    if (!l) return false;
    return !!l.consultantId && !!l.plannedStartDate && !!l.plannedEndDate && Number(l.plannedQuantity || 0) > 0;
  }, [selectedExpandedLine]);

  const isExpandedLineRemainder = useMemo(() => {
    const l = selectedExpandedLine as any;
    if (!l) return false;
    return !l.consultantId && !l.plannedStartDate && !l.plannedEndDate && Number(l.plannedQuantity || 0) === 0;
  }, [selectedExpandedLine]);

  // meta jour : non travaillé / réservé
  const dayMeta = (dayIso: string) => {
    const d = new Date(dayIso);
    const wdKey = dayKeyFromDate(d);

    const works = selectedConsultant?.workDays?.[wdKey];
    const nonWorked = works === false;

    const itemsForConsultant = (planningItems ?? []).filter((pi) => pi.consultantId === planConsultantId);
    const item = itemsForConsultant.find((pi) => overlapsDateRange(pi.startDate, pi.endDate, dayIso, dayIso)) ?? null;

    const reserved = !!item;
    const reservedLabel =
      item?.kind === "time_off"
        ? "Indispo"
        : item?.title
        ? shortBookingLabel(item.title)
        : null;

    return { nonWorked, reserved, item, reservedLabel };
  };

  const onToggleDay = (dayIso: string) => {
    if (!planConsultantId) {
      setPlanError("Veuillez d’abord sélectionner une ressource.");
      return;
    }
    if (!isExpandedLineRemainder) {
      setPlanError("Veuillez planifier depuis la ligne reliquat (non attribuée).");
      return;
    }

    const meta = dayMeta(dayIso);
    if (meta.nonWorked || meta.reserved) return;

    setPlanError(null);
    setSelectedDays((prev) => {
      const s = new Set(prev);
      if (s.has(dayIso)) s.delete(dayIso);
      else s.add(dayIso);
      return Array.from(s).sort();
    });
  };

  const handleCreateLine = async (payload: ProjectLineUpsertInput) => {
    if (!project?.id) return;
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
    if (expandedLineId === id) setExpandedLineId(null);
  };

  const handleRepairCreateRemainder = async (line: ProjectLine) => {
    try {
      await reportProjectLineRemainder(line.id);
      await refresh();
      setToastMessage("Reliquat créé.");
      setShowToast(true);
    } catch (e: any) {
      setPlanError(e?.message ?? "Impossible de créer le reliquat.");
    }
  };

  const handlePlanDays = async () => {
      setPlanError("Veuillez planifier depuis la ligne reliquat (non attribuée).");
      return;
    }
    if (!planConsultantId) {
      setPlanError("Veuillez sélectionner une ressource.");
      return;
    }
    if (selectedDays.length === 0) {
      setPlanError("Veuillez sélectionner un ou plusieurs jours.");
      return;
    }

    setPlanSaving(true);
    setPlanError(null);
    try {
      await allocateProjectLineDays(l.id, planConsultantId, selectedDays);
      await refresh();
      setToastMessage("Planification créée (découpage automatique si jours non consécutifs).");
      setShowToast(true);

      setExpandedLineId(null);
      setPlanConsultantId("");
      setSelectedDays([]);
    } catch (e: any) {
      setPlanError(e?.message ?? "Erreur lors de la planification.");
    } finally {
      setPlanSaving(false);
    }
  };

  const toggleGroup = (gid: string) => {
    setOpenGroups((prev) => ({ ...prev, [gid]: !prev[gid] }));
  };

  const toggleExpandedLine = (lineId: string, forceOpen?: boolean) => {
    setPlanError(null);
    setSelectedDays([]);
    setExpandedLineId((prev) => {
      if (forceOpen) return lineId;
      return prev === lineId ? null : lineId;
    });
  };

  if (!visible) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={project?.name ?? "Projet"} size="xl">
        {/* Bandeau haut */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Client</div>
              <div className="text-gray-900 font-medium truncate">
                {project?.clientNumber} — {project?.clientName}
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {client?.tier ? client.tier : ""}
                {client?.tier ? " • " : ""}
                {project?.clientAddress || ""}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <details className="relative">
                <summary className="list-none cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm">
                  <Settings2 className="w-4 h-4" />
                  Colonnes
                </summary>
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20">
                  <div className="text-xs text-gray-500 mb-2">Afficher / masquer</div>
                  {(
                    [
                      ["status", "Statut"],
                      ["affectation", "Affectation"],
                      ["date", "Date d’intervention"],
                      ["vendu", "Vendu"],
                      ["reste", "Reste"],
                      ["planifie", "Planifié"],
                      ["realise", "Réalisé"],
                      ["actions", "Actions"],
                    ] as Array<[ColumnKey, string]>
                  ).map(([k, label]) => (
                    <label key={k} className="flex items-center justify-between gap-3 py-1 text-sm">
                      <span className="text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={!!cols[k]}
                        onChange={(e) => setCols((prev) => ({ ...prev, [k]: e.target.checked }))}
                      />
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </div>

          <details className="mt-3">
            <summary className="text-xs text-gray-600 cursor-pointer select-none">
              Interlocuteurs & coordonnées
            </summary>

            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                {clientLoading ? (
                  <div className="text-gray-600">Chargement…</div>
                ) : clientError ? (
                  <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{clientError}</div>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>{client?.address || project?.clientAddress || "—"}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>{client?.phone || "—"}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                {(client?.contacts ?? []).length === 0 ? (
                  <div className="text-gray-600">Aucun interlocuteur.</div>
                ) : (
                  <div className="space-y-2">
                    {(client?.contacts ?? []).map((ct) => (
                      <div key={ct.id} className="bg-white border border-gray-200 rounded-lg p-2">
                        <div className="text-gray-900 font-medium">{ct.name}</div>
                        {ct.role ? <div className="text-xs text-gray-500">{ct.role}</div> : null}
                        <div className="mt-1 text-xs text-gray-700 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <div>{ct.email || "—"}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <div>{ct.phone || "—"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-gray-900 font-medium">Articles du projet</div>
              <div className="text-gray-500 text-sm">
                À l’ouverture, tous les articles chapeaux sont repliés. Dépliez un chapeau pour voir ses sous-lignes.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddLine(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-gray-600">Chargement…</div>
          ) : errorMsg ? (
            <div className="p-6 text-red-700 bg-red-50 border-t border-red-200">{errorMsg}</div>
          ) : (
            <div className="max-h-[68vh] overflow-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr className="text-xs text-gray-700">
                    <th className="px-3 py-2 text-left w-[38%]">Article</th>
                    {cols.status && <th className="px-3 py-2 text-left w-[12%]">Statut</th>}
                    {cols.affectation && <th className="px-3 py-2 text-left w-[12%]">Affectation</th>}
                    {cols.date && <th className="px-3 py-2 text-left w-[14%]">Date d’intervention</th>}
                    {cols.vendu && <th className="px-2 py-2 text-right w-[6%]">Vendu</th>}
                    {cols.reste && <th className="px-2 py-2 text-right w-[6%]">Reste</th>}
                    {cols.planifie && <th className="px-2 py-2 text-right w-[6%]">Planifié</th>}
                    {cols.realise && <th className="px-2 py-2 text-right w-[6%]">Réalisé</th>}
                    {cols.actions && <th className="px-2 py-2 text-right w-[8%]">Actions</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {groups.map((g) => {
                    const isOpen = !!openGroups[g.gid];
                    const st = statusFromGroup(g.soldTotal, g.plannedTotal);
                    const headerArticleName =
                      g.header?.articleName ??
                      g.allocations[0]?.articleName ??
                      "Article";

                    const headerService =
                      g.header?.articleService ??
                      g.allocations[0]?.articleService ??
                      "";

                    const headerComps =
                      (g.header?.articleCompetencesRequired ?? g.allocations[0]?.articleCompetencesRequired ?? []).filter(Boolean);

                    const subCount = g.allocations.length;

                    return (
                      <Fragment key={g.gid}>
                        {/* LIGNE CHAPEAU */}
                        <tr className="bg-white hover:bg-gray-50 transition-colors align-top text-sm">
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleGroup(g.gid)}
                              className="w-full text-left group"
                            >
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 text-gray-400 group-hover:text-gray-600">
                                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-gray-900 font-medium truncate">
                                    {headerArticleName}{" "}
                                    <span className="text-xs text-gray-500 font-normal">
                                      ({subCount} sous-lignes)
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 truncate">
                                    {headerService ? `${headerService} • ` : ""}Ligne chapeau
                                  </div>
                                  {headerComps.length ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {headerComps.map((c) => (
                                        <span key={c} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </button>
                          </td>

                          {cols.status && (
                            <td className="px-3 py-2">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs ${st.badge}`}>{st.label}</span>
                            </td>
                          )}

                          {cols.affectation && <td className="px-3 py-2 text-gray-900">Non attribuée</td>}

                          {cols.date && <td className="px-3 py-2 text-gray-700">—</td>}

                          {cols.vendu && <td className="px-2 py-2 text-right text-gray-900 tabular-nums">{g.soldTotal}</td>}

                          {cols.reste && (
                            <td className="px-2 py-2 text-right tabular-nums">
                              <span className={g.remaining > 0 ? "text-amber-700 font-medium" : "text-gray-900"}>
                                {g.remaining}
                              </span>
                            </td>
                          )}

                          {cols.planifie && (
                            <td className="px-2 py-2 text-right text-blue-700 font-medium tabular-nums">{g.plannedTotal}</td>
                          )}

                          {cols.realise && (
                            <td className="px-2 py-2 text-right text-green-700 font-medium tabular-nums">{g.realizedTotal}</td>
                          )}

                          {cols.actions && <td className="px-2 py-2" />}
                        </tr>

                        {/* SOUS-LIGNES */}
                        {isOpen &&
                          g.allocations.map((l) => {
                            const isExpanded = expandedLineId === l.id;

                            return (
                              <Fragment key={l.id}>
                                <tr className="bg-gray-50/40 hover:bg-gray-50 transition-colors align-top text-sm">
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandedLine(l.id)}
                                      className="w-full text-left group"
                                    >
                                      <div className="flex items-start gap-2 pl-6">
                                        <span className="mt-0.5 text-gray-300 group-hover:text-gray-500">
                                          <ChevronRight className={`w-4 h-4 ${isExpanded ? "rotate-90" : ""}`} />
                                        </span>
                                        <div className="min-w-0">
                                          <div className="text-gray-900 font-medium truncate">{l.articleName}</div>
                                          <div className="mt-1 text-xs text-gray-500 truncate">
                                            {l.articleService ? `${l.articleService} • ` : ""}Sous-ligne (allocation)
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  </td>

                                  {cols.status && <td className="px-3 py-2 text-gray-700">Sous-ligne</td>}
                                  {cols.affectation && <td className="px-3 py-2 text-gray-900">{l.consultantName || "—"}</td>}
                                  {cols.date && (
                                    <td className="px-3 py-2 text-gray-700">
                                      {formatInterventionDatesFR(l.plannedStartDate, l.plannedEndDate)}
                                    </td>
                                  )}

                                  {/* Sous-lignes : vendu/reste = "-" */}
                                  {cols.vendu && <td className="px-2 py-2 text-right text-gray-500 tabular-nums">-</td>}
                                  {cols.reste && <td className="px-2 py-2 text-right text-gray-500 tabular-nums">-</td>}

                                  {cols.planifie && (
                                    <td className="px-2 py-2 text-right text-blue-700 font-medium tabular-nums">
                                      {Number(l.plannedQuantity || 0)}
                                    </td>
                                  )}
                                  {cols.realise && (
                                    <td className="px-2 py-2 text-right text-green-700 font-medium tabular-nums">
                                      {Number(l.realizedQuantity || 0)}
                                    </td>
                                  )}

                                  {cols.actions && (
                                    <td className="px-2 py-2">
                                      <div className="flex justify-end gap-2">
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
                                  )}
                                </tr>

                                {/* Déroulé (lecture/planif) */}
                                {isExpanded && (
                                  <tr className="bg-gray-50">
                                    <td colSpan={10} className="px-3 pb-4">
                                      <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="text-gray-900 font-medium flex items-center gap-2">
                                          <CalendarDays className="w-4 h-4 text-gray-500" />
                                          Planification
                                        </div>

                                        {planError && (
                                          <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                                            <div className="flex items-start gap-2">
                                              <AlertTriangle className="w-4 h-4 mt-0.5" />
                                              <div className="text-sm">{planError}</div>
                                            </div>
                                          </div>
                                        )}

                                        {(planningLoading || planningError) && (
                                          <div className="mt-3 text-sm">
                                            {planningLoading ? (
                                              <div className="text-gray-600">Chargement du planning…</div>
                                            ) : (
                                              <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
                                                {planningError}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          {/* Colonne gauche */}
                                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <label className="block text-sm text-gray-700 mb-2">Ressource compétente</label>
                                            <select
                                              value={planConsultantId}
                                              onChange={(e) => {
                                                setPlanConsultantId(e.target.value);
                                                setPlanError(null);
                                                setSelectedDays([]);
                                              }}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              disabled={isExpandedLinePlanned}
                                            >
                                              <option value="">Sélectionner…</option>
                                              {competentConsultants.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                  {c.name}
                                                  {c.service ? ` — ${c.service}` : ""}
                                                  {c.location ? ` (${c.location})` : ""}
                                                </option>
                                              ))}
                                            </select>

                                            <div className="text-xs text-gray-500 mt-2">
                                              {isExpandedLinePlanned
                                                ? "Ligne déjà planifiée : affichage en vert."
                                                : "Sélection multi-jours : cliquez pour ajouter/retirer. Découpage automatique si non consécutif."}
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                              <button
                                                type="button"
                                                onClick={() => void handlePlanDays()}
                                                disabled={planSaving || !isExpandedLineRemainder || !planConsultantId || selectedDays.length === 0}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                              >
                                                {planSaving ? "Planification…" : "Planifier"}
                                              </button>
                                            </div>
                                          </div>

                                          {/* Colonne droite : planning */}
                                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-gray-900 font-medium">Planning — {monthLabel}</div>
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => setMonthCursor((d) => startOfMonth(addMonths(d, -1)))}
                                                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                                                  title="Mois précédent"
                                                >
                                                  <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setMonthCursor((d) => startOfMonth(addMonths(d, 1)))}
                                                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                                                  title="Mois suivant"
                                                >
                                                  <ChevronRight className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>

                                            <div className="text-sm text-gray-600 mt-1">
                                              Vert : ligne sélectionnée. Rouge : réservé (client + prestation). Gris : non travaillé.
                                            </div>

                                            <div className="mt-4 grid grid-cols-7 gap-2">
                                              {monthDays.map((d) => {
                                                const hasConsultant = !!planConsultantId;
                                                const meta = hasConsultant
                                                  ? dayMeta(d)
                                                  : { nonWorked: true, reserved: false, item: null as any, reservedLabel: null as any };

                                                const isGreen = hasConsultant && expandedLineBookingDays.has(d);
                                                const isBlue = hasConsultant && selectedDays.includes(d);

                                                const base =
                                                  "h-14 rounded-lg border text-[11px] flex flex-col items-center justify-center select-none px-1";
                                                let cls = `${base} bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed`;

                                                if (hasConsultant) {
                                                  if (isGreen) cls = `${base} bg-green-50 border-green-200 text-green-800 cursor-not-allowed`;
                                                  else if (meta.reserved) cls = `${base} bg-red-50 border-red-200 text-red-800 cursor-not-allowed`;
                                                  else if (meta.nonWorked) cls = `${base} bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed`;
                                                  else if (isBlue) cls = `${base} bg-blue-600 border-blue-700 text-white cursor-pointer`;
                                                  else cls = `${base} bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer`;
                                                }

                                                const dd = new Date(d);
                                                const day = dd.getDate();
                                                const weekday = dd.toLocaleDateString("fr-FR", { weekday: "short" });

                                                const label = isGreen
                                                  ? "Planifié"
                                                  : meta.reserved && meta.reservedLabel
                                                  ? meta.reservedLabel
                                                  : "";

                                                const clickable =
                                                  hasConsultant &&
                                                  !meta.nonWorked &&
                                                  !meta.reserved &&
                                                  !isGreen &&
                                                  isExpandedLineRemainder;

                                                return (
                                                  <button
                                                    key={d}
                                                    type="button"
                                                    className={cls}
                                                    onClick={() => (clickable ? onToggleDay(d) : undefined)}
                                                    disabled={!clickable}
                                                    title={
                                                      !hasConsultant
                                                        ? "Sélectionnez une ressource"
                                                        : isGreen
                                                        ? "Déjà planifié (ligne courante)"
                                                        : meta.reserved
                                                        ? meta.reservedLabel || "Indisponible"
                                                        : meta.nonWorked
                                                        ? "Non travaillé"
                                                        : "Disponible (clic pour sélectionner)"
                                                    }
                                                  >
                                                    <div className="capitalize">{weekday}</div>
                                                    <div className="font-medium tabular-nums">{day}</div>
                                                    <div className={`truncate w-full text-center ${isBlue ? "text-white" : ""}`}>
                                                      {label}
                                                    </div>
                                                  </button>
                                                );
                                              })}
                                            </div>

                                            <div className="mt-4 text-xs text-gray-500">
                                              Remarque : les dates affichées dans le tableau sont au format JJ/MM/AAAA.
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>

              {lines.length === 0 && <div className="py-10 text-center text-gray-500">Aucune ligne pour ce projet</div>}
            </div>
          )}
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
