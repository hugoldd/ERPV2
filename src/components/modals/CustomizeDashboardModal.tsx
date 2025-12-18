import { useState } from 'react';
import { Modal } from './Modal';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { Toast } from '../Toast';

interface WidgetConfig {
  id: string;
  component: any;
  enabled: boolean;
  order: number;
  colSpan: string;
}

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetConfig[];
  onSave: (config: WidgetConfig[]) => void;
}

const widgetLabels: Record<string, string> = {
  summary: 'Résumé du projet',
  prerequisites: 'Prérequis client',
  consumption: 'Consommation par prestation',
  interventions: 'Interventions à venir',
  validations: 'Validations client en attente',
  alerts: 'Écarts de charge',
  milestones: 'Jalons clés',
  documents: 'Documents récents'
};

export function CustomizeDashboardModal({ isOpen, onClose, config, onSave }: CustomizeDashboardModalProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [showToast, setShowToast] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleToggle = (id: string) => {
    setLocalConfig(prev => 
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const items = [...localConfig];
    const draggedItemContent = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedItemContent);
    
    // Update orders
    const updatedItems = items.map((item, idx) => ({ ...item, order: idx }));
    setLocalConfig(updatedItems);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSave = () => {
    onSave(localConfig);
    setShowToast(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Personnaliser le tableau de bord">
        <div className="space-y-4">
          <p className="text-gray-600">
            Activez ou désactivez les widgets et réorganisez-les par glisser-déposer.
          </p>

          <div className="space-y-2">
            {localConfig
              .sort((a, b) => a.order - b.order)
              .map((widget, index) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 bg-white border rounded-lg cursor-move transition-all ${
                    draggedItem === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="flex-1 text-gray-900">
                    {widgetLabels[widget.id] || widget.id}
                  </span>
                  <button
                    onClick={() => handleToggle(widget.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      widget.enabled
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {widget.enabled ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm">Masqué</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <Toast
          message="Configuration enregistrée"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
