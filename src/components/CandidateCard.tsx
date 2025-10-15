import { Link } from 'react-router-dom';
import { Candidate, CandidateStatus } from '../types';
import { getTranslatedStatus } from '../utils/statusTranslations';

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (id: number, status: string) => void;
}

const statusColors: Record<CandidateStatus, string> = {
  pending: 'bg-orange-100 text-orange-800',
  reviewing: 'bg-blue-100 text-blue-800',
  interviewed: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

function CandidateCard({ candidate, onStatusChange }: CandidateCardProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const newStatus = e.target.value;
    if (newStatus !== candidate.status) {
      onStatusChange(candidate.id, newStatus);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {candidate.first_name} {candidate.last_name}
          </h3>
          <p className="text-sm text-gray-600">{candidate.email}</p>
        </div>
        <span className={`status-badge ${statusColors[candidate.status]}`}>
          {getTranslatedStatus(candidate.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700 font-medium">{candidate.position_applied}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-600">{candidate.years_of_experience} anos de experiência</span>
        </div>

        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-600">Candidatura: {new Date(candidate.applied_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={candidate.status}
          onChange={handleStatusChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="pending">Pendente</option>
          <option value="reviewing">Em Análise</option>
          <option value="interviewed">Entrevistado</option>
          <option value="accepted">Aceito</option>
          <option value="rejected">Rejeitado</option>
        </select>
        
        <Link
          to={`/candidate/${candidate.id}`}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Ver
        </Link>
      </div>
    </div>
  );
}

export default CandidateCard;
