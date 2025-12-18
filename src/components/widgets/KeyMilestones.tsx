import { Flag, CheckCircle, Circle, Mail } from 'lucide-react';
import { useState } from 'react';
import { ManageMilestonesModal } from '../modals/ManageMilestonesModal';

export function KeyMilestones() {
  const [showManage, setShowManage] = useState(false);

  const milestones = [
    {
      name: 'MOM',
      fullName: 'Mise en œuvre',
      date: '20/06/2025',
      status: 'completed',
      letterStatus: 'sent',
    },
    {
      name: 'VA',
      fullName: 'Validation',
      date: '15/09/2025',
      status: 'planned',
      letterStatus: 'generated',
    },
    {
      name: 'VSR',
      fullName: 'Vérification Service Régulier',
      date: '30/09/2025',
      status: 'planned',
      letterStatus: 'pending',
    },
  ];

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flag className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900">Jalons clés (MOM / VA / VSR)</h2>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative pl-12">
              <div className="absolute left-0 top-1">
                {milestone.status === 'completed' ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{milestone.name}</span>
                      <span className="text-gray-500 text-sm">– {milestone.fullName}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {milestone.status === 'completed' ? 'Terminé le' : 'Prévu le'} {milestone.date}
                    </p>
                  </div>
                  
                  {milestone.letterStatus !== 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          milestone.letterStatus === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {milestone.letterStatus === 'sent' ? 'Envoyé' : 'Généré'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => setShowManage(true)}
          className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Gérer les jalons
        </button>
      </div>
    </div>

    <ManageMilestonesModal isOpen={showManage} onClose={() => setShowManage(false)} />
    </>
  );
}