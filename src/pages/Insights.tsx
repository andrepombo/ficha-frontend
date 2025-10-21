import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { candidateAPI } from '../services/api';
import { Candidate } from '../types';

interface ChartData {
  name: string;
  value: number;
}

function Insights() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      processAllData();
    }
  }, [candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getAll();
      setCandidates(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados. Por favor, tente novamente.');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const processGenderData = () => {
    const counts: { [key: string]: number } = { 'Masculino': 0, 'Feminino': 0, 'Prefiro não informar': 0 };
    candidates.forEach(c => {
      if (c.gender === 'masculino') counts['Masculino']++;
      else if (c.gender === 'feminino') counts['Feminino']++;
      else if (c.gender === 'prefiro_nao_informar') counts['Prefiro não informar']++;
    });
    setGenderData(Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })));
  };

  const processDisabilityData = () => {
    const labels: { [key: string]: string } = {
      'sem_deficiencia': 'Sem deficiência', 'fisica': 'Física', 'auditiva': 'Auditiva',
      'visual': 'Visual', 'mental': 'Mental', 'multipla': 'Múltipla', 'reabilitado': 'Reabilitado'
    };
    const counts: { [key: string]: number } = {};
    candidates.forEach(c => {
      if (c.disability) counts[labels[c.disability] || c.disability] = (counts[labels[c.disability] || c.disability] || 0) + 1;
    });
    setDisabilityData(Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
  };

  const processTransportationData = () => {
    const counts = { 'Sim': 0, 'Não': 0 };
    candidates.forEach(c => {
      if (c.has_own_transportation === 'sim') counts['Sim']++;
      else if (c.has_own_transportation === 'nao') counts['Não']++;
    });
    setTransportationData(Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })));
  };

  const processReferralData = () => {
    const labels: { [key: string]: string } = {
      'facebook': 'Facebook', 'indicacao_colaborador': 'Indicação', 'instagram': 'Instagram',
      'linkedin': 'LinkedIn', 'sine': 'Sine', 'outros': 'Outros'
    };
    const counts: { [key: string]: number } = {};
    candidates.forEach(c => {
      if (c.how_found_vacancy) counts[labels[c.how_found_vacancy] || c.how_found_vacancy] = (counts[labels[c.how_found_vacancy] || c.how_found_vacancy] || 0) + 1;
    });
    setReferralData(Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
  };

  const processAvailabilityData = () => {
    const labels: { [key: string]: string } = { 'imediato': 'Imediato', '15_dias': '15 dias', '30_dias': '30 dias' };
    const counts: { [key: string]: number } = {};
    candidates.forEach(c => {
      if (c.availability_start) counts[labels[c.availability_start] || c.availability_start] = (counts[labels[c.availability_start] || c.availability_start] || 0) + 1;
    });
    setAvailabilityData(Object.entries(counts).map(([name, value]) => ({ name, value })));
  };

  const processTravelData = () => {
    const counts = { 'Sim': 0, 'Não': 0 };
    candidates.forEach(c => {
      if (c.travel_availability === 'sim') counts['Sim']++;
      else if (c.travel_availability === 'nao') counts['Não']++;
    });
    setTravelData(Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })));
  };

  const processHeightPaintingData = () => {
    const counts = { 'Sim': 0, 'Não': 0 };
    candidates.forEach(c => {
      if (c.height_painting === 'sim') counts['Sim']++;
      else if (c.height_painting === 'nao') counts['Não']++;
    });
    setHeightPaintingData(Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })));
  };

  const processEmploymentData = () => {
    const counts = { 'Sim': 0, 'Não': 0 };
    candidates.forEach(c => {
      if (c.currently_employed === 'sim') counts['Sim']++;
      else if (c.currently_employed === 'nao') counts['Não']++;
    });
    setEmploymentData(Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })));
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insights dos Candidatos</h1>
          <p className="mt-2 text-gray-600">Análise detalhada das características e preferências dos candidatos</p>
        </div>

        {/* Top Priority Charts - Availability & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Disponibilidade para Início</h2>
            {availabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={availabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                  <Pie data={travelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                  <Pie data={heightPaintingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                  <Pie data={transportationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
                  <Pie data={employmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
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
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
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
              <p className="text-3xl font-bold mt-1">{candidates.length}</p>
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
