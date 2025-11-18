import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { questionnaireApi, positionsAPI } from '../../services/api';

interface Question {
  id?: number;
  question_text: string;
  question_type: 'multi_select' | 'single_select';
  order: number;
  points: number;
  scoring_mode: 'all_or_nothing' | 'partial' | 'weighted';
  options: QuestionOption[];
}

interface QuestionOption {
  id?: number;
  option_text: string;
  is_correct: boolean;
  order: number;
  option_points?: number;
}

interface QuestionnaireTemplate {
  id?: number;
  position_key: string;
  title: string;
  step_number: number;
  version: number;
  is_active: boolean;
}

interface Props {
  template: QuestionnaireTemplate | null;
  onClose: () => void;
}

function QuestionnaireBuilder({ template, onClose }: Props) {
  const [title, setTitle] = useState(template?.title || '');
  const [positionKey, setPositionKey] = useState(template?.position_key || '');
  const [stepNumber, setStepNumber] = useState(template?.step_number || 1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  useEffect(() => {
    loadPositions();
    if (template?.id) {
      loadTemplate();
    }
  }, [template]);

  const loadPositions = async () => {
    try {
      setLoadingPositions(true);
      const data = await positionsAPI.getAll();
      setPositions(data.filter((p: any) => p.is_active));
    } catch (error) {
      console.error('Error loading positions:', error);
      setPositions([]);
    } finally {
      setLoadingPositions(false);
    }
  };

  const loadTemplate = async () => {
    if (!template?.id) return;

    try {
      setLoading(true);
      const data = await questionnaireApi.getTemplate(template.id);
      const normalized = (data?.questions || []).map((q: any) => ({
        ...q,
        options: (q.options || []).map((o: any) => ({
          ...o,
          option_points: o.option_points !== undefined && o.option_points !== null
            ? parseFloat(o.option_points)
            : 0,
        })),
      }));
      console.log('Loaded template with normalized questions:', normalized);
      setQuestions(normalized);
    } catch (error) {
      console.error('Error loading template:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'multi_select',
      order: questions.length + 1,
      points: 1,
      scoring_mode: 'all_or_nothing',
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    const newOption: QuestionOption = {
      option_text: '',
      is_correct: false,
      order: question.options.length + 1,
      option_points: 0,
    };
    question.options = [...question.options, newOption];
    setQuestions(updated);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updated);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    field: keyof QuestionOption,
    value: any
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = {
      ...updated[questionIndex].options[optionIndex],
      [field]: value,
    };
    if (field === 'option_points') {
      console.log(`Updated option ${optionIndex} in question ${questionIndex}: option_points = ${value}`);
    }
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title || !positionKey) {
      alert('Por favor, preencha título e posição');
      return;
    }

    if (questions.length === 0) {
      alert('Adicione pelo menos uma questão');
      return;
    }

    for (const q of questions) {
      if (!q.question_text) {
        alert('Todas as questões devem ter texto');
        return;
      }
      if (q.options.length < 2) {
        alert('Cada questão deve ter pelo menos 2 opções');
        return;
      }
      if (q.scoring_mode !== 'weighted' && !q.options.some(o => o.is_correct)) {
        alert('Cada questão deve ter pelo menos uma resposta correta');
        return;
      }
      if (q.scoring_mode === 'partial') {
        const totalCorrectPoints = q.options
          .filter(o => o.is_correct)
          .reduce((sum, o) => sum + (o.option_points || 0), 0);
        if (totalCorrectPoints <= 0) {
          alert('No modo Parcial, distribua pontos (>0) entre as opções corretas.');
          return;
        }
      }
      if (q.scoring_mode === 'weighted') {
        const totalOptionPoints = q.options.reduce((sum, o) => sum + (o.option_points || 0), 0);
        if (totalOptionPoints <= 0) {
          alert('No modo Ponderado, distribua pontos (>0) entre as opções.');
          return;
        }
      }
    }

    try {
      setSaving(true);

      // Create or update template
      let templateId = template?.id;
      if (templateId) {
        await questionnaireApi.updateTemplate(templateId, {
          title,
          position_key: positionKey,
          step_number: stepNumber,
          version: (template?.version || 1) + 1,
        });
      } else {
        const newTemplate = await questionnaireApi.createTemplate({
          title,
          position_key: positionKey,
          step_number: stepNumber,
          version: 1,
          is_active: false,
        });
        templateId = newTemplate.id;
      }

      // Update or create questions
      const existing = template?.id ? await questionnaireApi.getTemplate(template.id) : null;
      const existingQuestions = existing?.questions || [];
      const existingQuestionIds = new Set(existingQuestions.map((q: any) => q.id));
      const processedQuestionIds = new Set<number>();

      for (const question of questions) {
        let questionId = question.id;
        
        // Update existing question or create new one
        if (questionId && existingQuestionIds.has(questionId)) {
          // Update existing question
          await questionnaireApi.updateQuestion(questionId, {
            question_text: question.question_text,
            question_type: question.question_type,
            order: question.order,
            points: question.points,
            scoring_mode: question.scoring_mode,
          });
          processedQuestionIds.add(questionId);
        } else {
          // Create new question
          const createdQuestion = await questionnaireApi.createQuestion({
            template_id: templateId,
            question_text: question.question_text,
            question_type: question.question_type,
            order: question.order,
            points: question.points,
            scoring_mode: question.scoring_mode,
          });
          questionId = createdQuestion.id;
          if (questionId) {
            processedQuestionIds.add(questionId);
          }
        }

        // Get existing options for this question
        const existingOptions = existingQuestions.find((q: any) => q.id === questionId)?.options || [];
        const existingOptionIds = new Set(existingOptions.map((o: any) => o.id));
        const processedOptionIds = new Set<number>();

        // Update or create options
        for (const option of question.options) {
          const optionId = option.id;
          
          if (optionId && existingOptionIds.has(optionId)) {
            // Update existing option
            await questionnaireApi.updateOption(optionId, {
              option_text: option.option_text,
              is_correct: option.is_correct,
              order: option.order,
              option_points: (option.option_points || 0),
            });
            processedOptionIds.add(optionId);
          } else {
            // Create new option
            const payload = {
              question_id: questionId,
              option_text: option.option_text,
              is_correct: option.is_correct,
              order: option.order,
              option_points: (option.option_points || 0),
            };
            console.log('Creating option with payload:', payload);
            const created = await questionnaireApi.createOption(payload);
            processedOptionIds.add(created.id);
          }
        }

        // Delete options that were removed
        for (const existingOption of existingOptions) {
          if (!processedOptionIds.has(existingOption.id)) {
            await questionnaireApi.deleteOption(existingOption.id);
          }
        }
      }

      // Delete questions that were removed
      for (const existingQuestion of existingQuestions) {
        if (!processedQuestionIds.has(existingQuestion.id)) {
          await questionnaireApi.deleteQuestion(existingQuestion.id);
        }
      }

      alert('Questionário salvo com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      alert('Erro ao salvar questionário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {template ? 'Editar Questionário' : 'Novo Questionário'}
            </h1>
            <p className="text-gray-600 mt-1">
              Configure perguntas e opções de resposta
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Template Info */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Informações do Questionário</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ex: Teste de Segurança"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posição
            </label>
            <select
              value={positionKey}
              onChange={(e) => setPositionKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loadingPositions}
            >
              <option value="">Selecione uma posição</option>
              {positions.map((position) => (
                <option key={position.id} value={position.name}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem (após Dados Pessoais)
            </label>
            <input
              type="number"
              min="1"
              value={stepNumber}
              onChange={(e) => setStepNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Questões</h2>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Questão
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Nenhuma questão adicionada ainda</p>
          </div>
        ) : (
          questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white rounded-lg shadow p-6 space-y-4">
              {/* Question Header */}
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="w-5 h-5" />
                  <span className="font-semibold text-lg">{qIndex + 1}</span>
                </div>
                <div className="flex-1 space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pergunta
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, 'question_text', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={2}
                      placeholder="Digite a pergunta..."
                    />
                  </div>

                  {/* Question Settings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={question.question_type}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, 'question_type', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="multi_select">Múltipla Escolha</option>
                        <option value="single_select">Escolha Única</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pontos
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            'points',
                            (() => {
                              const v = (e.target.value || '').replace(',', '.');
                              const n = parseFloat(v);
                              return Number.isNaN(n) ? 0 : n;
                            })()
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modo de Pontuação
                      </label>
                      <select
                        value={question.scoring_mode}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, 'scoring_mode', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="all_or_nothing">Tudo ou Nada</option>
                        <option value="partial">Parcial</option>
                        <option value="weighted">Ponderado (por pontos)</option>
                      </select>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Opções de Resposta
                      </label>
                      <button
                        onClick={() => handleAddOption(qIndex)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        + Adicionar Opção
                      </button>
                    </div>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.is_correct}
                          onChange={(e) =>
                            handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)
                          }
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          title="Marcar como correta"
                        />
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) =>
                            handleOptionChange(qIndex, oIndex, 'option_text', e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder={`Opção ${oIndex + 1}`}
                        />
                        {(question.scoring_mode === 'partial' || question.scoring_mode === 'weighted') && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Pts</label>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={option.option_points ?? 0}
                              onChange={(e) =>
                                handleOptionChange(
                                  qIndex,
                                  oIndex,
                                  'option_points',
                                  (() => {
                                    const v = (e.target.value || '').replace(',', '.');
                                    const n = parseFloat(v);
                                    return Number.isNaN(n) ? 0 : n;
                                  })()
                                )
                              }
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="0"
                              title={question.scoring_mode === 'weighted' ? "Pontos desta opção (usado no modo Ponderado)" : "Pontos desta opção (usado no modo Parcial)"}
                            />
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveOption(qIndex, oIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default QuestionnaireBuilder;
