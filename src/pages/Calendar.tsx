import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';
import { Interview } from '../types';
import InterviewModal from '../components/InterviewModal';
import FeedbackModal from '../components/FeedbackModal';
import InterviewCard from '../components/InterviewCard';

const DEFAULT_YEAR = 2025;
const DEFAULT_MONTH: number | 'all' = 'all';

const Calendar: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(DEFAULT_MONTH);
  const [selectedYear, setSelectedYear] = useState<number>(DEFAULT_YEAR);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    loadInterviews();
  }, [selectedMonth, selectedYear]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const monthParam = selectedMonth === 'all' ? undefined : selectedMonth;
      const data = await interviewAPI.getCalendar(monthParam, selectedYear);
      setInterviews(data);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsInterviewModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await interviewAPI.delete(id);
      loadInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  const handleAddFeedback = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsFeedbackModalOpen(true);
  };

  const handleModalClose = () => {
    setIsInterviewModalOpen(false);
    setIsFeedbackModalOpen(false);
    setSelectedInterview(null);
  };

  const getMonthName = (month: number | 'all') => {
    if (month === 'all') return 'Todos os meses';
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const groupInterviewsByDate = () => {
    const grouped: { [key: string]: Interview[] } = {};
    interviews.forEach(interview => {
      if (!grouped[interview.scheduled_date]) {
        grouped[interview.scheduled_date] = [];
      }
      grouped[interview.scheduled_date].push(interview);
    });
    return grouped;
  };

  const sortedDates = Object.keys(groupInterviewsByDate()).sort();

  // Calendar grid helper functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const generateCalendarDays = () => {
    if (selectedMonth === 'all') return [];
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getInterviewsForDay = (day: number) => {
    if (selectedMonth === 'all') return [];
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const grouped = groupInterviewsByDate();
    return grouped[dateStr] || [];
  };

  const isToday = (day: number) => {
    if (selectedMonth === 'all') return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth === today.getMonth() + 1 &&
      selectedYear === today.getFullYear()
    );
  };

  return (
    <div className="bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              {/* Month/Year Display and Selectors */}
              <div className="flex items-center gap-4">
                <p className="text-white text-2xl font-bold">
                  📅 {getMonthName(selectedMonth)} {selectedYear}
                </p>
                <select
                  value={selectedMonth === 'all' ? 'all' : selectedMonth}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedMonth(value === 'all' ? 'all' : parseInt(value));
                  }}
                  className="px-4 py-2 rounded-xl border-2 border-white bg-white text-gray-900 font-medium focus:ring-2 focus:ring-indigo-300 transition-all"
                >
                  <option value="all">Todos os meses</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-xl border-2 border-white bg-white text-gray-900 font-medium focus:ring-2 focus:ring-indigo-300 transition-all"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* View Mode Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-indigo-500 text-white hover:bg-indigo-400'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-indigo-500 text-white hover:bg-indigo-400'
                  }`}
                >
                  Calendário
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhuma entrevista agendada
            </h3>
            <p className="text-gray-600">
              Não há entrevistas agendadas para {getMonthName(selectedMonth)} de {selectedYear}.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-8">
            {sortedDates.map(date => {
              const dateInterviews = groupInterviewsByDate()[date];
              const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div key={date}>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-md mb-4">
                    <h2 className="text-xl font-bold capitalize">{formattedDate}</h2>
                    <p className="text-indigo-100 text-sm">{dateInterviews.length} entrevista(s)</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateInterviews
                      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                      .map(interview => (
                        <InterviewCard
                          key={interview.id}
                          interview={interview}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onAddFeedback={handleAddFeedback}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : selectedMonth === 'all' ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-lg text-gray-700 font-medium">
              Selecione um mês específico para visualizar o calendário.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Calendar Header - Days of Week */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-600 to-purple-600">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center py-4 text-white font-bold text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {generateCalendarDays().map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="bg-gray-50 min-h-[120px]" />;
                }

                const dayInterviews = getInterviewsForDay(day);
                const today = isToday(day);

                return (
                  <div
                    key={day}
                    className={`bg-white min-h-[120px] p-2 hover:bg-purple-50 transition-colors ${
                      today ? 'ring-2 ring-indigo-500 ring-inset' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-sm font-semibold ${
                          today
                            ? 'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                            : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                      {dayInterviews.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {dayInterviews.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {dayInterviews.slice(0, 3).map((interview) => (
                        <button
                          key={interview.id}
                          onClick={() => handleEdit(interview)}
                          className="w-full text-left text-xs p-1.5 rounded hover:shadow-md transition-all group"
                          style={{ backgroundColor: interview.status_color + '20' }}
                          title={`${interview.title} - ${interview.scheduled_time.substring(0, 5)}`}
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: interview.status_color }}
                            />
                            <span className="font-medium truncate group-hover:text-indigo-700">
                              {interview.scheduled_time.substring(0, 5)}
                            </span>
                          </div>
                          <div className="truncate text-gray-700 group-hover:text-gray-900 font-medium">
                            {interview.candidate_name}
                          </div>
                        </button>
                      ))}
                      {dayInterviews.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1 font-medium">
                          +{dayInterviews.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Agendada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-700">Cancelada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-gray-700">Reagendada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-gray-700">Não Compareceu</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-indigo-600">{interviews.length}</div>
            <div className="text-gray-600 font-medium">Total de Entrevistas</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">
              {interviews.filter(i => i.status === 'scheduled').length}
            </div>
            <div className="text-gray-600 font-medium">Agendadas</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">
              {interviews.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-gray-600 font-medium">Concluídas</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-red-600">
              {interviews.filter(i => i.status === 'cancelled').length}
            </div>
            <div className="text-gray-600 font-medium">Canceladas</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={handleModalClose}
        onSuccess={loadInterviews}
        candidateId={selectedInterview?.candidate || 0}
        candidateName={selectedInterview?.candidate_name || ''}
        interview={selectedInterview}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleModalClose}
        onSuccess={loadInterviews}
        interview={selectedInterview}
      />
    </div>
  );
};

export default Calendar;
