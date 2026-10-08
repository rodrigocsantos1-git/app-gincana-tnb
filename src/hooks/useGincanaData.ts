'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Team, Activity, Score, TeamStanding } from '@/lib/types';
import { INITIAL_TEAMS, INITIAL_ACTIVITIES, INITIAL_SCORES } from '@/lib/mockData';
import { sortActivitiesNumerically, getDeduplicatedTeamScores } from '@/lib/taskCompletion';

const LOCAL_STORAGE_KEYS = {
  TEAMS: 'tnb_gincana_teams',
  ACTIVITIES: 'tnb_gincana_activities',
  SCORES: 'tnb_gincana_scores',
};

export function useGincanaData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingDemo, setIsUsingDemo] = useState(!isSupabaseConfigured);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Carregar dados locais de fallback
  const loadLocalData = useCallback(() => {
    try {
      const storedTeams = localStorage.getItem(LOCAL_STORAGE_KEYS.TEAMS);
      const storedActivities = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVITIES);
      const storedScores = localStorage.getItem(LOCAL_STORAGE_KEYS.SCORES);

      let parsedTeams: Team[] = storedTeams ? JSON.parse(storedTeams) : INITIAL_TEAMS;
      const hasOfficialTeams = Array.isArray(parsedTeams) && parsedTeams.some((t) => t?.name === 'Amarela' || t?.name === 'Branco');
      if (!hasOfficialTeams) {
        parsedTeams = INITIAL_TEAMS;
        localStorage.setItem(LOCAL_STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
      }

      let parsedActivities: Activity[] = storedActivities ? JSON.parse(storedActivities) : INITIAL_ACTIVITIES;
      const hasOfficialActivities = Array.isArray(parsedActivities) && parsedActivities.some((a) => a?.title?.includes('Prova 1') || a?.id?.startsWith('act-prova'));
      if (!hasOfficialActivities) {
        parsedActivities = INITIAL_ACTIVITIES;
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      }

      const parsedScores: Score[] = storedScores ? JSON.parse(storedScores) : INITIAL_SCORES;

      setTeams(parsedTeams);
      setActivities(sortActivitiesNumerically(parsedActivities));
      setScores(parsedScores);
      setIsUsingDemo(true);
    } catch (e) {
      console.error('Erro ao ler localStorage, utilizando dados padrão:', e);
      setTeams(INITIAL_TEAMS);
      setActivities(sortActivitiesNumerically(INITIAL_ACTIVITIES));
      setScores(INITIAL_SCORES);
      setIsUsingDemo(true);
    }
  }, []);

  // Salvar no localStorage quando estiver no modo demo
  const persistLocalData = (newTeams?: Team[], newActivities?: Activity[], newScores?: Score[]) => {
    if (!isSupabaseConfigured) {
      try {
        if (newTeams) localStorage.setItem(LOCAL_STORAGE_KEYS.TEAMS, JSON.stringify(newTeams));
        if (newActivities) localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVITIES, JSON.stringify(newActivities));
        if (newScores) localStorage.setItem(LOCAL_STORAGE_KEYS.SCORES, JSON.stringify(newScores));
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
      }
    }
  };

  // Buscar dados do Supabase
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      loadLocalData();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [teamsRes, actRes, scoresRes] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('activities').select('*').order('created_at'),
        supabase
          .from('scores')
          .select(`
            *,
            team:teams(*),
            activity:activities(*)
          `)
          .order('created_at', { ascending: false }),
      ]);

      if (teamsRes.error || actRes.error || scoresRes.error) {
        console.warn('Erro ao consultar Supabase, utilizando modo demo:', {
          teamsError: teamsRes.error,
          actError: actRes.error,
          scoresError: scoresRes.error,
        });
        loadLocalData();
        return;
      }

      setTeams(teamsRes.data || []);
      setActivities(sortActivitiesNumerically(actRes.data || []));
      setScores(scoresRes.data || []);
      setIsUsingDemo(false);
    } catch (err) {
      console.error('Falha de conexão com Supabase, fallback para dados locais:', err);
      loadLocalData();
    } finally {
      setLoading(false);
    }
  }, [loadLocalData]);

  // Efeito inicial e configuração do Realtime
  useEffect(() => {
    fetchData();

    if (!isSupabaseConfigured) return;

    // Configurar canal Realtime para sincronização instantânea
    const channel = supabase
      .channel('gincana-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        () => {
          fetchData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Enriquecer pontuações com objetos de equipe e atividade quando carregados localmente
  const enrichedScores: Score[] = useMemo(() => {
    const validTeams = (teams || []).filter((t): t is Team => Boolean(t && t.id));
    const validActivities = (activities || []).filter((a): a is Activity => Boolean(a && a.id));
    const teamMap = new Map(validTeams.map((t) => [t.id, t]));
    const actMap = new Map(validActivities.map((a) => [a.id, a]));

    return (scores || []).filter(Boolean).map((s) => ({
      ...s,
      team: s.team || teamMap.get(s.team_id),
      activity: s.activity || (s.activity_id ? actMap.get(s.activity_id) : undefined),
    }));
  }, [scores, teams, activities]);

  // Calcular Leaderboard e Pódio ordenados
  const standings: TeamStanding[] = useMemo(() => {
    const validTeams = (teams || []).filter((t): t is Team => Boolean(t && t.id));
    if (!validTeams.length) return [];

    const pointsByTeam: Record<string, { total: number; count: number; recentAct?: string }> = {};

    validTeams.forEach((t) => {
      const teamRaw = enrichedScores.filter((s) => s.team_id === t.id);
      const teamDedup = getDeduplicatedTeamScores(teamRaw);
      const total = teamDedup.reduce((acc, s) => acc + (Number(s.points) || 0), 0);
      const recentAct = teamDedup.find((s) => s.activity?.title)?.activity?.title;
      pointsByTeam[t.id] = { total, count: teamDedup.length, recentAct };
    });

    const list: TeamStanding[] = validTeams.map((team) => ({
      team,
      totalPoints: pointsByTeam[team.id]?.total ?? 0,
      scoresCount: pointsByTeam[team.id]?.count ?? 0,
      recentActivity: pointsByTeam[team.id]?.recentAct,
      rank: 1,
    }));

    // Ordenar por pontuação decrescente
    list.sort((a, b) => b.totalPoints - a.totalPoints);

    // Atribuir ranking considerando empates
    let currentRank = 1;
    for (let i = 0; i < list.length; i++) {
      if (i > 0 && list[i].totalPoints < list[i - 1].totalPoints) {
        currentRank = i + 1;
      }
      list[i].rank = currentRank;
    }

    return list;
  }, [teams, enrichedScores]);

  // ================= AÇÕES: PONTUAÇÕES =================
  const addScore = async (data: {
    team_id: string;
    activity_id?: string | null;
    points: number;
    notes?: string | null;
  }) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const newScore: Score = {
        id: 'score-' + Date.now(),
        team_id: data.team_id,
        activity_id: data.activity_id || null,
        points: data.points,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };
      const updated = [newScore, ...scores];
      setScores(updated);
      persistLocalData(undefined, undefined, updated);
      return { success: true };
    }

    try {
      const { data: inserted, error } = await supabase
        .from('scores')
        .insert([data])
        .select(`*, team:teams(*), activity:activities(*)`)
        .single();

      if (error) throw error;
      setScores((prev) => [inserted, ...prev]);
      return { success: true, data: inserted };
    } catch (err: any) {
      console.error('Erro ao registrar pontuação no Supabase:', err);
      // Fallback otimista local
      const newScore: Score = {
        id: 'score-' + Date.now(),
        team_id: data.team_id,
        activity_id: data.activity_id || null,
        points: data.points,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };
      const updated = [newScore, ...scores];
      setScores(updated);
      return { success: true, warning: 'Salvo localmente (Supabase offline)' };
    }
  };

  const deleteScore = async (scoreId: string) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const updated = scores.filter((s) => s.id !== scoreId);
      setScores(updated);
      persistLocalData(undefined, undefined, updated);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) throw error;
      setScores((prev) => prev.filter((s) => s.id !== scoreId));
      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar pontuação:', err);
      return { success: false, error: err };
    }
  };

  const updateScore = async (
    scoreId: string,
    data: { team_id?: string; activity_id?: string | null; points?: number; notes?: string | null }
  ) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const updated = scores.map((s) => (s.id === scoreId ? { ...s, ...data } : s));
      setScores(updated);
      persistLocalData(undefined, undefined, updated);
      return { success: true };
    }

    try {
      const { data: updatedScore, error } = await supabase
        .from('scores')
        .update(data)
        .eq('id', scoreId)
        .select(`*, team:teams(*), activity:activities(*)`)
        .single();
      if (error) throw error;
      setScores((prev) => prev.map((s) => (s.id === scoreId ? (updatedScore as unknown as Score) : s)));
      return { success: true, data: updatedScore };
    } catch (err) {
      console.error('Erro ao atualizar pontuação no Supabase:', err);
      // Fallback otimista local
      const updated = scores.map((s) => (s.id === scoreId ? { ...s, ...data } : s));
      setScores(updated);
      return { success: true, warning: 'Atualizado localmente' };
    }
  };

  // ================= AÇÕES: EQUIPES =================
  const addTeam = async (data: { name: string; color: string }) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const newTeam: Team = {
        id: 'team-' + Date.now(),
        name: data.name,
        color: data.color,
        created_at: new Date().toISOString(),
      };
      const updated = [...teams, newTeam];
      setTeams(updated);
      persistLocalData(updated);
      return { success: true, data: newTeam };
    }

    try {
      const { data: inserted, error } = await supabase.from('teams').insert([data]).select().single();
      if (error) throw error;
      setTeams((prev) => [...prev, inserted]);
      return { success: true, data: inserted };
    } catch (err) {
      console.error('Erro ao criar equipe:', err);
      return { success: false, error: err };
    }
  };

  const updateTeam = async (id: string, data: { name: string; color: string }) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const updated = teams.map((t) => (t.id === id ? { ...t, ...data } : t));
      setTeams(updated);
      persistLocalData(updated);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('teams').update(data).eq('id', id);
      if (error) throw error;
      setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar equipe:', err);
      return { success: false, error: err };
    }
  };

  const deleteTeam = async (id: string) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const updatedTeams = teams.filter((t) => t.id !== id);
      const updatedScores = scores.filter((s) => s.team_id !== id);
      setTeams(updatedTeams);
      setScores(updatedScores);
      persistLocalData(updatedTeams, undefined, updatedScores);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setScores((prev) => prev.filter((s) => s.team_id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erro ao excluir equipe:', err);
      return { success: false, error: err };
    }
  };

  // ================= AÇÕES: ATIVIDADES =================
  const addActivity = async (data: { title: string; description?: string; max_points?: number }) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const newAct: Activity = {
        id: 'act-' + Date.now(),
        title: data.title,
        description: data.description || '',
        max_points: data.max_points || null,
        created_at: new Date().toISOString(),
      };
      const updated = [...activities, newAct];
      setActivities(updated);
      persistLocalData(undefined, updated);
      return { success: true, data: newAct };
    }

    try {
      const { data: inserted, error } = await supabase.from('activities').insert([data]).select().single();
      if (error) throw error;
      setActivities((prev) => [...prev, inserted]);
      return { success: true, data: inserted };
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      return { success: false, error: err };
    }
  };

  const updateActivity = async (
    id: string,
    data: { title: string; description?: string; max_points?: number }
  ) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const updated = activities.map((a) => (a.id === id ? { ...a, ...data } : a));
      setActivities(updated);
      persistLocalData(undefined, updated);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('activities').update(data).eq('id', id);
      if (error) throw error;
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar atividade:', err);
      return { success: false, error: err };
    }
  };

  const deleteActivity = async (id: string) => {
    if (!isSupabaseConfigured || isUsingDemo) {
      const updated = activities.filter((a) => a.id !== id);
      setActivities(updated);
      persistLocalData(undefined, updated);
      return { success: true };
    }

    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      setActivities((prev) => prev.filter((a) => a.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erro ao excluir atividade:', err);
      return { success: false, error: err };
    }
  };

  const clearAllScores = async () => {
    try {
      if (!isSupabaseConfigured || isUsingDemo) {
        setScores([]);
        persistLocalData(undefined, undefined, []);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.SCORES);
        return { success: true };
      }

      // Deletar todas as pontuações no Supabase
      const { error } = await supabase.from('scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && scores.length > 0) {
        const ids = scores.map((s) => s.id);
        const { error: error2 } = await supabase.from('scores').delete().in('id', ids);
        if (error2) throw error2;
      }

      setScores([]);
      persistLocalData(undefined, undefined, []);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SCORES);
      return { success: true };
    } catch (err) {
      console.error('Erro ao zerar pontuações:', err);
      // Fallback local caso falhe conexão
      setScores([]);
      persistLocalData(undefined, undefined, []);
      return { success: false, error: err };
    }
  };

  const exportBackup = () => {
    try {
      const now = new Date();
      const backupData = {
        appName: 'Gincana Acampa TNB',
        ministry: 'Ministério Infantil Tô na Bênção (TNB) - Igreja Bíblica da Paz',
        exportedAt: now.toISOString(),
        exportedAtFormatted: now.toLocaleString('pt-BR'),
        totalTeams: teams.length,
        totalScores: scores.length,
        standings: standings.map((s) => ({
          rank: s.rank,
          teamId: s.team.id,
          teamName: s.team.name,
          teamColor: s.team.color,
          totalPoints: s.totalPoints,
          scoresCount: s.scoresCount,
          recentActivity: s.recentActivity || null,
        })),
        teams,
        activities,
        scores,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `backup-gincana-tnb-${dateStr}_${timeStr}.json`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      return { success: true, fileName };
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
      return { success: false, error: err };
    }
  };

  const syncOfficialActivities = async () => {
    if (!isSupabaseConfigured || isUsingDemo) {
      setActivities(INITIAL_ACTIVITIES);
      persistLocalData(undefined, INITIAL_ACTIVITIES);
      return { success: true };
    }

    try {
      const existingTitles = new Set((activities || []).map((a) => (a?.title || '').toLowerCase().trim()));
      const toInsert = INITIAL_ACTIVITIES.filter(
        (oa) => !existingTitles.has((oa?.title || '').toLowerCase().trim())
      ).map((oa) => ({
        title: oa.title,
        description: oa.description,
        max_points: oa.max_points,
      }));

      if (toInsert.length > 0) {
        const { data, error } = await supabase.from('activities').insert(toInsert).select();
        if (error) throw error;
        setActivities((prev) => [...prev, ...(data || [])]);
      }
      return { success: true, insertedCount: toInsert.length };
    } catch (err) {
      console.error('Erro ao sincronizar provas oficiais:', err);
      return { success: false, error: err };
    }
  };

  const resetToMock = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TEAMS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SCORES);
    setTeams(INITIAL_TEAMS);
    setActivities(INITIAL_ACTIVITIES);
    setScores(INITIAL_SCORES);
    setIsUsingDemo(true);
  };

  const sortedActivities = useMemo(() => sortActivitiesNumerically(activities), [activities]);

  return {
    teams,
    activities: sortedActivities,
    scores: enrichedScores,
    standings,
    loading,
    isUsingDemo,
    realtimeConnected,
    fetchData,
    addScore,
    updateScore,
    deleteScore,
    clearAllScores,
    exportBackup,
    syncOfficialActivities,
    addTeam,
    updateTeam,
    deleteTeam,
    addActivity,
    updateActivity,
    deleteActivity,
    resetToMock,
  };
}
