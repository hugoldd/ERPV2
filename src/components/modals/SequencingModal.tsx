import { useState } from 'react';
import { Modal } from './Modal';
import { ArrowDown, Plus, X } from 'lucide-react';
import { Toast } from '../Toast';

interface SequenceStep {
  id: string;
  article: string;
  dependencies: string[];
}

const initialSequence: SequenceStep[] = [
  { id: '1', article: 'Installation', dependencies: [] },
  { id: '2', article: 'Paramétrage', dependencies: ['Installation'] },
  { id: '3', article: 'Reprise de données', dependencies: ['Paramétrage'] },
  { id: '4', article: 'Formation administrateurs', dependencies: ['Paramétrage'] },
  { id: '5', article: 'Formation utilisateurs', dependencies: ['Formation administrateurs'] },
];

interface SequencingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SequencingModal({ isOpen, onClose }: SequencingModalProps) {
  const [sequence, setSequence] = useState<SequenceStep[]>(initialSequence);
  const [showToast, setShowToast] = useState(false);

  const availableArticles = [
    'Installation',
    'Paramétrage',
    'Formation administrateurs',
    'Formation utilisateurs',
    'Reprise de données',
    'Migration',
    'Support',
    'Tests',
    'Validation',
    'Mise en production'
  ];

  const handleAddStep = () => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      article: '',
      dependencies: []
    };
    setSequence([...sequence, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    setSequence(sequence.filter(s => s.id !== id));
  };

  const handleUpdateArticle = (id: string, article: string) => {
    setSequence(sequence.map(s => 
      s.id === id ? { ...s, article } : s
    ));
  };

  const handleToggleDependency = (id: string, dependency: string) => {
    setSequence(sequence.map(s => {
      if (s.id === id) {
        const deps = s.dependencies.includes(dependency)
          ? s.dependencies.filter(d => d !== dependency)
          : [...s.dependencies, dependency];
        return { ...s, dependencies: deps };
      }
      return s;
    }));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Configuration du séquençage">
        <div className="space-y-6">
          <p className="text-gray-600">
            Définissez l'ordre et les dépendances entre les prestations. Une prestation ne peut commencer que lorsque ses dépendances sont terminées.
          </p>

          {/* Sequence Steps */}
          <div className="space-y-4">
            {sequence.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Article Selection */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Prestation
                      </label>
                      <select
                        value={step.article}
                        onChange={(e) => handleUpdateArticle(step.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une prestation</option>
                        {availableArticles.map(article => (
                          <option key={article} value={article}>{article}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dependencies */}
                    {index > 0 && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Dépend de :
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {sequence.slice(0, index).map(prevStep => (
                            prevStep.article && (
                              <label
                                key={prevStep.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={step.dependencies.includes(prevStep.article)}
                                  onChange={() => handleToggleDependency(step.id, prevStep.article)}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{prevStep.article}</span>
                              </label>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Arrow to next step */}
                {index < sequence.length - 1 && (
                  <div className="flex justify-center mt-3">
                    <ArrowDown className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Step Button */}
          <button
            onClick={handleAddStep}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une étape</span>
          </button>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer le séquençage
            </button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <Toast
          message="Séquençage enregistré avec succès"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
