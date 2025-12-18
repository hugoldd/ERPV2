import { useState } from 'react';
import { Settings } from 'lucide-react';
import { ProjectSummary } from '../components/widgets/ProjectSummary';
import { ConsumptionByService } from '../components/widgets/ConsumptionByService';
import { ClientPrerequisites } from '../components/widgets/ClientPrerequisites';
import { UpcomingInterventions } from '../components/widgets/UpcomingInterventions';
import { ClientValidations } from '../components/widgets/ClientValidations';
import { WorkloadAlerts } from '../components/widgets/WorkloadAlerts';
import { KeyMilestones } from '../components/widgets/KeyMilestones';
import { RecentDocuments } from '../components/widgets/RecentDocuments';
import { CustomizeDashboardModal } from '../components/modals/CustomizeDashboardModal';

export function PortfolioPage() {
  const [showCustomize, setShowCustomize] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState([
    { id: 'summary', component: ProjectSummary, enabled: true, order: 0, colSpan: 'xl:col-span-2' },
    { id: 'prerequisites', component: ClientPrerequisites, enabled: true, order: 1, colSpan: '' },
    { id: 'consumption', component: ConsumptionByService, enabled: true, order: 2, colSpan: '' },
    { id: 'interventions', component: UpcomingInterventions, enabled: true, order: 3, colSpan: '' },
    { id: 'validations', component: ClientValidations, enabled: true, order: 4, colSpan: '' },
    { id: 'alerts', component: WorkloadAlerts, enabled: true, order: 5, colSpan: 'lg:col-span-2' },
    { id: 'milestones', component: KeyMilestones, enabled: true, order: 6, colSpan: '' },
    { id: 'documents', component: RecentDocuments, enabled: true, order: 7, colSpan: 'lg:col-span-2 xl:col-span-3' },
  ]);

  const handleConfigSave = (newConfig: typeof widgetConfig) => {
    setWidgetConfig(newConfig);
  };

  const enabledWidgets = widgetConfig
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="p-6">
      {/* Dashboard Customization Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowCustomize(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Personnaliser le tableau de bord</span>
        </button>
      </div>

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {enabledWidgets.map((widget) => {
          const Widget = widget.component;
          return (
            <div key={widget.id} className={widget.colSpan}>
              <Widget />
            </div>
          );
        })}
      </div>

      <CustomizeDashboardModal
        isOpen={showCustomize}
        onClose={() => setShowCustomize(false)}
        config={widgetConfig}
        onSave={handleConfigSave}
      />
    </div>
  );
}
