'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { LogIn, UserPlus, Lock, Mail, User, AlertCircle, Tv, Sparkles } from 'lucide-react';

export function AuthScreen() {
  const { signInWithPassword, signUp, signInWithGoogle, isDemoUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await signUp(email.trim(), password, name.trim());
        if (error) {
          setErrorMsg(error.message || 'Erro ao realizar cadastro.');
        } else if (data?.user && !data.session) {
          setSuccessMsg('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
        }
      } else {
        const { error } = await signInWithPassword(email.trim(), password);
        if (error) {
          setErrorMsg(
            error.message === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos.'
              : error.message || 'Erro ao fazer login.'
          );
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setErrorMsg(error.message || 'Erro ao conectar com Google.');
    } finally {
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
        <div className="text-center mb-6">
          <div className="inline-block p-1 bg-white rounded-2xl shadow-md border-2 border-white dark:border-slate-700 mb-3">
            <Image
              src="/Logo_TNB.jpg"
              alt="Logo Tô na Bênção"
              width={64}
              height={64}
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acesso exclusivo para administradores e juízes
          </p>
        </div>

        {/* Mensagens de Alerta */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Botão de Login com o Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-100 font-bold py-3 px-4 rounded-xl text-sm transition-all border border-slate-300 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78c8fb] active:scale-95 disabled:opacity-50 cursor-pointer mb-5"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
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
        </button>

        {/* Divisor */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
              ou com e-mail e senha
            </span>
          </div>
        </div>

        {/* Formulário de E-mail e Senha */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@igreja.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#0284c7] via-[#78c8fb] to-[#bb94ff] hover:opacity-95 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Processando...</span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta de Administrador</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Alternar entre Login e Cadastro */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-[#78c8fb] transition-colors cursor-pointer"
          >
            {isSignUp
              ? 'Já possui uma conta? Faça Login'
              : 'Novo administrador? Cadastre-se aqui'}
          </button>
        </div>

        {/* Atalho Público para o Telão */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            href="/telao"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] dark:text-slate-400 dark:hover:text-[#78c8fb] transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Abrir Modo Telão sem Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
