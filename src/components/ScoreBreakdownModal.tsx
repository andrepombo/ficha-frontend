import React from 'react';
import { X, TrendingUp, GraduationCap, MapPin, MessageSquare, Users } from 'lucide-react';
import { Candidate, ScoreBreakdown } from '../types';

interface ScoreBreakdownModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
}

const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ candidate, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Ensure score is a number
  const score = typeof candidate.score === 'number' ? candidate.score : parseFloat(candidate.score as any) || 0;
  const grade = candidate.score_grade || 'F';
  const breakdown = candidate.score_breakdown;

  // Category details
  const categories = [
    {
      key: 'experience_skills',
      label: 'Experiência & Habilidades',
      icon: TrendingUp,
      maxScore: 32,
      description: 'Anos de experiência profissional e tempo parado',
      color: 'indigo',
    },
    {
      key: 'education',
      label: 'Educação & Qualificações',
      icon: GraduationCap,
      maxScore: 18,
      description: 'Nível educacional, cursos, habilidades técnicas e certificações',
      color: 'purple',
    },
    {
      key: 'availability_logistics',
      label: 'Disponibilidade & Logística',
      icon: MapPin,
      maxScore: 20,
      description: 'Disponibilidade imediata, transporte e viagens',
      color: 'blue',
    },
    {
      key: 'referral',
      label: 'Indicação',
      icon: Users,
      maxScore: 0,
      description: 'Como o candidato soube da vaga e quem indicou',
      color: 'green',
    },
    {
      key: 'interview_performance',
      label: 'Desempenho em Entrevistas',
      icon: MessageSquare,
      maxScore: 30,
      description: 'Avaliações e feedback de entrevistas',
      color: 'amber',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (grade.startsWith('B')) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (grade.startsWith('C')) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getProgressColor = (colorName: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      amber: 'bg-amber-500',
    };
    return colors[colorName] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Detalhamento da Pontuação</h2>
              <p className="text-indigo-100">{candidate.full_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Overall Score */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score.toFixed(1)}
              </div>
              <div className="text-indigo-100 text-sm mt-1">de 100 pontos</div>
            </div>
            <div className="text-center">
              <div className={`${getGradeColor(grade)} text-white text-5xl font-bold px-6 py-3 rounded-xl shadow-lg`}>
                {grade}
              </div>
              <div className="text-indigo-100 text-sm mt-1">Nota</div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pontuação por Categoria</h3>
          
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryScore = breakdown?.[category.key as keyof ScoreBreakdown] || 0;
              const percentage = (categoryScore / category.maxScore) * 100;
              const Icon = category.icon;

              return (
                <div key={category.key} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                      <Icon className={`text-${category.color}-600`} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-800">{category.label}</h4>
                        <span className="text-lg font-bold text-gray-700">
                          {categoryScore.toFixed(1)}/{category.maxScore}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${getProgressColor(category.color)} h-full rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Experience Details - Show Idle Time */}
          {candidate.professional_experiences && candidate.professional_experiences.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">📊 Detalhes da Experiência</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 font-medium mb-1">Anos de Experiência</div>
                  <div className="text-gray-800 font-semibold">
                    {(() => {
                      const totalDays = candidate.professional_experiences.reduce((total, exp) => {
                        if (exp.data_admissao) {
                          const endDate = exp.data_desligamento ? new Date(exp.data_desligamento) : new Date();
                          const startDate = new Date(exp.data_admissao);
                          if (endDate >= startDate) {
                            return total + (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                          }
                        }
                        return total;
                      }, 0);
                      const years = Math.round((totalDays / 365.25) * 10) / 10;
                      return `${years} ano${years !== 1 ? 's' : ''}`;
                    })()}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 font-medium mb-1">Tempo Parado</div>
                  <div className="text-gray-800 font-semibold">
                    {(() => {
                      const sortedExperiences = [...candidate.professional_experiences].sort((a, b) => {
                        if (!a.data_desligamento) return -1;
                        if (!b.data_desligamento) return 1;
                        return new Date(b.data_desligamento).getTime() - new Date(a.data_desligamento).getTime();
                      });
                      const mostRecentJob = sortedExperiences[0];
                      if (!mostRecentJob?.data_desligamento) {
                        return '✅ Empregado atualmente';
                      }
                      if (mostRecentJob.idle_time_formatted) {
                        return mostRecentJob.idle_time_formatted;
                      }
                      return 'N/A';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Details */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">👥 Indicação</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="text-green-600 font-medium mb-1">Como Soube da Vaga</div>
                <div className="text-gray-800 font-semibold">
                  {(() => {
                    const howFoundMap: { [key: string]: string } = {
                      'facebook': 'Facebook',
                      'indicacao_colaborador': 'Indicação de Colaborador',
                      'instagram': 'Instagram',
                      'linkedin': 'LinkedIn',
                      'sine': 'Sine',
                      'outros': 'Outros'
                    };
                    const howFound = candidate.how_found_vacancy || 'N/A';
                    return howFoundMap[howFound] || howFound;
                  })()}
                  {candidate.how_found_vacancy === 'outros' && candidate.how_found_vacancy_other && (
                    <span className="text-gray-600 text-xs block mt-1">
                      ({candidate.how_found_vacancy_other})
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="text-green-600 font-medium mb-1">Indicado Por</div>
                <div className="text-gray-800 font-semibold">
                  {candidate.referred_by || 'Não indicado'}
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-2">💡 Insights</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              {score >= 80 && (
                <li>• Candidato excelente! Perfil altamente qualificado para a posição.</li>
              )}
              {score >= 60 && score < 80 && (
                <li>• Bom candidato com potencial. Considere para entrevista.</li>
              )}
              {score < 60 && (
                <li>• Candidato pode precisar de mais desenvolvimento em algumas áreas.</li>
              )}
              {breakdown && breakdown.interview_performance === 0 && (
                <li>• Ainda não foi entrevistado. Pontuação pode aumentar após entrevista.</li>
              )}
            </ul>
          </div>

          {/* Last Updated */}
          {candidate.score_updated_at && (
            <div className="mt-4 text-center text-xs text-gray-500">
              Última atualização: {new Date(candidate.score_updated_at).toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdownModal;
