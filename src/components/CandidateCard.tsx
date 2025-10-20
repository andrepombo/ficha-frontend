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
  shortlisted: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white',
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
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
            ID: {candidate.id}
          </span>
          <span className={`status-badge ${statusColors[candidate.status]} flex-shrink-0`}>
            {getTranslatedStatus(candidate.status)}
          </span>
        </div>
        <p className="text-sm text-indigo-600 font-medium">
          {candidate.full_name}
        </p>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center text-sm">
          <div className="bg-indigo-100 rounded-lg p-2 mr-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-indigo-900 font-semibold">{candidate.phone_number}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <div className="bg-purple-100 rounded-lg p-2 mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <span className="text-gray-700 font-medium">CPF: {candidate.cpf}</span>
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
          <option value="shortlisted">Selecionado para Entrevista</option>
          <option value="interviewed">Entrevistado</option>
          <option value="accepted">Aceito</option>
          <option value="rejected">Rejeitado</option>
        </select>
        
        <Link
          to={`/candidate/${candidate.id}`}
          className="px-6 py-2.5 bg-white text-indigo-700 border-2 border-indigo-200 rounded-xl text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
        >
          Ver
        </Link>
      </div>
    </div>
  );
}

export default CandidateCard;
