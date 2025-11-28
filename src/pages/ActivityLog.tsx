import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ActivityLog {
  id: number;
  candidate_name: string | null;
  interview_title: string | null;
  interviewer_name: string | null;
  user_name: string | null;
  action_type: string;
  action_type_display: string;
  description: string;
  timestamp: string;
  old_value?: string | null;
  new_value?: string | null;
}

interface ActivityLogStats {
  total_activities: number;
  action_type_counts: Array<{
    action_type: string;
    action_type_display: string;
    count: number;
  }>;
  top_users: Array<{
    user__username: string;
    user__first_name: string;
    user__last_name: string;
    count: number;
  }>;
  daily_activity: Array<{
    day: string;
    count: number;
  }>;
}

const ActivityLog: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action_type: 'all',
    limit: '50'
  });
  const [deleting, setDeleting] = useState<number | null>(null);
  
  const isSuperuser = user?.is_superuser || false;
  
  // Debug: Log user info
  console.log('ActivityLog - User:', user);
  console.log('ActivityLog - Is Superuser:', isSuperuser);

  const actionTypeColors: { [key: string]: string } = {
    'candidate_created': 'text-green-600 bg-green-100',
    'candidate_updated': 'text-blue-600 bg-blue-100',
    'status_changed': 'text-purple-600 bg-purple-100',
    'interview_scheduled': 'text-indigo-600 bg-indigo-100',
    'interview_updated': 'text-indigo-600 bg-indigo-100',
    'interview_cancelled': 'text-red-600 bg-red-100',
    'interview_completed': 'text-green-600 bg-green-100',
    'interview_rescheduled': 'text-orange-600 bg-orange-100',
    'score_updated': 'text-yellow-600 bg-yellow-100',
    'note_added': 'text-gray-600 bg-gray-100',
  };

  const actionTypeIcons: { [key: string]: React.ReactNode } = {
    'candidate_created': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    'candidate_updated': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    'status_changed': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    'interview_scheduled': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'interview_updated': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    'interview_cancelled': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    'interview_completed': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'interview_rescheduled': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    'score_updated': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    'note_added': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action_type !== 'all') {
        params.append('action_type', filters.action_type);
      }
      params.append('limit', filters.limit);

      const response = await api.get(`/activity-logs/?${params.toString()}`);
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao buscar logs de atividade');
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/activity-logs/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching activity stats:', err);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionTypeColor = (actionType: string) => {
    return actionTypeColors[actionType] || 'text-gray-600 bg-gray-100';
  };

  const getActionTypeIcon = (actionType: string) => {
    return actionTypeIcons[actionType] || (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const handleDeleteLog = async (logId: number) => {
    if (!isSuperuser) {
      alert('Apenas superusuários podem deletar logs.');
      return;
    }

    if (!confirm('Tem certeza que deseja deletar este log? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeleting(logId);
      await api.delete(`/activity-logs/${logId}/`);
      
      // Remove from local state
      setLogs(logs.filter(log => log.id !== logId));
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error deleting activity log:', err);
      alert('Erro ao deletar log. Verifique se você tem permissão.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Logs de Atividade</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Ação
            </label>
            <select
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value="candidate_created">Candidato Criado</option>
              <option value="candidate_updated">Candidato Atualizado</option>
              <option value="status_changed">Status Alterado</option>
              <option value="interview_scheduled">Entrevista Agendada</option>
              <option value="interview_updated">Entrevista Atualizada</option>
              <option value="interview_cancelled">Entrevista Cancelada</option>
              <option value="interview_completed">Entrevista Concluída</option>
              <option value="interview_rescheduled">Entrevista Reagendada</option>
              <option value="score_updated">Pontuação Atualizada</option>
              <option value="note_added">Nota Adicionada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="25">25 recentes</option>
              <option value="50">50 recentes</option>
              <option value="100">100 recentes</option>
              <option value="200">200 recentes</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-800">Total de Atividades</h3>
              <p className="text-2xl font-bold text-indigo-900">{stats.total_activities}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Tipos de Ação</h3>
              <p className="text-2xl font-bold text-green-900">{stats.action_type_counts.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Usuários Ativos</h3>
              <p className="text-2xl font-bold text-purple-900">{stats.top_users.length}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Logs List */}
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">Nenhuma atividade corresponde aos filtros selecionados.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-full ${getActionTypeColor(log.action_type)}`}>
                    {getActionTypeIcon(log.action_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action_type_display}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {formatDate(log.timestamp)}
                        </p>
                        {isSuperuser && (
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            disabled={deleting === log.id}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Deletar log"
                          >
                            {deleting === log.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-1">
                      {log.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {log.user_name && (
                        <span>
                          <strong>Usuário:</strong> {log.user_name}
                        </span>
                      )}
                      {log.candidate_name && (
                        <span>
                          <strong>Candidato:</strong> {log.candidate_name}
                        </span>
                      )}
                      {log.interview_title && (
                        <span>
                          <strong>Entrevista:</strong> {log.interview_title}
                        </span>
                      )}
                      {log.interviewer_name && (
                        <span>
                          <strong>Entrevistador:</strong> {log.interviewer_name}
                        </span>
                      )}
                    </div>
                    
                    {(log.old_value || log.new_value) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {log.old_value && (
                          <div className="mb-1">
                            <strong>Anterior:</strong> {log.old_value}
                          </div>
                        )}
                        {log.new_value && (
                          <div>
                            <strong>Novo:</strong> {log.new_value}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
