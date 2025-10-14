export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  position_applied: string;
  current_company?: string;
  current_position?: string;
  years_of_experience: number;
  highest_education?: string;
  field_of_study?: string;
  linkedin_url?: string;
  portfolio_url?: string;
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
}

export type CandidateStatus = 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';

export interface CandidateFilters {
  status: string;
  search: string;
  position: string;
}

export interface CandidateStats {
  total: number;
  pending: number;
  reviewing: number;
  interviewed: number;
  accepted: number;
  rejected: number;
}
