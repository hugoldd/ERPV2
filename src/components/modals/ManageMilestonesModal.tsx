import { useState } from 'react';
import { Modal } from './Modal';
import { Flag, Mail, FileText, Send } from 'lucide-react';

interface ManageMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageMilestonesModal({ isOpen, onClose }: ManageMilestonesModalProps) {
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      type: 'MOM',
      fullName: 'Mise en œuvre',
      date: '2025-06-20',
      status: 'completed',
      letterGenerated: true,
      letterSent: true,
    },
    {
      id: 2,
      type: 'VA',
      fullName: 'Validation',
      date: '2025-09-15',
      status: 'planned',
      letterGenerated: true,
      letterSent: false,
    },
    {
      id: 3,
      type: 'VSR',
      fullName: 'Vérification Service Régulier',
      date: '2025-09-30',
      status: 'planned',
      letterGenerated: false,
      letterSent: false,
    },
  ]);

  const toggleComplete = (id: number) => {
    setMilestones(milestones.map(m =>
      m.id === id
        ? { ...m, status: m.status === 'completed' ? 'planned' : 'completed' }
        : m
    ));
  };

  const generateLetter = (id: number) => {
    setMilestones(milestones.map(m =>
      m.id === id ? { ...m, letterGenerated: true } : m
    ));
  };

  const sendLetter = (id: number) => {
    setMilestones(milestones.map(m =>
      m.id === id ? { ...m, letterSent: true } : m
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les jalons clés" size="lg">
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-gray-700 text-sm">
            Les jalons clés (MOM, VA, VSR) sont des étapes réglementaires obligatoires du projet. 
            Assurez-vous de générer et envoyer les courriers correspondants dans les délais.
          </p>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-6 rounded-lg border-2 ${
                milestone.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Flag className={`w-5 h-5 ${
                      milestone.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    <h3 className="text-gray-900">
                      {milestone.type} – {milestone.fullName}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Date prévue :</span>
                      <input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => {
                          setMilestones(milestones.map(m =>
                            m.id === milestone.id ? { ...m, date: e.target.value } : m
                          ));
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Statut :</span>
                      <button
                        onClick={() => toggleComplete(milestone.id)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          milestone.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {milestone.status === 'completed' ? 'Terminé' : 'Planifié'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Letter Actions */}
                <div className="flex flex-col gap-2">
                  {!milestone.letterGenerated ? (
                    <button
                      onClick={() => generateLetter(milestone.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Générer le courrier
                    </button>
                  ) : !milestone.letterSent ? (
                    <div className="flex flex-col gap-2">
                      <span className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        <FileText className="w-4 h-4" />
                        Courrier généré
                      </span>
                      <button
                        onClick={() => sendLetter(milestone.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Marquer comme envoyé
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                      <Mail className="w-4 h-4" />
                      Courrier envoyé
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-gray-700 text-sm mb-2">Notes sur ce jalon</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                  placeholder="Ajoutez des notes..."
                />
              </div>
            </div>
          ))}
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
