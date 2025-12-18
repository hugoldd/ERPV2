import { useState } from 'react';
import { Modal } from './Modal';
import { Plus, X } from 'lucide-react';
import { Toast } from '../Toast';
import type { ProjectTemplate } from "../../types/projectTemplate";


interface ManageProjectTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<ProjectTemplate, 'id'>) => void;
  template?: ProjectTemplate;
}

const availableArticles = [
  'Installation SIRH Paie',
  'Installation GTA',
  'Installation SIGF',
  'Paramétrage Paie',
  'Paramétrage GTA',
  'Paramétrage SIGF Standard',
  'Paramétrage avancé',
  'Formation utilisateurs',
  'Formation administrateurs',
  'Reprise de données',
  'Migration données'
];

export function ManageProjectTemplateModal({ isOpen, onClose, onSave, template }: ManageProjectTemplateModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [type, setType] = useState<ProjectTemplate['type']>(template?.type || 'Packagé');
  const [articles, setArticles] = useState<string[]>(template?.articles || []);
  const [selectedArticle, setSelectedArticle] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(template?.estimatedDuration || 30);
  const [estimatedDays, setEstimatedDays] = useState(template?.estimatedDays || 15);
  const [showToast, setShowToast] = useState(false);

  const handleAddArticle = () => {
    if (selectedArticle && !articles.includes(selectedArticle)) {
      setArticles([...articles, selectedArticle]);
      setSelectedArticle('');
    }
  };

  const handleRemoveArticle = (article: string) => {
    setArticles(articles.filter(a => a !== article));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      description,
      type,
      articles,
      estimatedDuration,
      estimatedDays
    });

    setShowToast(true);
    setTimeout(() => {
      onClose();
      if (!template) {
        setName('');
        setDescription('');
        setType('Packagé');
        setArticles([]);
        setEstimatedDuration(30);
        setEstimatedDays(15);
      }
    }, 1000);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={template ? 'Modifier le modèle de projet' : 'Créer un modèle de projet'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nom du modèle *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pack SIRH Paie Standard"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du modèle de projet..."
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Type de projet *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Packagé"
                  checked={type === 'Packagé'}
                  onChange={(e) => setType(e.target.value as ProjectTemplate['type'])}
                  className="text-blue-600"
                />
                <span className="text-gray-700">Packagé</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Sur-mesure"
                  checked={type === 'Sur-mesure'}
                  onChange={(e) => setType(e.target.value as ProjectTemplate['type'])}
                  className="text-blue-600"
                />
                <span className="text-gray-700">Sur-mesure</span>
              </label>
            </div>
          </div>

          {/* Articles */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Articles inclus *
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedArticle}
                onChange={(e) => setSelectedArticle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un article</option>
                {availableArticles
                  .filter(a => !articles.includes(a))
                  .map(article => (
                    <option key={article} value={article}>{article}</option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddArticle}
                disabled={!selectedArticle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {articles.map((article, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{article}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveArticle(article)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Duration & Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Durée estimée (jours calendaires) *
              </label>
              <input
                type="number"
                min="1"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Jours vendus *
              </label>
              <input
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {template ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={template ? 'Modèle mis à jour' : 'Modèle créé avec succès'}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
