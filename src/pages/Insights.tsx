import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { candidateAPI } from '../services/api';
import { Candidate } from '../types';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

function Insights() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart data states
  const [genderData, setGenderData] = useState<ChartData[]>([]);
  const [disabilityData, setDisabilityData] = useState<ChartData[]>([]);
  const [transportationData, setTransportationData] = useState<ChartData[]>([]);
  const [referralData, setReferralData] = useState<ChartData[]>([]);
  const [availabilityData, setAvailabilityData] = useState<ChartData[]>([]);
  const [travelData, setTravelData] = useState<ChartData[]>([]);
  const [heightPaintingData, setHeightPaintingData] = useState<ChartData[]>([]);
  const [employmentData, setEmploymentData] = useState<ChartData[]>([]);

  // Colors
  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#94a3b8'];
  const DISABILITY_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];
  const BINARY_COLORS = ['#10b981', '#ef4444'];
  const REFERRAL_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Helper function to navigate to Dashboard with filters
  const navigateToFilteredDashboard = (filterType: string, filterValue: string) => {
    const params = new URLSearchParams();
    params.set(filterType, filterValue);
    navigate(`/dashboard?${params.toString()}`);
  };

  // Click handlers for different chart types
  const handleGenderClick = (data: any) => {
    if (data && data.name) {
      const genderMap: { [key: string]: string } = {
        'Masculino': 'masculino',
        'Feminino': 'feminino',
        'Prefiro não informar': 'prefiro_nao_informar'
      };
      navigateToFilteredDashboard('gender', genderMap[data.name] || data.name);
    }
  };

  const handleDisabilityClick = (data: any) => {
    if (data && data.name) {
      const disabilityMap: { [key: string]: string } = {
        'Sem deficiência': 'sem_deficiencia',
        'Física': 'fisica',
        'Auditiva': 'auditiva',
        'Visual': 'visual',
        'Mental': 'mental',
        'Múltipla': 'multipla',
        'Reabilitado': 'reabilitado'
      };
      navigateToFilteredDashboard('disability', disabilityMap[data.name] || data.name);
    }
  };

  const handleTransportationClick = (data: any) => {
    if (data && data.name) {
      const value = data.name === 'Sim' ? 'sim' : 'nao';
      navigateToFilteredDashboard('transportation', value);
    }
  };

  const handleReferralClick = (data: any) => {
    if (data && data.name) {
      const referralMap: { [key: string]: string } = {
        'Facebook': 'facebook',
        'Indicação': 'indicacao_colaborador',
        'Instagram': 'instagram',
        'LinkedIn': 'linkedin',
        'Sine': 'sine',
        'Outros': 'outros'
      };
      navigateToFilteredDashboard('how_found_vacancy', referralMap[data.name] || data.name);
    }
  };

  const handleAvailabilityClick = (data: any) => {
    if (data && data.name) {
      const availabilityMap: { [key: string]: string } = {
        'Imediato': 'imediato',
        '15 dias': '15_dias',
        '30 dias': '30_dias',
        'A combinar': 'a_combinar'
      };
      navigateToFilteredDashboard('availability', availabilityMap[data.name] || data.name);
    }
  };

  const handleTravelClick = (data: any) => {
    if (data && data.name) {
      const value = data.name === 'Sim' ? 'sim' : 'nao';
      navigateToFilteredDashboard('travel_availability', value);
    }
  };

  const handleHeightPaintingClick = (data: any) => {
    if (data && data.name) {
      const value = data.name === 'Sim' ? 'sim' : 'nao';
      navigateToFilteredDashboard('height_painting', value);
    }
  };

  const handleEmploymentClick = (data: any) => {
    if (data && data.name) {
      const value = data.name === 'Sim' ? 'sim' : 'nao';
      navigateToFilteredDashboard('currently_employed', value);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getAll();
      setCandidates(data);
      setFilteredCandidates(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados. Por favor, tente novamente.');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on status
  const applyStatusFilter = (filter: string) => {
    setStatusFilter(filter);
    
    if (filter === 'all') {
      setFilteredCandidates(candidates);
    } else if (filter === 'in_process') {
      // Candidates still in the process (not accepted or rejected)
      const filtered = candidates.filter(c => 
        ['pending', 'reviewing', 'shortlisted', 'interviewed'].includes(c.status)
      );
      setFilteredCandidates(filtered);
    } else if (filter === 'accepted') {
      const filtered = candidates.filter(c => c.status === 'accepted');
      setFilteredCandidates(filtered);
    } else if (filter === 'rejected') {
      const filtered = candidates.filter(c => c.status === 'rejected');
      setFilteredCandidates(filtered);
    }
  };

  // Re-apply filter when candidates change
  useEffect(() => {
    applyStatusFilter(statusFilter);
  }, [candidates]);

  const processAllData = () => {
    processGenderData();
    processDisabilityData();
    processTransportationData();
    processReferralData();
    processAvailabilityData();
    processTravelData();
    processHeightPaintingData();
    processEmploymentData();
  };

  // Re-process data when filtered candidates change
  useEffect(() => {
    if (filteredCandidates.length > 0) {
      processAllData();
    }
  }, [filteredCandidates]);

  const processGenderData = () => {
    const genderCount: { [key: string]: number } = {};
    filteredCandidates.forEach(candidate => {
      if (candidate.gender === 'masculino') genderCount['Masculino'] = (genderCount['Masculino'] || 0) + 1;
      else if (candidate.gender === 'feminino') genderCount['Feminino'] = (genderCount['Feminino'] || 0) + 1;
      else if (candidate.gender === 'prefiro_nao_informar') genderCount['Prefiro não informar'] = (genderCount['Prefiro não informar'] || 0) + 1;
    });
    setGenderData(Object.entries(genderCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })));
  };

  const processDisabilityData = () => {
    const disabilityCount: { [key: string]: number } = {};
    const labels: { [key: string]: string } = {
      'sem_deficiencia': 'Sem deficiência', 'fisica': 'Física', 'auditiva': 'Auditiva',
      'visual': 'Visual', 'mental': 'Mental', 'multipla': 'Múltipla', 'reabilitado': 'Reabilitado'
    };
    filteredCandidates.forEach(candidate => {
      if (candidate.disability) disabilityCount[labels[candidate.disability] || candidate.disability] = (disabilityCount[labels[candidate.disability] || candidate.disability] || 0) + 1;
    });
    setDisabilityData(Object.entries(disabilityCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
  };

  const processTransportationData = () => {
    const transportationCount = { sim: 0, nao: 0 };
    filteredCandidates.forEach(candidate => {
      if (candidate.has_own_transportation === 'sim') transportationCount.sim++;
      else if (candidate.has_own_transportation === 'nao') transportationCount.nao++;
    });
    setTransportationData(Object.entries(transportationCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name: name === 'sim' ? 'Sim' : 'Não', value })));
  };

  const processReferralData = () => {
    const referralCount: { [key: string]: number } = {};
    const labels: { [key: string]: string } = {
      'facebook': 'Facebook', 'indicacao_colaborador': 'Indicação', 'instagram': 'Instagram',
      'linkedin': 'LinkedIn', 'sine': 'Sine', 'outros': 'Outros'
    };
    filteredCandidates.forEach(candidate => {
      if (candidate.how_found_vacancy) referralCount[labels[candidate.how_found_vacancy] || candidate.how_found_vacancy] = (referralCount[labels[candidate.how_found_vacancy] || candidate.how_found_vacancy] || 0) + 1;
    });
    setReferralData(Object.entries(referralCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
  };

  const processAvailabilityData = () => {
    const availabilityCount: { [key: string]: number } = {};
    const labels: { [key: string]: string } = { 'imediato': 'Imediato', '15_dias': '15 dias', '30_dias': '30 dias' };
    filteredCandidates.forEach(candidate => {
      if (candidate.availability_start) availabilityCount[labels[candidate.availability_start] || candidate.availability_start] = (availabilityCount[labels[candidate.availability_start] || candidate.availability_start] || 0) + 1;
    });
    setAvailabilityData(Object.entries(availabilityCount).map(([name, value]) => ({ name, value })));
  };

  const processTravelData = () => {
    const travelCount = { sim: 0, nao: 0 };
    filteredCandidates.forEach(candidate => {
      if (candidate.travel_availability === 'sim') travelCount.sim++;
      else if (candidate.travel_availability === 'nao') travelCount.nao++;
    });
    setTravelData(Object.entries(travelCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name: name === 'sim' ? 'Sim' : 'Não', value })));
  };

  const processHeightPaintingData = () => {
    const heightPaintingCount = { sim: 0, nao: 0 };
    filteredCandidates.forEach(candidate => {
      if (candidate.height_painting === 'sim') heightPaintingCount.sim++;
      else if (candidate.height_painting === 'nao') heightPaintingCount.nao++;
    });
    setHeightPaintingData(Object.entries(heightPaintingCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name: name === 'sim' ? 'Sim' : 'Não', value })));
  };

  const processEmploymentData = () => {
    const employmentCount = { sim: 0, nao: 0 };
    filteredCandidates.forEach(candidate => {
      if (candidate.currently_employed === 'sim') employmentCount.sim++;
      else if (candidate.currently_employed === 'nao') employmentCount.nao++;
    });
    setEmploymentData(Object.entries(employmentCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name: name === 'sim' ? 'Sim' : 'Não', value })));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button onClick={fetchCandidates} className="btn-primary">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Filter */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Insights de Candidatos</h1>
              <p className="mt-2 text-gray-600">Análise detalhada dos dados dos candidatos</p>
            </div>
            
            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => applyStatusFilter(e.target.value)}
                className="block w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="all">Todos os Candidatos</option>
                <option value="in_process">Em Processo</option>
                <option value="accepted">Aceitos</option>
                <option value="rejected">Rejeitados</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Mostrando {filteredCandidates.length} de {candidates.length} candidatos
              </p>
            </div>
          </div>
        </div>

        {/* Top Priority Charts - Availability & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Disponibilidade para Início</h2>
            {availabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={availabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label onClick={handleAvailabilityClick} cursor="pointer">
                    {availabilityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={REFERRAL_COLORS[index % REFERRAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Disponibilidade para Viagens</h2>
            {travelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={travelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label onClick={handleTravelClick} cursor="pointer">
                    {travelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BINARY_COLORS[index % BINARY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pintura em Altura</h2>
            {heightPaintingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={heightPaintingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label onClick={handleHeightPaintingClick} cursor="pointer">
                    {heightPaintingData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BINARY_COLORS[index % BINARY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>
        </div>

        {/* Transportation & Employment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transporte Próprio</h2>
            {transportationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={transportationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={handleTransportationClick} cursor="pointer">
                    {transportationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BINARY_COLORS[index % BINARY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Atualmente Empregado</h2>
            {employmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={employmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={handleEmploymentClick} cursor="pointer">
                    {employmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BINARY_COLORS[index % BINARY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Gênero</h2>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={handleGenderClick} cursor="pointer">
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>

          {/* Disability Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pessoas com Deficiência (PCD)</h2>
            {disabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={disabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} onClick={handleDisabilityClick} cursor="pointer">
                    {disabilityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DISABILITY_COLORS[index % DISABILITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500">Sem dados disponíveis</p>}
          </div>
        </div>

        {/* Referral Sources */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Como Souberam da Vaga</h2>
          {referralData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={referralData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} style={{ fontSize: '14px' }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} onClick={handleReferralClick} cursor="pointer">
                  {referralData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={REFERRAL_COLORS[index % REFERRAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">Sem dados disponíveis</p>}
        </div>

        {/* Key Insights Summary */}
        <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <h2 className="text-2xl font-bold mb-4">📊 Principais Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90">Total de Candidatos</p>
              <p className="text-3xl font-bold mt-1">{filteredCandidates.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90">Com Transporte Próprio</p>
              <p className="text-3xl font-bold mt-1">
                {transportationData.find(d => d.name === 'Sim')?.value || 0}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90">Disponíveis para Viagens</p>
              <p className="text-3xl font-bold mt-1">
                {travelData.find(d => d.name === 'Sim')?.value || 0}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm opacity-90">Pintores em Altura</p>
              <p className="text-3xl font-bold mt-1">
                {heightPaintingData.find(d => d.name === 'Sim')?.value || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;
