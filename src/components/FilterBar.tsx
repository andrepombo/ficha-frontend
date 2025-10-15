import { CandidateFilters } from '../types';

interface FilterBarProps {
  filters: CandidateFilters;
  onFilterChange: (filters: Partial<CandidateFilters>) => void;
  positions: string[];
}

function FilterBar({ filters, onFilterChange, positions }: FilterBarProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Search */}
        <div className="floating-label-container">
          <input
            type="text"
            placeholder="Nome, email ou cargo..."
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
            <option value="interviewed">Entrevistado</option>
            <option value="accepted">Aceito</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <label className="floating-label">Status</label>
        </div>

        {/* Position Filter */}
        <div className="floating-label-container">
          <select
            value={filters.position}
            onChange={(e) => onFilterChange({ position: e.target.value })}
            className={`select-modern floating-select ${filters.position !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">Todos os Cargos</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          <label className="floating-label">Cargo</label>
        </div>

        {/* Month Filter */}
        <div className="floating-label-container">
          <select
            value={filters.month}
            onChange={(e) => onFilterChange({ month: e.target.value })}
            className={`select-modern floating-select ${filters.month !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all"></option>
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
            <option value="all"></option>
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
