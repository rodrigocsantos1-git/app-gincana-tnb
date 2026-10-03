'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { AlertCircle, Tv, Sparkles, RefreshCw, ShieldCheck, Trophy } from 'lucide-react';

export function AuthScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogle = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || 'Erro ao conectar com Google.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro inesperado ao conectar com Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Elementos Estelares Decorativos no Fundo */}
      <div className="absolute top-10 left-10 text-white/50 pointer-events-none select-none animate-pulse">
        <Sparkles className="w-8 h-8 text-[#78c8fb]" />
      </div>
      <div className="absolute top-24 right-16 text-white/50 pointer-events-none select-none">
        <Sparkles className="w-6 h-6 text-[#bb94ff]" />
      </div>
      <div className="absolute bottom-16 left-20 text-white/40 pointer-events-none select-none">
        <Sparkles className="w-10 h-10 text-amber-300" />
      </div>

      {/* Card Principal de Autenticação */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-800 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Cabeçalho com Logotipo */}
        <div className="text-center mb-8">
          <div className="inline-block p-1 bg-white rounded-2xl shadow-md border-2 border-white dark:border-slate-700 mb-3">
            <Image
              src="/Logo_TNB.jpg"
              alt="Logo Tô na Bênção"
              width={72}
              height={72}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gincana Acampa TNB
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-[#0284c7] dark:text-[#78c8fb]">
            Ministério Infantil Tô na Bênção • IBP
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Painel de Lançamento e Gestão de Provas
          </p>
        </div>

        {/* Mensagens de Alerta */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Botão de Login Exclusivo com o Google */}
        <div className="space-y-4">
          <button
            onClick={handleGoogle}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-extrabold py-3.5 px-5 rounded-2xl text-sm sm:text-base transition-all border-2 border-slate-200 dark:border-slate-700 hover:border-[#78c8fb] dark:hover:border-[#78c8fb] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#78c8fb]/30 active:scale-95 disabled:opacity-50 cursor-pointer group"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 text-[#0284c7] animate-spin" />
                <span>Conectando com o Google...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>

          {/* Dica / Informação de Segurança */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-[#78c8fb] flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Acesso seguro com sua conta Google. As permissões de juiz e líder são liberadas pelos administradores da equipe.
            </p>
          </div>
        </div>

        {/* Atalhos Públicos para Apresentação e Telão */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <Link
            href="/telao"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0284c7] dark:text-slate-400 dark:hover:text-[#78c8fb] transition-colors py-1.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Tv className="w-4 h-4" />
            <span>Modo Telão</span>
          </Link>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/resultado-final"
            className="inline-flex items-center gap-2 text-xs font-black text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors py-1.5 px-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <Trophy className="w-4 h-4" />
            <span>Cerimônia do Resultado Final</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
