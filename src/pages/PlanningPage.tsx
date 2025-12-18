import { Calendar } from 'lucide-react';

export function PlanningPage() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-gray-900 mb-2">Planning des interventions</h2>
        <p className="text-gray-600 mb-6">
          Vue d'ensemble des interventions planifiées pour tous les projets
        </p>
        <div className="text-sm text-gray-500">
          Cette vue sera prochainement disponible avec un calendrier interactif
        </div>
      </div>
    </div>
  );
}
