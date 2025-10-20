import React, { useState, useEffect } from 'react';
import { Interview, User, InterviewType, InterviewStatus } from '../types';
import { interviewAPI, userAPI } from '../services/api';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidateId: number;
  candidateName: string;
  interview?: Interview | null;
}

const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  candidateId,
  candidateName,
  interview,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    interview_type: 'video' as InterviewType,
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    location: '',
    description: '',
    interviewer: null as number | null,
    status: 'scheduled' as InterviewStatus,
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      if (interview) {
        setFormData({
          title: interview.title,
          interview_type: interview.interview_type,
          scheduled_date: interview.scheduled_date,
          scheduled_time: interview.scheduled_time,
          duration_minutes: interview.duration_minutes,
          location: interview.location || '',
          description: interview.description || '',
          interviewer: interview.interviewer,
          status: interview.status,
        });
      } else {
        // Reset form for new interview
        setFormData({
          title: `Entrevista - ${candidateName}`,
          interview_type: 'video',
          scheduled_date: '',
          scheduled_time: '',
          duration_minutes: 60,
          location: '',
          description: '',
          interviewer: null,
          status: 'scheduled',
        });
      }
    }
  }, [isOpen, interview, candidateName]);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        candidate: candidateId,
      };

      if (interview) {
        await interviewAPI.update(interview.id, data);
      } else {
        await interviewAPI.create(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar entrevista');
      console.error('Error saving interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'interviewer' 
        ? (value ? parseInt(value) : null)
        : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {interview ? 'Editar Entrevista' : 'Agendar Entrevista'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-100 mt-2">Candidato: {candidateName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
              Título da Entrevista *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Ex: Entrevista Técnica - Desenvolvedor"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Tipo de Entrevista *
              </label>
              <select
                name="interview_type"
                value={formData.interview_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="video">Vídeo</option>
                <option value="phone">Telefone</option>
                <option value="in_person">Presencial</option>
                <option value="technical">Técnica</option>
                <option value="hr">RH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Entrevistador
              </label>
              <select
                name="interviewer"
                value={formData.interviewer || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Selecione um entrevistador</option>
                {users && users.length > 0 ? (
                  users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum usuário disponível</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Data *
              </label>
              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Horário *
              </label>
              <input
                type="time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Duração (min) *
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                min="15"
                step="15"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
              Local / Link da Reunião
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Ex: https://meet.google.com/xxx ou Sala 301"
            />
          </div>

          {interview && (
            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="scheduled">Agendada</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
                <option value="rescheduled">Reagendada</option>
                <option value="no_show">Candidato não compareceu</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-indigo-900 mb-2">
              Descrição / Notas
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Adicione detalhes sobre a entrevista..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : interview ? 'Atualizar' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewModal;
