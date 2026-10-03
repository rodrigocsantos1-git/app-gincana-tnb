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
  HelpCircle,
  LayoutGrid,
  ListOrdered,
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

// Estilo de texto e contraste de cada equipe
function getTeamTextStyle(team?: Team | null) {
  const name = (team?.name || '').toLowerCase();
  const color = (team?.color || '').toLowerCase();

  const isWhite =
    name.includes('branc') ||
    color === '#ffffff' ||
    color === '#fff' ||
    color === '#f8fafc' ||
    color === '#e2e8f0';

  const isYellow = name.includes('amar') || color === '#f59e0b' || color === '#eab308';

  return {
    isWhite,
    textColor: isWhite ? 'text-slate-950 font-black' : isYellow ? 'text-amber-950 font-black' : 'text-white font-black',
    badgeBg: isWhite ? 'bg-slate-200 text-slate-900 border border-slate-300' : isYellow ? 'bg-amber-100 text-amber-950 border border-amber-300' : '',
  };
}

const STORAGE_KEY = 'tnb_cabo_de_guerra_duels_v1';

export function CaboDeGuerraTable({
  teams,
  activity,
  scores,
  onSubmitScore,
  onUpdateScore,
  onSuccess,
}: CaboDeGuerraTableProps) {
  const [matches, setMatches] = useState<Record<string, string | null>>({});
  const [viewMode, setViewMode] = useState<'matriz' | 'duelos'>('matriz');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lista de todos os 6 duelos possíveis entre as equipes
  const duelsList = useMemo(() => {
    const list: { id: string; teamA: Team; teamB: Team }[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        list.push({
          id: getMatchId(teams[i].id, teams[j].id),
          teamA: teams[i],
          teamB: teams[j],
        });
      }
    }
    return list;
  }, [teams]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMatches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao ler duelos do cabo de guerra:', e);
    }
  }, []);

  // Salvar no localStorage sempre que matches mudar
  const updateMatchesState = (newMatches: Record<string, string | null>) => {
    setMatches(newMatches);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMatches));
    } catch (e) {
      console.error('Erro ao salvar duelos do cabo de guerra:', e);
    }
  };

  // Definir resultado de um duelo: equipe que venceu (V) ou que perdeu (D)
  const handleSetDuelResult = (teamAId: string, teamBId: string, winnerId: string | null) => {
    const matchId = getMatchId(teamAId, teamBId);
    const newMatches = {
      ...matches,
      [matchId]: matches[matchId] === winnerId ? null : winnerId,
    };
    updateMatchesState(newMatches);
    setSaveSuccessMsg(null);
    setErrorMsg(null);
  };

  // Resetar todos os duelos
  const handleResetDuels = () => {
    const confirmReset = window.confirm(
      'Tem certeza que deseja zerar a tabela de duelos do Cabo de Guerra?'
    );
    if (!confirmReset) return;
    updateMatchesState({});
    setSaveSuccessMsg(null);
    setErrorMsg(null);
  };

  // Calcular estatísticas de cada equipe: Vitórias (V), Derrotas (D) e Pontos de Duelo
  const teamStats = useMemo(() => {
    return teams.map((team) => {
      let vCount = 0;
      let dCount = 0;
      let matchesPlayed = 0;

      teams.forEach((opp) => {
        if (opp.id === team.id) return;
        const matchId = getMatchId(team.id, opp.id);
        const winner = matches[matchId];

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
        vCount, // Cada V é 1 ponto no somatório de vitórias conforme solicitado
        dCount,
        matchesPlayed,
        totalMatches: teams.length - 1,
      };
    });
  }, [teams, matches]);

  // Ordenar equipes por número de Vitórias (V) com critério de desempate por confronto direto
  const sortedStandings = useMemo(() => {
    const sorted = [...teamStats].sort((a, b) => {
      // 1. Mais vitórias (V)
      if (b.vCount !== a.vCount) {
        return b.vCount - a.vCount;
      }

      // 2. Desempate por confronto direto entre as duas equipes empatadas
      const directMatchId = getMatchId(a.team.id, b.team.id);
      const directWinner = matches[directMatchId];
      if (directWinner === a.team.id) return -1;
      if (directWinner === b.team.id) return 1;

      // 3. Menos derrotas
      return a.dCount - b.dCount;
    });

    // Atribuir colocações oficiais (1º=4 pts, 2º=3 pts, 3º=2 pts, 4º=1 pt)
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
  }, [teamStats, matches]);

  // Total de duelos realizados
  const totalCompletedDuels = Object.values(matches).filter((w) => w !== null).length;
  const isAllDuelsFinished = totalCompletedDuels === duelsList.length;

  // Lançar / Atualizar pontuação final na gincana para todas as 4 equipes
  const handleSaveAllCaboScores = async () => {
    if (totalCompletedDuels === 0) {
      setErrorMsg('Preencha os resultados dos duelos antes de salvar a pontuação.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      // Pontuações existentes desta prova no banco
      const existingScoresForCabo = scores.filter((s) => s.activity_id === activity.id);

      for (const standing of sortedStandings) {
        const team = standing.team;
        const pts = standing.gincanaPoints;
        const notes = `Cabo de Guerra - ${standing.rank}º Lugar (${standing.vCount} Vitórias / ${standing.dCount} Derrotas)`;

        const existing = existingScoresForCabo.find((s) => s.team_id === team.id);

        if (existing && onUpdateScore) {
          // Atualiza registro existente
          await onUpdateScore(existing.id, {
            team_id: team.id,
            activity_id: activity.id,
            points: pts,
            notes,
          });
        } else {
          // Lança novo registro
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
        'Pontuações oficiais do Cabo de Guerra calculadas e salvas com sucesso para todas as equipes!'
      );
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erro ao salvar pontuação do cabo de guerra:', err);
      setErrorMsg('Erro ao salvar pontuações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Prova e Regras */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 dark:border-amber-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
              ⚔️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <span>Cabo de Guerra — Duelo Entre Equipes</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Cada time duela contra todos os outros. Selecione <strong>V</strong> (Vitória = 1 ponto) ou{' '}
                <strong>D</strong> (Derrota). Quem tiver mais V vence!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleResetDuels}
              className="p-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
              title="Zerar duelos desta tabela"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>

        {/* Tabela Oficial de Pontuação da Gincana */}
        <div className="mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-bold">
            🥇 1º Lugar: <strong>4 pts</strong>
          </div>
          <div className="p-1.5 rounded-lg bg-blue-100/70 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200 font-bold">
            🥈 2º Lugar: <strong>3 pts</strong>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-bold">
            🥉 3º Lugar: <strong>2 pts</strong>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
            🏅 4º Lugar: <strong>1 pt</strong>
          </div>
        </div>
      </div>

      {/* Alertas de Sucesso ou Erro */}
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

      {/* Alternador de Modo de Visualização */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Progresso: {totalCompletedDuels} de {duelsList.length} Duelos Realizados
        </span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode('matriz')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'matriz'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tabela Matriz</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('duelos')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'duelos'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Lista de Duelos</span>
          </button>
        </div>
      </div>

      {/* MODO 1: TABELA MATRIZ (V / D) */}
      {viewMode === 'matriz' && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase">
                  <th className="p-3 w-40">Equipe</th>
                  {teams.map((t) => (
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
                    Total V (Vitórias)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teams.map((teamA) => {
                  const stat = teamStats.find((s) => s.team.id === teamA.id);
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

                      {/* Células de Confronto vs Outros Times */}
                      {teams.map((teamB) => {
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
                        const winner = matches[matchId];
                        const isWin = winner === teamA.id;
                        const isLoss = winner === teamB.id;

                        return (
                          <td key={teamB.id} className="p-2 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                              {/* Botão V (Vitória) */}
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

                              {/* Botão D (Derrota) */}
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

                      {/* Somatório de Vitórias V (1 ponto por V) */}
                      <td className="p-3 text-center bg-amber-500/5 dark:bg-amber-500/10 font-black">
                        <span className="inline-block px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs sm:text-sm font-black shadow-xs">
                          {stat?.vCount ?? 0} V ({stat?.vCount ?? 0} pts)
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

      {/* MODO 2: LISTA DE DUELOS (1 a 1) */}
      {viewMode === 'duelos' && (
        <div className="space-y-2">
          {duelsList.map((duel, idx) => {
            const winner = matches[duel.id];
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

                {/* Confronto Visual entre as 2 Equipes */}
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

      {/* RESULTADO E CLASSIFICAÇÃO FINAL DO CABO DE GUERRA */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/50 dark:from-slate-800/80 dark:to-amber-950/20 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            Classificação Final do Cabo de Guerra (Por Vitórias V)
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Quem vencer mais duelos ganha a pontuação máxima
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {sortedStandings.map((standing) => {
            const team = standing.team;
            const isWhite = (team.name || '').toLowerCase().includes('branc');
            const medalEmoji =
              standing.rank === 1
                ? '🥇 1º Lugar'
                : standing.rank === 2
                ? '🥈 2º Lugar'
                : standing.rank === 3
                ? '🥉 3º Lugar'
                : '🏅 4º Lugar';

            const cardBorder =
              standing.rank === 1
                ? 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 ring-1 ring-amber-400/40'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70';

            return (
              <div
                key={team.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-xs ${cardBorder}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {medalEmoji}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                    +{standing.gincanaPoints} pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border ${
                      isWhite ? 'border-slate-400' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {team.name}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 font-medium">
                  <span>
                    Vitórias: <strong>{standing.vCount} V</strong>
                  </span>
                  <span>
                    Derrotas: <strong>{standing.dCount} D</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTÃO PRINCIPAL DE CONFIRMAÇÃO: APLICAR PONTUAÇÃO DO CABO DE GUERRA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSaveAllCaboScores}
          disabled={isSaving || totalCompletedDuels === 0}
          className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 shadow-lg shadow-amber-500/30 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <span>Salvando Pontuações do Cabo de Guerra...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
              <span>Confirmar e Salvar Pontuação do Cabo de Guerra para Todos os Times</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          Aplica automaticamente os pontos oficiais (4, 3, 2 e 1 pts) na classificação geral conforme as vitórias de cada equipe.
        </p>
      </div>
    </div>
  );
}
