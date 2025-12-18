import { Plus, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ManageProjectModal } from './modals/ManageProjectModal';
import { Toast } from './Toast';
import type { NavigationPage } from '../App';

interface TopBarProps {
  currentPage: NavigationPage;
}

export function TopBar({ currentPage }: TopBarProps) {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleProjectCreated = () => {
    setShowToast(true);
  };

  const pageTitles: Record<NavigationPage, string> = {
    portfolio: 'Tableau de bord – Direction de projet',
    projects: 'Projets',
    planning: 'Planning des interventions',
    resources: 'Gestion des ressources',
    clients: 'Clients',
    competences: "Gestion des compétences",
    articles: 'Catalogue des articles',
    reporting: 'Reporting et analyses',
    administration: 'Administration et paramétrage'
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-gray-900">{pageTitles[currentPage]}</h1>
        </div>
        
        {/* Center Filters - Only show on portfolio page */}
        {currentPage === 'portfolio' && (
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Client ABC - Implémentation SIRH</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Project Type Badges */}
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors">
                Packagé
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors">
                Sur-mesure
              </button>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Cette semaine
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                30 jours
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                90 jours
              </button>
            </div>
          </div>
        )}
        
        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Create Project Button */}
          <button 
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un projet</span>
          </button>
          
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <ManageProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSaved={handleProjectCreated}
      />

      {showToast && (
        <Toast
          message="Projet créé avec succès"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
