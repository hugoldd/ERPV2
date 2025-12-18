import { Calendar, Video, MapPin } from 'lucide-react';
import { useState } from 'react';
import { ManageInterventionsModal } from '../modals/ManageInterventionsModal';

export function UpcomingInterventions() {
  const [showManage, setShowManage] = useState(false);

  const interventions = [
    {
      date: '12 Déc',
      time: '09:00 - 12:00',
      type: 'distance',
      name: 'Formation administrateurs',
      location: 'Teams',
    },
    {
      date: '13 Déc',
      time: '14:00 - 17:00',
      type: 'onsite',
      name: 'Reprise de données',
      location: 'Paris - Siège',
    },
    {
      date: '15 Déc',
      time: '10:00 - 11:30',
      type: 'distance',
      name: 'Point d\'avancement',
      location: 'Teams',
    },
    {
      date: '18 Déc',
      time: 'Toute la journée',
      type: 'onsite',
      name: 'Formation utilisateurs',
      location: 'Lyon - Agence Sud',
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-gray-900">Interventions à venir (7 jours)</h2>
        </div>
        
        <div className="space-y-3">
          {interventions.map((intervention, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-center min-w-[60px]">
                  <div className="text-blue-600">{intervention.date}</div>
                  <div className="text-gray-600 text-sm">{intervention.time}</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-900">{intervention.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        intervention.type === 'distance'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {intervention.type === 'distance' ? 'À distance' : 'Sur site'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    {intervention.type === 'distance' ? (
                      <>
                        <Video className="w-4 h-4" />
                        <button className="text-blue-600 hover:underline">
                          Lien {intervention.location}
                        </button>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>{intervention.location}</span>
                      </>
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
            Voir tout le planning
          </button>
        </div>
      </div>

      <ManageInterventionsModal isOpen={showManage} onClose={() => setShowManage(false)} />
    </>
  );
}