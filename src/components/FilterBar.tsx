import { CandidateFilters } from '../types';

interface FilterBarProps {
  filters: CandidateFilters;
  onFilterChange: (filters: Partial<CandidateFilters>) => void;
  positions: string[];
}

function FilterBar({ filters, onFilterChange, positions }: FilterBarProps) {
  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="reviewing">Em Análise</option>
            <option value="interviewed">Entrevistado</option>
            <option value="accepted">Aceito</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>

        {/* Position Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargo
          </label>
          <select
            value={filters.position}
            onChange={(e) => onFilterChange({ position: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos os Cargos</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
