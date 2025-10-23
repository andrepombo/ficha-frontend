import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import { Candidate, CandidateFilters, CandidateStats } from '../types';
import CandidateCard from '../components/CandidateCard';
import StatsCard from '../components/StatsCard';
import FilterBar from '../components/FilterBar';
import AdvancedSearchModal from '../components/AdvancedSearchModal';
import ScoreBadge from '../components/ScoreBadge';
import KanbanBoard from '../components/KanbanBoard';
import { getTranslatedStatus } from '../utils/statusTranslations';
import { downloadFile } from '../utils/downloadFile';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const candidateListRef = useRef<HTMLDivElement>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  
  // Check if navigating from Insights (URL params present)
  const hasUrlFilters = searchParams.get('gender') || searchParams.get('disability') || 
                        searchParams.get('transportation') || searchParams.get('how_found_vacancy') ||
                        searchParams.get('availability') || searchParams.get('travel_availability') ||
                        searchParams.get('height_painting') || searchParams.get('currently_employed');
  
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'kanban'>(() => {
    // Default to kanban view as the main view
    return 'kanban';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'phone' | 'cpf' | 'status' | 'score' | 'date';
    direction: 'asc' | 'desc';
  } | null>(null);
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
    
    // Check URL params for filters
    const urlGender = searchParams.get('gender');
    const urlDisability = searchParams.get('disability');
    const urlTransportation = searchParams.get('transportation');
    const urlHowFound = searchParams.get('how_found_vacancy');
    const urlAvailability = searchParams.get('availability');
    const urlTravel = searchParams.get('travel_availability');
    const urlHeightPainting = searchParams.get('height_painting');
    const urlEmployment = searchParams.get('currently_employed');
    
    // If any URL params exist, clear default month/year filters
    const hasUrlFilters = urlGender || urlDisability || urlTransportation || urlHowFound || 
                          urlAvailability || urlTravel || urlHeightPainting || urlEmployment;
    
    return {
      status: 'all',
      search: '',
      month: hasUrlFilters ? 'all' : month,
      year: hasUrlFilters ? 'all' : year,
      score_range: 'all',
    };
  });

  const [advancedFilters, setAdvancedFilters] = useState<any>(() => {
    // Initialize advanced filters from URL params if they exist
    return {
      gender: searchParams.get('gender') || 'all',
      disability: searchParams.get('disability') || 'all',
      education: 'all',
      transportation: searchParams.get('transportation') || 'all',
      currently_employed: searchParams.get('currently_employed') || 'all',
      availability: searchParams.get('availability') || 'all',
      travel_availability: searchParams.get('travel_availability') || 'all',
      height_painting: searchParams.get('height_painting') || 'all',
      city: 'all',
      how_found_vacancy: searchParams.get('how_found_vacancy') || 'all',
      date_from: '',
      date_until: '',
    };
  });

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // Fetch candidates when filters change (excluding search - that's client-side)
  useEffect(() => {
    fetchCandidates();
  }, [filters.status, filters.month, filters.year, filters.score_range, advancedFilters]);

  // Client-side search filtering - instant, no API calls
  useEffect(() => {
    if (!filters.search || filters.search.trim() === '') {
      setFilteredCandidates(candidates);
      return;
    }

    const searchLower = filters.search.toLowerCase().trim();
    const filtered = candidates.filter(candidate => {
      const nameMatch = candidate.full_name?.toLowerCase().includes(searchLower);
      const phoneMatch = candidate.phone_number?.toLowerCase().includes(searchLower);
      const cpfMatch = candidate.cpf?.toLowerCase().includes(searchLower);
      return nameMatch || phoneMatch || cpfMatch;
    });

    setFilteredCandidates(filtered);
  }, [filters.search, candidates]);

  // Scroll to candidate list when navigating from Insights
  useEffect(() => {
    if (hasUrlFilters && !loading && filteredCandidates.length > 0 && candidateListRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        candidateListRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [hasUrlFilters, loading, filteredCandidates.length]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Build query parameters including advanced filters
      const params: any = {
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        month: filters.month !== 'all' ? filters.month : undefined,
        year: filters.year !== 'all' ? filters.year : undefined,
        score_range: filters.score_range !== 'all' ? filters.score_range : undefined,
        ...advancedFilters,
      };
      
      // Remove 'all' values and empty strings
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const data = await candidateAPI.getAll(params);
      setCandidates(data);
      setFilteredCandidates(data);
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

  const handleFilterChange = useCallback((newFilters: Partial<CandidateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAdvancedFiltersApply = (newAdvancedFilters: any) => {
    setAdvancedFilters(newAdvancedFilters);
  };

  const hasActiveAdvancedFilters = () => {
    return Object.entries(advancedFilters).some(([key, value]) => {
      if (key === 'date_from' || key === 'date_until') {
        return value !== '';
      }
      return value !== 'all';
    });
  };

  const handleExportPDF = async () => {
    try {
      const blob = await candidateAPI.exportPDF(filters);
      const filename = `candidatos_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadFile(blob, filename);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Falha ao exportar PDF. Por favor, tente novamente.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await candidateAPI.exportExcel(filters);
      downloadFile(blob, `candidatos_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Erro ao exportar para Excel. Por favor, tente novamente.');
    }
  };

  // Get status badge colors matching StatsCard colors
  const getStatusBadgeClasses = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'bg-orange-100 text-orange-800',
      'reviewing': 'bg-purple-100 text-purple-800',
      'shortlisted': 'bg-cyan-100 text-cyan-800',
      'interviewed': 'bg-indigo-100 text-indigo-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Handle sorting
  const handleSort = (key: 'name' | 'phone' | 'cpf' | 'status' | 'score' | 'date') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted candidates
  const getSortedCandidates = () => {
    if (!sortConfig) return filteredCandidates;

    const sorted = [...filteredCandidates].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.full_name?.toLowerCase() || '';
          bValue = b.full_name?.toLowerCase() || '';
          break;
        case 'phone':
          aValue = a.phone_number || '';
          bValue = b.phone_number || '';
          break;
        case 'cpf':
          aValue = a.cpf || '';
          bValue = b.cpf || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'score':
          aValue = typeof a.score === 'number' ? a.score : parseFloat(a.score as any) || 0;
          bValue = typeof b.score === 'number' ? b.score : parseFloat(b.score as any) || 0;
          break;
        case 'date':
          aValue = new Date(a.applied_date).getTime();
          bValue = new Date(b.applied_date).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  // Render sort icon
  const renderSortIcon = (columnKey: 'name' | 'phone' | 'cpf' | 'status' | 'score' | 'date') => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };



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
    <div className={`${viewMode === 'kanban' ? 'max-w-[95%] mx-auto px-4 py-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
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
                {/* Export buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="px-4 py-2.5 text-sm font-bold flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Exportar PDF"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden lg:inline">PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="px-4 py-2.5 text-sm font-bold flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Exportar Excel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden lg:inline">Excel</span>
                  </button>
                </div>
                {/* View mode toggle */}
                <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl overflow-hidden shadow-md">
                  <button
                    type="button"
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2.5 text-sm font-bold flex items-center space-x-2 transition-all duration-300 ${
                      viewMode === 'kanban' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-indigo-700 hover:bg-white'
                    }`}
                    title="Kanban"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <span className="hidden md:inline">Kanban</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2.5 text-sm font-bold flex items-center space-x-2 border-l-2 border-indigo-200 transition-all duration-300 ${
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
          onAdvancedSearchClick={() => setIsAdvancedSearchOpen(true)}
          hasActiveAdvancedFilters={hasActiveAdvancedFilters()}
        />

        <div className="mt-6" ref={candidateListRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Candidatos ({filteredCandidates.length})
            </h2>
            {/* Secondary toggle (mobile) */}
            <div className="sm:hidden">
              <div className="inline-flex items-center bg-white border border-indigo-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-2 text-sm ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-indigo-700'}`}
                >Kanban</button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm border-l border-indigo-200 ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-indigo-700'}`}
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
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              candidates={filteredCandidates}
              onStatusChange={handleStatusChange}
            />
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
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nome
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center">
                        Telefone
                        {renderSortIcon('phone')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handleSort('cpf')}
                    >
                      <div className="flex items-center">
                        CPF
                        {renderSortIcon('cpf')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {renderSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        Pontuação
                        {renderSortIcon('score')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Aplicado em
                        {renderSortIcon('date')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {getSortedCandidates().map(candidate => (
                    <tr key={candidate.id} className="hover:bg-purple-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{candidate.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidate.phone_number || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{candidate.cpf || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(candidate.status)}`}>
                          {getTranslatedStatus(candidate.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {candidate.score !== null && candidate.score !== undefined ? (
                          <ScoreBadge candidate={candidate} size="sm" showGrade={true} />
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
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

        {/* Advanced Search Modal */}
        <AdvancedSearchModal
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onApplyFilters={handleAdvancedFiltersApply}
          currentFilters={advancedFilters}
        />
      </div>
  );
}

export default Dashboard;
