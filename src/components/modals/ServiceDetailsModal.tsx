import { Modal } from './Modal';
import { Activity, User, Clock } from 'lucide-react';

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailsModal({ isOpen, onClose }: ServiceDetailsModalProps) {
  const services = [
    {
      name: 'Installation',
      service: 'Service Technique',
      allocated: 8,
      consumed: 5,
      interventions: [
        { date: '20/06/2025', duration: 2, consultant: 'Pierre Martin', type: 'Installation serveurs' },
        { date: '22/06/2025', duration: 3, consultant: 'Sophie Leroy', type: 'Configuration réseau' },
      ],
    },
    {
      name: 'Paramétrage SIRH',
      service: 'Service SIRH',
      allocated: 15,
      consumed: 10,
      interventions: [
        { date: '25/06/2025', duration: 4, consultant: 'Marc Dubois', type: 'Paramétrage modules' },
        { date: '28/06/2025', duration: 3, consultant: 'Marc Dubois', type: 'Configuration workflow' },
        { date: '02/07/2025', duration: 3, consultant: 'Claire Bernard', type: 'Tests paramétrages' },
      ],
    },
    {
      name: 'Formation',
      service: 'Service Formation',
      allocated: 6,
      consumed: 3,
      interventions: [
        { date: '12/12/2025', duration: 3, consultant: 'Julie Rousseau', type: 'Formation administrateurs' },
      ],
    },
    {
      name: 'Reprise de données',
      service: 'Service Data',
      allocated: 6,
      consumed: 0,
      interventions: [],
    },
  ];

  const getPercentage = (consumed: number, allocated: number) => {
    return Math.round((consumed / allocated) * 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails par prestation / service" size="xl">
      <div className="space-y-6">
        {services.map((service, idx) => {
          const percentage = getPercentage(service.consumed, service.allocated);
          return (
            <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              {/* Service Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="text-gray-900">{service.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{service.service}</p>
                </div>
                <div className="text-right">
                  <div className="text-gray-900">
                    {service.consumed} / {service.allocated} jours
                  </div>
                  <div className={`text-sm ${percentage > 75 ? 'text-orange-600' : 'text-green-600'}`}>
                    {percentage}% consommé
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getStatusColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Interventions */}
              {service.interventions.length > 0 ? (
                <div>
                  <h4 className="text-gray-700 mb-3">Interventions réalisées</h4>
                  <div className="space-y-2">
                    {service.interventions.map((intervention, intIdx) => (
                      <div key={intIdx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-gray-900 text-sm">{intervention.type}</div>
                            <div className="text-gray-500 text-xs">{intervention.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 text-sm">{intervention.consultant}</span>
                          </div>
                          <span className="text-blue-600">{intervention.duration}j</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Aucune intervention réalisée pour le moment
                </div>
              )}

              {/* Remaining Days */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Jours restants</span>
                  <span className={`${service.allocated - service.consumed > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {service.allocated - service.consumed} jours
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
