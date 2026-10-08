import { Activity, Team, Score } from './types';

// Helper para identificar se a atividade possui limite de rodadas (ex: 5 rodadas obrigatórias)
export function getActivityRoundLimit(activity?: Activity | null): number | null {
  if (!activity) return null;
  const text = ((activity.title || '') + ' ' + (activity.description || '')).toLowerCase();

  if (
    text.includes('5 vezes') ||
    text.includes('5 rodadas') ||
    text.includes('pontuar 5') ||
    text.includes('cabo de guerra') ||
    text.includes('fase 2.1') ||
    text.includes('prova 1') ||
    text.includes('prova 2') ||
    text.includes('prova 3') ||
    text.includes('prova 4') ||
    text.includes('prova 5') ||
    text.includes('jornada') ||
    text.includes('correr') ||
    text.includes('corpo') ||
    text.includes('voz') ||
    text.includes('jesus')
  ) {
    return 5;
  }

  const match = text.match(/(\d+)\s*(vezes|rodadas)/);
  if (match && Number(match[1]) > 0) {
    return Number(match[1]);
  }
  return null;
}

export interface TeamTaskStatus {
  team: Team;
  scoresCount: number;
  requiredRounds: number;
  isCompleted: boolean;
  missingRounds: number;
  notStarted: boolean;
  totalPointsInActivity: number;
}

export interface ActivityCompletionStatus {
  activity: Activity;
  requiredRounds: number;
  isCaboDeGuerra: boolean;
  hasAnyScore: boolean;
  completedTeams: TeamTaskStatus[];
  missingTeams: TeamTaskStatus[];
  allTeamsStatus: TeamTaskStatus[];
  isFullyCompleted: boolean;
  isIncomplete: boolean; // hasAnyScore && missingTeams.length > 0
}

export function checkActivityCompletion(
  activity: Activity,
  teams: Team[] = [],
  scores: Score[] = []
): ActivityCompletionStatus {
  if (!activity || !activity.id) {
    return {
      activity: activity || { id: '', title: '', description: '', points: 0 },
      requiredRounds: 1,
      isCaboDeGuerra: false,
      hasAnyScore: false,
      completedTeams: [],
      missingTeams: [],
      allTeamsStatus: [],
      isFullyCompleted: false,
      isIncomplete: false,
    };
  }

  const validTeams = (teams || []).filter((t): t is Team => Boolean(t && t.id));
  const validScores = (scores || []).filter((s): s is Score => Boolean(s && s.id));

  const isCaboDeGuerra = (activity.title || '').toLowerCase().includes('cabo de guerra');
  const roundLimit = getActivityRoundLimit(activity);
  const requiredRounds = roundLimit || 1;

  const actScores = validScores.filter((s) => s.activity_id === activity.id);
  const hasAnyScore = actScores.length > 0;

  const allTeamsStatus: TeamTaskStatus[] = validTeams.map((team) => {
    const teamScores = actScores.filter((s) => s.team_id === team.id);
    const count = teamScores.length;
    const isCompleted = count >= requiredRounds;
    const totalPoints = teamScores.reduce((sum, s) => sum + (Number(s.points) || 0), 0);

    return {
      team: {
        ...team,
        name: team.name || 'Equipe',
        color: team.color || '#0284c7',
      },
      scoresCount: count,
      requiredRounds,
      isCompleted,
      missingRounds: Math.max(0, requiredRounds - count),
      notStarted: count === 0,
      totalPointsInActivity: totalPoints,
    };
  });

  const completedTeams = allTeamsStatus.filter((t) => t.isCompleted);
  const missingTeams = allTeamsStatus.filter((t) => !t.isCompleted);

  const isFullyCompleted = validTeams.length > 0 && missingTeams.length === 0;
  const isIncomplete = hasAnyScore && missingTeams.length > 0;

  return {
    activity,
    requiredRounds,
    isCaboDeGuerra,
    hasAnyScore,
    completedTeams,
    missingTeams,
    allTeamsStatus,
    isFullyCompleted,
    isIncomplete,
  };
}

export function checkAllActivitiesCompletion(
  activities: Activity[] = [],
  teams: Team[] = [],
  scores: Score[] = []
) {
  const validActivities = (activities || []).filter((a): a is Activity => Boolean(a && a.id));
  const validTeams = (teams || []).filter((t): t is Team => Boolean(t && t.id));
  const validScores = (scores || []).filter((s): s is Score => Boolean(s && s.id));

  const allStatuses = validActivities.map((act) =>
    checkActivityCompletion(act, validTeams, validScores)
  );

  const incompleteActivities = allStatuses.filter((s) => s.isIncomplete);
  const completedActivities = allStatuses.filter((s) => s.isFullyCompleted);
  const notStartedActivities = allStatuses.filter((s) => !s.hasAnyScore);

  return {
    allStatuses,
    incompleteActivities,
    completedActivities,
    notStartedActivities,
    hasAnyIncomplete: incompleteActivities.length > 0,
    totalActivities: validActivities.length,
  };
}

