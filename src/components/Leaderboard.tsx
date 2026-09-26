'use client';

import React from 'react';
import { TeamStanding, Score } from '@/lib/types';
import { Trophy, Medal, Award, Plus, Sparkles, TrendingUp, Target } from 'lucide-react';

interface LeaderboardProps {
  standings: TeamStanding[];
  scores?: Score[];
  onOpenScoreModal: (teamId?: string) => void;
}

export function Leaderboard({ standings, scores = [], onOpenScoreModal }: LeaderboardProps) {
  if (standings.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center">
        <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          Nenhuma equipe cadastrada ainda
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Cadastre as equipes da gincana na aba &quot;Equipes&quot; para iniciar a pontuação.
        </p>
      </div>
    );
  }

  const maxPoints = Math.max(...standings.map((s) => s.totalPoints), 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0284c7] dark:text-[#78c8fb]" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Placar Geral da Gincana
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {standings.length} {standings.length === 1 ? 'Equipe' : 'Equipes'}
        </span>
      </div>

      <div className="space-y-3">
        {standings.map((standing) => {
          const percentage = Math.max(Math.round((standing.totalPoints / maxPoints) * 100), 4);
          // Filtra todas as pontuações individuais desta equipe
          const teamScores = scores.filter((s) => s.team_id === standing.team.id);

          return (
            <div
              key={standing.team.id}
              className={`glass-card rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg relative overflow-hidden group ${
                standing.rank === 1
                  ? 'border-2 border-amber-300/80 dark:border-amber-500/60 bg-amber-50/30 dark:bg-amber-950/20'
                  : ''
              }`}
            >
              {/* Barra de Progresso no Fundo */}
              <div
                className="absolute left-0 bottom-0 top-0 opacity-15 dark:opacity-20 transition-all duration-700 pointer-events-none"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: standing.team.color,
                }}
              />

              <div className="relative z-10 flex flex-col">
                {/* Linha Superior: Posição, Nome, Total de Pontos e Botão Pontuar */}
                <div className="flex items-center justify-between gap-3">
                  {/* Posição e Identificação da Equipe */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Badge de Posição */}
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base">
                      {standing.rank === 1 ? (
                        <span className="w-full h-full rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                      ) : standing.rank === 2 ? (
                        <span className="w-full h-full rounded-xl bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100 flex items-center justify-center shadow">
                          <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                      ) : standing.rank === 3 ? (
                        <span className="w-full h-full rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center shadow">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                      ) : (
                        <span className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 font-bold">
                          {standing.rank}º
                        </span>
                      )}
                    </div>

                    {/* Cor e Nome da Equipe */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 shadow-sm border-2 border-white dark:border-slate-800"
                        style={{ backgroundColor: standing.team.color }}
                        title={`Cor da equipe: ${standing.team.color}`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                            {standing.team.name}
                          </h3>
                          {standing.rank === 1 && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                              <Sparkles className="w-3 h-3" /> 1º Lugar
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {standing.scoresCount}{' '}
                          {standing.scoresCount === 1 ? 'prova pontuada' : 'provas pontuadas'}
                          {standing.recentActivity && (
                            <span className="hidden md:inline">
                              {' '}
                              • Última: {standing.recentActivity}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pontuação e Botão de Ação Rápida */}
                  <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {standing.totalPoints}
                      </div>
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        pontos
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenScoreModal(standing.team.id)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-[#78c8fb]/20 dark:bg-slate-800 dark:hover:bg-[#78c8fb]/20 text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-[#78c8fb] border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title={`Lançar pontuação para ${standing.team.name}`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Pontuar</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Pontuações Individuais por Prova */}
                {teamScores.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#78c8fb]" />
                        Pontuações por Prova ({teamScores.length}):
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {teamScores.map((score) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-xs"
                          title={score.notes || undefined}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: standing.team.color }}
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {score.activity?.title || 'Pontuação Avulsa'}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-lg flex-shrink-0 ${
                              score.points >= 0
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {score.points >= 0 ? `+${score.points}` : score.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
