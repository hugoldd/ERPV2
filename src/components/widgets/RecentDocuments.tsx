import { FileText, Download, File } from 'lucide-react';
import { useState } from 'react';
import { DocumentViewerModal } from '../modals/DocumentViewerModal';

export function RecentDocuments() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const documents = [
    {
      name: 'CR COPIL 03/09',
      type: 'PDF',
      date: '03/09/2025',
      size: '2.4 MB',
      icon: FileText,
    },
    {
      name: 'Guide d\'utilisation module Paie',
      type: 'PDF',
      date: '28/08/2025',
      size: '5.1 MB',
      icon: FileText,
    },
    {
      name: 'Courrier VA',
      type: 'DOCX',
      date: '25/08/2025',
      size: '156 KB',
      icon: File,
    },
    {
      name: 'Cahier de recette Formation',
      type: 'PDF',
      date: '20/08/2025',
      size: '1.8 MB',
      icon: FileText,
    },
    {
      name: 'Planning détaillé projet',
      type: 'XLSX',
      date: '15/08/2025',
      size: '324 KB',
      icon: File,
    },
  ];

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-700" />
        <h2 className="text-gray-900">Derniers documents</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            onClick={() => setSelectedDocument(doc.name)}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <doc.icon className="w-8 h-8 text-blue-600" />
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded">
                <Download className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            
            <div className="space-y-1">
              <div className="text-gray-900 text-sm line-clamp-2">{doc.name}</div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {doc.type}
                </span>
                <span className="text-gray-500 text-xs">{doc.size}</span>
              </div>
              <p className="text-gray-500 text-xs">{doc.date}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Voir tous les documents
        </button>
      </div>
    </div>

    {selectedDocument && (
      <DocumentViewerModal 
        isOpen={true} 
        onClose={() => setSelectedDocument(null)} 
        documentName={selectedDocument}
      />
    )}
    </>
  );
}