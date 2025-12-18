import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Plus, X } from "lucide-react";
import { Toast } from "../Toast";
import type { Consultant, WorkDays } from "../../types";

interface ManageConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consultant: Omit<Consultant, "id">) => void | Promise<void>;
  consultant?: Consultant;
  competenceOptions?: string[];
}

const DEFAULT_WORK_DAYS: WorkDays = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
};

export function ManageConsultantModal({
  isOpen,
  onClose,
  onSave,
  consultant,
  competenceOptions = [],
}: ManageConsultantModalProps) {
  const [name, setName] = useState(consultant?.name || "");
  const [email, setEmail] = useState(consultant?.email || "");
  const [phone, setPhone] = useState(consultant?.phone || "");
  const [service, setService] = useState(consultant?.service || "SIRH");
  const [location, setLocation] = useState(consultant?.location || "");
  const [competences, setCompetences] = useState<string[]>(consultant?.competences || []);
  const [newCompetence, setNewCompetence] = useState("");
  const [workDays, setWorkDays] = useState<WorkDays>(consultant?.workDays || DEFAULT_WORK_DAYS);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(consultant?.name || "");
    setEmail(consultant?.email || "");
    setPhone(consultant?.phone || "");
    setService(consultant?.service || "SIRH");
    setLocation(consultant?.location || "");
    setCompetences(consultant?.competences || []);
    setNewCompetence("");
    setWorkDays(consultant?.workDays || DEFAULT_WORK_DAYS);
  }, [isOpen, consultant]);

  const handleAddCompetence = () => {
    if (newCompetence && !competences.includes(newCompetence)) {
      setCompetences([...competences, newCompetence]);
      setNewCompetence("");
    }
  };

  const handleRemoveCompetence = (comp: string) => {
    setCompetences(competences.filter((c) => c !== comp));
  };

  const toggleDay = (key: keyof WorkDays) => {
    setWorkDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSave({
      name,
      email: email.trim() || "", // côté API on mettra null si vide
      phone: phone.trim() || "",
      service,
      location,
      competences,
      workDays,
    });

    setShowToast(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const days: { key: keyof WorkDays; label: string }[] = [
    { key: "mon", label: "Lun" },
    { key: "tue", label: "Mar" },
    { key: "wed", label: "Mer" },
    { key: "thu", label: "Jeu" },
    { key: "fri", label: "Ven" },
    { key: "sat", label: "Sam" },
    { key: "sun", label: "Dim" },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={consultant ? "Modifier le consultant" : "Ajouter un consultant"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Nom complet *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jean.dupont@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Service & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Service *</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SIRH">SIRH</option>
                <option value="Finance">Finance</option>
                <option value="Support">Support</option>
                <option value="Formation">Formation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Localisation *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paris, Lyon, etc."
              />
            </div>
          </div>

          {/* Competences */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Compétences</label>
            <div className="flex gap-2 mb-2">
              <select
                value={newCompetence}
                onChange={(e) => setNewCompetence(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une compétence</option>
                {competenceOptions
                  .filter((c) => !competences.includes(c))
                  .map((comp) => (
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
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {competences.map((comp) => (
                <span key={comp} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {comp}
                  <button type="button" onClick={() => handleRemoveCompetence(comp)} className="hover:bg-blue-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Days */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Jours travaillés</label>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => (
                <label
                  key={d.key}
                  className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg border cursor-pointer select-none ${
                    workDays[d.key] ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={workDays[d.key]}
                    onChange={() => toggleDay(d.key)}
                    className="hidden"
                  />
                  <span className="text-sm">{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {consultant ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={consultant ? "Consultant mis à jour" : "Consultant ajouté avec succès"}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
