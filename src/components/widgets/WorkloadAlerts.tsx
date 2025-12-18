import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export function WorkloadAlerts() {
  const internalAlerts = [
    {
      description: 'Paramétrage additionnel module RH',
      days: 3,
      status: 'toqualify',
    },
    {
      description: 'Correction bug migration données',
      days: 2,
      status: 'toqualify',
    },
  ];

  const clientAlerts = [
    {
      description: 'Formation supplémentaire demandée',
      days: 5,
      status: 'amendment',
    },
    {
      description: 'Développement spécifique reporting',
      days: 8,
      status: 'amendment',
    },
    {
      description: 'Extension périmètre paie',
      days: 12,
      status: 'closed',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'toqualify':
        return { text: 'À qualifier', className: 'bg-yellow-100 text-yellow-700' };
      case 'amendment':
        return { text: 'Avenant en cours', className: 'bg-blue-100 text-blue-700' };
      case 'closed':
        return { text: 'Clos', className: 'bg-green-100 text-green-700' };
      default:
        return { text: 'Inconnu', className: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900">Écarts de charge</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Internal Origin */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <h3 className="text-gray-900">Origine interne</h3>
            <span className="text-gray-500 text-sm">(jours ajoutés non facturables)</span>
          </div>
          
          <div className="space-y-3">
            {internalAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-gray-900 text-sm">{alert.description}</span>
                  <span className="text-orange-700 ml-2 whitespace-nowrap">
                    +{alert.days}j
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    getStatusBadge(alert.status).className
                  }`}
                >
                  {getStatusBadge(alert.status).text}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Client Origin */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-gray-900">Origine client</h3>
            <span className="text-gray-500 text-sm">(jours en attente d'avenant)</span>
          </div>
          
          <div className="space-y-3">
            {clientAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-gray-900 text-sm">{alert.description}</span>
                  <span className="text-blue-700 ml-2 whitespace-nowrap">
                    +{alert.days}j
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    getStatusBadge(alert.status).className
                  }`}
                >
                  {getStatusBadge(alert.status).text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">
            Total écarts non facturables : <span className="text-orange-600">5 jours</span>
          </div>
          <div className="text-gray-600 text-sm">
            Total en attente d'avenant : <span className="text-blue-600">13 jours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
