'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Lock, RefreshCw, LogOut, Tv, Clock } from 'lucide-react';

export function PendingApprovalScreen() {
  const { user, profile, fetchProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    try {
      await fetchProfile();
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Líder';

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center border border-white/70 dark:border-slate-800 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo TNB */}
        <div className="inline-block p-1 bg-white rounded-2xl shadow-md border-2 border-white dark:border-slate-700 mb-2">
          <Image
            src="/Logo_TNB.jpg"
            alt="Logo Tô na Bênção"
            width={64}
            height={64}
            className="rounded-xl object-contain"
            priority
          />
        </div>

        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
          Tô na Bênção <span className="text-[#0284c7] dark:text-[#78c8fb]">• Gincana</span>
        </h2>

        {/* Ícone de Cadeado */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 shadow-sm">
          <Lock className="h-7 w-7" />
        </div>

        {/* Mensagem oficial idêntica ao Tarefas TNB */}
        <div className="text-slate-600 dark:text-slate-300 text-sm space-y-2">
          <p>
            Olá, <strong>{displayName}</strong>!
          </p>
          <p>
            Seu login foi realizado com sucesso. Para acessar a plataforma, um <strong>Administrador</strong> precisa aprovar o seu perfil.
          </p>
          <div className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Status: Aguardando Aprovação</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-[#0284c7] dark:text-[#78c8fb] font-bold rounded-xl transition cursor-pointer border border-sky-200 dark:border-sky-800 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificando...' : 'Verificar Aprovação'}</span>
          </button>

          <button
            onClick={signOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition cursor-pointer text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>

        {/* Link para o Telão */}
        <div className="pt-2 text-center">
          <Link
            href="/telao"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] dark:text-slate-400 dark:hover:text-[#78c8fb] transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Acompanhar Telão da Gincana (Aberto)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
