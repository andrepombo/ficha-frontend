export interface Candidate {
  id: number;
  full_name: string;
  cpf: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  gender?: string;
  disability?: string;
  has_own_transportation?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  position_applied?: string;
  current_company?: string;
  current_position?: string;
  years_of_experience?: number;
  has_relatives_in_company?: string;
  referred_by?: string;
  how_found_vacancy?: string;
  how_found_vacancy_other?: string;
  worked_at_pinte_before?: string;
  highest_education?: string;
  currently_employed?: string;
  availability_start?: string;
  travel_availability?: string;
  height_painting?: string;
  resume?: string;
  cover_letter?: string;
  skills?: string;
  certifications?: string;
  available_start_date?: string;
  expected_salary?: string;
  status: CandidateStatus;
  applied_date: string;
  updated_date: string;
  notes?: string;
  access_code?: string;
  professional_experiences?: ProfessionalExperience[];
}

export interface ProfessionalExperience {
  id: number;
  empresa: string;
  cargo: string;
  descricao_atividades?: string;
  data_admissao?: string;
  data_desligamento?: string;
  motivo_saida?: string;
}

export type CandidateStatus = 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';

export interface CandidateFilters {
  status: string;
  search: string;
  position: string;
  month: string;
  year: string;
}

export interface CandidateStats {
  total: number;
  pending: number;
  reviewing: number;
  interviewed: number;
  accepted: number;
  rejected: number;
}
