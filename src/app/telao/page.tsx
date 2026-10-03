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
  ListOrdered,
  Sun,
  Moon,
  Swords,
  Scroll,
  Target,
  Sparkle,
  Flame,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VinylAudioPlayer } from '@/components/VinylAudioPlayer';
import { SuspenseDrumRollButton } from '@/components/SuspenseDrumRollButton';
import { useTheme } from '@/components/ThemeProvider';

// Estilo visual dinâmico baseado na cor e nome configurados no Gerenciamento de Equipes
function getTeamAppearance(team?: { name?: string; color?: string } | null, isLight: boolean = false) {
  const name = (team?.name || '').toLowerCase();
  const color = team?.color || '#0284c7';

  const isWhite =
    name.includes('branc') ||
    color.toLowerCase() === '#ffffff' ||
    color.toLowerCase() === '#fff' ||
    color.toLowerCase() === '#f8fafc' ||
    color.toLowerCase() === '#e2e8f0';

  const isYellow =
    name.includes('amar') ||
    color.toLowerCase() === '#f59e0b' ||
    color.toLowerCase() === '#eab308' ||
    color.toLowerCase() === '#facc15';

  const isBlue =
    name.includes('azul') ||
    color.toLowerCase() === '#3b82f6' ||
    color.toLowerCase() === '#0284c7' ||
    color.toLowerCase() === '#38bdf8';

  const isGreen =
    name.includes('verd') ||
    color.toLowerCase() === '#10b981' ||
    color.toLowerCase() === '#059669' ||
    color.toLowerCase() === '#22c55e';

  if (isLight) {
    return {
      cardBg: 'bg-white/90 border-slate-200 text-slate-900 shadow-xl',
      pointsColor: isWhite ? 'text-slate-900' : isYellow ? 'text-amber-800' : isBlue ? 'text-sky-700' : isGreen ? 'text-emerald-700' : 'text-slate-900',
      tagColor: isWhite ? 'text-slate-700' : isYellow ? 'text-amber-800' : isBlue ? 'text-sky-700' : isGreen ? 'text-emerald-700' : 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-800 border border-slate-300',
      chipBorder: 'border-slate-300',
      accentColor: color,
    };
  }

  // Modo Escuro
  if (isYellow) {
    return {
      cardBg: 'bg-[#1a1409]/95 border-amber-500/50 shadow-amber-500/10 hover:border-amber-400',
      pointsColor: 'text-amber-400',
      tagColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      chipBorder: 'border-amber-500/30',
      accentColor: color,
    };
  }

  if (isBlue) {
    return {
      cardBg: 'bg-[#0a182d]/95 border-sky-500/50 shadow-sky-500/10 hover:border-sky-400',
      pointsColor: 'text-sky-400',
      tagColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
      chipBorder: 'border-sky-500/30',
      accentColor: color,
    };
  }

  if (isGreen) {
    return {
      cardBg: 'bg-[#081f16]/95 border-emerald-500/50 shadow-emerald-500/10 hover:border-emerald-400',
      pointsColor: 'text-emerald-400',
      tagColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      chipBorder: 'border-emerald-500/30',
      accentColor: color,
    };
  }

  if (isWhite) {
    return {
      cardBg: 'bg-[#151a27]/95 border-slate-300/60 shadow-slate-400/10 hover:border-white',
      pointsColor: 'text-white',
      tagColor: 'text-slate-200',
      badgeBg: 'bg-slate-700/40 text-slate-200 border border-slate-400/40',
      chipBorder: 'border-slate-400/30',
      accentColor: '#ffffff',
    };
  }

  // Cor personalizada qualquer configurada no Gerenciador de Equipes
  return {
    cardBg: 'bg-slate-900/95 border-white/20 shadow-lg hover:border-white/40',
    pointsColor: 'text-white',
    tagColor: 'text-slate-300',
    badgeBg: 'bg-white/10 text-white border border-white/20',
    chipBorder: 'border-white/20',
    accentColor: color,
  };
}

// Helper para definir estilo, contraste e texto preto para equipe branca / contraste no pódio
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
    color === '#eab308' ||
    color === '#facc15';

  const teamColor = team?.color || '#0284c7';

  return {
    isWhite,
    textColor: isWhite ? 'text-slate-950 font-black' : isYellow ? 'text-amber-950 font-black' : 'text-white font-black',
    border: isWhite
      ? 'border-2 border-slate-300 shadow-md'
      : 'border-2 border-white/60 shadow-md',
    boxShadow: isWhite
      ? '0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 0 8px #94a3b8, 0 12px 30px -3px rgba(0,0,0,0.4)'
      : `0 0 0 4px rgba(255, 255, 255, 0.95), 0 0 0 8px ${teamColor}, 0 12px 30px -3px ${teamColor}80`,
  };
}

