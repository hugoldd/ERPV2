import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal";
import { Plus, X } from "lucide-react";
import { Toast } from "../Toast";
import type { Article } from "../../types"; // <-- ajustez en ../types si nécessaire

interface ManageArticleModalProps {
  isOpen: boolean;
  onClose: () => void;

  // ✅ async possible (insert/update Supabase)
  onSave: (article: Omit<Article, "id">) => Promise<void> | void;

  article?: Article;

  // ✅ alimentés par Supabase (prestations + competences)
  prestationOptions: string[];
  competenceOptions: string[];

  // optionnel : si vous voulez garder vos valeurs possibles
  serviceOptions?: string[];
}

export function ManageArticleModal({
  isOpen,
  onClose,
  onSave,
  article,
  prestationOptions,
  competenceOptions,
  serviceOptions = ["SIRH", "Finance", "Support", "Formation"],
}: ManageArticleModalProps) {
  const defaultType = prestationOptions?.[0] ?? "Installation";
  const defaultService = serviceOptions?.[0] ?? "SIRH";

  const [name, setName] = useState("");
  const [type, setType] = useState<Article["type"]>(defaultType as Article["type"]);
  const [service, setService] = useState(defaultService);
  const [competencesRequired, setCompetencesRequired] = useState<string[]>([]);
  const [newCompetence, setNewCompetence] = useState("");
  const [standardDuration, setStandardDuration] = useState(1);
  const [mode, setMode] = useState<Article["mode"]>("Sur site");
  const [description, setDescription] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ options disponibles (sans celles déjà sélectionnées)
  const availableCompetences = useMemo(
    () => competenceOptions.filter((c) => !competencesRequired.includes(c)),
    [competenceOptions, competencesRequired]
  );

  // ✅ important : réinitialiser quand on ouvre / change d’article
  useEffect(() => {
    if (!isOpen) return;

    setName(article?.name ?? "");
    setType((article?.type ?? defaultType) as Article["type"]);
    setService(article?.service ?? defaultService);
    setCompetencesRequired(article?.competencesRequired ?? []);
    setNewCompetence("");
    setStandardDuration(article?.standardDuration ?? 1);
    setMode((article?.mode ?? "Sur site") as Article["mode"]);
    setDescription(article?.description ?? "");
  }, [isOpen, article, defaultType, defaultService]);

  const handleAddCompetence = () => {
    if (newCompetence && !competencesRequired.includes(newCompetence)) {
      setCompetencesRequired([...competencesRequired, newCompetence]);
      setNewCompetence("");
    }
  };

  const handleRemoveCompetence = (comp: string) => {
    setCompetencesRequired(competencesRequired.filter((c) => c !== comp));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await onSave({
        name,
        type,
        service,
        competencesRequired,
        standardDuration,
        mode,
        description,
      });

      setShowToast(true);

      // fermer après un petit délai, comme avant
      setTimeout(() => {
        onClose();
      }, 700);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={article ? "Modifier l'article" : "Créer un article"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Nom de l'article *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Installation SIRH Paie"
            />
          </div>

          {/* Type & Service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Type de prestation *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Article["type"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {prestationOptions.length === 0 ? (
                  <option value={defaultType}>{defaultType}</option>
                ) : (
                  prestationOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Service propriétaire *</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Durée standard (jours) *</label>
              <input
                type="number"
                min="1"
                value={standardDuration}
                onChange={(e) => setStandardDuration(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Mode d'intervention *</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Article["mode"])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sur site">Sur site</option>
                <option value="À distance">À distance</option>
                <option value="Hybride">Hybride</option>
              </select>
            </div>
          </div>

          {/* Competences */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Compétences nécessaires *</label>

            <div className="flex gap-2 mb-2">
              <select
                value={newCompetence}
                onChange={(e) => setNewCompetence(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une compétence</option>
                {availableCompetences.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddCompetence}
                disabled={!newCompetence}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ajouter la compétence"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {competencesRequired.map((comp) => (
                <span
                  key={comp}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {comp}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetence(comp)}
                    className="hover:bg-blue-100 rounded-full p-0.5"
                    title="Retirer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description de la prestation..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : article ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={article ? "Article mis à jour" : "Article créé avec succès"}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
