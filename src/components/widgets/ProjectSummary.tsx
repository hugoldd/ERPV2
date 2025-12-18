import { Calendar, TrendingUp, Users, FileText } from 'lucide-react';
import { useState } from 'react';
import { ProjectDetailModal } from '../modals/ProjectDetailModal';
import { SuggestResourcesModal } from '../modals/SuggestResourcesModal';
import { GeneratePlanningModal } from '../modals/GeneratePlanningModal';

export function ProjectSummary() {
  const [showDetails, setShowDetails] = useState(false);
  const [showSuggestResources, setShowSuggestResources] = useState(false);
  const [showGeneratePlanning, setShowGeneratePlanning] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-gray-900 mb-1">Projet – Client ABC</h2>
            <p className="text-gray-600 text-sm">Type : Packagé</p>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            À risque
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Jours vendus */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900 text-sm">Jours vendus</span>
            </div>
            <div className="text-blue-900">35</div>
          </div>
          
          {/* Jours consommés */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-orange-900 text-sm">Jours consommés</span>
            </div>
            <div className="text-orange-900">18</div>
            <div className="mt-1">
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '51%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Jours restants */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-green-900 text-sm">Jours restants</span>
            </div>
            <div className="text-green-900">17</div>
            <p className="text-green-700 text-sm mt-1">49% disponible</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 text-sm">Date de début : 15/06/2025</div>
            <div className="text-gray-600 text-sm">Date de fin prévue : 30/09/2025</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button 
            onClick={() => setShowDetails(true)}
            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Voir le projet complet
          </button>
          <button 
            onClick={() => setShowSuggestResources(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Suggérer ressources</span>
          </button>
          <button 
            onClick={() => setShowGeneratePlanning(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Générer planning</span>
          </button>
        </div>
      </div>

      <ProjectDetailModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
      <SuggestResourcesModal isOpen={showSuggestResources} onClose={() => setShowSuggestResources(false)} />
      <GeneratePlanningModal isOpen={showGeneratePlanning} onClose={() => setShowGeneratePlanning(false)} />
    </>
  );
}
