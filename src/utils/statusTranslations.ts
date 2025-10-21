import { CandidateStatus } from '../types';

// Status translations from English to Portuguese
export const statusTranslations: Record<CandidateStatus, string> = {
  pending: 'Pendente',
  reviewing: 'Em Análise',
  shortlisted: 'Entrevista',
  interviewed: 'Entrevistado',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
};

// Utility function to get translated status
export const getTranslatedStatus = (status: CandidateStatus): string => {
  return statusTranslations[status] || status;
};
