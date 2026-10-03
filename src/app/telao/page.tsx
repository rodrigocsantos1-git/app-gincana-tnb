'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGincanaData } from '@/hooks/useGincanaData';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Sparkles,
  Wifi,
  ListOrdered,
  LayoutGrid,
  Sun,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VinylAudioPlayer } from '@/components/VinylAudioPlayer';
import { SuspenseDrumRollButton } from '@/components/SuspenseDrumRollButton';
import { useTheme } from '@/components/ThemeProvider';

// Helper de contraste para equipes (garante texto legível para equipe branca e amarela)
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
    textColor: isWhite ? 'text-slate-950 font-black' : isYellow ? 'text-amber-950 font-black' : 'text-white font-black',
    border: isWhite
      ? 'border-2 border-slate-300 shadow-md'
      : 'border-2 border-white/60 shadow-md',
    boxShadow: isWhite
      ? '0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 0 8px #94a3b8, 0 12px 30px -3px rgba(0,0,0,0.4)'
      : `0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 0 8px ${teamColor}, 0 12px 30px -3px ${teamColor}90`,
  };
}

export default function TelaoPage() {
  const { standings, scores, realtimeConnected } = useGincanaData();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'linhas' | 'podio'>('linhas');

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
      particleCount: 140,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#78c8fb', '#bb94ff', '#f59e0b', '#10b981', '#ffffff'],
    });
  };

  const firstPlace = standings[0];
  const secondPlace = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;
  const fourthPlace = standings.length > 3 ? standings[3] : null;
  const otherPlaces = standings.length > 4 ? standings.slice(4) : [];

  const maxPoints = Math.max(...standings.map((s) => s.totalPoints), 1);
  const hasFourTeams = standings.length >= 4;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none overflow-x-hidden transition-colors duration-500 ${
        isLight
          ? 'bg-[#78c8fb] [background-image:radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.55)_0%,transparent_35%),radial-gradient(circle_at_88%_20%,rgba(187,148,255,0.35)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(159,224,255,0.50)_0%,transparent_55%),linear-gradient(145deg,#78c8fb_0%,#6bc0f5_45%,#7ecdfb_100%)] text-slate-900'
          : 'bg-[#090d16] [background-image:radial-gradient(circle_at_12%_14%,rgba(120,200,251,0.12)_0%,transparent_35%),radial-gradient(circle_at_88%_20%,rgba(187,148,255,0.15)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(91,33,182,0.25)_0%,transparent_60%),linear-gradient(160deg,#090d16_0%,#0f172a_45%,#1e1b4b_100%)] text-white'
      }`}
    >
      {/* Luzes Volumétricas de Fundo */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-0' : 'opacity-25'}`}>
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#78c8fb] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bb94ff] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5b21b6] rounded-full blur-[160px]" />
      </div>

      {/* Header Superior do Telão */}
      <header className={`relative z-10 flex items-center justify-between border-b pb-4 ${isLight ? 'border-sky-300/60' : 'border-white/10'}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors border shrink-0 ${
              isLight
                ? 'bg-white/80 hover:bg-white text-slate-800 border-white/80 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            title="Voltar ao Painel Administrativo"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Voltar</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <Image
                src="/logo-treinando-campeoes.png"
                alt="Logo Treinando Campeões - Tô na Bênção"
                width={80}
                height={80}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(187,148,255,0.45)] transition-transform hover:scale-105"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Gincana Acampa TNB
                </h1>
                <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-bold ${
                  isLight
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-[#bb94ff]/30 text-[#bb94ff] border border-[#bb94ff]/50'
                }`}>
                  AO VIVO
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Ministério Infantil Tô na Bênção • Treinando Campeões (Filipenses 3:14)
              </p>
              <p className={`text-sm sm:text-base md:text-lg font-extrabold italic leading-snug mt-1 max-w-3xl drop-shadow-sm ${
                isLight ? 'text-blue-950' : 'text-amber-200/95'
              }`}>
                &ldquo;Corro direto para a linha de chegada a fim de conseguir o prêmio da vitória. Esse prêmio é a nova vida para a qual Deus me chamou por meio de Cristo Jesus.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Apresentação */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Alternador de Tema Claro / Escuro */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-white/85 hover:bg-white border-white/80 text-slate-800 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white shadow-md'
            }`}
            title={isLight ? 'Mudar para Modo Noturno' : 'Mudar para Modo Claro'}
            aria-label="Alternar tema"
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-sky-700" />
                <span className="hidden sm:inline text-slate-800 font-extrabold">Escuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-amber-300 font-extrabold">Claro</span>
              </>
            )}
          </button>

          {/* Player de Vinil */}
          <VinylAudioPlayer />

          {/* Atalho para a Cerimônia Final */}
          <Link
            href="/resultado-final"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            title="Abrir a Cerimônia de Premiação com Revelação Passo a Passo"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Cerimônia Final</span>
          </Link>

          {/* Seletor de Modo: Por Provas vs Pódio */}
          <div className={`hidden md:flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-white/70 border-white/80 shadow-xs' : 'bg-white/10 border-white/10'
          }`}>
            <button
              onClick={() => setViewMode('linhas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'linhas'
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Por Provas</span>
            </button>
            <button
              onClick={() => setViewMode('podio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'podio'
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pódio</span>
            </button>
          </div>

          {/* Status Realtime */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            isLight ? 'bg-white/60 border-white/80 text-slate-700' : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <Wifi className={`w-3.5 h-3.5 ${realtimeConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{realtimeConnected ? 'Ao Vivo' : 'Telão'}</span>
          </div>

          {/* Rufar de Tambores */}
          <SuspenseDrumRollButton />

          {/* Confetes */}
          <button
            onClick={fireCelebration}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-300 shadow-sm'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
            }`}
            title="Soltar Confetes no Telão"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Tela Cheia F11 */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white/80 hover:bg-white text-slate-800 border-white/80 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border-transparent'
            }`}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 my-4 sm:my-6 flex flex-col justify-center max-w-7xl w-full mx-auto">
        {/* MODO 1: LINHAS HORIZONTAIS COM PONTUAÇÃO POR PROVA */}
        {viewMode === 'linhas' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ListOrdered className={`w-5 h-5 ${isLight ? 'text-sky-800' : 'text-[#78c8fb]'}`} />
                <h2 className={`text-sm sm:text-base md:text-lg font-black uppercase tracking-wider ${
                  isLight ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  Classificação Geral &amp; Histórico de Provas Executadas
                </h2>
              </div>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Arraste horizontalmente para ver todas as provas
              </span>
            </div>

            <div className="space-y-3.5">
              {standings.map((standing) => {
                const teamScores = (scores || []).filter((s) => s.team_id === standing.team.id);
                const percentage = Math.max(Math.round((standing.totalPoints / maxPoints) * 100), 5);
                const style = getTeamStyle(standing.team);

                return (
                  <div
                    key={standing.team.id}
                    className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-white/15 p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 group hover:border-white/30"
                    style={{
                      borderLeftWidth: '8px',
                      borderLeftColor: standing.team.color || '#0284c7',
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 opacity-15 pointer-events-none transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: standing.team.color,
                      }}
                    />

                    {/* Posição, Time e Total */}
                    <div className="relative z-10 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 flex-shrink-0 xl:min-w-[340px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shadow-lg flex-shrink-0 bg-slate-800 border border-white/20">
                          {standing.rank === 1 ? (
                            <span className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-amber-950 flex items-center justify-center font-black shadow-md">
                              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                            </span>
                          ) : standing.rank === 2 ? (
                            <span className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 flex items-center justify-center font-black shadow">
                              <Medal className="w-5 h-5 sm:w-6 sm:h-6" />
                            </span>
                          ) : standing.rank === 3 || standing.rank === 4 ? (
                            <span className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-100 flex items-center justify-center font-black shadow">
                              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                            </span>
                          ) : (
                            <span className="w-full h-full rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                              {standing.rank}º
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-center font-black text-sm sm:text-base uppercase flex-shrink-0 shadow-md ${style.textColor} ${style.border}`}
                            style={{ backgroundColor: standing.team.color }}
                            title={standing.team.name}
                          >
                            {standing.team.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white truncate tracking-tight">
                              {standing.team.name}
                            </h2>
                            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold block">
                              {teamScores.length} {teamScores.length === 1 ? 'prova pontuada' : 'provas pontuadas'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-baseline justify-end gap-1">
                          <span>{standing.totalPoints}</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-400 uppercase tracking-widest">pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Histórico Horizontal de Provas da Equipe */}
                    <div className="relative z-10 flex-1 min-w-0 border-t xl:border-t-0 xl:border-l border-white/10 pt-3 xl:pt-0 xl:pl-4">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {teamScores.length > 0 ? (
                          teamScores.map((score, idx) => (
                            <div
                              key={score.id || idx}
                              className="flex-shrink-0 flex items-center gap-2.5 px-3 sm:px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border backdrop-blur-md transition-all shadow-sm"
                              style={{ borderColor: `${standing.team.color}60` }}
                              title={score.notes || undefined}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: standing.team.color }}
                              />
                              <div className="flex flex-col min-w-0 pr-1">
                                <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[130px] sm:max-w-[190px]">
                                  {score.activity?.title || 'Pontuação Avulsa'}
                                </span>
                                {score.notes && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[190px]">
                                    {score.notes}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl flex-shrink-0 shadow-xs ${
                                  score.points >= 0
                                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                                    : 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                                }`}
                              >
                                {score.points >= 0 ? `+${score.points}` : score.points} pts
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 px-3 text-xs text-slate-500 italic flex items-center gap-2">
                            <span>Aguardando lançamentos de provas para esta equipe...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODO 2: PÓDIO CLÁSSICO TRADICIONAL */}
        {viewMode === 'podio' && (
          <div className="animate-in fade-in duration-300">
            <div
              className={`grid ${
                hasFourTeams
                  ? 'grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-[98vw] 2xl:max-w-[1850px]'
                  : standings.length === 3
                  ? 'grid-cols-3 gap-3 sm:gap-6 max-w-5xl'
                  : 'grid-cols-2 gap-4 max-w-3xl'
              } items-end mx-auto w-full mb-8 pt-8`}
            >
              {/* 2º Lugar */}
              {secondPlace && (() => {
                const style = getTeamStyle(secondPlace.team);
                return (
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                      style={{ backgroundColor: secondPlace.team.color, boxShadow: style.boxShadow }}
                    >
                      <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                        {secondPlace.team.name}
                      </span>
                    </div>

                    <p className={`text-lg sm:text-2xl md:text-3xl font-black my-1 sm:my-2 ${
                      isLight ? 'text-slate-800' : 'text-slate-300'
                    }`}>
                      {secondPlace.totalPoints} <span className={`text-xs sm:text-sm font-semibold ${
                        isLight ? 'text-slate-700' : 'text-slate-400'
                      }`}>pts</span>
                    </p>

                    <div className="w-full h-28 sm:h-38 md:h-44 rounded-t-3xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-x-4 border-slate-500 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                      <Medal className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-300 mb-1 z-10" />
                      <span className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-200 z-10">2º</span>
                      <span className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-slate-300 z-10">
                        Medalha de Prata
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 1º Lugar */}
              {firstPlace && (() => {
                const style = getTeamStyle(firstPlace.team);
                return (
                  <div className="flex flex-col items-center w-full relative -top-4 sm:-top-6">
                    <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] mb-1" />

                    <div
                      className={`w-full max-w-md py-3 sm:py-4 px-2 sm:px-5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-2xl transition-all ${style.textColor} ${style.border}`}
                      style={{ backgroundColor: firstPlace.team.color, boxShadow: style.boxShadow }}
                    >
                      <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-wider truncate px-1">
                        {firstPlace.team.name}
                      </span>
                    </div>

                    <p className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black my-1 sm:my-2 drop-shadow-lg ${
                      isLight ? 'text-amber-900' : 'text-amber-400'
                    }`}>
                      {firstPlace.totalPoints} <span className={`text-xs sm:text-base font-bold ${
                        isLight ? 'text-amber-950' : 'text-amber-300/80'
                      }`}>pts</span>
                    </p>

                    <div className="w-full h-36 sm:h-52 md:h-60 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 border-t-4 border-x-4 border-amber-300 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)] relative overflow-hidden">
                      <Trophy className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 text-amber-950 mb-1 z-10" />
                      <span className="text-3xl sm:text-6xl md:text-7xl font-black text-amber-950 z-10">1º</span>
                      <span className="text-[10px] sm:text-xs md:text-sm uppercase font-black tracking-widest text-amber-950 z-10">
                        Campeã Geral TNB!
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 3º Lugar */}
              {thirdPlace && (() => {
                const style = getTeamStyle(thirdPlace.team);
                return (
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                      style={{ backgroundColor: thirdPlace.team.color, boxShadow: style.boxShadow }}
                    >
                      <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                        {thirdPlace.team.name}
                      </span>
                    </div>

                    <p className={`text-base sm:text-xl md:text-2xl font-black my-1 sm:my-2 ${
                      isLight ? 'text-amber-900' : 'text-amber-500'
                    }`}>
                      {thirdPlace.totalPoints} <span className={`text-xs sm:text-sm font-semibold ${
                        isLight ? 'text-amber-950' : 'text-amber-400/70'
                      }`}>pts</span>
                    </p>

                    <div className="w-full h-22 sm:h-30 md:h-36 rounded-t-3xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-x-4 border-amber-700 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                      <Award className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-amber-300 mb-0.5 z-10" />
                      <span className="text-xl sm:text-3xl md:text-4xl font-black text-amber-200 z-10">3º</span>
                      <span className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-300 z-10">
                        Medalha de Bronze
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 4º Lugar */}
              {fourthPlace && (() => {
                const style = getTeamStyle(fourthPlace.team);
                return (
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                      style={{ backgroundColor: fourthPlace.team.color, boxShadow: style.boxShadow }}
                    >
                      <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                        {fourthPlace.team.name}
                      </span>
                    </div>

                    <p className={`text-sm sm:text-lg md:text-xl font-black my-1 sm:my-2 ${
                      isLight ? 'text-slate-800' : 'text-slate-300'
                    }`}>
                      {fourthPlace.totalPoints} <span className={`text-xs sm:text-sm font-semibold ${
                        isLight ? 'text-slate-700' : 'text-slate-400'
                      }`}>pts</span>
                    </p>

                    <div className="w-full h-18 sm:h-24 md:h-28 rounded-t-3xl bg-gradient-to-t from-slate-900 to-slate-800 border-t-4 border-x-4 border-slate-600 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                      <Award className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-300 mb-0.5 z-10" />
                      <span className="text-lg sm:text-2xl md:text-3xl font-black text-slate-300 z-10">4º</span>
                      <span className="text-[8px] sm:text-xs uppercase font-bold tracking-widest text-amber-300/80 z-10">
                        Medalha de Honra
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Demais Equipes (caso haja > 4) */}
        {otherPlaces.length > 0 && (
          <div className="max-w-4xl mx-auto w-full space-y-2 mt-4">
            <h4 className={`text-xs uppercase tracking-wider font-bold mb-2 ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}>
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
                      style={{ width: `${percentage}%`, backgroundColor: standing.team.color }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                        {standing.rank}º
                      </span>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: standing.team.color }} />
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
      <footer
        className={`relative z-10 border-t border-white/10 pt-3 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-2 ${
          isLight ? 'text-slate-800' : 'text-slate-400'
        }`}
      >
        <span>© {new Date().getFullYear()} Ministério Infantil Tô na Bênção • IBP</span>
        <span className={`italic font-bold ${isLight ? 'text-blue-950' : 'text-slate-300'}`}>
          &ldquo;Alegrei-me quando me disseram: Vamos à casa do Senhor&rdquo; (Salmos 122:1)
        </span>
        <div className="flex items-center gap-3">
          <Link href="/resultado-final" className="hover:text-amber-300 font-bold transition-colors">
            Cerimônia Final 🏆
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-white transition-colors">
            Painel Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
