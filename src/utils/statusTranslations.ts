import { CandidateStatus } from '../types';
import { SupportedLanguage } from '../contexts/LanguageContext';

// Status translations for supported languages
const statusTranslations: Record<SupportedLanguage, Record<CandidateStatus, string>> = {
  pt: {
    incomplete: 'Incompleto',
    pending: 'Pendente',
    reviewing: 'Em Análise',
    shortlisted: 'Entrevista',
    interviewed: 'Entrevistado',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
  },
  en: {
    incomplete: 'Incomplete',
    pending: 'Pending',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interviewed: 'Interviewed',
    accepted: 'Accepted',
    rejected: 'Rejected',
  }
};

// Utility function to get translated status
export const getTranslatedStatus = (status: CandidateStatus, lang: SupportedLanguage = 'pt'): string => {
  return statusTranslations[lang]?.[status] || status;
};
