import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { candidateAPI } from '../services/api';
import { Candidate } from '../types';
import { downloadFile } from '../utils/downloadFile';
import CompactFunnelCharts from '../components/CompactFunnelCharts';

interface MonthlyData {
  month: string;
  applications: number;
  accepted: number;
  rejected: number;
}

function Analytics() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      processMonthlyData();
    }
  }, [candidates, selectedMonth, selectedYear]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getAll();
      setCandidates(data);
      
      // Extract unique years from candidates
      const years = [...new Set(data.map(c => new Date(c.applied_date).getFullYear().toString()))];
      setAvailableYears(years.sort((a, b) => parseInt(b) - parseInt(a)));
      
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = () => {
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    // Initialize data for all 12 months
    const monthlyStats: { [key: string]: { applications: number; accepted: number; rejected: number } } = {};
    
    for (let i = 0; i < 12; i++) {
      const monthKey = monthNames[i];
      monthlyStats[monthKey] = { applications: 0, accepted: 0, rejected: 0 };
    }

    // Filter candidates by selected year and month, then count by month
    candidates
      .filter(c => {
        const date = new Date(c.applied_date);
        const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
        const monthMatch = selectedMonth === 'all' || date.getMonth() === parseInt(selectedMonth);
        return yearMatch && monthMatch;
      })
      .forEach(candidate => {
        const date = new Date(candidate.applied_date);
        const monthIndex = date.getMonth();
        const monthKey = monthNames[monthIndex];
        
        monthlyStats[monthKey].applications++;
        
        if (candidate.status === 'accepted') {
          monthlyStats[monthKey].accepted++;
        } else if (candidate.status === 'rejected') {
          monthlyStats[monthKey].rejected++;
        }
      });

    // Convert to array format for recharts
    // If a specific month is selected, only show that month's data
    let data: MonthlyData[];
    if (selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth);
      const monthKey = monthNames[monthIndex];
      data = [{
        month: monthKey,
        applications: monthlyStats[monthKey].applications,
        accepted: monthlyStats[monthKey].accepted,
        rejected: monthlyStats[monthKey].rejected,
      }];
    } else {
      data = monthNames.map(month => ({
        month,
        applications: monthlyStats[month].applications,
        accepted: monthlyStats[month].accepted,
        rejected: monthlyStats[month].rejected,
      }));
    }

    setMonthlyData(data);
  };

  const totalApplications = monthlyData.reduce((sum, month) => sum + month.applications, 0);
  const totalAccepted = monthlyData.reduce((sum, month) => sum + month.accepted, 0);
  const totalRejected = monthlyData.reduce((sum, month) => sum + month.rejected, 0);

  const handleExportPDF = async () => {
    try {
      const blob = await candidateAPI.exportAnalyticsPDF(selectedYear !== 'all' ? selectedYear : undefined);
      const filename = `analytics_${selectedYear}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadFile(blob, filename);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Falha ao exportar PDF. Por favor, tente novamente.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await candidateAPI.exportAnalyticsExcel(selectedYear !== 'all' ? selectedYear : undefined);
      const filename = `analytics_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadFile(blob, filename);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Falha ao exportar Excel. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados analíticos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button onClick={fetchCandidates} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-end">
            {/* Month, Year Selector and Export Buttons */}
            <div className="flex items-center space-x-3">
              <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
                Mês:
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">Todos</option>
                <option value="0">Janeiro</option>
                <option value="1">Fevereiro</option>
                <option value="2">Março</option>
                <option value="3">Abril</option>
                <option value="4">Maio</option>
                <option value="5">Junho</option>
                <option value="6">Julho</option>
                <option value="7">Agosto</option>
                <option value="8">Setembro</option>
                <option value="9">Outubro</option>
                <option value="10">Novembro</option>
                <option value="11">Dezembro</option>
              </select>
              
              <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                Ano:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">Todos</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {/* Export buttons */}
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-4 py-2 text-sm font-bold flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                title="Exportar PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-4 py-2 text-sm font-bold flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                title="Exportar Excel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Candidaturas</p>
                <p className="text-4xl font-bold mt-2">{totalApplications}</p>
                <p className="text-blue-100 text-xs mt-1">em {selectedYear}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Candidatos Aceitos</p>
                <p className="text-4xl font-bold mt-2">{totalAccepted}</p>
                <p className="text-green-100 text-xs mt-1">
                  {totalApplications > 0 ? `${((totalAccepted / totalApplications) * 100).toFixed(1)}%` : '0%'} do total
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Candidatos Rejeitados</p>
                <p className="text-4xl font-bold mt-2">{totalRejected}</p>
                <p className="text-red-100 text-xs mt-1">
                  {totalApplications > 0 ? `${((totalRejected / totalApplications) * 100).toFixed(1)}%` : '0%'} do total
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mb-8">
          <CompactFunnelCharts selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Candidaturas por Mês - {selectedYear}</h2>
          
          {totalApplications === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma candidatura encontrada para {selectedYear}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: '500' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: '500' }}
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
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="applications" 
                  fill="#3b82f6" 
                  name="Total de Candidaturas"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="accepted" 
                  fill="#10b981" 
                  name="Aceitos"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="rejected" 
                  fill="#ef4444" 
                  name="Rejeitados"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Additional Stats Table */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Detalhes Mensais</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aceitos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejeitados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Aceitação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((month, index) => (
                  <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {month.applications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {month.accepted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {month.rejected}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {month.applications > 0 
                        ? `${((month.accepted / month.applications) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
