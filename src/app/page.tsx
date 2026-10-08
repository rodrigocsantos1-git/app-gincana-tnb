'use client';

import React, { useState } from 'react';
import { useGincanaData } from '@/hooks/useGincanaData';
import { Header } from '@/components/Header';
import { Leaderboard } from '@/components/Leaderboard';
import { ScoreModal } from '@/components/ScoreModal';
import { EditScoreModal } from '@/components/EditScoreModal';
import { TeamManager } from '@/components/TeamManager';
import { ActivityManager } from '@/components/ActivityManager';
import { ScoreHistory } from '@/components/ScoreHistory';
import { UserManager } from '@/components/UserManager';
import { PendingApprovalScreen } from '@/components/PendingApprovalScreen';
import { useAuth } from '@/components/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { TaskCompletionAlert } from '@/components/TaskCompletionAlert';
import { Sparkles, Info, RefreshCw, Database, Zap, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const { user, profile, isAdmin, isApproved, loading: authLoading } = useAuth();
  const {
    teams,
    activities,
    scores,
    standings,
    loading,
    isUsingDemo,
    realtimeConnected,
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
    fetchData,
  } = useGincanaData();

  const [activeTab, setActiveTab] = useState<string>('leaderboard');
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedTeamIdForScore, setSelectedTeamIdForScore] = useState<string | undefined>(undefined);
  const [selectedActivityIdForScore, setSelectedActivityIdForScore] = useState<string | undefined>(undefined);
  const [editingScore, setEditingScore] = useState<any | null>(null);

  const handleOpenScoreModal = (teamId?: string, activityId?: string) => {
    setSelectedTeamIdForScore(teamId);
    setSelectedActivityIdForScore(activityId);
    setIsScoreModalOpen(true);
  };

  // Se a autenticação estiver carregando
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#0284c7] animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Carregando autenticação...
        </p>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, exibe a tela de login
  if (!user) {
    return <AuthScreen />;
  }

  // Se o usuário não estiver aprovado por um administrador, exibe tela de aguardo idêntica ao Tarefas TNB
  if (!isApproved) {
    return <PendingApprovalScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Header
        realtimeConnected={realtimeConnected}
        isUsingDemo={isUsingDemo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScoreModal={() => handleOpenScoreModal()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner de Demonstração / Aviso Supabase (Caso não configurado) */}
        {isUsingDemo && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">
                  Modo de Demonstração Ativo (Armazenamento Local)
                </p>
                <p className="opacity-90 mt-0.5">
                  Você pode testar todos os lançamentos e rankings agora. Para persistência em nuvem e sincronização em tempo real entre celulares e telão, configure as credenciais no arquivo <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.env.local</code>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
              <button
                onClick={resetToMock}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
                title="Recarregar os 4 times e provas originais de exemplo"
              >
                Resetar Exemplos
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-[#0284c7] animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Carregando dados da gincana...
            </p>
          </div>
        ) : (
          <>
            {/* Conteúdo Dinâmico por Aba */}
            {activeTab === 'leaderboard' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                {/* Painel Estratégico de Lançamento Rápido de Pontos (Otimizado para Celular / Voluntários) */}
                <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-white via-sky-50/50 to-purple-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800/80 border-2 border-[#0284c7]/25 dark:border-[#78c8fb]/30 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-[#0284c7]/15 dark:bg-[#78c8fb]/20 text-[#0284c7] dark:text-[#78c8fb]">
                          <Zap className="w-5 h-5 fill-current" />
                        </span>
                        <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          Lançamento de Pontos da Gincana
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                        Toque no botão principal ou selecione a equipe para registrar a pontuação da rodada:
                      </p>
                    </div>

                    {/* Botões de Destaque */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const caboAct = activities.find((a) => (a.title || '').toLowerCase().includes('cabo de guerra'));
                          handleOpenScoreModal(undefined, caboAct?.id);
                        }}
                        className="w-full sm:w-auto px-4 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm text-amber-950 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Lançar pontuação das 5 rodadas da Fase 2.1 - Cabo de Guerra"
                      >
                        <span className="text-base">⚔️</span>
                        <span>Cabo de Guerra (5 Rodadas)</span>
                      </button>

                      <button
                        onClick={() => handleOpenScoreModal()}
                        className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#7c3aed] hover:brightness-110 shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-white/60 dark:ring-slate-800"
                      >
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                        <span>Lançar Pontuação Agora</span>
                      </button>
                    </div>
                  </div>

                  {/* Atalhos Rápidos com 1 Toque por Equipe */}
                  {teams.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                        Atalhos Rápidos Direto por Equipe:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {teams.map((team) => {
                          const isWhite = (team.name || '').toLowerCase().includes('branc') || (team.color || '').toLowerCase() === '#ffffff';
                          const isYellow = (team.name || '').toLowerCase().includes('amar') || (team.color || '').toLowerCase() === '#f59e0b';
                          const textColor = isWhite ? 'text-slate-950 font-black' : isYellow ? 'text-amber-950 font-black' : 'text-white font-black';
                          const border = isWhite ? 'border-2 border-slate-400 shadow-xs' : 'border border-white/50 shadow-xs';

                          return (
                            <button
                              key={team.id}
                              onClick={() => handleOpenScoreModal(team.id)}
                              className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between gap-1.5 transition-all hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer ${textColor} ${border}`}
                              style={{ backgroundColor: team.color }}
                              title={`Lançar pontuação direta para ${team.name}`}
                            >
                              <span className="text-xs sm:text-sm font-black uppercase truncate">
                                {team.name}
                              </span>
                              <span className="text-[10px] sm:text-xs font-black bg-black/20 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                + Pontuar
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerta de Verificação de Tarefas Incompletas por Equipe e Fase */}
                <TaskCompletionAlert
                  teams={teams}
                  activities={activities}
                  scores={scores}
                  onOpenScoreModal={handleOpenScoreModal}
                />

                {/* Tabela de Classificação Geral */}
                <Leaderboard
                  standings={standings}
                  scores={scores}
                  onOpenScoreModal={handleOpenScoreModal}
                  onEditScore={(score) => setEditingScore(score)}
                  onExportBackup={exportBackup}
                  onClearScores={clearAllScores}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="animate-in fade-in duration-300 space-y-4">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
                  <span>← Voltar ao Placar Geral</span>
                </button>
                <TeamManager
                  teams={teams}
                  standings={standings}
                  onAddTeam={addTeam}
                  onUpdateTeam={updateTeam}
                  onDeleteTeam={deleteTeam}
                />
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="animate-in fade-in duration-300 space-y-4">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
                  <span>← Voltar ao Placar Geral</span>
                </button>
                <ActivityManager
                  activities={activities}
                  onAddActivity={addActivity}
                  onUpdateActivity={updateActivity}
                  onDeleteActivity={deleteActivity}
                  onSyncOfficial={syncOfficialActivities}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in duration-300">
                <ScoreHistory
                  scores={scores}
                  teams={teams}
                  activities={activities}
                  onDeleteScore={deleteScore}
                  onEditScore={(score) => setEditingScore(score)}
                  onGoBackToLeaderboard={() => setActiveTab('leaderboard')}
                  onExportBackup={exportBackup}
                  onClearScores={clearAllScores}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {activeTab === 'users' && isAdmin && (
              <div className="animate-in fade-in duration-300 space-y-4">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
                  <span>← Voltar ao Placar Geral</span>
                </button>
                <UserManager />
              </div>
            )}
          </>
        )}
      </main>

      {/* Botão Flutuante Estratégico (FAB) Fixo na Tela para Acesso Imediato no Celular */}
      <button
        onClick={() => handleOpenScoreModal()}
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 sm:px-6 sm:py-4 rounded-full font-black text-sm sm:text-base text-white bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#7c3aed] shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white/80 dark:ring-slate-900/80 group"
        aria-label="Lançar Pontuação da Gincana"
        title="Clique para lançar pontos de qualquer tela"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide uppercase font-black">Lançar Ponto</span>
      </button>

      {/* Modal de Lançamento de Pontos */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          setSelectedTeamIdForScore(undefined);
          setSelectedActivityIdForScore(undefined);
        }}
        teams={teams}
        activities={activities}
        scores={scores}
        standings={standings}
        initialTeamId={selectedTeamIdForScore}
        initialActivityId={selectedActivityIdForScore}
        onSubmitScore={addScore}
        onUpdateScore={updateScore}
        onDeleteScore={deleteScore}
      />

      {/* Modal de Correção / Edição de Pontuação */}
      <EditScoreModal
        isOpen={!!editingScore}
        score={editingScore}
        onClose={() => setEditingScore(null)}
        teams={teams}
        activities={activities}
        onUpdateScore={updateScore}
        onDeleteScore={deleteScore}
      />

      {/* Rodapé Minimalista TNB */}
      <footer className="mt-auto py-6 border-t border-white/20 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} <strong>Tô na Bênção (TNB)</strong> • Igreja Bíblica da Paz
        </p>
        <p className="text-[11px] mt-1 opacity-75 font-medium">
          &quot;Alegrei-me quando me disseram: Vamos à casa do Senhor&quot; • Desenvolvido para o Acampamento TNB
        </p>
      </footer>
    </div>
  );
}
