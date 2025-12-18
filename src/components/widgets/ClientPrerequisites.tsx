import { AlertCircle, CheckCircle, Database, Key } from 'lucide-react';
import { useState } from 'react';
import { ManagePrerequisitesModal } from '../modals/ManagePrerequisitesModal';

export function ClientPrerequisites() {
  const [showManage, setShowManage] = useState(false);

  const prerequisites = [
    {
      name: 'Dump de données paie',
      status: 'missing',
      deadline: 'J-10',
      critical: true,
      icon: Database,
    },
    {
      name: 'Accès VPN',
      status: 'received',
      deadline: 'Validé',
      critical: false,
      icon: Key,
    },
    {
      name: 'Liste des administrateurs',
      status: 'received',
      deadline: 'Validé',
      critical: false,
      icon: CheckCircle,
    },
  ];

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900">Prérequis en attente</h2>
      </div>
      
      <div className="space-y-3">
        {prerequisites.map((prereq, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              prereq.status === 'missing'
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <prereq.icon
                className={`w-5 h-5 mt-0.5 ${
                  prereq.status === 'missing' ? 'text-red-600' : 'text-green-600'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-gray-900">{prereq.name}</div>
                    <p
                      className={`text-sm mt-1 ${
                        prereq.status === 'missing' ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      Statut : {prereq.status === 'missing' ? 'Non reçu' : 'Reçu'} – Échéance{' '}
                      {prereq.deadline}
                    </p>
                  </div>
                  {prereq.critical && (
                    <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                      Bloquant
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => setShowManage(true)}
          className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Gérer les prérequis
        </button>
      </div>
    </div>

    <ManagePrerequisitesModal isOpen={showManage} onClose={() => setShowManage(false)} />
    </>
  );
}