// Helper para obter o peso de ordenação numérica oficial das atividades
export function getActivityOrderWeight(title: string): number {
  const t = (title || '').toLowerCase().trim();
  if (t.includes('prova 1') || t.includes('mapa da jornada')) return 1.0;
  if (t.includes('prova 2') && !t.includes('2.1')) return 2.0;
  if (t.includes('2.1') || t.includes('cabo de guerra')) return 2.1;
  if (t.includes('prova 3') || t.includes('um só corpo')) return 3.0;
  if (t.includes('prova 4') || t.includes('voz certa') || t.includes('ouvir a voz')) return 4.0;
  if (t.includes('prova 5') || t.includes('jeito de jesus')) return 5.0;
  if (t.includes('tesouro')) return 6.0;
  if (t.includes('grito')) return 7.0;
  if (t.includes('fantasia')) return 8.0;

  const match = t.match(/prova\s*(\d+(\.\d+)?)/);
  if (match) return parseFloat(match[1]);

  return 99;
}

// Helper para ordenar atividades estritamente em ordem numérica oficial:
// 1. Prova 1, 2. Prova 2, 2.1 Fase 2.1 - Cabo de Guerra, 3. Prova 3, 4. Prova 4, 5. Prova 5, Caça ao Tesouro, Grito de Guerra, Melhor Fantasia
export function sortActivitiesNumerically(activities: Activity[] = []): Activity[] {
  if (!activities || !Array.isArray(activities)) return [];

  return [...activities].sort((a, b) => {
    const weightA = getActivityOrderWeight(a.title);
    const weightB = getActivityOrderWeight(b.title);
    if (weightA !== weightB) return weightA - weightB;
    return (a.title || '').localeCompare(b.title || '');
  });
}

// Helper para ordenar pontuações por ordem numérica da prova e rodada
export function sortScoresNumerically(scores: Score[] = []): Score[] {
  if (!scores || !Array.isArray(scores) || scores.length === 0) return [];

  const getScoreWeight = (s: Score): number => {
    const actTitle = s.activity?.title || '';
    const notesLower = (s.notes || '').toLowerCase();
    const actWeight = getActivityOrderWeight(actTitle);
    const roundMatch = notesLower.match(/(\d+)ª\s*rod|rodada\s*(\d+)/);
    const roundOffset = roundMatch ? Number(roundMatch[1] || roundMatch[2]) * 0.01 : 0;
    return actWeight + roundOffset;
  };

  return [...scores].sort((a, b) => {
    const wA = getScoreWeight(a);
    const wB = getScoreWeight(b);
    if (wA !== wB) return wA - wB;
    return (a.created_at ? new Date(a.created_at).getTime() : 0) - (b.created_at ? new Date(b.created_at).getTime() : 0);
  });
}

// Helper para deduplicar pontuações de uma equipe:
// Ao ajustar a pontuação de uma prova de resultado único (ex: Grito de Guerra, Melhor Fantasia),
// ou ao ajustar a pontuação de uma mesma rodada (ex: 1ª Rodada), exibe apenas o lançamento mais recente (último ajustado).
export function getDeduplicatedTeamScores(teamScores: Score[] = []): Score[] {
  if (!teamScores || !Array.isArray(teamScores) || teamScores.length === 0) return [];

  // Ordena cronologicamente decrescente (mais recente primeiro para manter o último lançamento/ajuste)
  const sorted = [...teamScores].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  const seenKeys = new Set<string>();
  const deduplicated: Score[] = [];

  for (const score of sorted) {
    const actId = score.activity_id || score.activity?.id || '';
    const actTitle = (score.activity?.title || '').toLowerCase().trim();
    const notesLower = (score.notes || '').toLowerCase().trim();

    let key: string;
    if (actId || actTitle) {
      // 1. Verifica se tem menção a número de rodada nas notas (ex: "1ª Rodada", "Rodada 2", "1ª rod.")
      const roundMatch = notesLower.match(/(\d+)ª\s*rod|rodada\s*(\d+)/);
      if (roundMatch) {
        const roundNum = roundMatch[1] || roundMatch[2];
        key = `act_${actTitle || actId}_round_${roundNum}`;
      } else {
        const isMultiRound =
          actTitle.includes('prova 1') ||
          actTitle.includes('prova 2') ||
          actTitle.includes('cabo de guerra') ||
          actTitle.includes('fase 2.1') ||
          actTitle.includes('prova 3') ||
          actTitle.includes('prova 4') ||
          actTitle.includes('prova 5');

        if (isMultiRound) {
          // Em provas de rodadas sem anotação explícita de número, cada lançamento conta
          key = `round_score_${score.id}`;
        } else {
          // Provas de resultado único (Grito de Guerra, Melhor Fantasia, etc.):
          // Se houver mais de um lançamento para a mesma equipe nessa prova, mantém APENAS O MAIS RECENTE!
          key = `single_act_${actTitle || actId}`;
        }
      }
    } else {
      // Pontuação avulsa sem atividade
      key = `avulsa_${score.id}`;
    }

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicated.push(score);
    }
  }

  return deduplicated;
}

