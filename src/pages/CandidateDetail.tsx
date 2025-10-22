import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import { Candidate, CandidateStatus, Interview } from '../types';
import { getTranslatedStatus } from '../utils/statusTranslations';
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
  score?: number;
  maxScore?: number;
}

function InfoItem({ label, value, score, maxScore }: InfoItemProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 relative">
      {score !== undefined && maxScore !== undefined && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
          {score.toFixed(1)}/{maxScore}
        </div>
      )}
      <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium text-lg pr-16">{value}</p>
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
  const [scoringConfig, setScoringConfig] = useState<any>(null);
  
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
      fetchScoringConfig();
    }
  }, [id]);

  const fetchScoringConfig = async () => {
    try {
      const config = await candidateAPI.getScoringConfig();
      setScoringConfig(config.weights);
    } catch (err) {
      console.error('Error fetching scoring config:', err);
    }
  };

  const fetchCandidate = async (candidateId: number) => {
    try {
      setLoading(true);
      const data = await candidateAPI.getById(candidateId);
      console.log('Candidate data received:', data);
      console.log('Professional experiences:', data.professional_experiences);
      
      // Always recalculate score to ensure it's up to date with current config
      console.log('Recalculating score to match current configuration...');
      try {
        await candidateAPI.calculateScore(candidateId);
        // Fetch again to get updated score
        const updatedData = await candidateAPI.getById(candidateId);
        setCandidate(updatedData);
        setNotes(updatedData.notes || '');
      } catch (scoreErr) {
        console.error('Error calculating score:', scoreErr);
        // Still set the candidate data even if score calculation fails
        setCandidate(data);
        setNotes(data.notes || '');
      }
      
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Removed 'Voltar ao Painel' link as requested */}

        {/* Header Card with Gradient */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl mb-6">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
          
          <div className="relative p-8">
            {/* Top Section: Avatar, Name, and Application Date */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {candidate.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {candidate.full_name}
                  </h1>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Candidatura: {new Date(candidate.applied_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <span className={`status-badge ${statusColors[candidate.status]} inline-block text-sm px-5 py-2 rounded-xl font-semibold shadow-md`}>
                  {getTranslatedStatus(candidate.status)}
                </span>
                {candidate.score !== undefined && candidate.score !== null && (
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-3 rounded-xl shadow-lg">
                    <div className="text-center">
                      <div className="text-xs font-bold text-white uppercase tracking-wide mb-1">Pontuação Total</div>
                      <div className="text-3xl font-black text-white">{Number(candidate.score).toFixed(1)}</div>
                      <div className="text-xs font-semibold text-white/90">de 100 pontos</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-gray-900 font-medium truncate">{candidate.email || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Telefone</p>
                  <p className="text-gray-900 font-medium">{candidate.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Data de Nascimento</p>
                  <p className="text-gray-900 font-medium">{candidate.date_of_birth ? new Date(candidate.date_of_birth).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* CPF, Access Code, and Status Change */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2.5 rounded-xl font-medium border border-purple-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CPF: {candidate.cpf}</span>
              </div>
              {candidate.access_code && (
                <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-medium border border-indigo-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Código: {candidate.access_code}</span>
                </div>
              )}
              
              {/* Inline Status Change - pushed to the right */}
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm font-semibold text-indigo-600 whitespace-nowrap">
                  Alterar Status:
                </label>
                <select
                  value={candidate.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="select-modern pl-4 pr-10 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:border-purple-300 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                >
                  <option value="pending">🟡 Pendente</option>
                  <option value="reviewing">🔵 Em Análise</option>
                  <option value="shortlisted">🟢 Selecionado para Entrevista</option>
                  <option value="interviewed">🟣 Entrevistado</option>
                  <option value="accepted">✅ Aceito</option>
                  <option value="rejected">❌ Rejeitado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Card */}
        {candidate.score_breakdown && (
          <div className="bg-white rounded-xl shadow p-6 mb-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white shadow">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Detalhamento da Pontuação</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Experience & Skills */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-900 text-sm">Experiência</h3>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-blue-700">{(candidate.score_breakdown.experience_skills || 0).toFixed(1)}</div>
                  <div className="text-xs font-semibold text-blue-600">/ {scoringConfig ? scoringConfig.experience_skills.years_of_experience : 20} pts</div>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(((candidate.score_breakdown.experience_skills || 0) / (scoringConfig ? scoringConfig.experience_skills.years_of_experience : 20)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Education */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-900 text-sm">Educação</h3>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-purple-700">{(candidate.score_breakdown.education || 0).toFixed(1)}</div>
                  <div className="text-xs font-semibold text-purple-600">/ {scoringConfig ? (scoringConfig.education.education_level + scoringConfig.education.courses + (scoringConfig.education.skills || 0) + (scoringConfig.education.certifications || 0)) : 29} pts</div>
                </div>
                <div className="mt-2 bg-purple-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(((candidate.score_breakdown.education || 0) / (scoringConfig ? (scoringConfig.education.education_level + scoringConfig.education.courses + (scoringConfig.education.skills || 0) + (scoringConfig.education.certifications || 0)) : 29)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Availability & Logistics */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-teal-600 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-900 text-sm">Disponibilidade</h3>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-green-700">{(candidate.score_breakdown.availability_logistics || 0).toFixed(1)}</div>
                  <div className="text-xs font-semibold text-green-600">/ {scoringConfig ? (scoringConfig.availability_logistics.immediate_availability + scoringConfig.availability_logistics.own_transportation + scoringConfig.availability_logistics.travel_availability + (scoringConfig.availability_logistics.height_painting || 0)) : 23} pts</div>
                </div>
                <div className="mt-2 bg-green-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(((candidate.score_breakdown.availability_logistics || 0) / (scoringConfig ? (scoringConfig.availability_logistics.immediate_availability + scoringConfig.availability_logistics.own_transportation + scoringConfig.availability_logistics.travel_availability + (scoringConfig.availability_logistics.height_painting || 0)) : 23)) * 100, 100)}%` }}
                  />
                </div>
              </div>


              {/* Interview Performance */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-amber-900 text-sm">Entrevista</h3>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-amber-700">{(candidate.score_breakdown.interview_performance || 0).toFixed(1)}</div>
                  <div className="text-xs font-semibold text-amber-600">/ {scoringConfig ? (scoringConfig.interview_performance.average_rating + scoringConfig.interview_performance.feedback_quality) : 30} pts</div>
                </div>
                <div className="mt-2 bg-amber-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(((candidate.score_breakdown.interview_performance || 0) / (scoringConfig ? (scoringConfig.interview_performance.average_rating + scoringConfig.interview_performance.feedback_quality) : 30)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experiências Profissionais Section */}
        {candidate.professional_experiences && candidate.professional_experiences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Experiências Profissionais</h2>
              </div>
              {candidate.score_breakdown && candidate.score_breakdown.experience_skills > 0 && scoringConfig && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Pontuação Experiência</div>
                  <div className="text-lg font-bold text-blue-700">
                    {(candidate.score_breakdown.experience_skills || 0).toFixed(1)}/
                    {scoringConfig.experience_skills.years_of_experience}
                  </div>
                </div>
              )}
            </div>
            
            {/* Experience Summary with Score Breakdown */}
            {scoringConfig && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                <InfoItem 
                  label="Anos de Experiência" 
                  value={(() => {
                    const totalDays = candidate.professional_experiences.reduce((total, exp) => {
                      if (exp.data_admissao) {
                        const endDate = exp.data_desligamento ? new Date(exp.data_desligamento) : new Date();
                        const startDate = new Date(exp.data_admissao);
                        if (endDate >= startDate) {
                          return total + (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                        }
                      }
                      return total;
                    }, 0);
                    const years = Math.round((totalDays / 365.25) * 10) / 10;
                    return `${years} ano${years !== 1 ? 's' : ''}`;
                  })()}
                  score={scoringConfig ? (() => {
                    const totalDays = candidate.professional_experiences.reduce((total, exp) => {
                      if (exp.data_admissao) {
                        const endDate = exp.data_desligamento ? new Date(exp.data_desligamento) : new Date();
                        const startDate = new Date(exp.data_admissao);
                        if (endDate >= startDate) {
                          return total + (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                        }
                      }
                      return total;
                    }, 0);
                    const years = totalDays / 365.25;
                    const yearsMax = scoringConfig.experience_skills.years_of_experience;
                    if (years >= 6) return yearsMax;
                    if (years >= 4) return yearsMax * 0.87;
                    if (years >= 2) return yearsMax * 0.67;
                    if (years >= 1) return yearsMax * 0.33;
                    return yearsMax * 0.13;
                  })() : undefined}
                  maxScore={scoringConfig?.experience_skills.years_of_experience}
                />
              </div>
            )}

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

        {/* Educação & Qualificações Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Educação & Qualificações</h2>
            </div>
            {candidate.score_breakdown && candidate.score_breakdown.education > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 rounded-xl border border-purple-200">
                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Pontuação Educação</div>
                <div className="text-lg font-bold text-purple-700">{(candidate.score_breakdown.education || 0).toFixed(1)}/{scoringConfig ? scoringConfig.education.education_level + scoringConfig.education.courses : 20}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              label="Escolaridade" 
              value={
                candidate.highest_education === 'analfabeto' ? 'Analfabeto' :
                candidate.highest_education === 'fundamental_incompleto' ? 'Ensino fundamental incompleto' :
                candidate.highest_education === 'fundamental_completo' ? 'Ensino fundamental completo' :
                candidate.highest_education === 'medio_incompleto' ? 'Ensino Médio incompleto' :
                candidate.highest_education === 'medio_completo' ? 'Ensino Médio completo' :
                candidate.highest_education === 'tecnica_incompleta' ? 'Educação Técnica incompleta' :
                candidate.highest_education === 'tecnica_completa' ? 'Educação Técnica completa' :
                candidate.highest_education === 'superior_incompleta' ? 'Educação Superior incompleta' :
                candidate.highest_education === 'superior_completa' ? 'Educação Superior completa' : 'N/A'
              }
              score={scoringConfig ? (
                candidate.highest_education === 'fundamental_incompleto' ? 0.2 * scoringConfig.education.education_level :
                candidate.highest_education === 'fundamental_completo' ? 0.3 * scoringConfig.education.education_level :
                candidate.highest_education === 'medio_incompleto' ? 0.5 * scoringConfig.education.education_level :
                candidate.highest_education === 'medio_completo' ? 0.6 * scoringConfig.education.education_level :
                candidate.highest_education === 'tecnica_incompleta' ? 0.7 * scoringConfig.education.education_level :
                candidate.highest_education === 'tecnica_completa' ? 0.8 * scoringConfig.education.education_level :
                candidate.highest_education === 'superior_incompleta' ? 0.85 * scoringConfig.education.education_level :
                candidate.highest_education === 'superior_completa' ? 0.95 * scoringConfig.education.education_level :
                candidate.highest_education === 'pos_graduacao' ? 1.0 * scoringConfig.education.education_level : 0
              ) : undefined}
              maxScore={scoringConfig?.education.education_level}
            />
            <InfoItem 
              label="Cursos Adicionais" 
              value={(() => {
                const courses = (candidate as any).courses || '';
                if (!courses || !courses.trim()) return 'Nenhum';
                const courseList = courses.split(',').map((c: string) => c.trim()).filter((c: string) => c);
                return `${courseList.length} curso${courseList.length !== 1 ? 's' : ''}`;
              })()}
              score={scoringConfig ? (() => {
                const courses = (candidate as any).courses || '';
                if (!courses || !courses.trim()) return 0;
                const courseCount = courses.split(',').map((c: string) => c.trim()).filter((c: string) => c).length;
                return Math.min(courseCount * 0.5, scoringConfig.education.courses);
              })() : undefined}
              maxScore={scoringConfig?.education.courses}
            />
            <InfoItem 
              label="Habilidades" 
              value={(() => {
                const skills = candidate.skills || '';
                if (!skills.trim()) return 'Nenhuma';
                const skillList = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
                return `${skillList.length} habilidade${skillList.length !== 1 ? 's' : ''}`;
              })()}
              score={scoringConfig ? (() => {
                const skills = candidate.skills || '';
                if (!skills.trim()) return 0;
                const skillCount = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s).length;
                const skillsMax = scoringConfig.education.skills || 0;
                if (skillCount >= 5) return skillsMax;
                if (skillCount >= 3) return skillsMax * 0.75;
                if (skillCount >= 1) return skillsMax * 0.5;
                return 0;
              })() : undefined}
              maxScore={scoringConfig?.education.skills}
            />
            <InfoItem 
              label="Certificações" 
              value={(() => {
                const certs = candidate.certifications || '';
                if (!certs.trim()) return 'Nenhuma';
                const certList = certs.split(',').map((c: string) => c.trim()).filter((c: string) => c);
                return `${certList.length} certificação${certList.length !== 1 ? 'ões' : ''}`;
              })()}
              score={scoringConfig ? (() => {
                const certs = candidate.certifications || '';
                if (!certs.trim()) return 0;
                const certCount = certs.split(',').map((c: string) => c.trim()).filter((c: string) => c).length;
                const certMax = scoringConfig.education.certifications || 0;
                if (certCount >= 3) return certMax;
                if (certCount >= 2) return certMax * 0.71;
                if (certCount >= 1) return certMax * 0.43;
                return 0;
              })() : undefined}
              maxScore={scoringConfig?.education.certifications}
            />
          </div>
        </div>

        {/* Disponibilidade & Logística Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Disponibilidade & Logística</h2>
            </div>
            {candidate.score_breakdown && candidate.score_breakdown.availability_logistics > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 rounded-xl border border-green-200">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Pontuação Disponibilidade</div>
                <div className="text-lg font-bold text-green-700">{(candidate.score_breakdown.availability_logistics || 0).toFixed(1)}/{scoringConfig ? scoringConfig.availability_logistics.immediate_availability + scoringConfig.availability_logistics.own_transportation + scoringConfig.availability_logistics.travel_availability + (scoringConfig.availability_logistics.height_painting || 0) : 26}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              label="Disponibilidade para Início" 
              value={
                candidate.availability_start === 'imediato' ? 'De imediato' :
                candidate.availability_start === '15_dias' ? '15 dias' :
                candidate.availability_start === '30_dias' ? '30 dias' : 'N/A'
              }
              score={scoringConfig ? (
                candidate.availability_start === 'imediato' ? scoringConfig.availability_logistics.immediate_availability :
                candidate.availability_start === '15_dias' ? scoringConfig.availability_logistics.immediate_availability * 0.75 :
                candidate.availability_start === '30_dias' ? scoringConfig.availability_logistics.immediate_availability * 0.5 : 0
              ) : undefined}
              maxScore={scoringConfig?.availability_logistics.immediate_availability}
            />
            <InfoItem 
              label="Transporte Próprio" 
              value={candidate.has_own_transportation === 'sim' ? 'Sim' : candidate.has_own_transportation === 'nao' ? 'Não' : 'N/A'}
              score={scoringConfig && candidate.has_own_transportation === 'sim' ? scoringConfig.availability_logistics.own_transportation : 0}
              maxScore={scoringConfig?.availability_logistics.own_transportation}
            />
            <InfoItem 
              label="Disponibilidade para Viagens" 
              value={candidate.travel_availability === 'sim' ? 'Sim' : candidate.travel_availability === 'nao' ? 'Não' : 'N/A'}
              score={scoringConfig ? (
                candidate.travel_availability === 'sim' ? scoringConfig.availability_logistics.travel_availability :
                candidate.travel_availability === 'ocasionalmente' ? scoringConfig.availability_logistics.travel_availability * 0.5 : 0
              ) : undefined}
              maxScore={scoringConfig?.availability_logistics.travel_availability}
            />
            <InfoItem 
              label="Pintura em Altura (Balancim/Cadeirinha/Andaimes)" 
              value={candidate.height_painting === 'sim' ? 'Sim' : candidate.height_painting === 'nao' ? 'Não' : 'N/A'}
              score={scoringConfig && candidate.height_painting === 'sim' ? scoringConfig.availability_logistics.height_painting : 0}
              maxScore={scoringConfig?.availability_logistics.height_painting}
            />
          </div>
        </div>

        {/* Interviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Entrevistas</h2>
            </div>
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
            <div className="text-center py-16 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-green-200 border-dashed">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg">
                📅
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Nenhuma entrevista agendada
              </h3>
              <p className="text-gray-700 mb-6 text-lg">
                Agende a primeira entrevista com este candidato.
              </p>
              <button
                onClick={handleScheduleInterview}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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

        {/* Contact and Address Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contato e Endereço</h2>
            </div>
          </div>
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

        {/* Informações Extras Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Informações Extras</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Atualmente Empregado" value={candidate.currently_employed === 'sim' ? 'Sim' : candidate.currently_employed === 'nao' ? 'Não' : 'N/A'} />
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Informações Pessoais</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Internal Notes Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notas Internas</h2>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full px-5 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:border-purple-300 transition-all font-medium resize-none"
            placeholder="✍️ Adicione notas internas sobre este candidato..."
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Salvar Notas
              </>
            )}
          </button>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600">Zona de Perigo</h2>
          </div>
          <p className="text-gray-700 mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
            ⚠️ Uma vez que você deletar um candidato, não há como voltar atrás. Tenha certeza.
          </p>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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
