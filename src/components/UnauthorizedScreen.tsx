'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { ShieldAlert, LogOut, RefreshCw, Tv } from 'lucide-react';

export function UnauthorizedScreen() {
  const { user, signOut, checkAdminStatus, isCheckingAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-800 text-center animate-in fade-in duration-300">
        {/* Logo */}
        <div className="inline-block p-1 bg-white rounded-2xl shadow-md border-2 border-white dark:border-slate-700 mb-4">
          <Image
            src="/Logo_TNB.jpg"
            alt="Logo Tô na Bênção"
            width={60}
            height={60}
            className="rounded-xl object-contain"
            priority
          />
        </div>

        {/* Ícone de Alerta */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-300 dark:border-amber-800">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Título e Mensagem */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Acesso Restrito
        </h2>
        <p className="mt-1 text-xs font-bold text-[#0284c7] dark:text-[#78c8fb]">
          Gincana Acampa TNB • Ministério Infantil
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Conta Conectada:</p>
          <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {user?.email}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">
            ⚠️ Este e-mail não está cadastrado como administrador no banco de dados. Apenas administradores autorizados podem gerenciar a gincana e lançar pontos.
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-2.5">
          <button
            onClick={() => checkAdminStatus()}
            disabled={isCheckingAdmin}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#0284c7] to-[#78c8fb] hover:opacity-95 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingAdmin ? 'animate-spin' : ''}`} />
            <span>{isCheckingAdmin ? 'Verificando...' : 'Já liberaram? Verificar Novamente'}</span>
          </button>

          <button
            onClick={signOut}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sair / Entrar com Outra Conta</span>
          </button>
        </div>

        {/* Link Telão */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/telao"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] dark:text-slate-400 dark:hover:text-[#78c8fb] transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Ver Modo Telão (Livre)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
