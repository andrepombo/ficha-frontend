import { useState } from 'react';
import { FileText, Image as ImageIcon, Download, Eye, X } from 'lucide-react';

interface DocumentViewerProps {
  resume?: string;
  photo?: string;
  candidateName: string;
  candidateId: number;
}

function DocumentViewer({ resume, photo, candidateName, candidateId }: DocumentViewerProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  const getResumeUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const getDocumentViewerUrl = (docType: 'resume' | 'photo') => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('access_token');
    return `http://localhost:8000/api/candidates/${candidateId}/view-document/${docType}/?token=${token}`;
  };

  const isPdfFile = (url: string) => {
    return url?.toLowerCase().endsWith('.pdf');
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
                {isPdfFile(resume) ? (
                  <button
                    onClick={() => {
                      setIframeLoading(true);
                      setIframeError(false);
                      setShowResumeModal(true);
                    }}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm"
                  >
                    <Eye className="w-5 h-5" />
                    Visualizar
                  </button>
                ) : (
                  <a
                    href={getResumeUrl(resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm"
                  >
                    <Eye className="w-5 h-5" />
                    Visualizar
                  </a>
                )}
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

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium shadow-sm"
                >
                  <Eye className="w-5 h-5" />
                  Visualizar
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

      {/* Resume Preview Modal (PDF) */}
      {showResumeModal && resume && isPdfFile(resume) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-6xl w-full h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-2xl font-bold text-gray-900">Currículo - {candidateName}</h3>
              <button
                onClick={() => setShowResumeModal(false)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-md"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100 relative">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando documento...</p>
                  </div>
                </div>
              )}
              {iframeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center p-8">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar documento</h4>
                    <p className="text-gray-600 mb-6">Não foi possível exibir o documento no visualizador.</p>
                    <a
                      href={getResumeUrl(resume)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                    >
                      <Eye className="w-5 h-5" />
                      Abrir em nova aba
                    </a>
                  </div>
                </div>
              )}
              <iframe
                src={getDocumentViewerUrl('resume')}
                className="w-full h-full border-0"
                title="Resume Preview"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

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
