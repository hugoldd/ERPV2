import { useState } from 'react';
import { Modal } from './Modal';
import { Plus, Edit, Trash2, Video, MapPin } from 'lucide-react';

interface ManageInterventionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageInterventionsModal({ isOpen, onClose }: ManageInterventionsModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'distance',
    location: '',
    teamsLink: '',
  });

  const interventions = [
    { id: 1, date: '12 Déc 2025', time: '09:00 - 12:00', type: 'distance', name: 'Formation administrateurs', location: 'Teams' },
    { id: 2, date: '13 Déc 2025', time: '14:00 - 17:00', type: 'onsite', name: 'Reprise de données', location: 'Paris - Siège' },
    { id: 3, date: '15 Déc 2025', time: '10:00 - 11:30', type: 'distance', name: 'Point d\'avancement', location: 'Teams' },
    { id: 4, date: '18 Déc 2025', time: 'Toute la journée', type: 'onsite', name: 'Formation utilisateurs', location: 'Lyon - Agence Sud' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle intervention:', formData);
    setShowAddForm(false);
    setFormData({
      name: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'distance',
      location: '',
      teamsLink: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les interventions" size="lg">
      <div className="space-y-6">
        {/* Add Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Planifier une intervention
          </button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-gray-900 mb-4">Nouvelle intervention</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nom de l'intervention</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ex: Formation administrateurs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Heure début</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Heure fin</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Type d'intervention</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="distance"
                      checked={formData.type === 'distance'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">À distance</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="onsite"
                      checked={formData.type === 'onsite'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Sur site</span>
                  </label>
                </div>
              </div>

              {formData.type === 'distance' ? (
                <div>
                  <label className="block text-gray-700 mb-2">Lien Teams</label>
                  <input
                    type="url"
                    value={formData.teamsLink}
                    onChange={(e) => setFormData({ ...formData, teamsLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="https://teams.microsoft.com/..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 mb-2">Lieu / Site client</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ex: Paris - Siège"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Interventions List */}
        <div>
          <h3 className="text-gray-900 mb-4">Interventions planifiées</h3>
          <div className="space-y-3">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{intervention.date}</span>
                      <span>{intervention.time}</span>
                      <div className="flex items-center gap-1">
                        {intervention.type === 'distance' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        <span>{intervention.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
