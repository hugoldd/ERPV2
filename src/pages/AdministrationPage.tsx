import { useState } from 'react';
import { Package, Workflow, Settings as SettingsIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { ManageProjectTemplateModal } from '../components/modals/ManageProjectTemplateModal';
import { SequencingModal } from '../components/modals/SequencingModal';
import { Toast } from '../components/Toast';
import type { ProjectTemplate } from "../types/projectTemplate";



const mockTemplates: ProjectTemplate[] = [
  {
    id: '1',
    name: 'Pack SIRH Paie Standard',
    description: 'Installation et paramétrage standard du module Paie',
    type: 'Packagé',
    articles: ['Installation SIRH Paie', 'Paramétrage Paie', 'Formation utilisateurs'],
    estimatedDuration: 30,
    estimatedDays: 15
  },
  {
    id: '2',
    name: 'Pack SIGF Déploiement simple',
    description: 'Déploiement rapide du système de gestion financière',
    type: 'Packagé',
    articles: ['Installation SIGF', 'Paramétrage SIGF Standard', 'Formation administrateurs'],
    estimatedDuration: 45,
    estimatedDays: 20
  },
  {
    id: '3',
    name: 'Pack GTA Complet',
    description: 'Implémentation complète de la gestion des temps',
    type: 'Packagé',
    articles: ['Installation GTA', 'Paramétrage avancé', 'Formation utilisateurs', 'Formation administrateurs'],
    estimatedDuration: 60,
    estimatedDays: 25
  }
];

export function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'sequencing' | 'settings'>('templates');
  const [templates, setTemplates] = useState<ProjectTemplate[]>(mockTemplates);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | undefined>();
  const [showSequencing, setShowSequencing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAddTemplate = (newTemplate: Omit<ProjectTemplate, 'id'>) => {
    const template: ProjectTemplate = {
      ...newTemplate,
      id: Date.now().toString()
    };
    setTemplates([...templates, template]);
    setToastMessage('Modèle de projet créé');
    setShowToast(true);
  };

  const handleEditTemplate = (updatedTemplate: Omit<ProjectTemplate, 'id'>) => {
    if (editingTemplate) {
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id ? { ...updatedTemplate, id: editingTemplate.id } : t
      ));
      setToastMessage('Modèle de projet mis à jour');
      setShowToast(true);
      setEditingTemplate(undefined);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      setTemplates(templates.filter(t => t.id !== id));
      setToastMessage('Modèle supprimé');
      setShowToast(true);
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Projets packagés</span>
          </button>
          <button
            onClick={() => setActiveTab('sequencing')}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === 'sequencing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Workflow className="w-5 h-5" />
            <span>Séquençage des prestations</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Paramètres généraux</span>
          </button>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-gray-900 mb-2">Modèles de projets packagés</h2>
              <p className="text-gray-600">
                Configurez des modèles de projet réutilisables avec leurs articles associés
              </p>
            </div>
            <button
              onClick={() => setShowAddTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau modèle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        template.type === 'Packagé'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{template.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Articles inclus</div>
                    <div className="flex flex-wrap gap-2">
                      {template.articles.map((article, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {article}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Durée estimée</div>
                      <div className="text-gray-900">{template.estimatedDuration} jours</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Jours vendus</div>
                      <div className="text-gray-900">{template.estimatedDays} jours</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">Aucun modèle de projet configuré</div>
            </div>
          )}
        </div>
      )}

      {/* Sequencing Tab */}
      {activeTab === 'sequencing' && (
        <div>
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">Séquençage des prestations</h2>
            <p className="text-gray-600">
              Définissez les dépendances entre les prestations pour automatiser la création des plannings
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">Configuration du séquençage</h3>
            <p className="text-gray-600 mb-6">
              Configurez l'ordre et les dépendances entre les différentes prestations
            </p>
            <button
              onClick={() => setShowSequencing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configurer le séquençage
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">Paramètres généraux</h2>
            <p className="text-gray-600">
              Configuration globale de l'application
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-700">Alertes d'écart de charge</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-700">Rappels de validations client</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-700">Notifications d'interventions à venir</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-900 mb-4">Préférences d'affichage</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Langue
                  </label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ManageProjectTemplateModal
        isOpen={showAddTemplate}
        onClose={() => setShowAddTemplate(false)}
        onSave={handleAddTemplate}
      />

      {editingTemplate && (
        <ManageProjectTemplateModal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(undefined)}
          onSave={handleEditTemplate}
          template={editingTemplate}
        />
      )}

      <SequencingModal
        isOpen={showSequencing}
        onClose={() => setShowSequencing(false)}
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
