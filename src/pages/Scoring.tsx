import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, GraduationCap, MapPin, FileText, MessageSquare, Info, BarChart3, RefreshCw, Edit2, Save, X, RotateCcw } from 'lucide-react';
import { candidateAPI } from '../services/api';
import CriterionEditModal from '../components/CriterionEditModal';

interface ScoreDistribution {
  total: number;
  distribution: {
    excellent: { count: number; percentage: number; range: string };
    good: { count: number; percentage: number; range: string };
    average: { count: number; percentage: number; range: string };
    poor: { count: number; percentage: number; range: string };
  };
  top_candidates: any[];
}

interface ScoringWeights {
  experience_skills: {
    years_of_experience: number;
    skills: number;
    certifications: number;
  };
  education: {
    education_level: number;
    courses: number;
  };
  availability_logistics: {
    immediate_availability: number;
    own_transportation: number;
    travel_availability: number;
    height_painting: number;
  };
  profile_completeness: {
    essential_fields: number;
    professional_fields: number;
    additional_info: number;
  };
  interview_performance: {
    average_rating: number;
    feedback_quality: number;
  };
}

const Scoring: React.FC = () => {
  const [distribution, setDistribution] = useState<ScoreDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [weights, setWeights] = useState<ScoringWeights>({
    experience_skills: {
      years_of_experience: 15,
      skills: 8,
      certifications: 7,
    },
    education: {
      education_level: 18,
      courses: 2,
    },
    availability_logistics: {
      immediate_availability: 8,
      own_transportation: 6,
      travel_availability: 6,
      height_painting: 0,
    },
    profile_completeness: {
      essential_fields: 8,
      professional_fields: 4.5,
      additional_info: 2.5,
    },
    interview_performance: {
      average_rating: 12,
      feedback_quality: 3,
    },
  });
  const [editedWeights, setEditedWeights] = useState<ScoringWeights>(weights);
  const [isCustom, setIsCustom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof ScoringWeights | null>(null);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getScoreDistribution();
      setDistribution(data);
    } catch (error) {
      console.error('Error fetching score distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScoringConfig = async () => {
    try {
      const config = await candidateAPI.getScoringConfig();
      setWeights(config.weights);
      setEditedWeights(config.weights);
      setIsCustom(config.is_custom);
    } catch (error) {
      console.error('Error fetching scoring config:', error);
    }
  };

  const handleRecalculateScores = async () => {
    if (!confirm('Recalcular pontuações para todos os candidatos? Isso pode levar alguns segundos.')) {
      return;
    }

    try {
      setRecalculating(true);
      await candidateAPI.recalculateAllScores();
      alert('Pontuações recalculadas com sucesso!');
      fetchDistribution();
    } catch (error) {
      console.error('Error recalculating scores:', error);
      alert('Erro ao recalcular pontuações. Tente novamente.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleEditWeights = () => {
    setEditedWeights(weights);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedWeights(weights);
    setEditMode(false);
  };

  const handleOpenCategoryModal = (categoryKey: keyof ScoringWeights) => {
    if (editMode) {
      setSelectedCategory(categoryKey);
      setModalOpen(true);
    }
  };

  const handleSaveCategoryWeights = (categoryKey: keyof ScoringWeights, updatedCriteria: Record<string, number>) => {
    console.log('Saving category weights:', categoryKey, updatedCriteria);
    
    // Special handling: "skills" and "certifications" are displayed in education but stored in experience_skills
    let newWeights = { ...editedWeights };
    
    if (categoryKey === 'education') {
      // Extract skills and certifications from education criteria
      const { skills, certifications, ...educationCriteria } = updatedCriteria;
      
      // Update education without skills and certifications
      newWeights.education = educationCriteria as any;
      
      // Update skills and certifications in experience_skills
      newWeights.experience_skills = {
        ...newWeights.experience_skills,
        ...(skills !== undefined && { skills }),
        ...(certifications !== undefined && { certifications }),
      };
    } else if (categoryKey === 'experience_skills') {
      // When editing experience_skills, update normally
      newWeights.experience_skills = updatedCriteria as any;
    } else {
      // For other categories, update normally
      newWeights[categoryKey] = updatedCriteria as any;
    }
    
    console.log('New weights after update:', newWeights);
    setEditedWeights(newWeights);
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(editedWeights).forEach((categoryWeights) => {
      if (typeof categoryWeights === 'object' && categoryWeights !== null) {
        total += (Object.values(categoryWeights) as number[]).reduce((sum, val) => sum + val, 0);
      }
    });
    return total;
  };

  const getCategoryTotal = (categoryKey: keyof ScoringWeights, weightsObj: ScoringWeights) => {
    const categoryWeights = weightsObj[categoryKey];
    if (typeof categoryWeights === 'object' && categoryWeights !== null) {
      return (Object.values(categoryWeights) as number[]).reduce((sum, val) => sum + val, 0);
    }
    return 0;
  };

  const handleSaveWeights = async () => {
    const total = calculateTotal();
    // Allow small floating point differences
    if (Math.abs(total - 100) > 0.1) {
      alert(`O total deve ser 100 pontos. Total atual: ${total.toFixed(1)}`);
      return;
    }

    try {
      setSaving(true);
      console.log('Saving weights:', editedWeights);
      await candidateAPI.updateScoringConfig(editedWeights);
      setWeights(editedWeights);
      setIsCustom(true);
      setEditMode(false);
      alert('Pesos atualizados com sucesso! Recalcule as pontuações para aplicar as mudanças.');
    } catch (error: any) {
      console.error('Error saving weights:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.error || 'Erro ao salvar pesos. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetWeights = async () => {
    if (!confirm('Resetar para os pesos padrão? Isso não afetará as pontuações já calculadas até que você recalcule.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await candidateAPI.resetScoringConfig();
      setWeights(response.weights);
      setEditedWeights(response.weights);
      setIsCustom(false);
      setEditMode(false);
      alert('Pesos resetados para os valores padrão!');
    } catch (error) {
      console.error('Error resetting weights:', error);
      alert('Erro ao resetar pesos. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchDistribution();
    fetchScoringConfig();
  }, []);

  const criterionLabels: Record<string, Record<string, { label: string; description: string }>> = {
    experience_skills: {
      years_of_experience: { label: 'Anos de experiência', description: '6+ anos: máximo | 4-5 anos: 87% | 2-3 anos: 67% | 1 ano: 33%' },
    },
    education: {
      education_level: { label: 'Nível educacional', description: 'Pós-graduação: máximo | Superior: 95% | Técnico: 80%' },
      courses: { label: 'Cursos adicionais', description: '0.5 pontos por curso listado (máximo configurável)' },
      skills: { label: 'Habilidades listadas', description: '5+ habilidades: máximo | 3-4: 75% | 1-2: 50%' },
      certifications: { label: 'Certificações', description: '3+ certificações: máximo | 2: 71% | 1: 43%' },
    },
    availability_logistics: {
      immediate_availability: { label: 'Disponibilidade imediata', description: 'Imediato: máximo | 15 dias: 75% | 30 dias: 50%' },
      own_transportation: { label: 'Transporte próprio', description: 'Sim: máximo | Não: 0%' },
      travel_availability: { label: 'Disponibilidade para viagens', description: 'Sim: máximo | Ocasionalmente: 50%' },
      height_painting: { label: 'Pintura em altura', description: 'Sim: máximo | Não: 0%' },
    },
    profile_completeness: {
      essential_fields: { label: 'Campos essenciais', description: 'Email, telefone, endereço, cidade' },
      professional_fields: { label: 'Campos profissionais', description: 'Posição, empresa, habilidades' },
      additional_info: { label: 'Informações adicionais', description: 'Educação, certificações, indicação' },
    },
    interview_performance: {
      average_rating: { label: 'Avaliação média', description: 'Baseado em avaliações de 1-5 estrelas' },
      feedback_quality: { label: 'Qualidade do feedback', description: 'Baseado na porcentagem de entrevistas com feedback' },
    },
  };

  const categories = [
    {
      key: 'experience_skills',
      label: 'Experiência & Habilidades',
      icon: TrendingUp,
      maxScore: 30,
      color: 'indigo',
      criteria: [
        { label: 'Anos de experiência', points: '15 pontos', details: '6+ anos: 15pts | 4-5 anos: 13pts | 2-3 anos: 10pts | 1 ano: 5pts' },
      ],
    },
    {
      key: 'education',
      label: 'Educação & Qualificações',
      icon: GraduationCap,
      maxScore: 20,
      color: 'purple',
      criteria: [
        { label: 'Nível educacional', points: '18 pontos', details: 'Pós-graduação: 18pts | Superior completo: 17pts | Técnico: 14pts' },
        { label: 'Cursos adicionais', points: '2 pontos bônus', details: '0.5 pontos por curso listado' },
        { label: 'Habilidades listadas', points: '8 pontos', details: '5+ habilidades: 8pts | 3-4: 6pts | 1-2: 4pts' },
        { label: 'Certificações', points: '7 pontos', details: '3+ certificações: 7pts | 2: 5pts | 1: 3pts' },
      ],
    },
    {
      key: 'availability_logistics',
      label: 'Disponibilidade & Logística',
      icon: MapPin,
      maxScore: 20,
      color: 'blue',
      criteria: [
        { label: 'Disponibilidade imediata', points: '8 pontos', details: 'Imediato: 8pts | 15 dias: 6pts | 30 dias: 4pts' },
        { label: 'Transporte próprio', points: '6 pontos', details: 'Sim: 6pts | Não: 0pts' },
        { label: 'Disponibilidade para viagens', points: '6 pontos', details: 'Sim: 6pts | Ocasionalmente: 3pts' },
        { label: 'Pintura em altura', points: '0 pontos', details: 'Sim: pontos configuráveis | Não: 0pts' },
      ],
    },
    {
      key: 'profile_completeness',
      label: 'Completude do Perfil',
      icon: FileText,
      maxScore: 15,
      color: 'green',
      criteria: [
        { label: 'Campos essenciais', points: '8 pontos', details: 'Email, telefone, endereço, cidade (2pts cada)' },
        { label: 'Campos profissionais', points: '4.5 pontos', details: 'Posição, empresa, habilidades (1.5pts cada)' },
        { label: 'Informações adicionais', points: '1.5 pontos', details: 'Educação, certificações, indicação (0.5pts cada)' },
      ],
    },
    {
      key: 'interview_performance',
      label: 'Desempenho em Entrevistas',
      icon: MessageSquare,
      maxScore: 15,
      color: 'amber',
      criteria: [
        { label: 'Avaliação média', points: '12 pontos', details: 'Baseado em avaliações de 1-5 estrelas' },
        { label: 'Qualidade do feedback', points: '3 pontos', details: 'Baseado na porcentagem de entrevistas com feedback' },
      ],
    },
  ];

  const gradeScale = [
    { grade: 'A+', range: '95-100', color: 'from-green-500 to-green-600', description: 'Candidato excepcional' },
    { grade: 'A', range: '90-94', color: 'from-green-500 to-green-600', description: 'Candidato excelente' },
    { grade: 'A-', range: '85-89', color: 'from-green-500 to-green-600', description: 'Candidato muito forte' },
    { grade: 'B+', range: '80-84', color: 'from-yellow-500 to-yellow-600', description: 'Candidato forte' },
    { grade: 'B', range: '75-79', color: 'from-yellow-500 to-yellow-600', description: 'Bom candidato' },
    { grade: 'B-', range: '70-74', color: 'from-yellow-500 to-yellow-600', description: 'Candidato acima da média' },
    { grade: 'C+', range: '65-69', color: 'from-orange-500 to-orange-600', description: 'Candidato médio' },
    { grade: 'C', range: '60-64', color: 'from-orange-500 to-orange-600', description: 'Candidato aceitável' },
    { grade: 'C-', range: '55-59', color: 'from-orange-500 to-orange-600', description: 'Candidato abaixo da média' },
    { grade: 'D', range: '50-54', color: 'from-red-500 to-red-600', description: 'Candidato fraco' },
    { grade: 'F', range: '0-49', color: 'from-red-500 to-red-600', description: 'Candidato insuficiente' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Award size={32} />
              <h1 className="text-3xl font-bold">Sistema de Pontuação</h1>
              {isCustom && !editMode && (
                <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                  Personalizado
                </span>
              )}
            </div>
            <p className="text-indigo-100 text-lg">
              Entenda como os candidatos são avaliados de forma objetiva e consistente
            </p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={handleEditWeights}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Edit2 size={20} />
                  Editar Pesos
                </button>
                <button
                  onClick={handleRecalculateScores}
                  disabled={recalculating}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={20} className={recalculating ? 'animate-spin' : ''} />
                  {recalculating ? 'Recalculando...' : 'Recalcular'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResetWeights}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <RotateCcw size={20} />
                  Resetar
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveWeights}
                  disabled={saving || calculateTotal() !== 100}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}
          </div>
        </div>
        {editMode && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total de Pontos:</span>
              <span className={`text-2xl font-bold ${calculateTotal() === 100 ? 'text-green-300' : 'text-red-300'}`}>
                {calculateTotal()} / 100
              </span>
            </div>
            {calculateTotal() !== 100 && (
              <p className="text-sm text-yellow-200 mt-2">
                ⚠️ O total deve ser exatamente 100 pontos para salvar
              </p>
            )}
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Info className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Pontuação Total</h3>
          </div>
          <p className="text-4xl font-bold text-indigo-600">100</p>
          <p className="text-sm text-gray-600 mt-1">pontos máximos</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Categorias</h3>
          </div>
          <p className="text-4xl font-bold text-purple-600">5</p>
          <p className="text-sm text-gray-600 mt-1">áreas de avaliação</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Notas</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">A+ - F</p>
          <p className="text-sm text-gray-600 mt-1">escala de avaliação</p>
        </div>
      </div>

      {/* Score Distribution */}
      {!loading && distribution && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribuição de Pontuações</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="text-sm font-semibold text-green-800 mb-1">Excelente (80-100)</div>
              <div className="text-3xl font-bold text-green-600">{distribution.distribution.excellent.count}</div>
              <div className="text-sm text-green-700">{distribution.distribution.excellent.percentage}% dos candidatos</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="text-sm font-semibold text-yellow-800 mb-1">Bom (60-79)</div>
              <div className="text-3xl font-bold text-yellow-600">{distribution.distribution.good.count}</div>
              <div className="text-sm text-yellow-700">{distribution.distribution.good.percentage}% dos candidatos</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="text-sm font-semibold text-orange-800 mb-1">Médio (40-59)</div>
              <div className="text-3xl font-bold text-orange-600">{distribution.distribution.average.count}</div>
              <div className="text-sm text-orange-700">{distribution.distribution.average.percentage}% dos candidatos</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="text-sm font-semibold text-red-800 mb-1">Fraco (0-39)</div>
              <div className="text-3xl font-bold text-red-600">{distribution.distribution.poor.count}</div>
              <div className="text-sm text-red-700">{distribution.distribution.poor.percentage}% dos candidatos</div>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Categories */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Critérios de Avaliação</h2>
        <div className="space-y-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.key} 
                className={`bg-gray-50 border border-gray-300 rounded-xl p-5 hover:shadow-md transition-shadow hover:bg-white ${editMode ? 'cursor-pointer hover:border-indigo-400' : ''}`}
                onClick={() => handleOpenCategoryModal(category.key as keyof ScoringWeights)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${category.color}-100 flex-shrink-0`}>
                    <Icon className={`text-${category.color}-600`} size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{category.label}</h3>
                      <span className="text-2xl font-bold text-gray-700">
                        {getCategoryTotal(category.key as keyof ScoringWeights, editMode ? editedWeights : weights)} pts
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(criterionLabels[category.key] || {}).map(([criterionKey, { label, description }]) => {
                        // Special handling: "skills" is displayed in education but stored in experience_skills
                        let points = 0;
                        if (category.key === 'education' && criterionKey === 'skills') {
                          // Get skills points from experience_skills
                          const weightsToUse = editMode ? editedWeights : weights;
                          points = weightsToUse.experience_skills.skills;
                        } else {
                          const categoryWeights = (editMode ? editedWeights : weights)[category.key as keyof ScoringWeights];
                          points = typeof categoryWeights === 'object' && categoryWeights !== null 
                            ? (categoryWeights as any)[criterionKey] 
                            : 0;
                        }
                        return (
                          <div key={criterionKey} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                              <span className="font-semibold text-gray-700">{label}</span>
                              <span className="text-indigo-600 font-bold ml-2">({points} pontos)</span>
                              <p className="text-gray-600 text-xs mt-1">{description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Scale */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Escala de Notas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradeScale.map((item) => (
            <div key={item.grade} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-lg font-bold text-xl min-w-[60px] text-center`}>
                {item.grade}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.range} pontos</div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-start gap-3">
          <Info className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-indigo-900 mb-2">💡 Como funciona?</h3>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• As pontuações são calculadas automaticamente com base nos dados do candidato</li>
              <li>• Candidatos sem entrevistas têm 0 pontos em "Desempenho em Entrevistas"</li>
              <li>• Perfis incompletos terão pontuações mais baixas</li>
              <li>• As pontuações podem ser recalculadas a qualquer momento</li>
              <li>• Use as pontuações para priorizar candidatos e tomar decisões objetivas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Criterion Edit Modal */}
      {selectedCategory && (
        <CriterionEditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(updatedCriteria) => handleSaveCategoryWeights(selectedCategory, updatedCriteria)}
          categoryName={categories.find(c => c.key === selectedCategory)?.label || ''}
          categoryIcon={
            categories.find(c => c.key === selectedCategory)?.icon ? 
            React.createElement(categories.find(c => c.key === selectedCategory)!.icon, { size: 28 }) : 
            null
          }
          criteria={
            selectedCategory === 'education' 
              ? { 
                  ...editedWeights.education, 
                  skills: editedWeights.experience_skills.skills,
                  certifications: editedWeights.experience_skills.certifications 
                } as Record<string, number>
              : editedWeights[selectedCategory] as Record<string, number>
          }
          criteriaLabels={criterionLabels[selectedCategory]}
        />
      )}
    </div>
  );
};

export default Scoring;
