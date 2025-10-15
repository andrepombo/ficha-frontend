import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import { Candidate, CandidateStatus } from '../types';
import { getTranslatedStatus } from '../utils/statusTranslations';
import Header from '../components/Header';

const statusColors: Record<CandidateStatus, string> = {
  pending: 'bg-orange-100 text-orange-800',
  reviewing: 'bg-blue-100 text-blue-800',
  interviewed: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

interface InfoItemProps {
  label: string;
  value: string | number;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCandidate(parseInt(id));
    }
  }, [id]);

  const fetchCandidate = async (candidateId: number) => {
    try {
      setLoading(true);
      const data = await candidateAPI.getById(candidateId);
      setCandidate(data);
      setNotes(data.notes || '');
      setError(null);
    } catch (err) {
      setError('Failed to load candidate details.');
      console.error('Error fetching candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!candidate) return;
    
    try {
      await candidateAPI.updateStatus(candidate.id, newStatus);
      setCandidate(prev => prev ? { ...prev, status: newStatus as CandidateStatus } : null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    if (!candidate) return;
    
    try {
      setSaving(true);
      await candidateAPI.updateNotes(candidate.id, notes);
      setCandidate(prev => prev ? { ...prev, notes } : null);
      alert('Notes saved successfully!');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!candidate) return;
    
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }
    
    try {
      await candidateAPI.delete(candidate.id);
      alert('Candidate deleted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      alert('Failed to delete candidate. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes do candidato...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Candidato não encontrado'}</p>
          <Link to="/dashboard" className="btn-primary">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Painel
        </Link>

        <div className="card mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {candidate.first_name} {candidate.last_name}
              </h1>
              <p className="text-gray-600">{candidate.email}</p>
              <p className="text-gray-600">{candidate.phone_number}</p>
            </div>
            <div className="text-right">
              <span className={`status-badge ${statusColors[candidate.status]} inline-block mb-3`}>
                {getTranslatedStatus(candidate.status)}
              </span>
              <p className="text-sm text-gray-500">
                Candidatura: {new Date(candidate.applied_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alterar Status
            </label>
            <select
              value={candidate.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pendente</option>
              <option value="reviewing">Em Análise</option>
              <option value="interviewed">Entrevistado</option>
              <option value="accepted">Aceito</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Profissionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Cargo Pretendido" value={candidate.position_applied} />
            <InfoItem label="Anos de Experiência" value={`${candidate.years_of_experience} anos`} />
            <InfoItem label="Empresa Atual" value={candidate.current_company || 'N/A'} />
            <InfoItem label="Cargo Atual" value={candidate.current_position || 'N/A'} />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Educação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Nível de Educação" value={candidate.highest_education || 'N/A'} />
            <InfoItem label="Área de Estudo" value={candidate.field_of_study || 'N/A'} />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contato e Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Endereço" value={candidate.address || 'N/A'} />
            <InfoItem label="Cidade" value={candidate.city || 'N/A'} />
            <InfoItem label="Estado" value={candidate.state || 'N/A'} />
            <InfoItem label="CEP" value={candidate.postal_code || 'N/A'} />
            <InfoItem label="País" value={candidate.country} />
            <InfoItem label="Data de Nascimento" value={candidate.date_of_birth ? new Date(candidate.date_of_birth).toLocaleDateString('pt-BR') : 'N/A'} />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Habilidades e Informações Adicionais</h2>
          <div className="space-y-4">
            <InfoItem label="Habilidades" value={candidate.skills || 'N/A'} />
            <InfoItem label="Certificações" value={candidate.certifications || 'N/A'} />
            {candidate.linkedin_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">LinkedIn</p>
                <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {candidate.linkedin_url}
                </a>
              </div>
            )}
            {candidate.portfolio_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Portfolio</p>
                <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {candidate.portfolio_url}
                </a>
              </div>
            )}
            {candidate.resume && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Currículo</p>
                <a href={candidate.resume} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  Baixar Currículo
                </a>
              </div>
            )}
          </div>
        </div>

        {candidate.cover_letter && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Carta de Apresentação</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{candidate.cover_letter}</p>
          </div>
        )}

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Disponibilidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              label="Data de Início" 
              value={candidate.available_start_date ? new Date(candidate.available_start_date).toLocaleDateString('pt-BR') : 'N/A'} 
            />
            <InfoItem 
              label="Salário Esperado" 
              value={candidate.expected_salary ? `R$ ${parseFloat(candidate.expected_salary).toLocaleString('pt-BR')}` : 'N/A'} 
            />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notas Internas</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Adicione notas internas sobre este candidato..."
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="mt-3 btn-primary"
          >
            {saving ? 'Salvando...' : 'Salvar Notas'}
          </button>
        </div>

        <div className="card border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Zona de Perigo</h2>
          <p className="text-gray-600 mb-4">
            Uma vez que você deletar um candidato, não há como voltar atrás. Tenha certeza.
          </p>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Deletar Candidato
          </button>
        </div>
      </div>
    </div>
  );
}

export default CandidateDetail;
