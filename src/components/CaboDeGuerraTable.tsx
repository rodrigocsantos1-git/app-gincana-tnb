'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Team, Activity, Score } from '@/lib/types';
import {
  Trophy,
  Swords,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Medal,
  Award,
  AlertCircle,
  LayoutGrid,
  ListOrdered,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CaboDeGuerraTableProps {
  teams: Team[];
  activity: Activity;
  scores: Score[];
  onSubmitScore: (data: {
    team_id: string;
    activity_id?: string | null;
    points: number;
    notes?: string | null;
  }) => Promise<any>;
  onUpdateScore?: (
    scoreId: string,
    data: { team_id?: string; activity_id?: string | null; points?: number; notes?: string | null }
  ) => Promise<any>;
  onSuccess?: () => void;
  onClose?: () => void;
}

// Representação de cada duelo entre 2 equipes
export interface MatchDuel {
  id: string;
  teamAId: string;
  teamBId: string;
  winnerId: string | null; // ID da equipe que venceu (V), ou null se pendente
}

// Helper para obter chave única ordenada de um duelo
export function getMatchId(teamIdA: string, teamIdB: string): string {
  return [teamIdA, teamIdB].sort().join('_vs_');
}

// Chave do localStorage para armazenar os duelos por rodada
const STORAGE_KEY_ROUNDS = 'tnb_cabo_de_guerra_rounds_duels_v2';

export function CaboDeGuerraTable({
  teams,
  activity,
  scores,
  onSubmitScore,
  onUpdateScore,
  onSuccess,
  onClose,
}: CaboDeGuerraTableProps) {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [matchesByRound, setMatchesByRound] = useState<Record<number, Record<string, string | null>>>({
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
  });
  const [viewMode, setViewMode] = useState<'matriz' | 'duelos'>('matriz');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validTeams = useMemo(() => teams.filter((t): t is Team => Boolean(t && t.id)), [teams]);

  // Lista de todos os 6 duelos possíveis entre as equipes
  const duelsList = useMemo(() => {
    const list: { id: string; teamA: Team; teamB: Team }[] = [];
    for (let i = 0; i < validTeams.length; i++) {
      for (let j = i + 1; j < validTeams.length; j++) {
        list.push({
          id: getMatchId(validTeams[i].id, validTeams[j].id),
          teamA: validTeams[i],
          teamB: validTeams[j],
        });
      }
    }
    return list;
  }, [validTeams]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUNDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setMatchesByRound((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch (e) {
      console.error('Erro ao ler duelos das 5 rodadas do cabo de guerra:', e);
    }
  }, []);

  // Mapeamento das pontuações já salvas no banco de dados por rodada (1 a 5) e por equipe
  const existingScoresByRound = useMemo(() => {
    const map: Record<number, Record<string, Score>> = {
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
    };

    const actScores = (scores || []).filter((s) => s && s.activity_id === activity.id);

    validTeams.forEach((team) => {
      const teamScores = actScores
        .filter((s) => s.team_id === team.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      teamScores.forEach((score, idx) => {
        const match = (score.notes || '').match(/rodada\s*(\d+)|(\d+)ª\s*rodada/i);
        const roundNum = match ? Number(match[1] || match[2]) : idx + 1;
        if (roundNum >= 1 && roundNum <= 5) {
          map[roundNum][team.id] = score;
        }
      });
    });

    return map;
  }, [scores, activity.id, validTeams]);

  // Status de conclusão de cada rodada (1 a 5)
  const roundStatus = useMemo(() => {
    return [1, 2, 3, 4, 5].map((roundNum) => {
      const roundScores = existingScoresByRound[roundNum] || {};
      const completedTeamsCount = Object.keys(roundScores).length;
      const isCompleted = validTeams.length > 0 && completedTeamsCount >= validTeams.length;
      const isPartiallyCompleted = completedTeamsCount > 0 && !isCompleted;

      const roundMatches = matchesByRound[roundNum] || {};
      const duelsDone = Object.values(roundMatches).filter((w) => w !== null).length;

      return {
        roundNum,
        isCompleted,
        isPartiallyCompleted,
        completedTeamsCount,
        duelsDone,
        totalDuels: duelsList.length,
      };
    });
  }, [existingScoresByRound, validTeams, matchesByRound, duelsList.length]);

  // Total de rodadas oficiais concluídas
  const totalRoundsCompleted = useMemo(() => {
    return roundStatus.filter((r) => r.isCompleted).length;
  }, [roundStatus]);

  // Selecionar automaticamente a primeira rodada não concluída se houver
  useEffect(() => {
    const firstPending = roundStatus.find((r) => !r.isCompleted);
    if (firstPending) {
      // Deixa o usuário na primeira pendente se ele ainda não tiver interagido
    }
  }, [roundStatus]);

  // Atualizar estado de confrontos da rodada atual
  const updateMatchesState = (newMatchesForCurrentRound: Record<string, string | null>) => {
    setMatchesByRound((prev) => {
      const updated = {
        ...prev,
        [currentRound]: newMatchesForCurrentRound,
      };
      try {
        localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(updated));
      } catch (e) {
        console.error('Erro ao salvar duelos:', e);
      }
      return updated;
    });
  };

  // Marcar resultado de um confronto da rodada atual
  const handleSetDuelResult = (teamAId: string, teamBId: string, winnerId: string | null) => {
    const matchId = getMatchId(teamAId, teamBId);
    const currentMatches = matchesByRound[currentRound] || {};
    const newMatches = {
      ...currentMatches,
      [matchId]: currentMatches[matchId] === winnerId ? null : winnerId,
    };
    updateMatchesState(newMatches);
    setSaveSuccessMsg(null);
    setErrorMsg(null);
  };

  // Resetar duelos apenas da rodada atual
  const handleResetCurrentRoundDuels = () => {
    const confirmReset = window.confirm(
      `Tem certeza que deseja zerar os duelos da Rodada ${currentRound} do Cabo de Guerra?`
    );
    if (!confirmReset) return;
    updateMatchesState({});
    setSaveSuccessMsg(null);
    setErrorMsg(null);
  };

  // Duelos da rodada ativa
  const currentRoundMatches = useMemo(() => {
    return matchesByRound[currentRound] || {};
  }, [matchesByRound, currentRound]);

  // Total de duelos preenchidos na rodada ativa
  const totalCompletedDuelsInRound = useMemo(() => {
    return Object.values(currentRoundMatches).filter((w) => w !== null).length;
  }, [currentRoundMatches]);

  // Estatísticas da rodada ativa por equipe
  const currentRoundStats = useMemo(() => {
    return validTeams.map((team) => {
      let vCount = 0;
      let dCount = 0;
      let matchesPlayed = 0;

      validTeams.forEach((opp) => {
        if (opp.id === team.id) return;
        const matchId = getMatchId(team.id, opp.id);
        const winner = currentRoundMatches[matchId];

        if (winner) {
          matchesPlayed++;
          if (winner === team.id) {
            vCount++;
          } else {
            dCount++;
          }
        }
      });

      return {
        team,
        vCount,
        dCount,
        matchesPlayed,
        totalMatches: validTeams.length - 1,
      };
    });
  }, [validTeams, currentRoundMatches]);

  // Classificação da rodada ativa (1º=4 pts, 2º=3 pts, 3º=2 pts, 4º=1 pt)
  const currentRoundStandings = useMemo(() => {
    const sorted = [...currentRoundStats].sort((a, b) => {
      if (b.vCount !== a.vCount) {
        return b.vCount - a.vCount;
      }
      const directMatchId = getMatchId(a.team.id, b.team.id);
      const directWinner = currentRoundMatches[directMatchId];
      if (directWinner === a.team.id) return -1;
      if (directWinner === b.team.id) return 1;
      return a.dCount - b.dCount;
    });

    const pointsMap = [4, 3, 2, 1];

    return sorted.map((item, index) => {
      const rank = index + 1;
      const gincanaPoints = pointsMap[index] ?? Math.max(1, 4 - index);

      return {
        ...item,
        rank,
        gincanaPoints,
      };
    });
  }, [currentRoundStats, currentRoundMatches]);

  // Salvar pontuação da rodada atual no banco para todas as equipes
  const handleSaveCurrentRoundScores = async () => {
    if (totalCompletedDuelsInRound === 0) {
      setErrorMsg(`Preencha o resultado dos confrontos da Rodada ${currentRound} antes de salvar.`);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      const existingForRound = existingScoresByRound[currentRound] || {};

      for (const standing of currentRoundStandings) {
        const team = standing.team;
        const pts = standing.gincanaPoints;
        const notes = `Cabo de Guerra - Rodada ${currentRound} - ${standing.rank}º Lugar (${standing.vCount} Vitórias / ${standing.dCount} Derrotas)`;

        const existing = existingForRound[team.id];

        if (existing && onUpdateScore) {
          await onUpdateScore(existing.id, {
            team_id: team.id,
            activity_id: activity.id,
            points: pts,
            notes,
          });
        } else {
          await onSubmitScore({
            team_id: team.id,
            activity_id: activity.id,
            points: pts,
            notes,
          });
        }
      }

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ffffff', '#bb94ff'],
      });

      setSaveSuccessMsg(
        `🎉 Pontuação da Rodada ${currentRound} salva com sucesso para todas as equipes!`
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erro ao salvar pontuação da rodada do cabo de guerra:', err);
      setErrorMsg('Erro ao salvar pontuações da rodada. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tabela Consolidada das 5 Rodadas (Soma Geral da Prova)
  const consolidatedTable = useMemo(() => {
    return validTeams.map((team) => {
      const roundPoints: (number | null)[] = [1, 2, 3, 4, 5].map((rNum) => {
        const score = existingScoresByRound[rNum]?.[team.id];
        return score ? Number(score.points) : null;
      });

      const totalPoints = roundPoints.reduce<number>(
        (sum, pts) => sum + (pts !== null ? pts : 0),
        0
      );
      const roundsScoredCount = roundPoints.filter((pts) => pts !== null).length;

      return {
        team,
        roundPoints,
        totalPoints,
        roundsScoredCount,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [validTeams, existingScoresByRound]);

  return (
    <div className="space-y-4">
      {/* CABEÇALHO DA PROVA: REGULAMENTO DAS 5 RODADAS DE DUELOS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-emerald-500/10 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Cabo de Guerra — 5 Rodadas de Duelos
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  {totalRoundsCompleted}/5 Rodadas Concluídas
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Em cada uma das <strong>5 Rodadas</strong>, as equipes realizam confrontos diretos (V = Vitória, D = Derrota). Cada rodada premia: <strong>1º=4 pts, 2º=3 pts, 3º=2 pts, 4º=1 pt</strong> (Total máx: 20 pts).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetCurrentRoundDuels}
            className="p-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
            title={`Zerar confrontos da Rodada ${currentRound}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar Rodada {currentRound}</span>
          </button>
        </div>

        {/* Barra de Progresso das 5 Rodadas */}
        <div className="mt-3.5 pt-3 border-t border-amber-500/20">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Progresso Oficial da Prova:</span>
            </span>
            <span className="font-black text-amber-600 dark:text-amber-400">
              {totalRoundsCompleted} de 5 Rodadas Pontuadas ({Math.round((totalRoundsCompleted / 5) * 100)}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${(totalRoundsCompleted / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* SELETOR DE ABAS DAS 5 RODADAS OFICIAIS */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>Selecione a Rodada para Lançar/Visualizar os Duelos:</span>
        </label>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((roundNum) => {
            const st = roundStatus.find((r) => r.roundNum === roundNum);
            const isSelected = currentRound === roundNum;
            const isDone = st?.isCompleted;

            return (
              <button
                key={roundNum}
                type="button"
                onClick={() => {
                  setCurrentRound(roundNum);
                  setSaveSuccessMsg(null);
                  setErrorMsg(null);
                }}
                className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  isSelected
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-md ring-2 ring-blue-300 scale-[1.02]'
                    : isDone
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-500/25'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-black">
                    {roundNum}ª Rod.
                  </span>
                  {isDone && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isDone
                      ? 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isDone ? 'Concluída' : 'Pendente'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ALERTAS DE SUCESSO OU ERRO */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CONTROLE DOS DUELOS DA RODADA SELECIONADA */}
      <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Duelos da {currentRound}ª Rodada ({totalCompletedDuelsInRound} de {duelsList.length} Realizados)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('matriz')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'matriz'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matriz</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('duelos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'duelos'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>
        </div>

        {/* MODO 1: TABELA MATRIZ (V / D) */}
        {viewMode === 'matriz' && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase">
                    <th className="p-3 w-36">Equipe</th>
                    {validTeams.map((t) => (
                      <th key={t.id} className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                            style={{ backgroundColor: t.color }}
                          />
                          <span>vs {t.name}</span>
                        </div>
                      </th>
                    ))}
                    <th className="p-3 text-center bg-amber-500/10 text-amber-950 dark:text-amber-200 font-black">
                      Vitórias (V)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {validTeams.map((teamA) => {
                    const stat = currentRoundStats.find((s) => s.team.id === teamA.id);
                    const isWhite = (teamA.name || '').toLowerCase().includes('branc');

                    return (
                      <tr
                        key={teamA.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Nome da Equipe */}
                        <td className="p-3 font-bold">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs border ${
                                isWhite ? 'border-slate-400' : 'border-black/10'
                              }`}
                              style={{ backgroundColor: teamA.color }}
                            />
                            <span className="font-black text-slate-900 dark:text-white">
                              {teamA.name}
                            </span>
                          </div>
                        </td>

                        {/* Confrontos vs Outros Times */}
                        {validTeams.map((teamB) => {
                          if (teamA.id === teamB.id) {
                            return (
                              <td
                                key={teamB.id}
                                className="p-2 text-center bg-slate-50/50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 select-none font-bold"
                              >
                                —
                              </td>
                            );
                          }

                          const matchId = getMatchId(teamA.id, teamB.id);
                          const winner = currentRoundMatches[matchId];
                          const isWin = winner === teamA.id;
                          const isLoss = winner === teamB.id;

                          return (
                            <td key={teamB.id} className="p-2 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleSetDuelResult(teamA.id, teamB.id, teamA.id)}
                                  title={`Vitória da Equipe ${teamA.name}`}
                                  className={`px-2.5 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95 cursor-pointer ${
                                    isWin
                                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
                                  }`}
                                >
                                  V
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetDuelResult(teamA.id, teamB.id, teamB.id)}
                                  title={`Derrota da Equipe ${teamA.name}`}
                                  className={`px-2.5 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95 cursor-pointer ${
                                    isLoss
                                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700'
                                  }`}
                                >
                                  D
                                </button>
                              </div>
                            </td>
                          );
                        })}

                        {/* Total V da Rodada */}
                        <td className="p-3 text-center bg-amber-500/5 dark:bg-amber-500/10 font-black">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-black shadow-2xs">
                            {stat?.vCount ?? 0} V
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODO 2: LISTA DE DUELOS (Cards) */}
        {viewMode === 'duelos' && (
          <div className="space-y-2">
            {duelsList.map((duel, idx) => {
              const winner = currentRoundMatches[duel.id];
              const isFinished = winner !== null && winner !== undefined;

              return (
                <div
                  key={duel.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isFinished
                      ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-900 border-amber-300/80 dark:border-amber-500/40 ring-1 ring-amber-300/30'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 text-[11px]">
                      #{idx + 1}
                    </span>
                    <span>Duelo:</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
                    {/* Time A */}
                    <button
                      type="button"
                      onClick={() => handleSetDuelResult(duel.teamA.id, duel.teamB.id, duel.teamA.id)}
                      className={`flex-1 sm:flex-initial flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
                        winner === duel.teamA.id
                          ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400 shadow-md'
                          : winner === duel.teamB.id
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 opacity-70'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: duel.teamA.color }}
                        />
                        <span>{duel.teamA.name}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                        {winner === duel.teamA.id ? 'V (Venceu)' : 'V'}
                      </span>
                    </button>

                    <span className="text-xs font-black text-slate-400">vs</span>

                    {/* Time B */}
                    <button
                      type="button"
                      onClick={() => handleSetDuelResult(duel.teamA.id, duel.teamB.id, duel.teamB.id)}
                      className={`flex-1 sm:flex-initial flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
                        winner === duel.teamB.id
                          ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400 shadow-md'
                          : winner === duel.teamA.id
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 opacity-70'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: duel.teamB.color }}
                        />
                        <span>{duel.teamB.name}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                        {winner === duel.teamB.id ? 'V (Venceu)' : 'V'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CLASSIFICAÇÃO E PONTUAÇÃO CALCULADA DA RODADA ATIVA */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/50 dark:from-slate-800/80 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            Classificação da {currentRound}ª Rodada (Pontos da Rodada)
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Regra: 1º=4 pts | 2º=3 pts | 3º=2 pts | 4º=1 pt
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {currentRoundStandings.map((standing) => {
            const team = standing.team;
            const isWhite = (team.name || '').toLowerCase().includes('branc');
            const medalEmoji =
              standing.rank === 1
                ? '🥇 1º'
                : standing.rank === 2
                ? '🥈 2º'
                : standing.rank === 3
                ? '🥉 3º'
                : '🏅 4º';

            const cardBorder =
              standing.rank === 1
                ? 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 ring-1 ring-amber-400/40'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70';

            return (
              <div
                key={team.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 shadow-2xs ${cardBorder}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {medalEmoji}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                    +{standing.gincanaPoints} pts
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      isWhite ? 'border-slate-400' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {team.name}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span>{standing.vCount} Vitórias</span>
                  <span>{standing.dCount} Derrotas</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTÃO PRINCIPAL DE SALVAR A RODADA ATIVA */}
      <div>
        <button
          type="button"
          onClick={handleSaveCurrentRoundScores}
          disabled={isSaving || totalCompletedDuelsInRound === 0}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 shadow-lg shadow-amber-500/30 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <span>Salvando Pontuação da {currentRound}ª Rodada...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
              <span>
                {existingScoresByRound[currentRound] &&
                Object.keys(existingScoresByRound[currentRound]).length >= validTeams.length
                  ? `Atualizar Pontuação da ${currentRound}ª Rodada para Todas as Equipes`
                  : `Confirmar e Salvar ${currentRound}ª Rodada para Todas as Equipes`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* QUADRO CONSOLIDADO DAS 5 RODADAS DO CABO DE GUERRA */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#0284c7]" />
            Quadro Consolidado das 5 Rodadas (Pontuação Geral no Cabo de Guerra)
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Total máximo possível: 20 pontos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase">
                <th className="p-2.5 w-36">Equipe</th>
                <th className="p-2 text-center">1ª Rod</th>
                <th className="p-2 text-center">2ª Rod</th>
                <th className="p-2 text-center">3ª Rod</th>
                <th className="p-2 text-center">4ª Rod</th>
                <th className="p-2 text-center">5ª Rod</th>
                <th className="p-2.5 text-center bg-amber-500/10 text-amber-950 dark:text-amber-200 font-black">
                  Total Acumulado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {consolidatedTable.map((item, idx) => {
                const team = item.team;
                const isWhite = (team.name || '').toLowerCase().includes('branc');
                const isLeading = idx === 0 && item.totalPoints > 0;

                return (
                  <tr
                    key={team.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-2.5 font-bold">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full flex-shrink-0 border ${
                            isWhite ? 'border-slate-400' : 'border-black/10'
                          }`}
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-black text-slate-900 dark:text-white">
                          {team.name}
                        </span>
                        {isLeading && (
                          <span className="text-[10px]" title="Líder do Cabo de Guerra">
                            👑
                          </span>
                        )}
                      </div>
                    </td>

                    {item.roundPoints.map((pts, rIdx) => (
                      <td key={rIdx} className="p-2 text-center">
                        {pts !== null ? (
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-black text-xs">
                            {pts} pts
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                        )}
                      </td>
                    ))}

                    <td className="p-2.5 text-center bg-amber-500/5 dark:bg-amber-500/10 font-black">
                      <span className="inline-block px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-black shadow-2xs">
                        {item.totalPoints} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
