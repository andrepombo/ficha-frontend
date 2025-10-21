import React from 'react';
import { Interview } from '../types';

interface InterviewCardProps {
  interview: Interview;
  onEdit?: (interview: Interview) => void;
  onDelete?: (id: number) => void;
  onAddFeedback?: (interview: Interview) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  onEdit,
  onDelete,
  onAddFeedback,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; classes: string }> = {
      scheduled: { label: 'Agendada', classes: 'bg-gradient-to-r from-blue-500 to-blue-600' },
      completed: { label: 'Concluída', classes: 'bg-gradient-to-r from-green-500 to-green-600' },
      cancelled: { label: 'Cancelada', classes: 'bg-gradient-to-r from-red-500 to-red-600' },
      rescheduled: { label: 'Reagendada', classes: 'bg-gradient-to-r from-amber-500 to-amber-600' },
      no_show: { label: 'Não Compareceu', classes: 'bg-gradient-to-r from-gray-500 to-gray-600' },
    };

    const config = statusConfig[status] || { label: status, classes: 'bg-gray-500' };
    return (
      <span className={`${config.classes} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; icon: string }> = {
      video: { label: 'Vídeo', icon: '📹' },
      phone: { label: 'Telefone', icon: '📞' },
      in_person: { label: 'Presencial', icon: '🏢' },
      technical: { label: 'Técnica', icon: '💻' },
      hr: { label: 'RH', icon: '👥' },
    };

    const config = typeConfig[type] || { label: type, icon: '📋' };
    return (
      <span className="text-gray-600 text-sm flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-purple-200 group hover:border-purple-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
            {interview.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge(interview.status)}
            {getTypeBadge(interview.interview_type)}
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(interview)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Editar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta entrevista?')) {
                    onDelete(interview.id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{formatDate(interview.scheduled_date)}</span>
          <span className="mx-2">•</span>
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{formatTime(interview.scheduled_time)}</span>
          <span className="mx-2 text-gray-400">({interview.duration_minutes} min)</span>
        </div>

        {interview.interviewer_name && (
          <div className="flex items-center text-gray-700">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Entrevistador: <span className="font-medium">{interview.interviewer_name}</span></span>
          </div>
        )}

        {interview.location && (
          <div className="flex items-start text-gray-700">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="break-all">{interview.location}</span>
          </div>
        )}
      </div>

      {interview.description && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700">{interview.description}</p>
        </div>
      )}

      {interview.rating && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Avaliação:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= interview.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      )}

      {interview.feedback && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm font-semibold text-green-900 mb-1">Feedback:</p>
          <p className="text-sm text-green-800">{interview.feedback}</p>
        </div>
      )}

      {interview.status === 'completed' && !interview.feedback && onAddFeedback && (
        <button
          onClick={() => onAddFeedback(interview)}
          className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
        >
          Adicionar Feedback
        </button>
      )}
    </div>
  );
};

export default InterviewCard;
