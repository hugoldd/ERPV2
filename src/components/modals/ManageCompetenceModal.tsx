import React, { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Toast } from "../Toast";
import type { Competence } from "../../types";

interface ManageCompetenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { name: string }) => Promise<void> | void;
  competence?: Competence;
}

export function ManageCompetenceModal({
  isOpen,
  onClose,
  onSave,
  competence,
}: ManageCompetenceModalProps) {
  const [name, setName] = useState(competence?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(competence?.name ?? "");
  }, [isOpen, competence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name });
      setShowToast(true);
      setTimeout(() => onClose(), 700);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={competence ? "Modifier la compétence" : "Créer une compétence"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nom de la compétence *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex : Paie"
            />
          </div>

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
              {saving ? "Enregistrement..." : competence ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={competence ? "Compétence mise à jour" : "Compétence créée"}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
