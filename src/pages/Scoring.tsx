import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, GraduationCap, MapPin, FileText, MessageSquare, Info, BarChart3, RefreshCw } from 'lucide-react';
import { candidateAPI } from '../services/api';

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

const Scoring: React.FC = () => {
  const [distribution, setDistribution] = useState<ScoreDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

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

  useEffect(() => {
    fetchDistribution();
  }, []);

  const categories = [
    {
      key: 'experience_skills',
      label: 'Experiência & Habilidades',
      icon: TrendingUp,
      maxScore: 30,
      color: 'indigo',
      criteria: [
        { label: 'Anos de experiência', points: '15 pontos', details: '6+ anos: 15pts | 4-5 anos: 13pts | 2-3 anos: 10pts | 1 ano: 5pts' },
        { label: 'Habilidades listadas', points: '8 pontos', details: '5+ habilidades: 8pts | 3-4: 6pts | 1-2: 4pts' },
        { label: 'Certificações', points: '7 pontos', details: '3+ certificações: 7pts | 2: 5pts | 1: 3pts' },
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
            </div>
            <p className="text-indigo-100 text-lg">
              Entenda como os candidatos são avaliados de forma objetiva e consistente
            </p>
          </div>
          <button
            onClick={handleRecalculateScores}
            disabled={recalculating}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Recalculando...' : 'Recalcular Pontuações'}
          </button>
        </div>
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
              <div key={category.key} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${category.color}-100 flex-shrink-0`}>
                    <Icon className={`text-${category.color}-600`} size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{category.label}</h3>
                      <span className="text-2xl font-bold text-gray-700">{category.maxScore} pts</span>
                    </div>
                    <div className="space-y-2">
                      {category.criteria.map((criterion, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-700">{criterion.label}</span>
                            <span className="text-indigo-600 font-bold ml-2">({criterion.points})</span>
                            <p className="text-gray-600 text-xs mt-1">{criterion.details}</p>
                          </div>
                        </div>
                      ))}
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
    </div>
  );
};

export default Scoring;
