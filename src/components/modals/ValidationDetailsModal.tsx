import { Modal } from './Modal';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ValidationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationName: string;
}

export function ValidationDetailsModal({ isOpen, onClose, validationName }: ValidationDetailsModalProps) {
  const [emailSubject, setEmailSubject] = useState('Relance validation - ' + validationName);
  const [emailBody, setEmailBody] = useState(
    `Bonjour,\n\nNous souhaitons attirer votre attention sur la validation en attente concernant : ${validationName}.\n\nMerci de bien vouloir nous faire un retour dans les meilleurs délais.\n\nCordialement,\nJean Dupont\nChef de projet`
  );

  const handleSendReminder = () => {
    console.log('Relance envoyée:', { subject: emailSubject, body: emailBody });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Validation - ${validationName}`} size="lg">
      <div className="space-y-6">
        {/* Validation Status */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="w-6 h-6 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">Statut de la validation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Document envoyé le :</span>
                  <span className="text-gray-900">03/12/2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Délai de réponse :</span>
                  <span className="text-orange-600">5 jours écoulés</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Statut actuel :</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    En attente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Actions */}
        <div>
          <h3 className="text-gray-900 mb-4">Documents liés</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="text-gray-900">Compte-rendu {validationName}</div>
                  <div className="text-gray-500 text-sm">PDF - 1.2 MB</div>
                </div>
              </div>
              <span className="text-blue-600 text-sm">Télécharger</span>
            </button>
          </div>
        </div>

        {/* Email Reminder */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Envoyer une relance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Objet</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                rows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSendReminder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Envoyer la relance
            </button>
          </div>
        </div>

        {/* Mark as Validated */}
        <div className="border-t border-gray-200 pt-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <CheckCircle className="w-4 h-4" />
            Marquer comme validé
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
