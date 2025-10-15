import { Link } from 'react-router-dom';
import { Candidate, CandidateStatus } from '../types';
import { getTranslatedStatus } from '../utils/statusTranslations';

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (id: number, status: string) => void;
}

const statusColors: Record<CandidateStatus, string> = {
  pending: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  reviewing: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  interviewed: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  accepted: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
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
    <div className="card group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg font-bold text-indigo-900 group-hover:text-indigo-700 transition-colors truncate">
            {candidate.first_name} {candidate.last_name}
          </h3>
          <p className="text-sm text-indigo-600 font-medium mt-1 truncate">{candidate.email}</p>
        </div>
        <span className={`status-badge ${statusColors[candidate.status]} flex-shrink-0`}>
          {getTranslatedStatus(candidate.status)}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center text-sm">
          <div className="bg-indigo-100 rounded-lg p-2 mr-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-indigo-900 font-semibold">{candidate.position_applied}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <div className="bg-purple-100 rounded-lg p-2 mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-gray-700 font-medium">{candidate.years_of_experience} anos de experiência</span>
        </div>

        <div className="flex items-center text-sm">
          <div className="bg-blue-100 rounded-lg p-2 mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-gray-700 font-medium">{new Date(candidate.applied_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          value={candidate.status}
          onChange={handleStatusChange}
          className="flex-1 select-modern text-sm font-medium"
        >
          <option value="pending">Pendente</option>
          <option value="reviewing">Em Análise</option>
          <option value="interviewed">Entrevistado</option>
          <option value="accepted">Aceito</option>
          <option value="rejected">Rejeitado</option>
        </select>
        
        <Link
          to={`/candidate/${candidate.id}`}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:-translate-y-0.5"
        >
          Ver
        </Link>
      </div>
    </div>
  );
}

export default CandidateCard;
