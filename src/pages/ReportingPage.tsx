import { BarChart3 } from 'lucide-react';

export function ReportingPage() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-gray-900 mb-2">Reporting et analyses</h2>
        <p className="text-gray-600 mb-6">
          Tableaux de bord et indicateurs de performance des projets
        </p>
        <div className="text-sm text-gray-500">
          Les rapports détaillés seront prochainement disponibles
        </div>
      </div>
    </div>
  );
}
