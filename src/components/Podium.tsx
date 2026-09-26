'use client';

import React from 'react';
import { TeamStanding } from '@/lib/types';
import { Trophy, Medal, Award, Crown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PodiumProps {
  standings: TeamStanding[];
  onSelectTeamForScore?: (teamId: string) => void;
}

export function Podium({ standings, onSelectTeamForScore }: PodiumProps) {
  if (standings.length === 0) {
    return null;
  }

  const firstPlace = standings[0];
  const secondPlace = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;

  const triggerPodiumConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#78c8fb', '#bb94ff', '#f59e0b', '#10b981', '#ffffff'],
    });
  };

  return (
    <div className="w-full mb-8">
      {/* Título da Seção */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500 animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Pódio da Vitória
          </h2>
        </div>
        <button
          onClick={triggerPodiumConfetti}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Soltar confetes de comemoração"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Comemorar!
        </button>
      </div>

      {/* Grid do Pódio (Ordem visual: 2º Lugar | 1º Lugar | 3º Lugar) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end pt-8 pb-2">
        {/* 2º LUGAR (Prata - Esquerda) */}
        {secondPlace ? (
          <div className="flex flex-col items-center group">
            {/* Avatar / Badge do Time */}
            <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-1">
              <div
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg border-4 border-slate-200 dark:border-slate-700 font-black text-white text-xl sm:text-2xl transition-all"
                style={{ backgroundColor: secondPlace.team.color }}
              >
                {secondPlace.team.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-full p-1 shadow-md border-2 border-white dark:border-slate-800">
                <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-200" />
              </div>
            </div>

            {/* Informações da Equipe */}
            <h3 className="font-bold text-xs sm:text-base text-slate-800 dark:text-slate-100 text-center line-clamp-1 px-1">
              {secondPlace.team.name}
            </h3>
            <p className="text-sm sm:text-xl font-extrabold text-slate-600 dark:text-slate-300 mb-2">
              {secondPlace.totalPoints} <span className="text-[10px] sm:text-xs font-semibold">pts</span>
            </p>

            {/* Pilar do Pódio */}
            <div
              onClick={() => onSelectTeamForScore?.(secondPlace.team.id)}
              className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex flex-col items-center justify-center border-t-2 border-x-2 border-slate-300 dark:border-slate-600 shadow-md cursor-pointer hover:brightness-105 transition-all"
              title="Clique para lançar pontos para esta equipe"
            >
              <span className="text-2xl sm:text-4xl font-black text-slate-500 dark:text-slate-400">
                2º
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">
                Prata
              </span>
            </div>
          </div>
        ) : (
          <div className="h-28 sm:h-36 rounded-t-2xl border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 flex items-center justify-center">
            <span className="text-xs text-slate-400 font-semibold">Vago</span>
          </div>
        )}

        {/* 1º LUGAR (Ouro - Centro / Mais Alto) */}
        {firstPlace ? (
          <div className="flex flex-col items-center group relative -top-3">
            {/* Coroa flutuante e Troféu */}
            <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Crown className="w-8 h-8 text-amber-400 animate-pulse drop-shadow-md" />
              </div>
              <div
                className="w-18 h-18 sm:w-26 sm:h-26 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-amber-300 dark:border-amber-400 font-black text-white text-2xl sm:text-4xl transition-all"
                style={{ backgroundColor: firstPlace.team.color }}
              >
                {firstPlace.team.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-900 rounded-full p-1.5 shadow-lg border-2 border-white dark:border-slate-800">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
              </div>
            </div>

            {/* Informações da Equipe Líder */}
            <div className="text-center px-1">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 mb-0.5">
                Líder Atual
              </span>
              <h3 className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white line-clamp-1">
                {firstPlace.team.name}
              </h3>
            </div>
            <p className="text-lg sm:text-3xl font-black text-amber-600 dark:text-amber-400 mb-2">
              {firstPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold">pts</span>
            </p>

            {/* Pilar do Pódio 1º Lugar */}
            <div
              onClick={() => onSelectTeamForScore?.(firstPlace.team.id)}
              className="w-full h-36 sm:h-48 rounded-t-3xl bg-gradient-to-t from-amber-400 via-amber-300 to-amber-200 dark:from-amber-600 dark:via-amber-500 dark:to-amber-400 flex flex-col items-center justify-center border-t-4 border-x-4 border-amber-300 dark:border-amber-300 shadow-xl cursor-pointer hover:brightness-105 transition-all relative overflow-hidden"
              title="Clique para lançar pontos para esta equipe"
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
              <span className="text-3xl sm:text-6xl font-black text-amber-900 dark:text-amber-950 relative z-10">
                1º
              </span>
              <span className="text-xs sm:text-sm uppercase font-black tracking-widest text-amber-900 dark:text-amber-950 relative z-10 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 inline" /> Campeão
              </span>
            </div>
          </div>
        ) : null}

        {/* 3º LUGAR (Bronze - Direita) */}
        {thirdPlace ? (
          <div className="flex flex-col items-center group">
            {/* Avatar / Badge do Time */}
            <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-1">
              <div
                className="w-13 h-13 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center shadow-lg border-4 border-amber-700/30 dark:border-amber-700/60 font-black text-white text-lg sm:text-xl transition-all"
                style={{ backgroundColor: thirdPlace.team.color }}
              >
                {thirdPlace.team.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-1 bg-amber-700 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-slate-800">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              </div>
            </div>

            {/* Informações da Equipe */}
            <h3 className="font-bold text-xs sm:text-base text-slate-800 dark:text-slate-100 text-center line-clamp-1 px-1">
              {thirdPlace.team.name}
            </h3>
            <p className="text-sm sm:text-xl font-extrabold text-slate-600 dark:text-slate-300 mb-2">
              {thirdPlace.totalPoints} <span className="text-[10px] sm:text-xs font-semibold">pts</span>
            </p>

            {/* Pilar do Pódio */}
            <div
              onClick={() => onSelectTeamForScore?.(thirdPlace.team.id)}
              className="w-full h-22 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-700/40 to-amber-600/30 dark:from-amber-900/60 dark:to-amber-800/50 flex flex-col items-center justify-center border-t-2 border-x-2 border-amber-600/40 dark:border-amber-700/50 shadow-md cursor-pointer hover:brightness-105 transition-all"
              title="Clique para lançar pontos para esta equipe"
            >
              <span className="text-xl sm:text-3xl font-black text-amber-800 dark:text-amber-400">
                3º
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-amber-800 dark:text-amber-400 mt-0.5">
                Bronze
              </span>
            </div>
          </div>
        ) : (
          <div className="h-22 sm:h-28 rounded-t-2xl border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 flex items-center justify-center">
            <span className="text-xs text-slate-400 font-semibold">Vago</span>
          </div>
        )}
      </div>
    </div>
  );
}
