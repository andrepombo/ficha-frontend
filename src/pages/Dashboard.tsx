import { useState, useEffect } from 'react';
import { candidateAPI } from '../services/api';
import { Candidate, CandidateFilters, CandidateStats } from '../types';
import CandidateCard from '../components/CandidateCard';
import StatsCard from '../components/StatsCard';
import FilterBar from '../components/FilterBar';
import Header from '../components/Header';

function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CandidateStats>({
    total: 0,
    pending: 0,
    reviewing: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
  });
  const [filters, setFilters] = useState<CandidateFilters>({
    status: 'all',
    search: '',
    position: 'all',
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

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
        c.first_name.toLowerCase().includes(searchLower) ||
        c.last_name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.position_applied.toLowerCase().includes(searchLower)
      );
    }

    if (filters.position !== 'all') {
      filtered = filtered.filter(c => c.position_applied === filters.position);
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

  const positions = [...new Set(candidates.map(c => c.position_applied))];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Total" count={stats.total} color="blue" />
          <StatsCard title="Pendente" count={stats.pending} color="orange" />
          <StatsCard title="Em Análise" count={stats.reviewing} color="purple" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Candidatos ({filteredCandidates.length})
          </h2>
          
          {filteredCandidates.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum candidato encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
