import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "./Modal";
import type { Article, Consultant, ProjectLine } from "../../types";
import type { ProjectLineUpsertInput } from "../../api/projects";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ProjectLineUpsertInput) => void | Promise<void>;
  articles: Article[];
  consultants: Consultant[]; // conservé pour compatibilité (planification ailleurs)
  line?: ProjectLine;
}

function toNumber(v: string): number {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function ManageProjectLineModal(props: Props) {
  const { isOpen, onClose, onSave, articles, line } = props;

  const [articleId, setArticleId] = useState(line?.articleId ?? "");
  const [soldQuantity, setSoldQuantity] = useState<string>(String(line?.soldQuantity ?? 1));
  const [amount, setAmount] = useState<string>(String(line?.amount ?? 0));

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setArticleId(line?.articleId ?? "");
    setSoldQuantity(String(line?.soldQuantity ?? 1));
    setAmount(String(line?.amount ?? 0));
  }, [isOpen, line]);

  const selectedArticle = useMemo(
    () => articles.find((a) => a.id === articleId) ?? null,
    [articles, articleId]
  );

  const canSubmit = useMemo(() => {
    if (!articleId) return false;
    const sold = toNumber(soldQuantity);
    const amt = toNumber(amount);
    if (!(sold > 0)) return false;
    if (amt < 0) return false;
    return true;
  }, [articleId, soldQuantity, amount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      const sold = toNumber(soldQuantity);
      const amt = toNumber(amount);

      const payload: ProjectLineUpsertInput = {
        articleId,
        soldQuantity: sold,
        amount: amt,
        consultantId: null,
        plannedStartDate: null,
        plannedEndDate: null,
        plannedQuantity: 0,
        realizedQuantity: 0,
      };

      await onSave(payload);
      onClose();
    } catch (e2: any) {
      setErrorMsg(e2?.message ?? "Erreur lors de l’enregistrement de la ligne.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={line ? "Modifier la ligne" : "Ajouter une ligne"}
      size="lg"
    >
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {errorMsg}
        </div>
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
                {a.name}
              </option>
            ))}
          </select>

          <div className="text-xs text-gray-500 mt-2">
            {selectedArticle?.competencesRequired?.length
              ? `Compétences requises : ${selectedArticle.competencesRequired.join(", ")}`
              : "Aucune compétence requise."}
          </div>

          <div className="text-xs text-gray-500 mt-1">
            La ressource, les dates et la planification se gèrent dans l’écran de planification du projet.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Quantité vendue *</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min={0}
              value={soldQuantity}
              onChange={(e) => setSoldQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">Ex. : 1, 1.5, 2, 2.5…</div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Montant</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">Montant total associé à la ligne chapeau.</div>
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
  );
}
