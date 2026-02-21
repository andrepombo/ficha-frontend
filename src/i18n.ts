import { SupportedLanguage } from './contexts/LanguageContext';
import { CandidateStatus } from './types';

export type MonthOption = { value: string; label: string };
type ScoreOptionKey = 'excellent' | 'good' | 'average' | 'poor' | 'not_scored';

interface AppCopyShape {
  status: Record<CandidateStatus, string>;
  header: {
    titles: {
      candidateDetail: string;
      dashboard: string;
      analytics: string;
      demographics: string;
      insights: string;
      scoring: string;
      calendar: string;
      activityLog: string;
      questionnaires: string;
      positions: string;
      default: string;
    };
    notifications: string;
    logout: string;
    role: string;
  };
  filterBar: {
    searchPlaceholder: string;
    searchLabel: string;
    statusLabel: string;
    statusAll: string;
    statuses: Record<CandidateStatus, string>;
    scoreLabel: string;
    scoreAll: string;
    scoreOptions: Record<ScoreOptionKey, string>;
    advancedSearch: string;
    advancedActive: string;
    monthLabel: string;
    yearLabel: string;
    monthAll: string;
    yearAll: string;
    months: MonthOption[];
  };
  dashboard: {
    subtitle: string;
    totalLabel: string;
    statLabels: Record<CandidateStatus, string>;
    exportPdf: string;
    exportExcel: string;
    viewModes: { kanban: string; cards: string; list: string };
    candidatesTitle: string;
    emptyState: string;
    loading: string;
    error: string;
    retry: string;
    tableHeaders: {
      name: string;
      phone: string;
      cpf: string;
      status: string;
      score: string;
      date: string;
      actions: string;
    };
    exportPdfError: string;
    exportExcelError: string;
    statusUpdateError: string;
    emptyKanban: string;
    monthAllYearsSuffix: string;
    yearPrefix: string;
    allPeriods: string;
  };
  candidateCard: {
    idPrefix: string;
    cpf: string;
    view: string;
  };
  sidebar: {
    brandTitle: string;
    brandSubtitle: string;
    nav: Record<
      'dashboard' | 'analytics' | 'demographics' | 'insights' | 'calendar' | 'questionnaires' | 'positions' | 'scoring' | 'activityLog',
      string
    >;
    collapseTooltip: {
      expand: string;
      collapse: string;
    };
    footer: {
      line1: string;
      line2: string;
    };
  };
  kanban: {
    columnTitles: Record<CandidateStatus, string>;
    empty: string;
    viewDetails: string;
  };
}

const statusLabels: Record<SupportedLanguage, Record<CandidateStatus, string>> = {
  pt: {
    incomplete: 'Incompleto',
    pending: 'Pendente',
    reviewing: 'Em Análise',
    shortlisted: 'Selecionado para Entrevista',
    interviewed: 'Entrevistado',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
  },
  en: {
    incomplete: 'Incomplete',
    pending: 'Pending',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interviewed: 'Interviewed',
    accepted: 'Accepted',
    rejected: 'Rejected',
  },
};

