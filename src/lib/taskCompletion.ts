import { Activity, Team, Score } from './types';

// Helper para identificar se a atividade possui limite de rodadas (ex: 5 rodadas obrigatórias)
export function getActivityRoundLimit(activity?: Activity | null): number | null {
  if (!activity) return null;
  const text = ((activity.title || '') + ' ' + (activity.description || '')).toLowerCase();

  if (
    text.includes('5 vezes') ||
    text.includes('5 rodadas') ||
    text.includes('pontuar 5') ||
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
  teams: Team[],
  scores: Score[]
): ActivityCompletionStatus {
  const isCaboDeGuerra = (activity.title || '').toLowerCase().includes('cabo de guerra');
  const roundLimit = getActivityRoundLimit(activity);
  const requiredRounds = isCaboDeGuerra ? 1 : roundLimit || 1;

  const actScores = scores.filter((s) => s.activity_id === activity.id);
  const hasAnyScore = actScores.length > 0;

  const allTeamsStatus: TeamTaskStatus[] = teams.map((team) => {
    const teamScores = actScores.filter((s) => s.team_id === team.id);
    const count = teamScores.length;
    const isCompleted = count >= requiredRounds;
    const totalPoints = teamScores.reduce((sum, s) => sum + (s.points || 0), 0);

    return {
      team,
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

  const isFullyCompleted = teams.length > 0 && missingTeams.length === 0;
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
  activities: Activity[],
  teams: Team[],
  scores: Score[]
) {
  const allStatuses = activities.map((act) => checkActivityCompletion(act, teams, scores));

  const incompleteActivities = allStatuses.filter((s) => s.isIncomplete);
  const completedActivities = allStatuses.filter((s) => s.isFullyCompleted);
  const notStartedActivities = allStatuses.filter((s) => !s.hasAnyScore);

  return {
    allStatuses,
    incompleteActivities,
    completedActivities,
    notStartedActivities,
    hasAnyIncomplete: incompleteActivities.length > 0,
    totalActivities: activities.length,
  };
}