// Retorna o ícone mais adequado de acordo com a prova
function getActivityIcon(title: string = '') {
  const t = title.toLowerCase();
  if (t.includes('cabo')) return <Swords className="w-3.5 h-3.5 text-amber-400" />;
  if (t.includes('palavra') || t.includes('jornada')) return <Scroll className="w-3.5 h-3.5 text-sky-400" />;
  if (t.includes('tesouro')) return <Target className="w-3.5 h-3.5 text-yellow-400" />;
  if (t.includes('grito')) return <Flame className="w-3.5 h-3.5 text-rose-400" />;
  return <Sparkle className="w-3.5 h-3.5 text-purple-400" />;
}

export default function TelaoPage() {
  const { standings, scores, realtimeConnected } = useGincanaData();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'linhas' | 'podio'>('linhas');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
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
      particleCount: 160,
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
      className={`min-h-screen flex flex-col justify-between p-2.5 sm:p-5 md:p-6 select-none overflow-x-hidden transition-colors duration-500 ${isLight
          ? 'bg-[#78c8fb] [background-image:radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.6)_0%,transparent_35%),radial-gradient(circle_at_88%_20%,rgba(187,148,255,0.4)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(159,224,255,0.55)_0%,transparent_55%),linear-gradient(145deg,#78c8fb_0%,#6bc0f5_45%,#7ecdfb_100%)] text-slate-900'
          : 'bg-[#070a12] [background-image:radial-gradient(circle_at_12%_14%,rgba(120,200,251,0.08)_0%,transparent_35%),radial-gradient(circle_at_88%_20%,rgba(187,148,255,0.12)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(91,33,182,0.20)_0%,transparent_60%),linear-gradient(160deg,#070a12_0%,#0c101d_45%,#13172b_100%)] text-white'
        }`}
    >
      {/* Luzes Volumétricas de Fundo */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-0' : 'opacity-25'}`}>
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#78c8fb] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bb94ff] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5b21b6] rounded-full blur-[160px]" />
      </div>

      {/* ========================================================================= */}
      {/* TOP BAR / TICKER MARQUEE (EXATAMENTE COMO NO STITCH)                     */}
      {/* ========================================================================= */}
      <div className={`relative z-10 flex items-center justify-between text-xs py-1.5 px-3 mb-3 rounded-2xl border backdrop-blur-md ${isLight ? 'bg-white/70 border-white/80 text-slate-800 shadow-xs' : 'bg-black/40 border-white/10 text-slate-300'
        }`}>
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className={`p-1 rounded-lg transition-colors ${isLight ? 'bg-white hover:bg-slate-100 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            title="Voltar ao Painel Administrativo"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="w-5 h-5 relative rounded-full overflow-hidden flex-shrink-0">
            <Image src="/Logo_TNB.png" alt="TNB" width={20} height={20} className="object-contain" />
          </div>
          <span className={`font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Gincana Acampa TNB
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            AO VIVO
          </span>
        </div>

        {/* Citação Ticker Central */}
        <div className={`hidden md:flex items-center gap-2 font-semibold text-[11px] truncate max-w-xl ${isLight ? 'text-blue-950 font-bold' : 'text-amber-300'
          }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate italic">
            &ldquo;Corro direto para a linha de chegada a fim de conseguir o prêmio da vitória. Esse prêmio é a nova vida para a...&rdquo;
          </span>
        </div>

        {/* Indicador de Status Online */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{realtimeConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO BANNER PRINCIPAL (DESIGN IDENTICO AO STITCH)                         */}
      {/* ========================================================================= */}
      <div className={`relative z-10 overflow-hidden rounded-3xl border p-4 sm:p-5 shadow-2xl backdrop-blur-xl mb-4 sm:mb-5 ${isLight
          ? 'bg-white/85 border-white/90 text-slate-900'
          : 'bg-[#121629]/95 border-indigo-500/20 text-white'
        }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Lado Esquerdo: Logo Treinando Campeões + Título + Versículo */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-3xl p-1 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border-2 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo-treinando-campeoes.png"
                alt="Logo Treinando Campeões - Tô na Bênção"
                width={88}
                height={88}
                className="w-full h-full object-contain drop-shadow"
                priority
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase ${isLight ? 'text-slate-950' : 'text-white'
                  }`}>
                  Gincana Acampa TNB
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider shadow-sm">
                  AO VIVO NO TELÃO
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isLight ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                  }`}>
                  Edição 2026
                </span>
              </div>

              <p className={`text-xs sm:text-sm italic font-medium leading-relaxed max-w-2xl drop-shadow-sm ${isLight ? 'text-slate-800' : 'text-slate-200'
                }`}>
                &ldquo;Corro direto para a linha de chegada a fim de conseguir o prêmio da vitória. Esse prêmio é a nova vida para a qual Deus me chamou por meio de Cristo Jesus.&rdquo;
              </p>
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block mt-1 ${isLight ? 'text-blue-900' : 'text-amber-400'
                }`}>
                FILIPENSES 3:14
              </span>
            </div>
          </div>

          {/* Lado Direito: Pod de Controles de Apresentação */}
          <div className={`flex-shrink-0 border rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 shadow-xl ${isLight ? 'bg-white/80 border-slate-200' : 'bg-[#0c101d]/90 border-white/10'
            }`}>
            <div className="flex items-center gap-2 justify-end">
              <VinylAudioPlayer />
              <SuspenseDrumRollButton />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Link
                href="/resultado-final"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-amber-950 hover:brightness-110 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                title="Abrir a Cerimônia de Premiação"
              >
                <Trophy className="w-4 h-4" />
                <span>Cerimônia Final ✨</span>
              </Link>

              {/* Botão Confetes */}
              <button
                onClick={fireCelebration}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 cursor-pointer"
                title="Soltar Confetes"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Alternador de Tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                title={isLight ? 'Modo Escuro' : 'Modo Claro'}
              >
                {isLight ? <Moon className="w-4 h-4 text-sky-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Fullscreen F11 */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                title="Tela Cheia"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO: BARRA DE TÍTULO + ALTERNADOR DE ABAS (POR PROVAS vs PÓDIO)         */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-pink-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.9)]" />
          <h2 className={`text-base sm:text-lg md:text-xl font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'
            }`}>
            Classificação em Tempo Real
          </h2>
          <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-white/10'
            }`}>
            {standings.length} EQUIPES ATIVAS
          </span>
        </div>

        {/* Abas Alternadoras com Estilo Pílula */}
        <div className={`flex items-center p-1 rounded-2xl border shadow-lg ${isLight ? 'bg-white/80 border-slate-300' : 'bg-[#0c101d]/90 border-white/10'
          }`}>
          <button
            onClick={() => setViewMode('linhas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${viewMode === 'linhas'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Modo Por Provas (Horizontal)</span>
          </button>
          <button
            onClick={() => setViewMode('podio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${viewMode === 'podio'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Modo Pódio Clássico</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTEÚDO PRINCIPAL                                                        */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto mb-4">
        {/* ======================================================================= */}
        {/* MODO 1: LINHAS HORIZONTAIS COM PROVAS CONCLUÍDAS (DESIGN DO STITCH)      */}
        {/* ======================================================================= */}
        {viewMode === 'linhas' && (
          <div className="space-y-3.5 animate-in fade-in duration-300">
            {standings.map((standing, idx) => {
              const teamScores = (scores || []).filter((s) => s.team_id === standing.team.id);
              const appearance = getTeamAppearance(standing.team, isLight);
              // Posição: usa o rank real quando há pontos, ou o índice quando todos estão com 0 pts
              const displayRank = standing.totalPoints > 0 ? standing.rank : idx + 1;

              return (
                <div
                  key={standing.team.id}
                  className={`relative overflow-hidden rounded-3xl border-2 p-3.5 sm:p-4 md:p-5 shadow-2xl backdrop-blur-xl transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 group ${isLight
                      ? 'bg-white/90 border-slate-200 text-slate-900 shadow-xl'
                      : appearance.cardBg
                    }`}
                  style={{
                    borderLeftWidth: '8px',
                    borderLeftColor: appearance.accentColor,
                  }}
                >
                  {/* Bloco 1: Badge de Posição + Identificação da Equipe + Pontuação */}
                  <div className="relative z-10 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 flex-shrink-0 xl:min-w-[420px]">
                    {/* Badge da Posição */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg border border-white/20">
                      {displayRank === 1 ? (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 font-black flex flex-col items-center justify-center shadow-lg border border-amber-300">
                          <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-xs sm:text-sm leading-none font-black">1º</span>
                        </div>
                      ) : displayRank === 2 ? (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-200 to-slate-400 text-slate-900 font-black flex flex-col items-center justify-center shadow-lg border border-slate-100">
                          <Medal className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-xs sm:text-sm leading-none font-black">2º</span>
                        </div>
                      ) : displayRank === 3 ? (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 font-black flex flex-col items-center justify-center shadow-lg border border-amber-600">
                          <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-xs sm:text-sm leading-none font-black">3º</span>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-white text-slate-950 font-black flex flex-col items-center justify-center shadow-lg border-2 border-slate-300">
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950" />
                          <span className="text-xs sm:text-sm leading-none font-black">{displayRank}º</span>
                        </div>
                      )}
                    </div>

                    {/* Nome e Metadados da Equipe EXATAMENTE como no Painel Administrativo */}
                    <div className="min-w-0">
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider block ${isLight ? 'text-slate-600' : appearance.tagColor
                        }`}>
                        ● Equipe {standing.team.name}
                      </span>
                      <h3 className={`text-xl sm:text-2xl md:text-3xl font-black truncate tracking-tight ${isLight ? 'text-slate-950' : 'text-white'
                        }`}>
                        {standing.team.name}
                      </h3>
                      <span className={`text-[11px] sm:text-xs font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                        {teamScores.length} {teamScores.length === 1 ? 'prova pontuada' : 'provas pontuadas'} • Gincana TNB
                      </span>
                    </div>

                    {/* Pontuação Total em Destaque Gigante */}
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest block ${isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                        PONTUAÇÃO TOTAL
                      </span>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight ${isLight ? 'text-slate-950' : appearance.pointsColor
                          }`}>
                          {standing.totalPoints.toLocaleString('pt-BR')}
                        </span>
                        <span className={`text-xs sm:text-sm font-black uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                          PTS
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${appearance.badgeBg}`}>
                          {displayRank === 1 ? 'LÍDER GERAL' : displayRank === 2 ? 'VICE-LÍDER' : displayRank === 3 ? '3º LUGAR' : '4º LUGAR'}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                          {teamScores.length} {teamScores.length === 1 ? 'prova' : 'provas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: Histórico Horizontal de Provas Concluídas */}
                  <div className={`relative z-10 flex-1 min-w-0 border-t xl:border-t-0 xl:border-l pt-3 xl:pt-0 xl:pl-5 ${isLight ? 'border-slate-300' : 'border-white/10'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                        <Scroll className="w-3.5 h-3.5" />
                        HISTÓRICO DE PROVAS CONCLUÍDAS
                      </span>
                      <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-500'
                        }`}>
                        Deslize para ver todas →
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {teamScores.length > 0 ? (
                        teamScores.map((score, sIdx) => (
                          <div
                            key={score.id || sIdx}
                            className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-md transition-all shadow-sm ${isLight
                                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                                : `bg-black/50 hover:bg-black/70 ${appearance.chipBorder} text-white`
                              }`}
                            title={score.notes || undefined}
                          >
                            <span className="p-1 rounded-lg bg-white/10 flex-shrink-0">
                              {getActivityIcon(score.activity?.title || '')}
                            </span>
                            <div className="flex flex-col min-w-0 pr-1">
                              <span className={`text-xs sm:text-sm font-black truncate max-w-[120px] sm:max-w-[170px] ${isLight ? 'text-slate-900' : 'text-white'
                                }`}>
                                {score.activity?.title || 'Pontuação Avulsa'}
                              </span>
                              {score.notes && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px] sm:max-w-[170px]">
                                  {score.notes}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl flex-shrink-0 shadow-xs ${score.points >= 0
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                                  : 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                                }`}
                            >
                              {score.points >= 0 ? `+${score.points}` : score.points} pts
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-2.5 px-3 text-xs text-slate-500 italic flex items-center gap-2">
                          <span>Aguardando lançamentos de provas para esta equipe...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================================= */}
        {/* MODO 2: PÓDIO CLÁSSICO TRADICIONAL                                       */}
        {/* ======================================================================= */}
        {viewMode === 'podio' && (
          <div className="animate-in fade-in duration-300">
            <div
              className={`grid ${hasFourTeams
                  ? 'grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-[98vw] 2xl:max-w-[1850px]'
                  : standings.length === 3
                    ? 'grid-cols-3 gap-3 sm:gap-6 max-w-5xl'
                    : 'grid-cols-2 gap-4 max-w-3xl'
                } items-end mx-auto w-full mb-8 pt-8`}
            >
              {/* 2º Lugar */}
              {secondPlace && (
                <div className="flex flex-col items-center w-full">
                  <div
                    className="w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all text-white font-black border-2 border-white/60"
                    style={{ backgroundColor: secondPlace.team.color }}
                  >
                    <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                      {secondPlace.team.name}
                    </span>
                  </div>

                  <p className={`text-lg sm:text-2xl md:text-3xl font-black my-1 sm:my-2 ${isLight ? 'text-slate-900' : 'text-slate-300'
                    }`}>
                    {secondPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold opacity-70">pts</span>
                  </p>

                  <div className="w-full h-28 sm:h-38 md:h-44 rounded-t-3xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-x-4 border-slate-500 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                    <Medal className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-300 mb-1 z-10" />
                    <span className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-200 z-10">2º</span>
                    <span className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-slate-300 z-10">
                      Medalha de Prata
                    </span>
                  </div>
                </div>
              )}

              {/* 1º Lugar */}
              {firstPlace && (
                <div className="flex flex-col items-center w-full relative -top-4 sm:-top-6">
                  <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] mb-1" />

                  <div
                    className="w-full max-w-md py-3 sm:py-4 px-2 sm:px-5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-2xl transition-all text-white font-black border-2 border-white/60"
                    style={{ backgroundColor: firstPlace.team.color }}
                  >
                    <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-wider truncate px-1">
                      {firstPlace.team.name}
                    </span>
                  </div>

                  <p className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black my-1 sm:my-2 drop-shadow-lg ${isLight ? 'text-amber-950' : 'text-amber-400'
                    }`}>
                    {firstPlace.totalPoints} <span className="text-xs sm:text-base font-bold opacity-80">pts</span>
                  </p>

                  <div className="w-full h-36 sm:h-52 md:h-60 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 border-t-4 border-x-4 border-amber-300 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)] relative overflow-hidden">
                    <Trophy className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 text-amber-950 mb-1 z-10" />
                    <span className="text-3xl sm:text-6xl md:text-7xl font-black text-amber-950 z-10">1º</span>
                    <span className="text-[10px] sm:text-xs md:text-sm uppercase font-black tracking-widest text-amber-950 z-10">
                      Campeã Geral TNB!
                    </span>
                  </div>
                </div>
              )}

              {/* 3º Lugar */}
              {thirdPlace && (
                <div className="flex flex-col items-center w-full">
                  <div
                    className="w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all text-white font-black border-2 border-white/60"
                    style={{ backgroundColor: thirdPlace.team.color }}
                  >
                    <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                      {thirdPlace.team.name}
                    </span>
                  </div>

                  <p className={`text-base sm:text-xl md:text-2xl font-black my-1 sm:my-2 ${isLight ? 'text-amber-950' : 'text-amber-500'
                    }`}>
                    {thirdPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold opacity-70">pts</span>
                  </p>

                  <div className="w-full h-22 sm:h-30 md:h-36 rounded-t-3xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-x-4 border-amber-700 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                    <Award className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-amber-300 mb-0.5 z-10" />
                    <span className="text-xl sm:text-3xl md:text-4xl font-black text-amber-200 z-10">3º</span>
                    <span className="text-[9px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-300 z-10">
                      Medalha de Bronze
                    </span>
                  </div>
                </div>
              )}

              {/* 4º Lugar */}
              {fourthPlace && (
                <div className="flex flex-col items-center w-full">
                  <div
                    className="w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all text-slate-950 font-black border-2 border-slate-300"
                    style={{ backgroundColor: fourthPlace.team.color }}
                  >
                    <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                      {fourthPlace.team.name}
                    </span>
                  </div>

                  <p className={`text-sm sm:text-lg md:text-xl font-black my-1 sm:my-2 ${isLight ? 'text-slate-900' : 'text-slate-300'
                    }`}>
                    {fourthPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold opacity-70">pts</span>
                  </p>

                  <div className="w-full h-18 sm:h-24 md:h-28 rounded-t-3xl bg-gradient-to-t from-slate-900 to-slate-800 border-t-4 border-x-4 border-slate-600 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                    <Award className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-300 mb-0.5 z-10" />
                    <span className="text-lg sm:text-2xl md:text-3xl font-black text-slate-300 z-10">4º</span>
                    <span className="text-[8px] sm:text-xs uppercase font-bold tracking-widest text-amber-300/80 z-10">
                      Medalha de Honra
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demais Equipes (caso haja > 4) */}
        {otherPlaces.length > 0 && (
          <div className="max-w-4xl mx-auto w-full space-y-2 mt-4">
            <h4 className={`text-xs uppercase tracking-wider font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-slate-400'
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

      {/* Footer Oficial */}
      <footer
        className={`relative z-10 border-t border-white/10 pt-3 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-2 ${isLight ? 'text-slate-900 font-bold' : 'text-slate-400'
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
