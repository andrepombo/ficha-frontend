import { CandidateFilters } from '../types';

interface FilterBarProps {
  filters: CandidateFilters;
  onFilterChange: (filters: Partial<CandidateFilters>) => void;
  onAdvancedSearchClick: () => void;
  hasActiveAdvancedFilters: boolean;
}

function FilterBar({ filters, onFilterChange, onAdvancedSearchClick, hasActiveAdvancedFilters }: FilterBarProps) {
  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {/* Search */}
        <div className="floating-label-container">
          <input
            type="text"
            placeholder="Nome, telefone ou CPF..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="input-modern floating-input"
          />
          <label className="floating-label">Buscar</label>
        </div>

        {/* Status Filter */}
        <div className="floating-label-container">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className={`select-modern floating-select ${filters.status !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="reviewing">Em Análise</option>
            <option value="shortlisted">Selecionado para Entrevista</option>
            <option value="interviewed">Entrevistado</option>
            <option value="accepted">Aceito</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <label className="floating-label">Status</label>
        </div>

        {/* Score Range Filter */}
        <div className="floating-label-container">
          <select
            value={filters.score_range || 'all'}
            onChange={(e) => onFilterChange({ score_range: e.target.value })}
            className={`select-modern floating-select ${filters.score_range && filters.score_range !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">Todas as Pontuações</option>
            <option value="excellent">Excelente (80-100)</option>
            <option value="good">Bom (60-79)</option>
            <option value="average">Médio (40-59)</option>
            <option value="poor">Baixo (0-39)</option>
            <option value="not_scored">Sem Pontuação</option>
          </select>
          <label className="floating-label">Pontuação</label>
        </div>

        {/* Advanced Search Button */}
        <div className="flex items-end">
          <button
            onClick={onAdvancedSearchClick}
            className={`w-full px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
              hasActiveAdvancedFilters
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-white text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Busca Avançada</span>
            {hasActiveAdvancedFilters && (
              <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">
                Ativo
              </span>
            )}
          </button>
        </div>

        {/* Month Filter */}
        <div className="floating-label-container">
          <select
            value={filters.month}
            onChange={(e) => onFilterChange({ month: e.target.value })}
            className={`select-modern floating-select ${filters.month !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">Todos os Meses</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <label className="floating-label">Mês</label>
        </div>

        {/* Year Filter */}
        <div className="floating-label-container">
          <select
            value={filters.year}
            onChange={(e) => onFilterChange({ year: e.target.value })}
            className={`select-modern floating-select ${filters.year !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">Todos os Anos</option>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
          <label className="floating-label">Ano</label>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