const base: Record<SupportedLanguage, AppCopyShape> = {
  pt: {
    status: statusLabels.pt,
    header: {
      titles: {
        candidateDetail: 'Detalhes do Candidato',
        dashboard: 'Painel de Candidatos',
        analytics: 'Análise de Dados',
        demographics: 'Demografia',
        insights: 'Insights',
        scoring: 'Sistema de Pontuação',
        calendar: 'Calendário de Entrevistas',
        activityLog: 'Registro de Atividades',
        questionnaires: 'Questionários',
        positions: 'Vagas',
        default: 'Painel do Empregador',
      },
      notifications: 'Notificações',
      logout: 'Sair',
      role: 'Administrador',
    },
    filterBar: {
      searchPlaceholder: 'Nome, telefone ou CPF...',
      searchLabel: 'Buscar',
      statusLabel: 'Status',
      statusAll: 'Todos os Status',
      statuses: statusLabels.pt,
      scoreLabel: 'Pontuação',
      scoreAll: 'Todas as Pontuações',
      scoreOptions: {
        excellent: 'Excelente (80-100)',
        good: 'Bom (60-79)',
        average: 'Médio (40-59)',
        poor: 'Baixo (0-39)',
        not_scored: 'Sem Pontuação',
      },
      advancedSearch: 'Busca Avançada',
      advancedActive: 'Ativo',
      monthLabel: 'Mês',
      yearLabel: 'Ano',
      monthAll: 'Todos os Meses',
      yearAll: 'Todos os Anos',
      months: [
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
      ] as MonthOption[],
    },
    dashboard: {
      subtitle: 'Estatísticas de candidatos',
      totalLabel: 'candidatos',
      statLabels: {
        incomplete: 'Incompleto',
        pending: 'Pendente',
        reviewing: 'Em Análise',
        shortlisted: 'Selecionado',
        interviewed: 'Entrevistado',
        accepted: 'Aceito',
        rejected: 'Rejeitado',
      },
      exportPdf: 'PDF',
      exportExcel: 'Excel',
      viewModes: {
        kanban: 'Kanban',
        cards: 'Cartões',
        list: 'Lista',
      },
      candidatesTitle: 'Candidatos',
      emptyState: 'Nenhum candidato encontrado com os filtros selecionados.',
      loading: 'Carregando candidatos...',
      error: 'Falha ao carregar candidatos.',
      retry: 'Tentar Novamente',
      tableHeaders: {
        name: 'Nome',
        phone: 'Telefone',
        cpf: 'CPF',
        status: 'Status',
        score: 'Pontuação',
        date: 'Aplicado em',
        actions: 'Ações',
      },
      exportPdfError: 'Falha ao exportar PDF. Por favor, tente novamente.',
      exportExcelError: 'Erro ao exportar para Excel. Por favor, tente novamente.',
      statusUpdateError: 'Falha ao atualizar status. Tente novamente.',
      emptyKanban: 'Nenhum candidato',
      monthAllYearsSuffix: '(Todos os anos)',
      yearPrefix: 'Ano',
      allPeriods: 'Todos os períodos',
    },
    candidateCard: {
      idPrefix: 'ID',
      cpf: 'CPF',
      view: 'Ver',
    },
    kanban: {
      columnTitles: {
        incomplete: 'Incompleto',
        pending: 'Pendente',
        reviewing: 'Em Análise',
        shortlisted: 'Pré-Selecionado',
        interviewed: 'Entrevistado',
        accepted: 'Aceito',
        rejected: 'Rejeitado',
      },
      empty: 'Nenhum candidato',
      viewDetails: 'Ver Detalhes',
    },
    sidebar: {
      brandTitle: 'Recrutamento',
      brandSubtitle: 'Sistema RH',
      nav: {
        dashboard: 'Painel',
        analytics: 'Análise',
        demographics: 'Demografia',
        insights: 'Insights',
        calendar: 'Calendário',
        questionnaires: 'Questionários',
        positions: 'Cargos',
        scoring: 'Pontuação',
        activityLog: 'Logs de Atividade',
      },
      collapseTooltip: {
        expand: 'Expandir',
        collapse: 'Recolher',
      },
      footer: {
        line1: '© 2026 Andre Pombo',
        line2: 'Sistema de Gestão RH',
      },
    },
  },
  en: {
    status: statusLabels.en,
    header: {
      titles: {
        candidateDetail: 'Candidate Details',
        dashboard: 'Candidate Dashboard',
        analytics: 'Data Analytics',
        demographics: 'Demographics',
        insights: 'Insights',
        scoring: 'Scoring System',
        calendar: 'Interview Calendar',
        activityLog: 'Activity Log',
        questionnaires: 'Questionnaires',
        positions: 'Positions',
        default: 'Employer Panel',
      },
      notifications: 'Notifications',
      logout: 'Logout',
      role: 'Administrator',
    },
    filterBar: {
      searchPlaceholder: 'Name, phone or ID...',
      searchLabel: 'Search',
      statusLabel: 'Status',
      statusAll: 'All Statuses',
      statuses: statusLabels.en,
      scoreLabel: 'Score',
      scoreAll: 'All Scores',
      scoreOptions: {
        excellent: 'Excellent (80-100)',
        good: 'Good (60-79)',
        average: 'Average (40-59)',
        poor: 'Low (0-39)',
        not_scored: 'Not scored',
      },
      advancedSearch: 'Advanced Search',
      advancedActive: 'Active',
      monthLabel: 'Month',
      yearLabel: 'Year',
      monthAll: 'All Months',
      yearAll: 'All Years',
      months: [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
      ] as MonthOption[],
    },
    dashboard: {
      subtitle: 'Candidate statistics',
      totalLabel: 'candidates',
      statLabels: {
        incomplete: 'Incomplete',
        pending: 'Pending',
        reviewing: 'Reviewing',
        shortlisted: 'Shortlisted',
        interviewed: 'Interviewed',
        accepted: 'Accepted',
        rejected: 'Rejected',
      },
      exportPdf: 'PDF',
      exportExcel: 'Excel',
      viewModes: {
        kanban: 'Kanban',
        cards: 'Cards',
        list: 'List',
      },
      candidatesTitle: 'Candidates',
      emptyState: 'No candidates found for the selected filters.',
      loading: 'Loading candidates...',
      error: 'Failed to load candidates.',
      retry: 'Try again',
      tableHeaders: {
        name: 'Name',
        phone: 'Phone',
        cpf: 'ID',
        status: 'Status',
        score: 'Score',
        date: 'Applied on',
        actions: 'Actions',
      },
      exportPdfError: 'Failed to export PDF. Please try again.',
      exportExcelError: 'Failed to export Excel. Please try again.',
      statusUpdateError: 'Failed to update status. Please try again.',
      emptyKanban: 'No candidates',
      monthAllYearsSuffix: '(All years)',
      yearPrefix: 'Year',
      allPeriods: 'All periods',
    },
    candidateCard: {
      idPrefix: 'ID',
      cpf: 'ID',
      view: 'View',
    },
    kanban: {
      columnTitles: {
        incomplete: 'Incomplete',
        pending: 'Pending',
        reviewing: 'Reviewing',
        shortlisted: 'Shortlisted',
        interviewed: 'Interviewed',
        accepted: 'Accepted',
        rejected: 'Rejected',
      },
      empty: 'No candidates',
      viewDetails: 'View Details',
    },
    sidebar: {
      brandTitle: 'Recruitment',
      brandSubtitle: 'HR Platform',
      nav: {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        demographics: 'Demographics',
        insights: 'Insights',
        calendar: 'Calendar',
        questionnaires: 'Questionnaires',
        positions: 'Positions',
        scoring: 'Scoring',
        activityLog: 'Activity Log',
      },
      collapseTooltip: {
        expand: 'Expand',
        collapse: 'Collapse',
      },
      footer: {
        line1: '© 2026 Andre Pombo',
        line2: 'HR Management System',
      },
    },
  },
};

export type AppCopy = AppCopyShape;

export const getCopy = (lang: SupportedLanguage): AppCopy => base[lang] ?? base.pt;

export const getLocale = (lang: SupportedLanguage) => (lang === 'pt' ? 'pt-BR' : 'en-US');
