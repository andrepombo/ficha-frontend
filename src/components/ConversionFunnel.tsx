import { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  conversion_from_previous?: number;
  color: string;
}

interface FunnelData {
  stages: FunnelStage[];
  total_in_funnel: number;
  overall_conversion_rate: number;
  rejected_count: number;
}

interface ConversionFunnelProps {
  selectedYear?: string;
}

function ConversionFunnel({ selectedYear }: ConversionFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnelData();
  }, [selectedYear]);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getFunnelStats(selectedYear !== 'all' ? selectedYear : undefined);
      setFunnelData(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados do funil. Por favor, tente novamente.');
      console.error('Error fetching funnel data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !funnelData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-red-600">{error || 'Erro ao carregar dados'}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
        <h2 className="text-2xl font-bold text-white">Funil de Conversão</h2>
        <p className="text-indigo-100 text-sm mt-1">
          Acompanhe a jornada dos candidatos através das etapas do processo seletivo
        </p>
      </div>

      {/* Overall Stats */}
      <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{funnelData.total_in_funnel}</div>
            <div className="text-sm text-gray-600">Total no Funil</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{funnelData.overall_conversion_rate}%</div>
            <div className="text-sm text-gray-600">Taxa de Conversão</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{funnelData.rejected_count}</div>
            <div className="text-sm text-gray-600">Rejeitados</div>
          </div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="p-8">
        <div className="space-y-4">
          {funnelData.stages.map((stage, index) => {
            // Calculate width percentage for visual funnel effect
            const maxCount = funnelData.stages[0].count;
            const widthPercentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.name} className="relative">
                {/* Stage Container */}
                <div className="flex items-center gap-4">
                  {/* Stage Number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {/* Funnel Bar */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{stage.name}</span>
                      <span className="text-xs text-gray-500">
                        {stage.count} candidatos ({stage.percentage}% do total)
                      </span>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                      <div
                        className="h-full flex items-center justify-between px-4 transition-all duration-500 ease-out rounded-lg"
                        style={{
                          width: `${Math.max(widthPercentage, 25)}%`,
                          backgroundColor: stage.color,
                          boxShadow: `0 4px 14px 0 ${stage.color}40`,
                        }}
                      >
                        <span className="text-white font-bold text-lg">{stage.count}</span>
                        {stage.conversion_from_previous !== undefined && (
                          <span className="text-white text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded">
                            {stage.conversion_from_previous}% da etapa anterior
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow between stages */}
                {index < funnelData.stages.length - 1 && (
                  <div className="flex justify-center my-2">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda das Etapas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: '#3b82f6' }}></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Aplicados</div>
                <div className="text-xs text-gray-600">Candidatos em análise inicial (Pendente + Em Análise)</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: '#8b5cf6' }}></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Selecionados</div>
                <div className="text-xs text-gray-600">Candidatos selecionados para entrevista</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: '#f59e0b' }}></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Entrevistados</div>
                <div className="text-xs text-gray-600">Candidatos que já foram entrevistados</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: '#10b981' }}></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Contratados</div>
                <div className="text-xs text-gray-600">Candidatos aceitos e contratados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {funnelData.total_in_funnel > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-indigo-900 mb-1">Insights</h4>
                <p className="text-sm text-indigo-800">
                  De cada 100 candidatos que aplicam, aproximadamente{' '}
                  <span className="font-bold">{funnelData.overall_conversion_rate}</span> são contratados.
                  {funnelData.rejected_count > 0 && (
                    <> Atualmente há <span className="font-bold">{funnelData.rejected_count}</span> candidatos rejeitados.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversionFunnel;
