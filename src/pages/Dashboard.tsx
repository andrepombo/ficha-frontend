import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import { Candidate, CandidateFilters, CandidateStats } from '../types';
import CandidateCard from '../components/CandidateCard';
import StatsCard from '../components/StatsCard';
import FilterBar from '../components/FilterBar';
import Header from '../components/Header';
import { getTranslatedStatus } from '../utils/statusTranslations';

function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CandidateStats>({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
  });
  // Set default filters to current month and year
  const getDefaultMonthYear = () => {
    const now = new Date();
    return {
      month: (now.getMonth() + 1).toString().padStart(2, '0'),
      year: now.getFullYear().toString()
    };
  };

  const [filters, setFilters] = useState<CandidateFilters>(() => {
    const { month, year } = getDefaultMonthYear();
    return {
      status: 'all',
      search: '',
      position: 'all',
      month: month,
      year: year,
    };
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

  // Recalculate stats whenever filtered candidates change
  useEffect(() => {
    calculateStats(filteredCandidates);
  }, [filteredCandidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getAll();
      setCandidates(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load candidates. Please try again.');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Candidate[]) => {
    const newStats: CandidateStats = {
      total: data.length,
      pending: data.filter(c => c.status === 'pending').length,
      reviewing: data.filter(c => c.status === 'reviewing').length,
      shortlisted: data.filter(c => c.status === 'shortlisted').length,
      interviewed: data.filter(c => c.status === 'interviewed').length,
      accepted: data.filter(c => c.status === 'accepted').length,
      rejected: data.filter(c => c.status === 'rejected').length,
    };
    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.position_applied?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.position !== 'all') {
      filtered = filtered.filter(c => c.position_applied === filters.position);
    }

    // Filter by month
    if (filters.month !== 'all') {
      filtered = filtered.filter(c => {
        const appliedDate = new Date(c.applied_date);
        const month = (appliedDate.getMonth() + 1).toString().padStart(2, '0');
        return month === filters.month;
      });
    }

    // Filter by year
    if (filters.year !== 'all') {
      filtered = filtered.filter(c => {
        const appliedDate = new Date(c.applied_date);
        const year = appliedDate.getFullYear().toString();
        return year === filters.year;
      });
    }

    setFilteredCandidates(filtered);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await candidateAPI.updateStatus(id, newStatus);
      const updatedCandidates = candidates.map(c =>
        c.id === id ? { ...c, status: newStatus as any } : c
      );
      setCandidates(updatedCandidates);
      calculateStats(updatedCandidates);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleFilterChange = (newFilters: Partial<CandidateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const positions = [...new Set(candidates.map(c => c.position_applied).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando candidatos...</p>
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

  // Get filtered month and year display
  const getFilteredMonthYear = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // If both month and year are selected (not 'all'), show the specific period
    if (filters.month !== 'all' && filters.year !== 'all') {
      const monthIndex = parseInt(filters.month) - 1;
      return `${months[monthIndex]} ${filters.year}`;
    }
    
    // If only year is selected, show just the year
    if (filters.year !== 'all' && filters.month === 'all') {
      return `Ano ${filters.year}`;
    }
    
    // If only month is selected, show month with current year
    if (filters.month !== 'all' && filters.year === 'all') {
      const monthIndex = parseInt(filters.month) - 1;
      return `${months[monthIndex]} (Todos os anos)`;
    }
    
    // If both are 'all', show "Todos os períodos"
    return 'Todos os períodos';
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Month and Year */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-indigo-900">{getFilteredMonthYear()}</h1>
                  <p className="text-sm text-indigo-600 font-semibold mt-1">Estatísticas de candidatos</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-6 py-3 border-2 border-indigo-200 shadow-md">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</span>
                  <span className="text-sm text-indigo-700 font-bold uppercase">candidatos</span>
                </div>
                {/* View mode toggle */}
                <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl overflow-hidden shadow-md">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2.5 text-sm font-bold flex items-center space-x-2 transition-all duration-300 ${
                      viewMode === 'cards' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-indigo-700 hover:bg-white'
                    }`}
                    title="Cartões"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden md:inline">Cartões</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2.5 text-sm font-bold flex items-center space-x-2 border-l-2 border-indigo-200 transition-all duration-300 ${
                      viewMode === 'list' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-indigo-700 hover:bg-white'
                    }`}
                    title="Lista"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="hidden md:inline">Lista</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
          <StatsCard title="Total" count={stats.total} color="blue" />
          <StatsCard title="Pendente" count={stats.pending} color="orange" />
          <StatsCard title="Em Análise" count={stats.reviewing} color="purple" />
          <StatsCard title="Selecionado" count={stats.shortlisted} color="cyan" />
          <StatsCard title="Entrevistado" count={stats.interviewed} color="indigo" />
          <StatsCard title="Aceito" count={stats.accepted} color="green" />
          <StatsCard title="Rejeitado" count={stats.rejected} color="red" />
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          positions={positions}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Candidatos ({filteredCandidates.length})
            </h2>
            {/* Secondary toggle (mobile) */}
            <div className="sm:hidden">
              <div className="inline-flex items-center bg-white border border-indigo-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-indigo-700'}`}
                >Cartões</button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm border-l border-indigo-200 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-indigo-700'}`}
                >Lista</button>
              </div>
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum candidato encontrado com os filtros selecionados.</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cargo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aplicado em</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCandidates.map(candidate => (
                    <tr key={candidate.id} className="hover:bg-purple-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{candidate.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidate.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidate.position_applied}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {getTranslatedStatus(candidate.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(candidate.applied_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <Link
                          to={`/candidate/${candidate.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-md text-sm font-medium"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
