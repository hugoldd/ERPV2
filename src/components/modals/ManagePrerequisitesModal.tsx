import { useState } from 'react';
import { Modal } from './Modal';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ManagePrerequisitesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Prerequisite {
  id: number;
  name: string;
  status: 'received' | 'missing';
  deadline: string;
  critical: boolean;
}

export function ManagePrerequisitesModal({ isOpen, onClose }: ManagePrerequisitesModalProps) {
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([
    { id: 1, name: 'Dump de données paie', status: 'missing', deadline: '2025-12-21', critical: true },
    { id: 2, name: 'Accès VPN', status: 'received', deadline: '2025-12-01', critical: false },
    { id: 3, name: 'Liste des administrateurs', status: 'received', deadline: '2025-12-01', critical: false },
  ]);

  const [newPrereq, setNewPrereq] = useState({
    name: '',
    deadline: '',
    critical: false,
  });

  const toggleStatus = (id: number) => {
    setPrerequisites(prerequisites.map(prereq =>
      prereq.id === id
        ? { ...prereq, status: prereq.status === 'received' ? 'missing' : 'received' }
        : prereq
    ));
  };

  const deletePrerequisite = (id: number) => {
    setPrerequisites(prerequisites.filter(prereq => prereq.id !== id));
  };

  const addPrerequisite = () => {
    if (newPrereq.name && newPrereq.deadline) {
      const newId = Math.max(...prerequisites.map(p => p.id), 0) + 1;
      setPrerequisites([
        ...prerequisites,
        { ...newPrereq, id: newId, status: 'missing' },
      ]);
      setNewPrereq({ name: '', deadline: '', critical: false });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les prérequis client" size="lg">
      <div className="space-y-6">
        {/* Existing Prerequisites */}
        <div>
          <h3 className="text-gray-900 mb-4">Prérequis existants</h3>
          <div className="space-y-3">
            {prerequisites.map((prereq) => (
              <div
                key={prereq.id}
                className={`p-4 rounded-lg border ${
                  prereq.status === 'received'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-900">{prereq.name}</span>
                      {prereq.critical && (
                        <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                          Bloquant
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Échéance : {new Date(prereq.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(prereq.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        prereq.status === 'received'
                          ? 'bg-green-100 hover:bg-green-200'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={prereq.status === 'received' ? 'Marquer comme non reçu' : 'Marquer comme reçu'}
                    >
                      {prereq.status === 'received' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                    <button
                      onClick={() => deletePrerequisite(prereq.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Prerequisite */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Ajouter un prérequis</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Nom du prérequis</label>
              <input
                type="text"
                value={newPrereq.name}
                onChange={(e) => setNewPrereq({ ...newPrereq, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ex: Fichier organigramme"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Date d'échéance</label>
                <input
                  type="date"
                  value={newPrereq.deadline}
                  onChange={(e) => setNewPrereq({ ...newPrereq, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 px-4 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPrereq.critical}
                    onChange={(e) => setNewPrereq({ ...newPrereq, critical: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Prérequis bloquant</span>
                </label>
              </div>
            </div>

            <button
              onClick={addPrerequisite}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter le prérequis
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enregistrer et fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
