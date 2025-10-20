import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import { Candidate, CandidateStatus, Interview } from '../types';
import { getTranslatedStatus } from '../utils/statusTranslations';
import Header from '../components/Header';
import InterviewModal from '../components/InterviewModal';
import FeedbackModal from '../components/FeedbackModal';
import InterviewCard from '../components/InterviewCard';

const statusColors: Record<CandidateStatus, string> = {
  pending: 'bg-orange-100 text-orange-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-cyan-100 text-cyan-800',
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
  
  // Interview state
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    if (id) {
      fetchCandidate(parseInt(id));
      fetchInterviews(parseInt(id));
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

  const fetchInterviews = async (candidateId: number) => {
    try {
      setLoadingInterviews(true);
      const data = await candidateAPI.getInterviews(candidateId);
      setInterviews(data);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoadingInterviews(false);
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

  const handleScheduleInterview = () => {
    setSelectedInterview(null);
    setIsInterviewModalOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsInterviewModalOpen(true);
  };

  const handleDeleteInterview = async (interviewId: number) => {
    if (!id) return;
    try {
      await import('../services/api').then(({ interviewAPI }) => interviewAPI.delete(interviewId));
      fetchInterviews(parseInt(id));
    } catch (err) {
      console.error('Error deleting interview:', err);
      alert('Failed to delete interview. Please try again.');
    }
  };

  const handleAddFeedback = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsFeedbackModalOpen(true);
  };

  const handleModalClose = () => {
    setIsInterviewModalOpen(false);
    setIsFeedbackModalOpen(false);
    setSelectedInterview(null);
  };

  const handleInterviewSuccess = () => {
    if (id) {
      fetchInterviews(parseInt(id));
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
    <div className="min-h-screen bg-purple-50">
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
                {candidate.full_name}
              </h1>
              <p className="text-gray-600">{candidate.email || 'Email não informado'}</p>
              <p className="text-gray-600">{candidate.phone_number}</p>
              <p className="text-sm text-gray-500 mt-1">CPF: {candidate.cpf}</p>
            </div>
            <div className="text-right">
              <span className={`status-badge ${statusColors[candidate.status]} inline-block mb-3`}>
                {getTranslatedStatus(candidate.status)}
              </span>
              <p className="text-sm text-gray-500">
                Candidatura: {new Date(candidate.applied_date).toLocaleDateString('pt-BR')}
              </p>
              {candidate.access_code && (
                <p className="text-sm text-gray-500 mt-1">
                  Código: {candidate.access_code}
                </p>
              )}
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
              <option value="shortlisted">Selecionado para Entrevista</option>
              <option value="interviewed">Entrevistado</option>
              <option value="accepted">Aceito</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Data de Nascimento" value={candidate.date_of_birth ? new Date(candidate.date_of_birth).toLocaleDateString('pt-BR') : 'N/A'} />
            <InfoItem label="Sexo" value={candidate.gender === 'masculino' ? 'Masculino' : candidate.gender === 'feminino' ? 'Feminino' : candidate.gender === 'prefiro_nao_informar' ? 'Prefiro não informar' : 'N/A'} />
            <InfoItem label="PCD" value={
              candidate.disability === 'sem_deficiencia' ? 'Sem deficiência' :
              candidate.disability === 'fisica' ? 'Física' :
              candidate.disability === 'auditiva' ? 'Auditiva' :
              candidate.disability === 'visual' ? 'Visual' :
              candidate.disability === 'mental' ? 'Mental' :
              candidate.disability === 'multipla' ? 'Múltipla' :
              candidate.disability === 'reabilitado' ? 'Reabilitado' : 'N/A'
            } />
            <InfoItem label="Transporte Próprio" value={candidate.has_own_transportation === 'sim' ? 'Sim' : candidate.has_own_transportation === 'nao' ? 'Não' : 'N/A'} />
            <InfoItem label="Escolaridade" value={
              candidate.highest_education === 'analfabeto' ? 'Analfabeto' :
              candidate.highest_education === 'fundamental_incompleto' ? 'Ensino fundamental incompleto' :
              candidate.highest_education === 'fundamental_completo' ? 'Ensino fundamental completo' :
              candidate.highest_education === 'medio_incompleto' ? 'Ensino Médio incompleto' :
              candidate.highest_education === 'medio_completo' ? 'Ensino Médio completo' :
              candidate.highest_education === 'tecnica_incompleta' ? 'Educação Técnica incompleta' :
              candidate.highest_education === 'tecnica_completa' ? 'Educação Técnica completa' :
              candidate.highest_education === 'superior_incompleta' ? 'Educação Superior incompleta' :
              candidate.highest_education === 'superior_completa' ? 'Educação Superior completa' : 'N/A'
            } />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contato e Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Endereço" value={candidate.address || 'N/A'} />
            <InfoItem label="Cidade" value={candidate.city || 'N/A'} />
            <InfoItem label="Estado" value={candidate.state || 'N/A'} />
            <InfoItem label="CEP" value={candidate.postal_code || 'N/A'} />
            <InfoItem label="País" value={candidate.country || 'N/A'} />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Indicação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Parentes/Amigos na Empresa" value={candidate.has_relatives_in_company === 'sim' ? 'Sim' : candidate.has_relatives_in_company === 'nao' ? 'Não' : 'N/A'} />
            <InfoItem label="Trabalhou na Pinte Antes" value={candidate.worked_at_pinte_before === 'sim' ? 'Sim' : candidate.worked_at_pinte_before === 'nao' ? 'Não' : 'N/A'} />
            <InfoItem label="Indicado Por" value={candidate.referred_by || 'N/A'} />
            <InfoItem label="Como Soube da Vaga" value={
              candidate.how_found_vacancy === 'facebook' ? 'Facebook' :
              candidate.how_found_vacancy === 'indicacao_colaborador' ? 'Indicação de colaborador' :
              candidate.how_found_vacancy === 'instagram' ? 'Instagram' :
              candidate.how_found_vacancy === 'linkedin' ? 'LinkedIn' :
              candidate.how_found_vacancy === 'sine' ? 'Sine' :
              candidate.how_found_vacancy === 'outros' ? `Outros: ${candidate.how_found_vacancy_other || ''}` : 'N/A'
            } />
          </div>
        </div>

        {candidate.professional_experiences && candidate.professional_experiences.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Experiências Profissionais</h2>
            <div className="space-y-4">
              {candidate.professional_experiences.map((exp) => (
                <div key={exp.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <h3 className="font-semibold text-lg text-gray-900">{exp.cargo}</h3>
                  <p className="text-gray-700 font-medium">{exp.empresa}</p>
                  {(exp.data_admissao || exp.data_desligamento) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {exp.data_admissao ? new Date(exp.data_admissao).toLocaleDateString('pt-BR') : '?'} - {exp.data_desligamento ? new Date(exp.data_desligamento).toLocaleDateString('pt-BR') : 'Atual'}
                    </p>
                  )}
                  {exp.descricao_atividades && (
                    <p className="text-gray-600 mt-2">{exp.descricao_atividades}</p>
                  )}
                  {exp.motivo_saida && (
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Motivo da saída:</span> {exp.motivo_saida}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Extras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Atualmente Empregado" value={candidate.currently_employed === 'sim' ? 'Sim' : candidate.currently_employed === 'nao' ? 'Não' : 'N/A'} />
            <InfoItem label="Disponibilidade para Início" value={
              candidate.availability_start === 'imediato' ? 'De imediato' :
              candidate.availability_start === '15_dias' ? '15 dias' :
              candidate.availability_start === '30_dias' ? '30 dias' : 'N/A'
            } />
            <InfoItem label="Disponibilidade para Viagens" value={candidate.travel_availability === 'sim' ? 'Sim' : candidate.travel_availability === 'nao' ? 'Não' : 'N/A'} />
            <InfoItem label="Pintura em Altura (Balancim/Cadeirinha/Andaimes)" value={candidate.height_painting === 'sim' ? 'Sim' : candidate.height_painting === 'nao' ? 'Não' : 'N/A'} />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Habilidades e Qualificações</h2>
          <div className="space-y-4">
            {candidate.skills && candidate.skills !== '' ? (
              <InfoItem label="Habilidades" value={candidate.skills} />
            ) : (
              <p className="text-gray-500">Nenhuma habilidade informada</p>
            )}
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos</h2>
          {candidate.resume ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Currículo</p>
              <a 
                href={candidate.resume} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar Currículo
              </a>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum currículo enviado</p>
          )}
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

        {/* Interviews Section */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📅 Entrevistas</h2>
            <button
              onClick={handleScheduleInterview}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agendar Entrevista
            </button>
          </div>

          {loadingInterviews ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nenhuma entrevista agendada
              </h3>
              <p className="text-gray-600 mb-4">
                Agende a primeira entrevista com este candidato.
              </p>
              <button
                onClick={handleScheduleInterview}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Agendar Primeira Entrevista
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map(interview => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onEdit={handleEditInterview}
                  onDelete={handleDeleteInterview}
                  onAddFeedback={handleAddFeedback}
                />
              ))}
            </div>
          )}
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

      {/* Modals */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={handleModalClose}
        onSuccess={handleInterviewSuccess}
        candidateId={candidate.id}
        candidateName={candidate.full_name}
        interview={selectedInterview}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleModalClose}
        onSuccess={handleInterviewSuccess}
        interview={selectedInterview}
      />
    </div>
  );
}

export default CandidateDetail;
