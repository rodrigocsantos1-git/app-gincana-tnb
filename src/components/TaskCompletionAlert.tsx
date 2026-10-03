'use client';

import React, { useState } from 'react';
import { Team, Activity, Score } from '@/lib/types';
import { checkAllActivitiesCompletion, ActivityCompletionStatus } from '@/lib/taskCompletion';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Plus, Clock, HelpCircle } from 'lucide-react';

interface TaskCompletionAlertProps {
  teams: Team[];
  activities: Activity[];
  scores: Score[];
  onOpenScoreModal: (teamId?: string, activityId?: string) => void;
}

export function TaskCompletionAlert({
  teams,
  activities,
  scores,
  onOpenScoreModal,
}: TaskCompletionAlertProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (teams.length === 0 || activities.length === 0) {
    return null;
  }

  const { incompleteActivities, completedActivities, notStartedActivities } =
    checkAllActivitiesCompletion(activities, teams, scores);

  // Se não houver nenhuma tarefa incompleta e nenhuma concluída ainda (gincana acabou de começar sem pontos)
  if (incompleteActivities.length === 0 && completedActivities.length === 0) {
    return null;
  }

  // Se todas as tarefas que iniciaram já foram 100% concluídas por todas as equipes!
  if (incompleteActivities.length === 0 && completedActivities.length > 0) {
    return (
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 dark:border-emerald-500/40 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200">
                Todas as tarefas em andamento estão 100% concluídas!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                {completedActivities.length}{' '}
                {completedActivities.length === 1 ? 'tarefa finalizada' : 'tarefas finalizadas'} por todas as equipes. Nenhuma pontuação pendente.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
            Tudo em dia ✅
          </span>
        </div>
      </div>
    );
  }

  // Se existem tarefas que foram iniciadas por algumas equipes, mas faltam outras equipes completarem!
  return (
    <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border-2 border-amber-400/80 dark:border-amber-500/70 shadow-lg backdrop-blur-md space-y-4">
      {/* Header do Alerta */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md flex-shrink-0 mt-0.5 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-100 tracking-tight">
                Atenção: Tarefas Incompletas na Fase!
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                {incompleteActivities.length}{' '}
                {incompleteActivities.length === 1 ? 'prova com pendência' : 'provas com pendências'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300 font-medium">
              Há equipes que ainda não possuem pontuação registrada ou faltam rodadas para completar a prova:
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl text-amber-800 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition-colors cursor-pointer flex-shrink-0"
          title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Conteúdo Expansível com as Tarefas e Equipes Pendentes */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {incompleteActivities.map((status) => {
            const { activity, missingTeams, completedTeams, requiredRounds, isCaboDeGuerra } = status;

            return (
              <div
                key={activity.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-700/80 shadow-sm space-y-3"
              >
                {/* Título da Atividade */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📌</span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {activity.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    {isCaboDeGuerra
                      ? 'Duelos Cabo de Guerra'
                      : requiredRounds > 1
                      ? `Exige ${requiredRounds} rodadas por equipe`
                      : 'Pontuação obrigatória'}
                  </span>
                </div>

                {/* Lista de Equipes que Faltam Completar */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                    ❌ Falta completar para:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {missingTeams.map(({ team, scoresCount, notStarted, missingRounds }) => {
                      const isWhite =
                        (team.name || '').toLowerCase().includes('branc') ||
                        (team.color || '').toLowerCase() === '#ffffff';

                      return (
                        <div
                          key={team.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full flex-shrink-0 border ${
                                isWhite ? 'border-slate-400' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: team.color }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {team.name}
                              </p>
                              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                                {notStarted
                                  ? 'Nenhuma pontuação registrada'
                                  : `Faltam ${missingRounds} ${
                                      missingRounds === 1 ? 'rodada' : 'rodadas'
                                    } (${scoresCount}/${requiredRounds})`}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenScoreModal(team.id, activity.id)}
                            className="px-3 py-1.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:brightness-110 shadow-sm cursor-pointer flex items-center gap-1 active:scale-95 flex-shrink-0"
                            title={`Lançar pontos agora para ${team.name} nesta prova`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Lançar</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Equipes que Já Concluíram */}
                {completedTeams.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Já concluíram:
                    </span>
                    {completedTeams.map(({ team, scoresCount }) => (
                      <span
                        key={team.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span>{team.name}</span>
                        <span>({scoresCount}p)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
