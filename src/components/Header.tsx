'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';
import { Sun, Moon, Tv, Wifi, WifiOff, Sparkles, LogOut } from 'lucide-react';

interface HeaderProps {
  realtimeConnected: boolean;
  isUsingDemo: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScoreModal: () => void;
}

export function Header({
  realtimeConnected,
  isUsingDemo,
  activeTab,
  setActiveTab,
  onOpenScoreModal,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700 bg-white flex items-center justify-center">
              <Image
                src="/Logo_TNB.jpg"
                alt="Logo Tô na Bênção"
                width={52}
                height={52}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>Gincana Acampa</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#bb94ff]/20 text-[#5b21b6] dark:text-[#bb94ff] border border-[#bb94ff]/40">
                    TNB
                  </span>
                </h1>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Ministério Infantil Tô na Bênção • IBP
              </p>
            </div>
          </div>

          {/* Status Realtime & Botões de Ação */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Badge de Conexão */}
            {isUsingDemo ? (
              <div
                title="Rodando em modo local. Configure o Supabase para sincronização em nuvem."
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Modo Local</span>
              </div>
            ) : (
              <div
                title="Conectado ao Supabase com sincronização Realtime"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  realtimeConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                }`}
              >
                <Wifi className={`w-3.5 h-3.5 ${realtimeConnected ? 'animate-pulse' : ''}`} />
                <span className="hidden md:inline">
                  {realtimeConnected ? 'Tempo Real Ativo' : 'Supabase Conectado'}
                </span>
              </div>
            )}

            {/* Botão de Lançar Pontos */}
            <button
              onClick={onOpenScoreModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0284c7] via-[#78c8fb] to-[#bb94ff] hover:opacity-95 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Lançar Ponto</span>
              <span className="sm:hidden">+ Ponto</span>
            </button>

            {/* Atalho para Modo Telão */}
            <Link
              href="/telao"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Abrir Modo Telão / Apresentação"
            >
              <Tv className="w-4 h-4 text-[#78c8fb]" />
              <span className="hidden md:inline">Telão</span>
            </Link>

            {/* Alternador de Tema Claro/Escuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Modo Noturno'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Usuário Logado & Botão de Sair */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <span
                  className="hidden xl:inline-block text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-[120px] truncate"
                  title={user.email || 'Administrador'}
                >
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Sair da conta"
                  aria-label="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Abas de Navegação Principal */}
        <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none border-t border-slate-100 dark:border-slate-800/60">
          {[
            { id: 'leaderboard', label: '🏆 Placar & Pódio' },
            { id: 'teams', label: '🛡️ Equipes' },
            { id: 'activities', label: '🎯 Provas' },
            { id: 'history', label: '📋 Histórico' },
            { id: 'admins', label: '👥 Administradores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-[#0284c7] dark:text-[#78c8fb] shadow-sm font-bold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
