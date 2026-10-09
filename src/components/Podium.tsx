'use client';

import React from 'react';
import Image from 'next/image';
import { TeamStanding } from '@/lib/types';
import { Trophy, Medal, Award, Crown, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTeamLogo } from '@/lib/teamLogos';

interface PodiumProps {
  standings: TeamStanding[];
  onSelectTeamForScore?: (teamId: string) => void;
}

// Helper para definir estilo, contraste e texto preto para equipe branca
function getTeamStyle(team?: { name?: string; color?: string } | null) {
  const name = (team?.name || '').toLowerCase();
  const color = (team?.color || '').toLowerCase();

  const isWhite =
    name.includes('branc') ||
    color === '#ffffff' ||
    color === '#fff' ||
    color === '#f8fafc' ||
    color === '#e2e8f0';

  const isYellow =
    name.includes('amar') ||
    color === '#f59e0b' ||
    color === '#eab308';

  const teamColor = team?.color || '#0284c7';

  return {
    isWhite,
    // Texto PRETO para equipe branca conforme solicitado
    textColor: isWhite ? 'text-slate-950 font-black' : isYellow ? 'text-amber-950 font-black' : 'text-white font-black',
    border: isWhite
      ? 'border-2 border-slate-400/90 dark:border-slate-500 shadow-md'
      : 'border-2 border-white/60 dark:border-slate-700/60 shadow-md',
    boxShadow: isWhite
      ? '0 0 0 3px rgba(255, 255, 255, 0.95), 0 0 0 6px #64748b, 0 10px 25px -3px rgba(0,0,0,0.3)'
      : `0 0 0 3px rgba(255, 255, 255, 0.95), 0 0 0 6px ${teamColor}, 0 10px 25px -3px ${teamColor}80`,
  };
}

