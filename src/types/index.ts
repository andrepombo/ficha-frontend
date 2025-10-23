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
  score?: number;
  score_grade?: string;
  score_color?: string;
  score_breakdown?: ScoreBreakdown;
  score_updated_at?: string;
}

export interface ScoreBreakdown {
  experience_skills: number;
  education: number;
  availability_logistics: number;
  interview_performance: number;
}

export interface ProfessionalExperience {
  id: number;
  empresa: string;
  cargo: string;
  descricao_atividades?: string;
  data_admissao?: string;
  data_desligamento?: string;
  motivo_saida?: string;
  idle_time_days?: number | null;
  idle_time_formatted?: string | null;
}

export type CandidateStatus = 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected';

export interface CandidateFilters {
  status: string;
  search: string;
  position?: string;
  month: string;
  year: string;
  score_range?: string;
}

export interface CandidateStats {
  total: number;
  pending: number;
  reviewing: number;
  shortlisted: number;
  interviewed: number;
  accepted: number;
  rejected: number;
}

export interface Interview {
  id: number;
  candidate: number;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_position?: string;
  interviewer: number | null;
  interviewer_name: string | null;
  title: string;
  interview_type: InterviewType;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location?: string;
  description?: string;
  status: InterviewStatus;
  status_color: string;
  feedback?: string;
  rating?: number;
  candidate_notified: boolean;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_name?: string;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
export type InterviewType = 'phone' | 'video' | 'in_person' | 'technical' | 'hr';

export interface InterviewStats {
  total: number;
  upcoming: number;
  today: number;
  by_status: {
    [key: string]: number;
  };
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}
