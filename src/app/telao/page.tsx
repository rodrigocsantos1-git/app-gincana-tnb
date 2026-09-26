'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGincanaData } from '@/hooks/useGincanaData';
import { Trophy, Medal, Award, Crown, Maximize2, Minimize2, ArrowLeft, Sparkles, Wifi } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TelaoPage() {
  const { standings, realtimeConnected, isUsingDemo } = useGincanaData();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const fireCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#78c8fb', '#bb94ff', '#f59e0b', '#10b981', '#ffffff'],
    });
  };

  const firstPlace = standings[0];
  const secondPlace = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;
  const otherPlaces = standings.slice(3);

  const maxPoints = Math.max(...standings.map((s) => s.totalPoints), 1);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-25">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#78c8fb] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bb94ff] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5b21b6] rounded-full blur-[160px]" />
      </div>

      {/* Top Bar Telão */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Voltar ao Painel Administrativo"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg flex items-center justify-center">
              <Image
                src="/Logo_TNB.jpg"
                alt="Logo TNB"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase">
                  Gincana Acampa TNB
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#bb94ff]/30 text-[#bb94ff] border border-[#bb94ff]/50">
                  AO VIVO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Ministério Infantil Tô na Bênção • Igreja Bíblica da Paz
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Apresentação */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
            <Wifi className={`w-3.5 h-3.5 ${realtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{realtimeConnected ? 'Sincronização em Tempo Real' : 'Modo Telão'}</span>
          </div>

          <button
            onClick={fireCelebration}
            className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 cursor-pointer"
            title="Soltar Confetes no Telão"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Telão */}
      <main className="relative z-10 flex-1 my-6 flex flex-col justify-center max-w-7xl w-full mx-auto">
        {/* PÓDIO GIGANTE DOS 3 PRIMEIROS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-4xl mx-auto w-full mb-10 pt-10">
          {/* 2º LUGAR (Prata) */}
          {secondPlace && (
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center font-black text-white text-2xl sm:text-3xl shadow-xl border-4 border-slate-400 mb-2"
                style={{ backgroundColor: secondPlace.team.color }}
              >
                {secondPlace.team.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-sm sm:text-xl text-center truncate max-w-full">
                {secondPlace.team.name}
              </h3>
              <p className="text-xl sm:text-3xl font-black text-slate-300 mb-2">
                {secondPlace.totalPoints} <span className="text-xs sm:text-sm font-normal">pts</span>
              </p>
              <div className="w-full h-32 sm:h-44 rounded-t-3xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-x-4 border-slate-500 flex flex-col items-center justify-center shadow-2xl">
                <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mb-1" />
                <span className="text-3xl sm:text-5xl font-black text-slate-200">2º</span>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-400">
                  Prata
                </span>
              </div>
            </div>
          )}

          {/* 1º LUGAR (Ouro - Centro) */}
          {firstPlace && (
            <div className="flex flex-col items-center relative -top-6">
              <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-amber-400 animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              <div
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-white text-3xl sm:text-5xl shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4 border-amber-400 mb-2"
                style={{ backgroundColor: firstPlace.team.color }}
              >
                {firstPlace.team.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-black text-base sm:text-2xl text-center text-amber-300 truncate max-w-full">
                {firstPlace.team.name}
              </h3>
              <p className="text-2xl sm:text-5xl font-black text-amber-400 mb-3 drop-shadow-md">
                {firstPlace.totalPoints} <span className="text-sm sm:text-lg font-normal">pts</span>
              </p>
              <div className="w-full h-44 sm:h-60 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 border-t-4 border-x-4 border-amber-300 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-amber-950 mb-1" />
                <span className="text-4xl sm:text-7xl font-black text-amber-950">1º</span>
                <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-amber-950">
                  Líder da Gincana
                </span>
              </div>
            </div>
          )}

          {/* 3º LUGAR (Bronze) */}
          {thirdPlace && (
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-white text-xl sm:text-2xl shadow-xl border-4 border-amber-700 mb-2"
                style={{ backgroundColor: thirdPlace.team.color }}
              >
                {thirdPlace.team.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-xs sm:text-lg text-center truncate max-w-full">
                {thirdPlace.team.name}
              </h3>
              <p className="text-lg sm:text-2xl font-black text-amber-600 mb-2">
                {thirdPlace.totalPoints} <span className="text-xs sm:text-sm font-normal">pts</span>
              </p>
              <div className="w-full h-24 sm:h-36 rounded-t-3xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-x-4 border-amber-700 flex flex-col items-center justify-center shadow-xl">
                <Award className="w-7 h-7 sm:w-9 sm:h-9 text-amber-300 mb-0.5" />
                <span className="text-2xl sm:text-4xl font-black text-amber-200">3º</span>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-amber-400">
                  Bronze
                </span>
              </div>
            </div>
          )}
        </div>

        {/* DEMAIS COLOCAÇÕES (Se houver 4+ equipes) */}
        {otherPlaces.length > 0 && (
          <div className="max-w-4xl mx-auto w-full space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
              Demais Equipes:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherPlaces.map((standing) => {
                const percentage = Math.max(Math.round((standing.totalPoints / maxPoints) * 100), 5);
                return (
                  <div
                    key={standing.team.id}
                    className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-between"
                  >
                    <div
                      className="absolute inset-y-0 left-0 opacity-20"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: standing.team.color,
                      }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                        {standing.rank}º
                      </span>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: standing.team.color }}
                      />
                      <span className="font-bold text-base truncate">{standing.team.name}</span>
                    </div>
                    <div className="relative z-10 text-right">
                      <span className="text-xl font-black text-white">{standing.totalPoints}</span>
                      <span className="text-xs text-slate-400 ml-1">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer Telão */}
      <footer className="relative z-10 border-t border-white/10 pt-3 text-center text-xs text-slate-400 flex items-center justify-between">
        <span>© Ministério Infantil Tô na Bênção • IBP</span>
        <span className="italic">&quot;Crianças com os olhos fixos em Jesus!&quot;</span>
        <span>Atualização Instantânea</span>
      </footer>
    </div>
  );
}