export function Podium({ standings, onSelectTeamForScore }: PodiumProps) {
  if (standings.length === 0) {
    return null;
  }

  const firstPlace = standings[0];
  const secondPlace = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;
  const fourthPlace = standings.length > 3 ? standings[3] : null;
  const otherPlaces = standings.length > 4 ? standings.slice(4) : [];

  const triggerPodiumConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#78c8fb', '#bb94ff', '#f59e0b', '#10b981', '#ffffff'],
    });
  };

  const hasFourTeams = standings.length >= 4;

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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Soltar confetes de comemoração"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Comemorar!</span>
        </button>
      </div>

      {/* Grid do Pódio (Ordem: 2º Lugar | 1º Lugar | 3º Lugar | 4º Lugar) */}
      <div
        className={`grid ${
          hasFourTeams
            ? 'grid-cols-4 gap-1.5 sm:gap-4 md:gap-5'
            : standings.length === 3
            ? 'grid-cols-3 gap-2 sm:gap-4 md:gap-6'
            : standings.length === 2
            ? 'grid-cols-2 gap-4 max-w-md mx-auto'
            : 'grid-cols-1 max-w-xs mx-auto'
        } items-end pt-8 pb-2`}
      >
        {/* 2º LUGAR (Prata - Esquerda) */}
        {secondPlace ? (() => {
          const style = getTeamStyle(secondPlace.team);
          const logo = getTeamLogo(secondPlace.team);
          return (
            <div className="flex flex-col items-center group w-full">
              {/* Badge da Equipe */}
              <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-1 w-full flex justify-center">
                <div
                  className={`w-full max-w-[110px] sm:max-w-[150px] md:max-w-[170px] py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 text-center leading-tight transition-all ${style.textColor} ${style.border}`}
                  style={{
                    backgroundColor: secondPlace.team.color,
                    boxShadow: style.boxShadow,
                  }}
                  title={secondPlace.team.name}
                >
                  {logo && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md overflow-hidden relative flex-shrink-0 bg-white/20 border border-white/30">
                      <Image src={logo} alt="" fill className="object-contain" />
                    </div>
                  )}
                  <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block text-center px-0.5">
                    {secondPlace.team.name}
                  </span>
                </div>
                <div className="absolute -bottom-1.5 right-1/2 translate-x-7 sm:translate-x-12 bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-full p-0.5 sm:p-1 shadow-md border-2 border-white dark:border-slate-800">
                  <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
                </div>
              </div>

              {/* Informações da Equipe em Card de Alto Contraste */}
              <div className="w-full text-center px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex flex-col items-center px-2 py-0.5 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-white/70 dark:border-slate-700/70 shadow-xs max-w-full">
                  <h3 className="font-black text-[10px] sm:text-xs md:text-sm text-slate-950 dark:text-white truncate max-w-full">
                    {secondPlace.team.name}
                  </h3>
                  <p className="text-[11px] sm:text-sm md:text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {secondPlace.totalPoints} <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400">pts</span>
                  </p>
                </div>
              </div>

              {/* Pilar do Pódio */}
              <div
                onClick={() => onSelectTeamForScore?.(secondPlace.team.id)}
                className="w-full h-24 sm:h-32 md:h-36 rounded-t-2xl bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex flex-col items-center justify-center border-t-2 border-x-2 border-slate-300 dark:border-slate-600 shadow-md cursor-pointer hover:brightness-105 active:scale-98 transition-all"
                title="Clique para lançar pontos para esta equipe"
              >
                <span className="text-xl sm:text-3xl md:text-4xl font-black text-slate-600 dark:text-slate-300">
                  2º
                </span>
                <span className="text-[9px] sm:text-xs uppercase font-extrabold text-slate-600 dark:text-slate-400 mt-0.5">
                  Prata
                </span>
              </div>
            </div>
          );
        })() : null}

        {/* 1º LUGAR (Ouro - Centro / Mais Alto) */}
        {firstPlace ? (() => {
          const style = getTeamStyle(firstPlace.team);
          const logo = getTeamLogo(firstPlace.team);
          return (
            <div className="flex flex-col items-center group relative -top-3 w-full">
              {/* Coroa flutuante e Troféu */}
              <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-2 w-full flex justify-center">
                <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-pulse drop-shadow-md" />
                </div>
                <div
                  className={`w-full max-w-[125px] sm:max-w-[170px] md:max-w-[200px] py-2 sm:py-2.5 px-1.5 sm:px-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 text-center leading-tight transition-all shadow-lg ${style.textColor} ${style.border}`}
                  style={{
                    backgroundColor: firstPlace.team.color,
                    boxShadow: style.boxShadow,
                  }}
                  title={firstPlace.team.name}
                >
                  {logo && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md overflow-hidden relative flex-shrink-0 bg-white/20 border border-white/40">
                      <Image src={logo} alt="" fill className="object-contain" />
                    </div>
                  )}
                  <span className="text-[10px] sm:text-sm md:text-base font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block text-center px-0.5">
                    {firstPlace.team.name}
                  </span>
                </div>
                <div className="absolute -bottom-1.5 right-1/2 translate-x-8 sm:translate-x-14 bg-amber-400 text-slate-900 rounded-full p-1 sm:p-1.5 shadow-lg border-2 border-white dark:border-slate-800">
                  <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-950" />
                </div>
              </div>

              {/* Informações da Equipe Líder em Card de Alto Contraste */}
              <div className="w-full text-center px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex flex-col items-center px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-amber-300/80 dark:border-amber-500/60 shadow-md max-w-full">
                  <span className="inline-block px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 mb-0.5">
                    Líder
                  </span>
                  <h3 className="font-black text-[11px] sm:text-sm md:text-base text-slate-950 dark:text-white truncate max-w-full">
                    {firstPlace.team.name}
                  </h3>
                  <p className="text-xs sm:text-base md:text-lg font-black text-amber-700 dark:text-amber-300 leading-tight">
                    {firstPlace.totalPoints} <span className="text-[9px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">pts</span>
                  </p>
                </div>
              </div>

              {/* Pilar do Pódio 1º Lugar */}
              <div
                onClick={() => onSelectTeamForScore?.(firstPlace.team.id)}
                className="w-full h-32 sm:h-44 md:h-48 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-t from-amber-400 via-amber-300 to-amber-200 dark:from-amber-600 dark:via-amber-500 dark:to-amber-400 flex flex-col items-center justify-center border-t-4 border-x-4 border-amber-300 dark:border-amber-300 shadow-xl cursor-pointer hover:brightness-105 active:scale-98 transition-all relative overflow-hidden"
                title="Clique para lançar pontos para esta equipe"
              >
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
                <span className="text-2xl sm:text-5xl md:text-6xl font-black text-amber-900 dark:text-amber-950 relative z-10">
                  1º
                </span>
                <span className="text-[9px] sm:text-xs md:text-sm uppercase font-black tracking-widest text-amber-900 dark:text-amber-950 relative z-10 flex items-center gap-0.5 sm:gap-1">
                  <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" /> Ouro
                </span>
              </div>
            </div>
          );
        })() : null}

        {/* 3º LUGAR (Bronze - Direita) */}
        {thirdPlace ? (() => {
          const style = getTeamStyle(thirdPlace.team);
          const logo = getTeamLogo(thirdPlace.team);
          return (
            <div className="flex flex-col items-center group w-full">
              {/* Badge do Time */}
              <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-1 w-full flex justify-center">
                <div
                  className={`w-full max-w-[105px] sm:max-w-[145px] md:max-w-[165px] py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 text-center leading-tight transition-all shadow-md ${style.textColor} ${style.border}`}
                  style={{
                    backgroundColor: thirdPlace.team.color,
                    boxShadow: style.boxShadow,
                  }}
                  title={thirdPlace.team.name}
                >
                  {logo && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md overflow-hidden relative flex-shrink-0 bg-white/20 border border-white/30">
                      <Image src={logo} alt="" fill className="object-contain" />
                    </div>
                  )}
                  <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block text-center px-0.5">
                    {thirdPlace.team.name}
                  </span>
                </div>
                <div className="absolute -bottom-1.5 right-1/2 translate-x-7 sm:translate-x-11 bg-amber-700 text-white rounded-full p-0.5 sm:p-1 shadow-md border-2 border-white dark:border-slate-800">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
                </div>
              </div>

              {/* Informações da Equipe em Card de Alto Contraste */}
              <div className="w-full text-center px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex flex-col items-center px-2 py-0.5 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-white/70 dark:border-slate-700/70 shadow-xs max-w-full">
                  <h3 className="font-black text-[10px] sm:text-xs md:text-sm text-slate-950 dark:text-white truncate max-w-full">
                    {thirdPlace.team.name}
                  </h3>
                  <p className="text-[11px] sm:text-sm md:text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {thirdPlace.totalPoints} <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400">pts</span>
                  </p>
                </div>
              </div>

              {/* Pilar do Pódio */}
              <div
                onClick={() => onSelectTeamForScore?.(thirdPlace.team.id)}
                className="w-full h-20 sm:h-26 md:h-28 rounded-t-2xl bg-gradient-to-t from-amber-700/40 to-amber-600/30 dark:from-amber-900/60 dark:to-amber-800/50 flex flex-col items-center justify-center border-t-2 border-x-2 border-amber-600/40 dark:border-amber-700/50 shadow-md cursor-pointer hover:brightness-105 active:scale-98 transition-all"
                title="Clique para lançar pontos para esta equipe"
              >
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-amber-800 dark:text-amber-400">
                  3º
                </span>
                <span className="text-[9px] sm:text-xs uppercase font-extrabold text-amber-800 dark:text-amber-400 mt-0.5">
                  Bronze
                </span>
              </div>
            </div>
          );
        })() : null}

        {/* 4º LUGAR (Honra / Participação) */}
        {fourthPlace ? (() => {
          const style = getTeamStyle(fourthPlace.team);
          const logo = getTeamLogo(fourthPlace.team);
          return (
            <div className="flex flex-col items-center group w-full">
              {/* Badge do Time */}
              <div className="relative mb-2 transition-transform duration-300 group-hover:-translate-y-1 w-full flex justify-center">
                <div
                  className={`w-full max-w-[100px] sm:max-w-[140px] md:max-w-[160px] py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 text-center leading-tight transition-all shadow-md ${style.textColor} ${style.border}`}
                  style={{
                    backgroundColor: fourthPlace.team.color,
                    boxShadow: style.boxShadow,
                  }}
                  title={fourthPlace.team.name}
                >
                  {logo && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md overflow-hidden relative flex-shrink-0 bg-white/20 border border-white/30">
                      <Image src={logo} alt="" fill className="object-contain" />
                    </div>
                  )}
                  <span className="text-[8px] sm:text-xs md:text-sm font-black uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block text-center px-0.5">
                    {fourthPlace.team.name}
                  </span>
                </div>
                <div className="absolute -bottom-1.5 right-1/2 translate-x-6 sm:translate-x-10 bg-amber-700 text-white rounded-full p-0.5 sm:p-1 shadow-md border-2 border-white dark:border-slate-800">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
                </div>
              </div>

              {/* Informações da Equipe em Card de Alto Contraste */}
              <div className="w-full text-center px-0.5 mb-1.5 flex flex-col items-center">
                <div className="inline-flex flex-col items-center px-2 py-0.5 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-white/70 dark:border-slate-700/70 shadow-xs max-w-full">
                  <h3 className="font-black text-[9px] sm:text-xs md:text-sm text-slate-950 dark:text-white truncate max-w-full">
                    {fourthPlace.team.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {fourthPlace.totalPoints} <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400">pts</span>
                  </p>
                </div>
              </div>

              {/* Pilar do Pódio 4º Lugar */}
              <div
                onClick={() => onSelectTeamForScore?.(fourthPlace.team.id)}
                className="w-full h-16 sm:h-20 md:h-22 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800/90 dark:to-slate-800/60 flex flex-col items-center justify-center border-t-2 border-x-2 border-slate-300 dark:border-slate-700 shadow-md cursor-pointer hover:brightness-105 active:scale-98 transition-all"
                title="Clique para lançar pontos para esta equipe"
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 dark:text-amber-400 mb-0.5" />
                <span className="text-base sm:text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300">
                  4º
                </span>
                <span className="text-[8px] sm:text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">
                  Honra
                </span>
              </div>
            </div>
          );
        })() : null}
      </div>

      {/* Demais colocações se houver mais de 4 equipes */}
      {otherPlaces.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
          {otherPlaces.map((standing) => (
            <div
              key={standing.team.id}
              onClick={() => onSelectTeamForScore?.(standing.team.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 transition-all text-xs font-bold"
            >
              <span className="text-slate-400">{standing.rank}º</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: standing.team.color }}
              />
              <span className="text-slate-700 dark:text-slate-200">{standing.team.name}</span>
              <span className="text-[#0284c7] dark:text-[#78c8fb]">{standing.totalPoints} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
