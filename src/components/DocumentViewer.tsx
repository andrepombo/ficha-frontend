import { useState } from 'react';
import { FileText, Image as ImageIcon, Download, Eye, X } from 'lucide-react';

interface DocumentViewerProps {
  resume?: string;
  photo?: string;
  candidateName: string;
}

function DocumentViewer({ resume, photo, candidateName }: DocumentViewerProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const getResumeUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const hasDocuments = resume || photo;

  if (!hasDocuments) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
        </div>
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-3xl mx-auto mb-4">
            📄
          </div>
          <p className="text-gray-500 text-lg">Nenhum documento enviado</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Section */}
          {resume && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Currículo</h3>
                  <p className="text-sm text-gray-600">Documento</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={getResumeUrl(resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm"
                >
                  <Eye className="w-5 h-5" />
                  Visualizar
                </a>
                <a
                  href={getResumeUrl(resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Baixar
                </a>
              </div>
            </div>
          )}

          {/* Photo Section */}
          {photo && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Foto do Candidato</h3>
                  <p className="text-sm text-gray-600">Imagem</p>
                </div>
              </div>

              {/* Photo Preview Thumbnail */}
              <div className="mb-4">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                  <img
                    src={photo.startsWith('http') ? photo : `http://localhost:8000${photo}`}
                    alt={candidateName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium shadow-sm"
                >
                  <Eye className="w-5 h-5" />
                  Ampliar
                </button>
                <a
                  href={photo.startsWith('http') ? photo : `http://localhost:8000${photo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Baixar
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && photo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Foto - {candidateName}</h3>
              <div className="flex items-center justify-center">
                <img
                  src={photo.startsWith('http') ? photo : `http://localhost:8000${photo}`}
                  alt={candidateName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentViewer;
