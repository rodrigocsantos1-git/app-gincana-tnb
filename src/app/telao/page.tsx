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
  Star,
  ListOrdered,
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
      ? 'border-2 border-slate-300 shadow-md'
      : 'border-2 border-white/60 shadow-md',
    boxShadow: isWhite
      ? '0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 0 8px #94a3b8, 0 12px 30px -3px rgba(0,0,0,0.4)'
      : `0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 0 8px ${teamColor}, 0 12px 30px -3px ${teamColor}90`,
  };
}

export default function TelaoPage() {
  const { standings, scores, realtimeConnected } = useGincanaData();
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
      particleCount: 120,
      spread: 90,
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-25">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#78c8fb] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bb94ff] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5b21b6] rounded-full blur-[160px]" />
      </div>

      {/* Top Bar Telão */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Voltar ao Painel Administrativo"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 shadow-lg flex items-center justify-center">
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
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight uppercase">
                  Gincana Acampa TNB
                </h1>
                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-bold bg-[#bb94ff]/30 text-[#bb94ff] border border-[#bb94ff]/50">
                  AO VIVO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:block">
                Ministério Infantil Tô na Bênção • Igreja Bíblica da Paz
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Apresentação e Alternância */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link para a Cerimônia de Resultado Final */}
          <Link
            href="/resultado-final"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            title="Abrir a Cerimônia de Premiação com Revelação Passo a Passo"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Cerimônia Final</span>
          </Link>

          {/* Alternador de Modo de Visualização */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-white/10 border border-white/10">
            <button
              onClick={() => setViewMode('linhas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'linhas'
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
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
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Pódio</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
            <Wifi className={`w-3.5 h-3.5 ${realtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{realtimeConnected ? 'Tempo Real Ativo' : 'Telão'}</span>
          </div>

          <button
            onClick={fireCelebration}
            className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 cursor-pointer"
            title="Soltar Confetes no Telão"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Telão */}
      <main className="relative z-10 flex-1 my-4 sm:my-6 flex flex-col justify-center max-w-7xl w-full mx-auto">
        {/* ========================================================================= */}
        {/* MODO 1: LINHAS HORIZONTAIS COM PONTUAÇÃO POR PROVAS (MODO PRINCIPAL)     */}
        {/* ========================================================================= */}
        {viewMode === 'linhas' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Cabeçalho da Seção */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-[#78c8fb]" />
                <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-slate-300">
                  Classificação Geral & Histórico de Provas Executadas
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Arraste horizontalmente para ver todas as provas
              </span>
            </div>

            {/* Linhas por Equipe */}
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
                    {/* Barra de Progresso no Fundo */}
                    <div
                      className="absolute inset-y-0 left-0 opacity-15 pointer-events-none transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: standing.team.color,
                      }}
                    />

                    {/* Lado Esquerdo: Posição, Identificação da Equipe e Total de Pontos */}
                    <div className="relative z-10 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 flex-shrink-0 xl:min-w-[340px]">
                      {/* Badge de Posição */}
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
                          ) : standing.rank === 3 ? (
                            <span className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-100 flex items-center justify-center font-black shadow">
                              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                            </span>
                          ) : (
                            <span className="w-full h-full rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                              {standing.rank}º
                            </span>
                          )}
                        </div>

                        {/* Cor e Nome da Equipe */}
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

                      {/* Pontuação Total da Equipe em Destaque Gigante */}
                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-baseline justify-end gap-1">
                          <span>{standing.totalPoints}</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-400 uppercase tracking-widest">pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Coluna/Faixa Horizontal de Provas Executadas */}
                    <div className="relative z-10 flex-1 min-w-0 border-t xl:border-t-0 xl:border-l border-white/10 pt-3 xl:pt-0 xl:pl-4">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {teamScores.length > 0 ? (
                          teamScores.map((score, idx) => (
                            <div
                              key={score.id || idx}
                              className="flex-shrink-0 flex items-center gap-2.5 px-3 sm:px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border backdrop-blur-md transition-all shadow-sm"
                              style={{
                                borderColor: `${standing.team.color}60`,
                              }}
                              title={score.notes || undefined}
                            >
                              {/* Bolinha da cor da equipe */}
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: standing.team.color }}
                              />
                              {/* Nome e Rodada da Prova */}
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
                              {/* Pontos Ganho */}
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

        {/* ========================================================================= */}
        {/* MODO 2: PÓDIO CLÁSSICO TRADICIONAL                                        */}
        {/* ========================================================================= */}
        {viewMode === 'podio' && (
          <div className="animate-in fade-in duration-300">
            <div
              className={`grid ${
                hasFourTeams
                  ? 'grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-6xl'
                  : standings.length === 3
                  ? 'grid-cols-3 gap-3 sm:gap-6 max-w-4xl'
                  : standings.length === 2
                  ? 'grid-cols-2 gap-4 max-w-2xl'
                  : 'grid-cols-1 max-w-md'
              } items-end mx-auto w-full mb-8 pt-8`}
            >
              {/* 2º LUGAR (Prata) */}
              {secondPlace && (() => {
                const style = getTeamStyle(secondPlace.team);
                return (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-center p-2 mb-2 sm:mb-3 transition-all ${style.textColor} ${style.border}`}
                      style={{
                        backgroundColor: secondPlace.team.color,
                        boxShadow: style.boxShadow,
                      }}
                      title={secondPlace.team.name}
                    >
                      <span className="text-xs sm:text-base md:text-xl font-black uppercase tracking-tight break-words line-clamp-2 px-1">
                        {secondPlace.team.name}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-lg md:text-xl text-center truncate max-w-full">
                      {secondPlace.team.name}
                    </h3>
                    <p className="text-lg sm:text-2xl md:text-3xl font-black text-slate-300 mb-2">
                      {secondPlace.totalPoints} <span className="text-xs sm:text-sm font-normal">pts</span>
                    </p>
                    <div className="w-full h-28 sm:h-38 md:h-44 rounded-t-3xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-x-4 border-slate-500 flex flex-col items-center justify-center shadow-2xl">
                      <Medal className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-300 mb-1" />
                      <span className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-200">2º</span>
                      <span className="text-[9px] sm:text-xs uppercase font-bold tracking-widest text-slate-400">
                        Prata
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 1º LUGAR (Ouro - Centro / Mais Alto) */}
              {firstPlace && (() => {
                const style = getTeamStyle(firstPlace.team);
                return (
                  <div className="flex flex-col items-center relative -top-4 sm:-top-6">
                    <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                    <div
                      className={`w-16 h-16 sm:w-26 sm:h-26 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-center p-2 mb-2 sm:mb-3 transition-all shadow-xl ${style.textColor} ${style.border}`}
                      style={{
                        backgroundColor: firstPlace.team.color,
                        boxShadow: style.boxShadow,
                      }}
                      title={firstPlace.team.name}
                    >
                      <span className="text-xs sm:text-lg md:text-2xl font-black uppercase tracking-tight break-words line-clamp-2 px-1">
                        {firstPlace.team.name}
                      </span>
                    </div>
                    <h3 className="font-black text-sm sm:text-xl md:text-2xl text-center text-amber-300 truncate max-w-full">
                      {firstPlace.team.name}
                    </h3>
                    <p className="text-xl sm:text-4xl md:text-5xl font-black text-amber-400 mb-2 sm:mb-3 drop-shadow-md">
                      {firstPlace.totalPoints} <span className="text-xs sm:text-base font-normal">pts</span>
                    </p>
                    <div className="w-full h-36 sm:h-52 md:h-60 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 border-t-4 border-x-4 border-amber-300 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                      <Trophy className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 text-amber-950 mb-1" />
                      <span className="text-3xl sm:text-6xl md:text-7xl font-black text-amber-950">1º</span>
                      <span className="text-[10px] sm:text-xs md:text-sm uppercase font-black tracking-widest text-amber-950">
                        Líder da Gincana
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 3º LUGAR (Bronze) */}
              {thirdPlace && (() => {
                const style = getTeamStyle(thirdPlace.team);
                return (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-13 h-13 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-center p-2 mb-2 sm:mb-3 transition-all ${style.textColor} ${style.border}`}
                      style={{
                        backgroundColor: thirdPlace.team.color,
                        boxShadow: style.boxShadow,
                      }}
                      title={thirdPlace.team.name}
                    >
                      <span className="text-xs sm:text-base md:text-lg font-black uppercase tracking-tight break-words line-clamp-2 px-1">
                        {thirdPlace.team.name}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-base md:text-lg text-center truncate max-w-full">
                      {thirdPlace.team.name}
                    </h3>
                    <p className="text-base sm:text-xl md:text-2xl font-black text-amber-500 mb-2">
                      {thirdPlace.totalPoints} <span className="text-xs sm:text-sm font-normal">pts</span>
                    </p>
                    <div className="w-full h-22 sm:h-30 md:h-36 rounded-t-3xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-x-4 border-amber-700 flex flex-col items-center justify-center shadow-xl">
                      <Award className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-amber-300 mb-0.5" />
                      <span className="text-xl sm:text-3xl md:text-4xl font-black text-amber-200">3º</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs uppercase font-bold tracking-widest text-amber-400">
                        Bronze
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 4º LUGAR (Honra / Participação) */}
              {fourthPlace && (() => {
                const style = getTeamStyle(fourthPlace.team);
                return (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-3xl flex items-center justify-center text-center p-2 mb-2 sm:mb-3 transition-all ${style.textColor} ${style.border}`}
                      style={{
                        backgroundColor: fourthPlace.team.color,
                        boxShadow: style.boxShadow,
                      }}
                      title={fourthPlace.team.name}
                    >
                      <span className="text-xs sm:text-base md:text-lg font-black uppercase tracking-tight break-words line-clamp-2 px-1">
                        {fourthPlace.team.name}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[11px] sm:text-sm md:text-base text-center truncate max-w-full">
                      {fourthPlace.team.name}
                    </h3>
                    <p className="text-sm sm:text-lg md:text-xl font-black text-slate-300 mb-2">
                      {fourthPlace.totalPoints} <span className="text-xs sm:text-sm font-normal">pts</span>
                    </p>
                    <div className="w-full h-18 sm:h-24 md:h-28 rounded-t-3xl bg-gradient-to-t from-slate-900 to-slate-800 border-t-4 border-x-4 border-slate-600 flex flex-col items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-300 mb-0.5" />
                      <span className="text-lg sm:text-2xl md:text-3xl font-black text-slate-300">4º</span>
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        Honra
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Demais colocações (se houver mais de 4 equipes) */}
        {otherPlaces.length > 0 && (
          <div className="max-w-4xl mx-auto w-full space-y-2 mt-4">
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
      <footer className="relative z-10 border-t border-white/10 pt-3 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Ministério Infantil Tô na Bênção • IBP</span>
        <span className="italic">&quot;Crianças com os olhos fixos em Jesus!&quot;</span>
        <div className="flex items-center gap-3">
          <Link href="/resultado-final" className="hover:text-amber-300 font-bold transition-colors">Cerimônia Final 🏆</Link>
          <span>•</span>
          <Link href="/" className="hover:text-white transition-colors">Painel Admin</Link>
        </div>
      </footer>
    </div>
  );
}
