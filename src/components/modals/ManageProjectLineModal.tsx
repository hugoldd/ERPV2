import { useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal";
import type { Article, Consultant, ProjectLine } from "../../types";
import type { ProjectLineUpsertInput } from "../../api/projects";
import { Toast } from "../Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ProjectLineUpsertInput) => Promise<void>;
  articles: Article[];
  consultants: Consultant[];
  line?: ProjectLine;
}

function toNum(v: string): number {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function matchScore(required: string[] | undefined, consultant: Consultant | undefined): number {
  const req = (required ?? []).filter(Boolean);
  if (req.length === 0) return 100;
  const have = new Set((consultant?.competences ?? []).filter(Boolean));
  const hit = req.filter((r) => have.has(r)).length;
  return Math.round((hit / req.length) * 100);
}

export function ManageProjectLineModal({ isOpen, onClose, onSave, articles, consultants, line }: Props) {
  const [articleId, setArticleId] = useState(line?.articleId ?? "");
  const [soldQuantity, setSoldQuantity] = useState(String(line?.soldQuantity ?? 1));
  const [amount, setAmount] = useState(String(line?.amount ?? 0));

  const [consultantId, setConsultantId] = useState<string>(line?.consultantId ?? "");
  const [plannedStartDate, setPlannedStartDate] = useState(line?.plannedStartDate ?? "");
  const [plannedEndDate, setPlannedEndDate] = useState(line?.plannedEndDate ?? "");
  const [plannedQuantity, setPlannedQuantity] = useState(String(line?.plannedQuantity ?? 0));
  const [realizedQuantity, setRealizedQuantity] = useState(String(line?.realizedQuantity ?? 0));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setArticleId(line?.articleId ?? "");
    setSoldQuantity(String(line?.soldQuantity ?? 1));
    setAmount(String(line?.amount ?? 0));
    setConsultantId(line?.consultantId ?? "");
    setPlannedStartDate(line?.plannedStartDate ?? "");
    setPlannedEndDate(line?.plannedEndDate ?? "");
    setPlannedQuantity(String(line?.plannedQuantity ?? 0));
    setRealizedQuantity(String(line?.realizedQuantity ?? 0));
    setErrorMsg(null);
  }, [isOpen, line]);

  const selectedArticle = useMemo(() => articles.find((a) => a.id === articleId), [articles, articleId]);
  const selectedConsultant = useMemo(() => consultants.find((c) => c.id === consultantId), [consultants, consultantId]);

  const computed = useMemo(() => {
    const sold = Math.max(0, toNum(soldQuantity));
    const planned = Math.max(0, toNum(plannedQuantity));
    const realized = Math.max(0, toNum(realizedQuantity));
    const amt = Math.max(0, toNum(amount));
    const remaining = Math.max(0, sold - planned);
    return { sold, planned, realized, amt, remaining };
  }, [soldQuantity, plannedQuantity, realizedQuantity, amount]);

  const canSubmit = useMemo(() => {
    if (!articleId) return false;
    if (computed.sold <= 0) return false;
    if (computed.planned < 0 || computed.planned > computed.sold) return false;
    if (computed.realized < 0 || computed.realized > computed.planned) return false;
    if (computed.amt < 0) return false;
    // dates : si start est rempli et end est vide => on autorise (on mettra end = start)
    return true;
  }, [articleId, computed]);

  const score = useMemo(() => matchScore(selectedArticle?.competencesRequired, selectedConsultant), [selectedArticle, selectedConsultant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setErrorMsg(null);
    try {
      const end = plannedEndDate || plannedStartDate || null;
      const payload: ProjectLineUpsertInput = {
        articleId,
        soldQuantity: computed.sold,
        amount: computed.amt,
        consultantId: consultantId || null,
        plannedStartDate: plannedStartDate || null,
        plannedEndDate: end,
        plannedQuantity: computed.planned,
        realizedQuantity: computed.realized,
      };

      await onSave(payload);
      setShowToast(true);
      setTimeout(() => onClose(), 450);
    } catch (e2: any) {
      setErrorMsg(e2?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={line ? "Modifier une ligne" : "Ajouter une ligne"}
        size="lg"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Article *</label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner…</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.service}
                </option>
              ))}
            </select>
            {selectedArticle?.competencesRequired?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedArticle.competencesRequired.map((c) => (
                  <span key={c} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">Aucune compétence requise.</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Quantité vendue *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={soldQuantity}
                onChange={(e) => setSoldQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Montant</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Reste à planifier</label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {computed.remaining}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Ressource</label>
              <select
                value={consultantId}
                onChange={(e) => setConsultantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non attribuée</option>
                {consultants.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.service}
                  </option>
                ))}
              </select>
              {consultantId && selectedArticle ? (
                <div className="text-xs mt-1 text-gray-600">
                  Matching compétences : <span className="text-gray-900">{score}%</span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Date prévue (début)</label>
                <input
                  type="date"
                  value={plannedStartDate}
                  onChange={(e) => setPlannedStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Date prévue (fin)</label>
                <input
                  type="date"
                  value={plannedEndDate}
                  onChange={(e) => setPlannedEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Quantité planifiée</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={plannedQuantity}
                onChange={(e) => setPlannedQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">Doit être ≤ quantité vendue.</div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Quantité réalisée</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={realizedQuantity}
                onChange={(e) => setRealizedQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">Doit être ≤ quantité planifiée.</div>
            </div>
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
              {saving ? "Enregistrement…" : line ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={line ? "Ligne mise à jour" : "Ligne ajoutée"}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
