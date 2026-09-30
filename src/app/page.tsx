'use client';

import React, { useState } from 'react';
import { useGincanaData } from '@/hooks/useGincanaData';
import { Header } from '@/components/Header';
import { Podium } from '@/components/Podium';
import { Leaderboard } from '@/components/Leaderboard';
import { ScoreModal } from '@/components/ScoreModal';
import { TeamManager } from '@/components/TeamManager';
import { ActivityManager } from '@/components/ActivityManager';
import { ScoreHistory } from '@/components/ScoreHistory';
import { UserManager } from '@/components/UserManager';
import { PendingApprovalScreen } from '@/components/PendingApprovalScreen';
import { useAuth } from '@/components/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { Sparkles, Info, RefreshCw, Database } from 'lucide-react';

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

  const handleOpenScoreModal = (teamId?: string) => {
    setSelectedTeamIdForScore(teamId);
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
                {/* Pódio dos 3 Primeiros */}
                <Podium
                  standings={standings}
                  onSelectTeamForScore={handleOpenScoreModal}
                />

                {/* Tabela de Classificação Geral */}
                <Leaderboard
                  standings={standings}
                  scores={scores}
                  onOpenScoreModal={handleOpenScoreModal}
                  onExportBackup={exportBackup}
                  onClearScores={clearAllScores}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="animate-in fade-in duration-300">
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
              <div className="animate-in fade-in duration-300">
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
                  onExportBackup={exportBackup}
                  onClearScores={clearAllScores}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {activeTab === 'users' && isAdmin && (
              <div className="animate-in fade-in duration-300">
                <UserManager />
              </div>
            )}
          </>
        )}
      </main>

      {/* Botão Flutuante (FAB) Mobile para Lançar Ponto Rapidamente em Campo */}
      <button
        onClick={() => handleOpenScoreModal()}
        className="sm:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full text-white bg-gradient-to-r from-[#0284c7] to-[#bb94ff] shadow-2xl shadow-blue-500/40 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
        aria-label="Lançar Pontuação"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Modal de Lançamento de Pontos */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        teams={teams}
        activities={activities}
        standings={standings}
        initialTeamId={selectedTeamIdForScore}
        onSubmitScore={addScore}
      />

      {/* Rodapé Minimalista TNB */}
      <footer className="mt-auto py-6 border-t border-white/20 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} <strong>Tô na Bênção (TNB)</strong> • Igreja Bíblica da Paz
        </p>
        <p className="text-[11px] mt-1 opacity-75">
          &quot;Crianças com os olhos fixos em Jesus!&quot; • Desenvolvido para o Acampamento TNB
        </p>
      </footer>
    </div>
  );
}
