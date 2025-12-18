import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import type { Client, Consultant, Project, ProjectStatus } from "../../types";
import { fetchClients } from "../../api/clients";
import { fetchConsultants } from "../../api/consultants";
import { createProject, updateProject, type ProjectUpsertInput } from "../../api/projects";
import { Toast } from "../Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSaved?: () => void | Promise<void>;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "devis_en_cours", label: "Devis en cours" },
  { value: "commande_receptionnee", label: "Commande réceptionnée" },
  { value: "attente_affectation_dp", label: "En attente d'affectation de DP" },
  { value: "en_cours_deploiement", label: "En cours de déploiement" },
  { value: "facture", label: "Facturé" },
  { value: "paye", label: "Payé" },
  { value: "termine", label: "Terminé" },
];

const SALES_TYPE_SUGGESTIONS = ["Packagé", "Sur-mesure", "Régie", "Forfait", "Abonnement"];

function isoToFR(iso?: string | null): string {
  if (!iso) return "";
  // attendu: YYYY-MM-DD
  const parts = String(iso).slice(0, 10).split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function frToISO(fr?: string | null): string | null {
  const v = (fr ?? "").trim();
  if (!v) return null;

  // accepte "DD/MM/YYYY" ou "D/M/YYYY"
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null;
  if (yyyy < 1900 || yyyy > 2100) return null;
  if (mm < 1 || mm > 12) return null;

  const daysInMonth = new Date(yyyy, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) return null;

  const d2 = String(dd).padStart(2, "0");
  const m2 = String(mm).padStart(2, "0");
  return `${yyyy}-${m2}-${d2}`;
}

function normalizeFR(fr: string): string {
  const iso = frToISO(fr);
  return iso ? isoToFR(iso) : fr;
}

export function ManageProjectModal({ isOpen, onClose, project, onSaved }: Props) {
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);

  // lecture robuste (camelCase ou snake_case)
  const p: any = project ?? {};

  const [name, setName] = useState(p.name ?? "");
  const [clientId, setClientId] = useState(p.clientId ?? p.client_id ?? "");
  const [clientContactId, setClientContactId] = useState<string>(p.clientContactId ?? p.client_contact_id ?? "");
  const [commercialName, setCommercialName] = useState(p.commercialName ?? p.commercial_name ?? "");
  const [projectManagerId, setProjectManagerId] = useState<string>(p.projectManagerId ?? p.project_manager_id ?? "");
  // ✅ format FR dans l'UI
  const [orderDate, setOrderDate] = useState(isoToFR(p.orderDate ?? p.order_date ?? ""));
  const [salesType, setSalesType] = useState(p.salesType ?? p.sales_type ?? "");
  const [status, setStatus] = useState<ProjectStatus>((p.status as ProjectStatus) ?? "devis_en_cours");
  const [notes, setNotes] = useState(p.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const pp: any = project ?? {};
    setName(pp.name ?? "");
    setClientId(pp.clientId ?? pp.client_id ?? "");
    setClientContactId(pp.clientContactId ?? pp.client_contact_id ?? "");
    setCommercialName(pp.commercialName ?? pp.commercial_name ?? "");
    setProjectManagerId(pp.projectManagerId ?? pp.project_manager_id ?? "");
    setOrderDate(isoToFR(pp.orderDate ?? pp.order_date ?? ""));
    setSalesType(pp.salesType ?? pp.sales_type ?? "");
    setStatus((pp.status as ProjectStatus) ?? "devis_en_cours");
    setNotes(pp.notes ?? "");
    setRefError(null);
  }, [isOpen, project]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      setLoadingRefs(true);
      setRefError(null);
      try {
        const [c, cons] = await Promise.all([fetchClients(), fetchConsultants()]);
        if (cancelled) return;
        setClients(c);
        setConsultants(cons);
      } catch (e: any) {
        if (cancelled) return;
        setRefError(e?.message ?? "Erreur lors du chargement des données.");
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const selectedClient = useMemo(() => clients.find((c) => c.id === clientId) ?? null, [clients, clientId]);
  const contactOptions = useMemo(() => selectedClient?.contacts ?? [], [selectedClient]);

  // si on change de client, on invalide le contact sélectionné si nécessaire
  useEffect(() => {
    if (!isOpen) return;

    if (!clientId) {
      setClientContactId("");
      return;
    }
    if (clientContactId && !contactOptions.some((c) => c.id === clientContactId)) {
      setClientContactId("");
    }
  }, [isOpen, clientId, clientContactId, contactOptions]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!clientId) return false;
    if (!salesType.trim()) return false;
    if (!commercialName.trim()) return false;
    return true;
  }, [name, clientId, salesType, commercialName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // ✅ conversion FR -> ISO (ou null)
    const orderDateISO = frToISO(orderDate);
    if (orderDate.trim() && !orderDateISO) {
      setRefError("Date de commande invalide. Format attendu : JJ/MM/AAAA.");
      return;
    }

    const payload: ProjectUpsertInput = {
      name: name.trim(),
      clientId,
      clientContactId: clientContactId || null,
      commercialName: commercialName.trim(),
      projectManagerId: projectManagerId || null,
      orderDate: orderDateISO || null,
      salesType: salesType.trim(),
      status,
      notes: notes ?? "",
    };

    setSaving(true);
    try {
      if (project) {
        await updateProject(project.id, payload);
        setToastMsg("Projet mis à jour");
      } else {
        await createProject(payload);
        setToastMsg("Projet créé");
      }
      setShowToast(true);
      await onSaved?.();
      setTimeout(() => onClose(), 650);
    } catch (e2: any) {
      setRefError(e2?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={project ? "Modifier le projet" : "Créer un projet"} size="lg">
        {refError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{refError}</div>
        )}

        {loadingRefs ? (
          <div className="text-gray-600">Chargement…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nom du projet *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex : Déploiement SIRH – Phase 1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Client (N° client) *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.clientNumber} — {c.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">{selectedClient?.address ? `Adresse : ${selectedClient.address}` : ""}</div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Interlocuteur client</label>
                <select
                  value={clientContactId}
                  onChange={(e) => setClientContactId(e.target.value)}
                  disabled={!clientId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">—</option>
                  {contactOptions.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                      {ct.email ? ` (${ct.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Commercial *</label>
                <input
                  type="text"
                  value={commercialName}
                  onChange={(e) => setCommercialName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du commercial"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Directeur de projet</label>
                <select
                  value={projectManagerId}
                  onChange={(e) => setProjectManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Non affecté</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.service}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">(Affectation DP : à renseigner après la commande si besoin.)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Date de commande</label>
                {/* ✅ JJ/MM/AAAA */}
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="JJ/MM/AAAA"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  onBlur={(e) => setOrderDate(normalizeFR(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">Format : JJ/MM/AAAA</div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm text-gray-700 mb-2">Type de vente *</label>
                <input
                  list="sales-types"
                  value={salesType}
                  onChange={(e) => setSalesType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex : Packagé"
                />
                <datalist id="sales-types">
                  {SALES_TYPE_SUGGESTIONS.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">État *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Informations utiles, contexte, contraintes…"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Enregistrement…" : project ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {showToast && <Toast message={toastMsg} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
}
