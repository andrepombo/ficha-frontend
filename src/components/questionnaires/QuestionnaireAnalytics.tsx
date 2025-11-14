import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, Award, BarChart3 } from 'lucide-react';
import { questionnaireApi } from '../../services/api';

interface QuestionnaireTemplate {
  id: number;
  position_key: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: number;
  question_text: string;
  options: QuestionOption[];
}

interface QuestionOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface TemplateStats {
  total_responses: number;
  average_score: number;
  average_percentage: number;
}

interface OptionDistribution {
  option__id: number;
  option__option_text: string;
  option__is_correct: boolean;
  selection_count: number;
}

interface Props {
  template: QuestionnaireTemplate;
  onClose: () => void;
}

function QuestionnaireAnalytics({ template, onClose }: Props) {
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [optionDistribution, setOptionDistribution] = useState<OptionDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [template.id]);

  useEffect(() => {
    if (selectedQuestion) {
      loadOptionDistribution(selectedQuestion);
    }
  }, [selectedQuestion]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await questionnaireApi.getTemplateStats(template.id);
      setStats(data);
      
      // Select first question by default
      if (template.questions.length > 0) {
        setSelectedQuestion(template.questions[0].id);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptionDistribution = async (questionId: number) => {
    try {
      const data = await questionnaireApi.getOptionDistribution(questionId);
      setOptionDistribution(data);
    } catch (error) {
      console.error('Error loading option distribution:', error);
    }
  };

  const selectedQuestionData = template.questions.find(q => q.id === selectedQuestion);
  const maxSelections = Math.max(...optionDistribution.map(o => o.selection_count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            {template.title} - {template.position_key}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Respostas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_responses || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pontuação Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.average_score?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentual Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.average_percentage?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Análise por Questão
              </h2>
            </div>

            {/* Question Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione uma questão
              </label>
              <select
                value={selectedQuestion || ''}
                onChange={(e) => setSelectedQuestion(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {template.questions.map((q, index) => (
                  <option key={q.id} value={q.id}>
                    Questão {index + 1}: {q.question_text.substring(0, 60)}
                    {q.question_text.length > 60 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Details */}
            {selectedQuestionData && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Pergunta:</p>
                  <p className="text-gray-900">{selectedQuestionData.question_text}</p>
                </div>

                {/* Option Distribution */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Distribuição de Respostas:
                  </p>
                  {optionDistribution.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma resposta registrada para esta questão
                    </p>
                  ) : (
                    optionDistribution.map((option) => {
                      const percentage =
                        stats?.total_responses
                          ? (option.selection_count / stats.total_responses) * 100
                          : 0;
                      const barWidth = (option.selection_count / maxSelections) * 100;

                      return (
                        <div key={option.option__id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">
                                {option.option__option_text}
                              </span>
                              {option.option__is_correct && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                  Correta
                                </span>
                              )}
                            </div>
                            <span className="text-gray-600">
                              {option.selection_count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                option.option__is_correct
                                  ? 'bg-green-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default QuestionnaireAnalytics;
