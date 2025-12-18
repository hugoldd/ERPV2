import { Modal } from './Modal';
import { FileText, Download, Share2, Trash2 } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
}

export function DocumentViewerModal({ isOpen, onClose, documentName }: DocumentViewerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={documentName} size="xl">
      <div className="space-y-6">
        {/* Document Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Type</span>
              <div className="text-gray-900 mt-1">PDF</div>
            </div>
            <div>
              <span className="text-gray-600">Taille</span>
              <div className="text-gray-900 mt-1">2.4 MB</div>
            </div>
            <div>
              <span className="text-gray-600">Créé le</span>
              <div className="text-gray-900 mt-1">03/09/2025</div>
            </div>
            <div>
              <span className="text-gray-600">Créé par</span>
              <div className="text-gray-900 mt-1">Jean Dupont</div>
            </div>
          </div>
        </div>

        {/* Document Preview Placeholder */}
        <div className="bg-gray-100 rounded-lg p-12 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center mb-2">Aperçu du document</p>
          <p className="text-gray-500 text-sm text-center">
            Le visualiseur de documents serait affiché ici
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
}
