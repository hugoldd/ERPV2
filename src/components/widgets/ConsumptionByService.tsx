import { Activity } from 'lucide-react';
import { useState } from 'react';
import { ServiceDetailsModal } from '../modals/ServiceDetailsModal';

export function ConsumptionByService() {
  const [showDetails, setShowDetails] = useState(false);

  const services = [
    {
      name: 'Installation',
      service: 'Service Technique',
      consumed: 5,
      total: 8,
      status: 'good', // <75%
    },
    {
      name: 'Paramétrage SIRH',
      service: 'Service SIRH',
      consumed: 10,
      total: 15,
      status: 'warning', // 75-90%
    },
    {
      name: 'Formation',
      service: 'Service Formation',
      consumed: 3,
      total: 6,
      status: 'good',
    },
    {
      name: 'Reprise de données',
      service: 'Service Data',
      consumed: 0,
      total: 6,
      status: 'good',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPercentage = (consumed: number, total: number) => {
    return Math.round((consumed / total) * 100);
  };

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900">Consommation par prestation / service</h2>
      </div>
      
      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}></div>
                  <span className="text-gray-900">{service.name}</span>
                </div>
                <p className="text-gray-500 text-sm ml-4">{service.service}</p>
              </div>
              <div className="text-gray-900">
                {service.consumed} / {service.total} j
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 ml-4">
              <div
                className={`h-2 rounded-full ${getStatusColor(service.status)}`}
                style={{ width: `${getPercentage(service.consumed, service.total)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => setShowDetails(true)}
          className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Détails par prestation
        </button>
      </div>
    </div>

    <ServiceDetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}