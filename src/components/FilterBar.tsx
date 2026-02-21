import { CandidateFilters } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getCopy } from '../i18n';

interface FilterBarProps {
  filters: CandidateFilters;
  onFilterChange: (filters: Partial<CandidateFilters>) => void;
  onAdvancedSearchClick: () => void;
  hasActiveAdvancedFilters: boolean;
}

function FilterBar({ filters, onFilterChange, onAdvancedSearchClick, hasActiveAdvancedFilters }: FilterBarProps) {
  const { language } = useLanguage();
  const copy = getCopy(language);

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const months = copy.filterBar.months;

  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {/* Search */}
        <div className="floating-label-container">
          <input
            type="text"
            placeholder={copy.filterBar.searchPlaceholder}
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="input-modern floating-input"
          />
          <label className="floating-label">{copy.filterBar.searchLabel}</label>
        </div>

        {/* Status Filter */}
        <div className="floating-label-container">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className={`select-modern floating-select ${filters.status !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">{copy.filterBar.statusAll}</option>
            <option value="incomplete">{copy.filterBar.statuses.incomplete}</option>
            <option value="pending">{copy.filterBar.statuses.pending}</option>
            <option value="reviewing">{copy.filterBar.statuses.reviewing}</option>
            <option value="shortlisted">{copy.filterBar.statuses.shortlisted}</option>
            <option value="interviewed">{copy.filterBar.statuses.interviewed}</option>
            <option value="accepted">{copy.filterBar.statuses.accepted}</option>
            <option value="rejected">{copy.filterBar.statuses.rejected}</option>
          </select>
          <label className="floating-label">{copy.filterBar.statusLabel}</label>
        </div>

        {/* Score Range Filter */}
        <div className="floating-label-container">
          <select
            value={filters.score_range || 'all'}
            onChange={(e) => onFilterChange({ score_range: e.target.value })}
            className={`select-modern floating-select ${filters.score_range && filters.score_range !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">{copy.filterBar.scoreAll}</option>
            <option value="excellent">{copy.filterBar.scoreOptions.excellent}</option>
            <option value="good">{copy.filterBar.scoreOptions.good}</option>
            <option value="average">{copy.filterBar.scoreOptions.average}</option>
            <option value="poor">{copy.filterBar.scoreOptions.poor}</option>
            <option value="not_scored">{copy.filterBar.scoreOptions.not_scored}</option>
          </select>
          <label className="floating-label">{copy.filterBar.scoreLabel}</label>
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
            <span>{copy.filterBar.advancedSearch}</span>
            {hasActiveAdvancedFilters && (
              <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {copy.filterBar.advancedActive}
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
            <option value="all">{copy.filterBar.monthAll}</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <label className="floating-label">{copy.filterBar.monthLabel}</label>
        </div>

        {/* Year Filter */}
        <div className="floating-label-container">
          <select
            value={filters.year}
            onChange={(e) => onFilterChange({ year: e.target.value })}
            className={`select-modern floating-select ${filters.year !== 'all' ? 'has-value' : ''}`}
          >
            <option value="all">{copy.filterBar.yearAll}</option>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
          <label className="floating-label">{copy.filterBar.yearLabel}</label>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
