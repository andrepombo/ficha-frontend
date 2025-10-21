import { useState, useEffect } from 'react';
import { candidateAPI } from '../services/api';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters: any;
}

interface FilterOptions {
  positions: string[];
  cities: string[];
  companies: string[];
  education_levels: { value: string; label: string }[];
  gender_options: { value: string; label: string }[];
  disability_options: { value: string; label: string }[];
  availability_options: { value: string; label: string }[];
  how_found_options: { value: string; label: string }[];
  yes_no_options: { value: string; label: string }[];
}

function AdvancedSearchModal({ isOpen, onClose, onApplyFilters, currentFilters }: AdvancedSearchModalProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState({
    gender: 'all',
    disability: 'all',
    education: 'all',
    transportation: 'all',
    currently_employed: 'all',
    availability: 'all',
    travel_availability: 'all',
    height_painting: 'all',
    city: 'all',
    how_found_vacancy: 'all',
    date_from: '',
    date_until: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchFilterOptions();
      // Initialize with current filters
      setFilters({
        gender: currentFilters.gender || 'all',
        disability: currentFilters.disability || 'all',
        education: currentFilters.education || 'all',
        transportation: currentFilters.transportation || 'all',
        currently_employed: currentFilters.currently_employed || 'all',
        availability: currentFilters.availability || 'all',
        travel_availability: currentFilters.travel_availability || 'all',
        height_painting: currentFilters.height_painting || 'all',
        city: currentFilters.city || 'all',
        how_found_vacancy: currentFilters.how_found_vacancy || 'all',
        date_from: currentFilters.date_from || '',
        date_until: currentFilters.date_until || '',
      });
    }
  }, [isOpen, currentFilters]);

  const fetchFilterOptions = async () => {
    try {
      const options = await candidateAPI.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      gender: 'all',
      disability: 'all',
      education: 'all',
      transportation: 'all',
      currently_employed: 'all',
      availability: 'all',
      travel_availability: 'all',
      height_painting: 'all',
      city: 'all',
      how_found_vacancy: 'all',
      date_from: '',
      date_until: '',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Busca Avançada</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Sexo
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.gender_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Disability Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Deficiência (PCD)
              </label>
              <select
                value={filters.disability}
                onChange={(e) => setFilters({ ...filters, disability: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.disability_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Escolaridade
              </label>
              <select
                value={filters.education}
                onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.education_levels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Cidade
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todas</option>
                {filterOptions?.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Disponibilidade para Início
              </label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.availability_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currently Employed Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Atualmente Empregado
              </label>
              <select
                value={filters.currently_employed}
                onChange={(e) => setFilters({ ...filters, currently_employed: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.yes_no_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transportation Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Transporte Próprio
              </label>
              <select
                value={filters.transportation}
                onChange={(e) => setFilters({ ...filters, transportation: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.yes_no_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Availability Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Disponibilidade para Viagens
              </label>
              <select
                value={filters.travel_availability}
                onChange={(e) => setFilters({ ...filters, travel_availability: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.yes_no_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Height Painting Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Pintura em Altura
              </label>
              <select
                value={filters.height_painting}
                onChange={(e) => setFilters({ ...filters, height_painting: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.yes_no_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* How Found Vacancy Filter */}
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Como Soube da Vaga
              </label>
              <select
                value={filters.how_found_vacancy}
                onChange={(e) => setFilters({ ...filters, how_found_vacancy: e.target.value })}
                className="select-modern w-full"
              >
                <option value="all">Todos</option>
                {filterOptions?.how_found_options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Application Date Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-indigo-700 mb-2">
                Período de Candidatura
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">De</label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Até</label>
                  <input
                    type="date"
                    value={filters.date_until}
                    onChange={(e) => setFilters({ ...filters, date_until: e.target.value })}
                    className="input-modern w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearchModal;
