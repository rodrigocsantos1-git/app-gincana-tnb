'use client';

import React, { useState } from 'react';
import { TeamStanding, Score } from '@/lib/types';
import { Trophy, Medal, Award, Plus, Sparkles, TrendingUp, Target, Download, RotateCcw, AlertTriangle, X } from 'lucide-react';

interface LeaderboardProps {
  standings: TeamStanding[];
  scores?: Score[];
  onOpenScoreModal: (teamId?: string) => void;
  onExportBackup?: () => void;
  onClearScores?: () => Promise<any>;
  isAdmin?: boolean;
}

export function Leaderboard({
  standings,
  scores = [],
  onOpenScoreModal,
  onExportBackup,
  onClearScores,
  isAdmin = false,
}: LeaderboardProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleBackup = () => {
    if (onExportBackup) {
      onExportBackup();
      setFeedbackMsg({ type: 'success', text: 'Backup exportado com sucesso!' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleConfirmReset = async () => {
    if (!onClearScores) return;
    try {
      setIsResetting(true);
      await onClearScores();
      setIsResetModalOpen(false);
      setFeedbackMsg({ type: 'success', text: 'Todas as pontuações foram zeradas com sucesso!' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao zerar as pontuações. Tente novamente.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`mb-4 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 hover:bg-black/10 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header do Placar com Ações de Backup e Zerar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0284c7] dark:text-[#78c8fb]" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Placar Geral da Gincana
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-1">
            {standings.length} {standings.length === 1 ? 'Equipe' : 'Equipes'}
          </span>
        </div>

        {/* Botões de Ação: Backup e Zerar Placar */}
        <div className="flex items-center gap-2">
          {onExportBackup && (
            <button
              onClick={handleBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Baixar cópia de segurança em arquivo JSON com todos os dados atuais"
            >
              <Download className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#78c8fb]" />
              <span>Backup</span>
            </button>
          )}

          {isAdmin && onClearScores && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Zerar todos os lançamentos de pontuação (Apenas Administrador)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zerar Placar</span>
            </button>
          )}
        </div>
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
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 shadow-sm border-2 ${
                          (standing.team?.name || '').toLowerCase().includes('branc') || (standing.team?.color || '').toLowerCase() === '#ffffff'
                            ? 'border-slate-400 dark:border-slate-400 ring-1 ring-slate-900/10'
                            : 'border-white dark:border-slate-800'
                        }`}
                        style={{ backgroundColor: standing.team?.color || '#0284c7' }}
                        title={`Cor da equipe: ${standing.team?.color || ''}`}
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
                      className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:brightness-110 text-white shadow-md font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer flex-shrink-0 ring-2 ring-white/40 dark:ring-slate-800"
                      title={`Lançar pontuação para ${standing.team.name}`}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Pontuar</span>
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
                          <div className="flex flex-col min-w-0 pr-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 border ${
                                  (standing.team?.name || '').toLowerCase().includes('branc') || (standing.team?.color || '').toLowerCase() === '#ffffff'
                                    ? 'border-slate-400'
                                    : 'border-transparent'
                                }`}
                                style={{ backgroundColor: standing.team?.color || '#0284c7' }}
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {score.activity?.title || 'Pontuação Avulsa'}
                              </span>
                            </div>
                            {score.notes && (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate pl-3.5">
                                {score.notes}
                              </span>
                            )}
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

      {/* Modal de Confirmação para Zerar Placar */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white text-center mb-2">
              Zerar Todas as Pontuações?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed mb-4">
              Esta ação apagará <strong>todos os lançamentos de pontos</strong> realizados na gincana. O placar de todas as equipes voltará para <strong>0 pontos</strong>.
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs mb-5">
              💡 <strong>Dica de Segurança:</strong> As equipes e a lista de provas NÃO serão excluídas. Recomendamos baixar um backup antes de confirmar!
            </div>

            <div className="flex flex-col gap-2">
              {onExportBackup && (
                <button
                  type="button"
                  onClick={handleBackup}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Backup Primeiro</span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleConfirmReset}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isResetting ? (
                    <span>Zerando...</span>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Sim, Zerar Placar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
