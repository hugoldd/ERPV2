import { useState } from 'react';
import { Modal } from './Modal';
import { Download, FileText, Calendar } from 'lucide-react';
import { Toast } from '../Toast';

interface PlanningItem {
  id: string;
  article: string;
  consultant: string;
  mode: 'Sur site' | 'À distance' | 'Hybride';
  startDate: string;
  endDate: string;
  duration: number;
  location?: string;
}

const mockPlanning: PlanningItem[] = [
  {
    id: '1',
    article: 'Installation SIRH Paie',
    consultant: 'Marie Lefebvre',
    mode: 'Sur site',
    startDate: '15/06/2025',
    endDate: '19/06/2025',
    duration: 5,
    location: 'Paris, Client ABC'
  },
  {
    id: '2',
    article: 'Paramétrage Paie',
    consultant: 'Marie Lefebvre',
    mode: 'À distance',
    startDate: '22/06/2025',
    endDate: '03/07/2025',
    duration: 10
  },
  {
    id: '3',
    article: 'Reprise de données',
    consultant: 'Sophie Martin',
    mode: 'À distance',
    startDate: '06/07/2025',
    endDate: '10/07/2025',
    duration: 5
  },
  {
    id: '4',
    article: 'Formation utilisateurs',
    consultant: 'Lucas Bernard',
    mode: 'Hybride',
    startDate: '13/07/2025',
    endDate: '17/07/2025',
    duration: 5,
    location: 'Paris, Client ABC (J1-J2)'
  },
  {
    id: '5',
    article: 'Formation administrateurs',
    consultant: 'Marie Lefebvre',
    mode: 'Sur site',
    startDate: '20/07/2025',
    endDate: '22/07/2025',
    duration: 3,
    location: 'Paris, Client ABC'
  }
];

interface GeneratePlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneratePlanningModal({ isOpen, onClose }: GeneratePlanningModalProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleExportPDF = () => {
    setToastMessage('Planning exporté en PDF');
    setShowToast(true);
  };

  const handleExportExcel = () => {
    setToastMessage('Planning exporté en Excel');
    setShowToast(true);
  };

  const getModeColor = (mode: PlanningItem['mode']) => {
    switch (mode) {
      case 'Sur site':
        return 'bg-blue-100 text-blue-700';
      case 'À distance':
        return 'bg-green-100 text-green-700';
      case 'Hybride':
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Planning détaillé des interventions">
        <div className="space-y-4">
          {/* Project Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Projet</div>
                <div className="text-gray-900">Client ABC - Implémentation SIRH</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Période</div>
                <div className="text-gray-900">15/06/2025 - 30/09/2025</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Jours vendus</div>
                <div className="text-gray-900">35 jours</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Consultants</div>
                <div className="text-gray-900">3 consultants</div>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Exporter en PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter en Excel</span>
            </button>
          </div>

          {/* Planning Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Prestation</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Consultant</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Mode</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Dates</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Durée</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Lieu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockPlanning.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs">
                            {idx + 1}
                          </div>
                          <span className="text-sm text-gray-900">{item.article}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.consultant}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${getModeColor(item.mode)}`}>
                          {item.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {item.startDate} - {item.endDate}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.duration} j
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.location || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {mockPlanning.reduce((sum, item) => sum + item.duration, 0)} j
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              💡 Ce planning a été généré automatiquement en tenant compte du séquençage des prestations et de la disponibilité des consultants.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                setToastMessage('Planning enregistré');
                setShowToast(true);
                setTimeout(() => onClose(), 1500);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer le planning
            </button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
