import { useState } from 'react';
import { Modal } from './Modal';
import { CheckCircle2, MapPin, Award, Calendar } from 'lucide-react';
import { Toast } from '../Toast';

interface SuggestedResource {
  id: string;
  name: string;
  service: string;
  competences: string[];
  location: string;
  availability: number;
  matchScore: number;
  availableDates: string;
}

const mockSuggestions: SuggestedResource[] = [
  {
    id: '1',
    name: 'Marie Lefebvre',
    service: 'SIRH',
    competences: ['Paie', 'GTA', 'Formation'],
    location: 'Paris',
    availability: 60,
    matchScore: 95,
    availableDates: 'Du 15/01 au 28/02/2026'
  },
  {
    id: '3',
    name: 'Sophie Martin',
    service: 'SIRH',
    competences: ['Formation', 'Paie', 'Reprise de données'],
    location: 'Bordeaux',
    availability: 80,
    matchScore: 90,
    availableDates: 'Du 01/01 au 31/03/2026'
  },
  {
    id: '4',
    name: 'Lucas Bernard',
    service: 'SIRH',
    competences: ['GTA', 'Paramétrage', 'Support'],
    location: 'Paris',
    availability: 45,
    matchScore: 85,
    availableDates: 'Du 20/01 au 15/03/2026'
  },
  {
    id: '2',
    name: 'Thomas Durand',
    service: 'Finance',
    competences: ['SIGF', 'Paramétrage', 'Installation'],
    location: 'Lyon',
    availability: 30,
    matchScore: 60,
    availableDates: 'Du 01/02 au 30/04/2026'
  }
];

interface SuggestResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestResourcesModal({ isOpen, onClose }: SuggestResourcesModalProps) {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);

  const toggleResource = (id: string) => {
    setSelectedResources(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    setShowToast(true);
    setTimeout(() => {
      onClose();
      setSelectedResources([]);
    }, 1500);
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Ressources suggérées pour ce projet">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-900 mb-2">Critères de recherche</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <div>• Compétences requises : Paie, GTA, Formation</div>
              <div>• Services : SIRH</div>
              <div>• Période du projet : 15/06/2025 - 30/09/2025</div>
              <div>• Localisation préférentielle : Paris, Île-de-France</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-gray-900">Consultants disponibles ({mockSuggestions.length})</h3>
            
            {mockSuggestions.map((resource) => (
              <div
                key={resource.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedResources.includes(resource.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleResource(resource.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedResources.includes(resource.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedResources.includes(resource.id) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Resource Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-gray-900">{resource.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">{resource.service}</span>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {resource.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${getMatchColor(resource.matchScore)}`}>
                          Compatibilité : {resource.matchScore}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Dispo : {resource.availability}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {resource.competences.map((comp, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          <Award className="w-3 h-3" />
                          {comp}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {resource.availableDates}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedResources.length} consultant{selectedResources.length !== 1 ? 's' : ''} sélectionné{selectedResources.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedResources.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Affecter au projet
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {showToast && (
        <Toast
          message={`${selectedResources.length} consultant${selectedResources.length !== 1 ? 's' : ''} affecté${selectedResources.length !== 1 ? 's' : ''} au projet`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
