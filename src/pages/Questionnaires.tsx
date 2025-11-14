import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import QuestionnaireBuilder from '../components/questionnaires/QuestionnaireBuilder';
import QuestionnaireAnalytics from '../components/questionnaires/QuestionnaireAnalytics';
import { questionnaireApi } from '../services/api';

interface QuestionnaireTemplate {
  id: number;
  position_key: string;
  title: string;
  version: number;
  is_active: boolean;
  total_points: number;
  created_at: string;
  updated_at: string;
  questions: any[];
}

function Questionnaires() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await questionnaireApi.getTemplates();
      // Handle both paginated and non-paginated responses
      const templatesList = Array.isArray(data) 
        ? data 
        : ((data as any)?.results || []);
      setTemplates(templatesList);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setShowBuilder(true);
  };

  const handleEdit = (template: QuestionnaireTemplate) => {
    setSelectedTemplate(template);
    setShowBuilder(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este questionário?')) return;

    try {
      await questionnaireApi.deleteTemplate(id);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Erro ao excluir questionário');
    }
  };

  const handleToggleActive = async (template: QuestionnaireTemplate) => {
    try {
      if (template.is_active) {
        await questionnaireApi.deactivateTemplate(template.id);
      } else {
        await questionnaireApi.activateTemplate(template.id);
      }
      await loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      alert('Erro ao ativar/desativar questionário');
    }
  };

  const handleViewAnalytics = (template: QuestionnaireTemplate) => {
    setSelectedTemplate(template);
    setShowAnalytics(true);
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  const handleAnalyticsClose = () => {
    setShowAnalytics(false);
    setSelectedTemplate(null);
  };

  const filteredTemplates = filterPosition
    ? templates.filter(t => t.position_key.toLowerCase().includes(filterPosition.toLowerCase()))
    : templates;

  const positions = Array.from(new Set(templates.map(t => t.position_key)));

  if (showBuilder) {
    return (
      <QuestionnaireBuilder
        template={selectedTemplate}
        onClose={handleBuilderClose}
      />
    );
  }

  if (showAnalytics && selectedTemplate) {
    return (
      <QuestionnaireAnalytics
        template={selectedTemplate}
        onClose={handleAnalyticsClose}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionários</h1>
          <p className="text-gray-600 mt-1">
            Gerencie questionários por posição com perguntas de múltipla escolha
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Questionário
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Posição
            </label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todas as posições</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{filteredTemplates.length}</span>
            questionário(s)
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum questionário encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro questionário para começar
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Criar Questionário
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template.position_key}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {template.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        <CheckCircle className="w-3 h-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        <XCircle className="w-3 h-3" />
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Questões</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {template.questions?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pontos</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {template.total_points || 0}
                    </p>
                  </div>
                </div>

                {/* Version */}
                <div className="mb-4">
                  <span className="text-xs text-gray-500">
                    Versão {template.version}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleViewAnalytics(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      template.is_active
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {template.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Questionnaires;
