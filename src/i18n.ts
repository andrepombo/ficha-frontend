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
  candidateDetail: {
    loading: string;
    notFound: string;
    error: string;
    applicationDate: string;
    position: string;
    none: string;
    na: string;
    tabs: { personal: string; questionnaire: string };
    contact: { email: string; phone: string; birthDate: string; cpf: string };
    status: { label: string; updateError: string };
    notes: { saved: string; saveError: string };
    delete: { confirmation: string; success: string; error: string };
    sections: {
      scoreTitle: string;
      scoreTotalLabel: string;
      experienceTitle: string;
      experienceScoreLabel: string;
      educationTitle: string;
      educationScoreLabel: string;
      availabilityTitle: string;
      availabilityScoreLabel: string;
      referralTitle: string;
      referralScoreLabel: string;
      interviewsTitle: string;
      interviewsScoreLabel: string;
      interviewsEmptyTitle: string;
      interviewsEmptyDesc: string;
      scheduleInterview: string;
      scheduleFirst: string;
      contactTitle: string;
    };
    labels: {
      experienceYears: string;
      idleTime: string;
      workedBefore: string;
      educationLevel: string;
      courses: string;
      skills: string;
      certifications: string;
      availabilityStart: string;
      ownTransport: string;
      travelAvailability: string;
      heightPainting: string;
      relatives: string;
      referredBy: string;
      foundVacancy: string;
    };
    units: {
      year: string;
      years: string;
      course: string;
      courses: string;
      skill: string;
      skills: string;
      certification: string;
      certifications: string;
    };
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
  analytics: {
    loading: string;
    error: string;
    retry: string;
    selectors: {
      monthLabel: string;
      yearLabel: string;
      monthAll: string;
      yearAll: string;
      monthsShort: MonthOption[];
    };
    exportPdf: string;
    exportExcel: string;
    summary: {
      totalApplications: string;
      accepted: string;
      rejected: string;
      ofTotal: string;
      inYearPrefix: string;
    };
    chart: {
      titlePrefix: string;
      empty: string;
      legend: {
        applications: string;
        accepted: string;
        rejected: string;
      };
    };
    table: {
      title: string;
      headers: { month: string; total: string; accepted: string; rejected: string; acceptanceRate: string };
    };
    funnel: {
      title: string;
      subtitle: string;
      total: string;
      conversion: string;
      rejected: string;
      barLabel: string;
      tooltipCount: string;
      conversionArrow: string;
    };
    time: {
      title: string;
      subtitle: string;
      totalLabel: string;
      daysSuffix: string;
      barLabel: string;
      tooltipLabel: string;
    };
  };
  demographics: {
    loading: string;
    error: string;
    retry: string;
    cards: {
      totalCandidates: string;
      averageAge: string;
      averageAgeUnit: string;
      withAge: string;
      withEducation: string;
      ofTotal: string;
    };
    age: {
      title: string;
      noData: string;
      legendSuffix: string;
      tableTitle: string;
      headers: { range: string; quantity: string; percent: string };
    };
    education: {
      title: string;
      noData: string;
      tableTitle: string;
      headers: { level: string; quantity: string; percent: string };
      candidatesLabel: string;
    };
    labels: {
      gender: { male: string; female: string; undisclosed: string };
      disability: Record<string, string>;
      yesNo: { yes: string; no: string };
      availability: Record<string, string>;
      referral: Record<string, string>;
      education: Record<string, string>;
    };
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
    candidateDetail: {
      loading: 'Carregando detalhes do candidato...',
      notFound: 'Candidato não encontrado',
      error: 'Erro ao carregar dados do candidato',
      applicationDate: 'Candidatura',
      position: 'Posição',
      none: 'Sem posição',
      na: 'N/A',
      tabs: { personal: 'Dados Pessoais', questionnaire: 'Questionário' },
      contact: { email: 'Email', phone: 'Telefone', birthDate: 'Data de Nascimento', cpf: 'CPF' },
      status: { label: 'Alterar Status:', updateError: 'Falha ao atualizar status. Tente novamente.' },
      notes: { saved: 'Notas salvas com sucesso!', saveError: 'Falha ao salvar notas. Tente novamente.' },
      delete: {
        confirmation: 'Tem certeza de que deseja excluir este candidato? Esta ação não pode ser desfeita.',
        success: 'Candidato excluído com sucesso!',
        error: 'Falha ao excluir candidato. Tente novamente.',
      },
      sections: {
        scoreTitle: 'Detalhamento da Pontuação',
        scoreTotalLabel: 'Pontuação Total',
        experienceTitle: 'Experiências Profissionais',
        experienceScoreLabel: 'Pontuação Experiência',
        educationTitle: 'Educação & Qualificações',
        educationScoreLabel: 'Pontuação Educação',
        availabilityTitle: 'Disponibilidade & Logística',
        availabilityScoreLabel: 'Pontuação Disponibilidade',
        referralTitle: 'Indicação',
        referralScoreLabel: 'Pontuação Indicação',
        interviewsTitle: 'Entrevistas',
        interviewsScoreLabel: 'Pontuação Entrevista',
        interviewsEmptyTitle: 'Nenhuma entrevista agendada',
        interviewsEmptyDesc: 'Agende a primeira entrevista com este candidato.',
        scheduleInterview: 'Agendar Entrevista',
        scheduleFirst: 'Agendar Primeira Entrevista',
        contactTitle: 'Contato e Endereço',
      },
      labels: {
        experienceYears: 'Anos de Experiência',
        idleTime: 'Tempo Parado',
        workedBefore: 'Trabalhou na empresa antes?',
        educationLevel: 'Escolaridade',
        courses: 'Cursos Adicionais',
        skills: 'Habilidades',
        certifications: 'Certificações',
        availabilityStart: 'Disponibilidade para Início',
        ownTransport: 'Transporte Próprio',
        travelAvailability: 'Disponibilidade para Viagens',
        heightPainting: 'Pintura em Altura (Balancim/Cadeirinha/Andaimes)',
        relatives: 'Parentes/Amigos na Empresa',
        referredBy: 'Indicado Por',
        foundVacancy: 'Como Soube da Vaga',
      },
      units: {
        year: 'ano',
        years: 'anos',
        course: 'curso',
        courses: 'cursos',
        skill: 'habilidade',
        skills: 'habilidades',
        certification: 'certificação',
        certifications: 'certificações',
      },
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
    analytics: {
      loading: 'Carregando dados analíticos...',
      error: 'Falha ao carregar dados analíticos. Por favor, tente novamente.',
      retry: 'Tentar Novamente',
      selectors: {
        monthLabel: 'Mês',
        yearLabel: 'Ano',
        monthAll: 'Todos',
        yearAll: 'Todos',
        monthsShort: [
          { value: '0', label: 'Jan' },
          { value: '1', label: 'Fev' },
          { value: '2', label: 'Mar' },
          { value: '3', label: 'Abr' },
          { value: '4', label: 'Mai' },
          { value: '5', label: 'Jun' },
          { value: '6', label: 'Jul' },
          { value: '7', label: 'Ago' },
          { value: '8', label: 'Set' },
          { value: '9', label: 'Out' },
          { value: '10', label: 'Nov' },
          { value: '11', label: 'Dez' },
        ],
      },
      exportPdf: 'Exportar PDF',
      exportExcel: 'Exportar Excel',
      summary: {
        totalApplications: 'Total de Candidaturas',
        accepted: 'Candidatos Aceitos',
        rejected: 'Candidatos Rejeitados',
        ofTotal: 'do total',
        inYearPrefix: 'em',
      },
      chart: {
        titlePrefix: 'Candidaturas por Mês',
        empty: 'Nenhuma candidatura encontrada para',
        legend: {
          applications: 'Total de Candidaturas',
          accepted: 'Aceitos',
          rejected: 'Rejeitados',
        },
      },
      table: {
        title: 'Detalhes Mensais',
        headers: {
          month: 'Mês',
          total: 'Total',
          accepted: 'Aceitos',
          rejected: 'Rejeitados',
          acceptanceRate: 'Taxa de Aceitação',
        },
      },
      funnel: {
        title: 'Funil de Conversão',
        subtitle: 'Candidatos por etapa do processo',
        total: 'Total',
        conversion: 'Conversão',
        rejected: 'Rejeitados',
        barLabel: 'Candidatos',
        tooltipCount: 'Candidatos',
        conversionArrow: '→',
      },
      time: {
        title: 'Tempo Médio por Etapa',
        subtitle: 'Duração média em cada fase',
        totalLabel: 'Tempo total médio do processo',
        daysSuffix: 'dias',
        barLabel: 'Dias',
        tooltipLabel: 'Duração Média',
      },
    },
    demographics: {
      loading: 'Carregando dados demográficos...',
      error: 'Falha ao carregar dados demográficos. Por favor, tente novamente.',
      retry: 'Tentar Novamente',
      cards: {
        totalCandidates: 'Total de Candidatos',
        averageAge: 'Idade Média',
        averageAgeUnit: 'anos',
        withAge: 'Com Idade Registrada',
        withEducation: 'Com Escolaridade',
        ofTotal: '% do total',
      },
      age: {
        title: 'Distribuição por Faixa Etária',
        noData: 'Nenhum dado de idade disponível',
        legendSuffix: 'anos',
        tableTitle: 'Detalhes por Faixa Etária',
        headers: {
          range: 'Faixa Etária',
          quantity: 'Quantidade',
          percent: 'Percentual',
        },
      },
      education: {
        title: 'Distribuição por Escolaridade',
        noData: 'Nenhum dado de escolaridade disponível',
        tableTitle: 'Detalhes por Escolaridade',
        headers: {
          level: 'Nível de Escolaridade',
          quantity: 'Quantidade',
          percent: 'Percentual',
        },
        candidatesLabel: 'Candidatos',
      },
      labels: {
        gender: { male: 'Masculino', female: 'Feminino', undisclosed: 'Prefiro não informar' },
        disability: {
          sem_deficiencia: 'Sem deficiência',
          fisica: 'Física',
          auditiva: 'Auditiva',
          visual: 'Visual',
          mental: 'Mental',
          multipla: 'Múltipla',
          reabilitado: 'Reabilitado',
        },
        yesNo: { yes: 'Sim', no: 'Não' },
        availability: {
          imediato: 'Imediato',
          '15_dias': '15 dias',
          '30_dias': '30 dias',
        },
        referral: {
          facebook: 'Facebook',
          indicacao_colaborador: 'Indicação de colaborador',
          instagram: 'Instagram',
          linkedin: 'LinkedIn',
          sine: 'Sine',
          outros: 'Outros',
        },
        education: {
          elementary: 'Ensino Fundamental',
          high_school: 'Ensino Médio',
          associate: 'Tecnólogo',
          bachelor: 'Bacharelado',
          other: 'Outro',
        },
      },
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
    candidateDetail: {
      loading: 'Loading candidate details...',
      notFound: 'Candidate not found',
      error: 'Failed to load candidate details',
      applicationDate: 'Application',
      position: 'Position',
      none: 'No position',
      na: 'N/A',
      tabs: { personal: 'Personal Data', questionnaire: 'Questionnaire' },
      contact: { email: 'Email', phone: 'Phone', birthDate: 'Birth Date', cpf: 'CPF' },
      status: { label: 'Change Status:', updateError: 'Failed to update status. Please try again.' },
      notes: { saved: 'Notes saved successfully!', saveError: 'Failed to save notes. Please try again.' },
      delete: {
        confirmation: 'Are you sure you want to delete this candidate? This action cannot be undone.',
        success: 'Candidate deleted successfully!',
        error: 'Failed to delete candidate. Please try again.',
      },
      sections: {
        scoreTitle: 'Score Breakdown',
        scoreTotalLabel: 'Total Score',
        experienceTitle: 'Professional Experience',
        experienceScoreLabel: 'Experience Score',
        educationTitle: 'Education & Qualifications',
        educationScoreLabel: 'Education Score',
        availabilityTitle: 'Availability & Logistics',
        availabilityScoreLabel: 'Availability Score',
        referralTitle: 'Referral',
        referralScoreLabel: 'Referral Score',
        interviewsTitle: 'Interviews',
        interviewsScoreLabel: 'Interview Score',
        interviewsEmptyTitle: 'No interviews scheduled',
        interviewsEmptyDesc: 'Schedule the first interview with this candidate.',
        scheduleInterview: 'Schedule Interview',
        scheduleFirst: 'Schedule First Interview',
        contactTitle: 'Contact & Address',
      },
      labels: {
        experienceYears: 'Years of Experience',
        idleTime: 'Idle Time',
        workedBefore: 'Worked at the company before?',
        educationLevel: 'Education Level',
        courses: 'Additional Courses',
        skills: 'Skills',
        certifications: 'Certifications',
        availabilityStart: 'Start Availability',
        ownTransport: 'Own Transportation',
        travelAvailability: 'Travel Availability',
        heightPainting: 'Height Painting (Cradle/Rope/Scaffolding)',
        relatives: 'Relatives/Friends in Company',
        referredBy: 'Referred By',
        foundVacancy: 'How Found the Vacancy',
      },
      units: {
        year: 'year',
        years: 'years',
        course: 'course',
        courses: 'courses',
        skill: 'skill',
        skills: 'skills',
        certification: 'certification',
        certifications: 'certifications',
      },
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
    analytics: {
      loading: 'Loading analytics data...',
      error: 'Failed to load analytics data. Please try again.',
      retry: 'Try again',
      selectors: {
        monthLabel: 'Month',
        yearLabel: 'Year',
        monthAll: 'All',
        yearAll: 'All',
        monthsShort: [
          { value: '0', label: 'Jan' },
          { value: '1', label: 'Feb' },
          { value: '2', label: 'Mar' },
          { value: '3', label: 'Apr' },
          { value: '4', label: 'May' },
          { value: '5', label: 'Jun' },
          { value: '6', label: 'Jul' },
          { value: '7', label: 'Aug' },
          { value: '8', label: 'Sep' },
          { value: '9', label: 'Oct' },
          { value: '10', label: 'Nov' },
          { value: '11', label: 'Dec' },
        ],
      },
      exportPdf: 'Export PDF',
      exportExcel: 'Export Excel',
      summary: {
        totalApplications: 'Total Applications',
        accepted: 'Accepted Candidates',
        rejected: 'Rejected Candidates',
        ofTotal: 'of total',
        inYearPrefix: 'in',
      },
      chart: {
        titlePrefix: 'Applications per Month',
        empty: 'No applications found for',
        legend: {
          applications: 'Total Applications',
          accepted: 'Accepted',
          rejected: 'Rejected',
        },
      },
      table: {
        title: 'Monthly Details',
        headers: {
          month: 'Month',
          total: 'Total',
          accepted: 'Accepted',
          rejected: 'Rejected',
          acceptanceRate: 'Acceptance Rate',
        },
      },
      funnel: {
        title: 'Conversion Funnel',
        subtitle: 'Candidates by process stage',
        total: 'Total',
        conversion: 'Conversion',
        rejected: 'Rejected',
        barLabel: 'Candidates',
        tooltipCount: 'Candidates',
        conversionArrow: '→',
      },
      time: {
        title: 'Average Time per Stage',
        subtitle: 'Average duration in each phase',
        totalLabel: 'Total average process time',
        daysSuffix: 'days',
        barLabel: 'Days',
        tooltipLabel: 'Average Duration',
      },
    },
    demographics: {
      loading: 'Loading demographics data...',
      error: 'Failed to load demographics data. Please try again.',
      retry: 'Try again',
      cards: {
        totalCandidates: 'Total Candidates',
        averageAge: 'Average Age',
        averageAgeUnit: 'years',
        withAge: 'With Age Recorded',
        withEducation: 'With Education',
        ofTotal: '% of total',
      },
      age: {
        title: 'Age Distribution',
        noData: 'No age data available',
        legendSuffix: 'years',
        tableTitle: 'Age Range Details',
        headers: {
          range: 'Age Range',
          quantity: 'Quantity',
          percent: 'Percent',
        },
      },
      education: {
        title: 'Education Distribution',
        noData: 'No education data available',
        tableTitle: 'Education Details',
        headers: {
          level: 'Education Level',
          quantity: 'Quantity',
          percent: 'Percent',
        },
        candidatesLabel: 'Candidates',
      },
      labels: {
        gender: { male: 'Male', female: 'Female', undisclosed: 'Prefer not to say' },
        disability: {
          sem_deficiencia: 'No disability',
          fisica: 'Physical',
          auditiva: 'Hearing',
          visual: 'Visual',
          mental: 'Mental',
          multipla: 'Multiple',
          reabilitado: 'Rehabilitated',
        },
        yesNo: { yes: 'Yes', no: 'No' },
        availability: {
          imediato: 'Immediate',
          '15_dias': '15 days',
          '30_dias': '30 days',
        },
        referral: {
          facebook: 'Facebook',
          indicacao_colaborador: 'Employee referral',
          instagram: 'Instagram',
          linkedin: 'LinkedIn',
          sine: 'Sine',
          outros: 'Other',
        },
        education: {
          elementary: 'Elementary School',
          high_school: 'High School',
          associate: 'Associate',
          bachelor: 'Bachelor',
          other: 'Other',
        },
      },
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
