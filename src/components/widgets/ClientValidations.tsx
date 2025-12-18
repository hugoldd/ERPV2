import { ClipboardCheck, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { ValidationDetailsModal } from '../modals/ValidationDetailsModal';

export function ClientValidations() {
  const [selectedValidation, setSelectedValidation] = useState<string | null>(null);

  const validations = [
    {
      name: 'Lot Formation',
      status: 'pending',
      days: 5,
      hasReserves: false,
    },
    {
      name: 'Reprise données RH',
      status: 'reserves',
      days: 3,
      hasReserves: true,
    },
    {
      name: 'Paramétrage module Paie',
      status: 'pending',
      days: 8,
      hasReserves: false,
    },
  ];

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900">Validations client en attente</h2>
      </div>
      
      <div className="space-y-3">
        {validations.map((validation, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-gray-900">{validation.name}</div>
                <p className="text-gray-600 text-sm mt-1">
                  {validation.hasReserves ? (
                    <span className="text-orange-600">Réserves émises</span>
                  ) : (
                    `Non validé depuis ${validation.days} jours`
                  )}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  validation.hasReserves
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {validation.hasReserves ? 'À revoir' : 'En attente'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedValidation(validation.name)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Voir le CR
              </button>
              <button 
                onClick={() => setSelectedValidation(validation.name)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
              >
                <Send className="w-4 h-4" />
                Relancer le client
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Toutes les validations
        </button>
      </div>
    </div>

    {selectedValidation && (
      <ValidationDetailsModal 
        isOpen={true} 
        onClose={() => setSelectedValidation(null)} 
        validationName={selectedValidation}
      />
    )}
    </>
  );
}