import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { candidateAPI } from '../services/api';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  conversion_from_previous?: number;
  color: string;
}

interface TimeStage {
  stage: string;
  average_days: number;
  color: string;
}

interface FunnelData {
  stages: FunnelStage[];
  total_in_funnel: number;
  overall_conversion_rate: number;
  rejected_count: number;
}

interface TimeData {
  stages: TimeStage[];
  total_average_days: number;
  note: string;
}

interface CompactFunnelChartsProps {
  selectedMonth?: string;
  selectedYear?: string;
}

function CompactFunnelCharts({ selectedMonth, selectedYear }: CompactFunnelChartsProps) {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters
      const monthParam = selectedMonth !== 'all' ? selectedMonth : undefined;
      const yearParam = selectedYear !== 'all' ? selectedYear : undefined;
      
      const [funnel, time] = await Promise.all([
        candidateAPI.getFunnelStats(yearParam, monthParam),
        candidateAPI.getAverageTimePerStage(yearParam, monthParam),
      ]);
      setFunnelData(funnel);
      setTimeData(time);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados. Por favor, tente novamente.');
      console.error('Error fetching data:', err);
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

  if (error || !funnelData || !timeData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-red-600">{error || 'Erro ao carregar dados'}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conversion Funnel Chart */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white">Funil de Conversão</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Candidatos por etapa do processo
          </p>
        </div>

        {/* Overall Stats */}
        <div className="px-6 py-3 bg-purple-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{funnelData.total_in_funnel}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{funnelData.overall_conversion_rate}%</div>
              <div className="text-xs text-gray-600">Conversão</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{funnelData.rejected_count}</div>
              <div className="text-xs text-gray-600">Rejeitados</div>
            </div>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnelData.stages} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: '500' }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: '500' }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                formatter={(value: any, name: string) => {
                  if (name === 'count') return [value, 'Candidatos'];
                  return [value, name];
                }}
              />
              <Bar 
                dataKey="count" 
                name="Candidatos"
                radius={[8, 8, 0, 0]}
              >
                {funnelData.stages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ fontSize: '14px', fontWeight: 'bold', fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Conversion Rates */}
          <div className="mt-4 space-y-2">
            {funnelData.stages.map((stage, index) => (
              index > 0 && stage.conversion_from_previous && (
                <div key={stage.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {funnelData.stages[index - 1].name} → {stage.name}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {stage.conversion_from_previous}%
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Average Time Per Stage Chart */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600">
          <h2 className="text-xl font-bold text-white">Tempo Médio por Etapa</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Duração média em cada fase
          </p>
        </div>

        {/* Total Time */}
        <div className="px-6 py-3 bg-purple-50 border-b border-gray-200">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{timeData.total_average_days} dias</div>
            <div className="text-xs text-gray-600">Tempo total médio do processo</div>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={timeData.stages} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="stage" 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: '500' }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: '500' }}
                label={{ value: 'Dias', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                formatter={(value: any) => [`${value} dias`, 'Duração Média']}
              />
              <Bar 
                dataKey="average_days" 
                name="Dias"
                radius={[8, 8, 0, 0]}
              >
                {timeData.stages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="average_days" 
                  position="top" 
                  style={{ fontSize: '14px', fontWeight: 'bold', fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stage Details */}
          <div className="mt-4 space-y-2">
            {timeData.stages.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <span className="text-gray-700">{stage.stage}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stage.average_days} dias
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompactFunnelCharts;
