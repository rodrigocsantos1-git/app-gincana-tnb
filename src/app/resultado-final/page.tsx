'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  RotateCcw,
  ChevronRight,
  Tv,
  HelpCircle,
  PartyPopper,
  AlertTriangle,
  Sun,
  Moon,
  Drum,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkAllActivitiesCompletion } from '@/lib/taskCompletion';
import { VinylAudioPlayer } from '@/components/VinylAudioPlayer';
import { useTheme } from '@/components/ThemeProvider';
import { getTeamLogo } from '@/lib/teamLogos';

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

export default function ResultadoFinalPage() {
  const { standings, scores, teams, activities, realtimeConnected } = useGincanaData();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPendingDetails, setShowPendingDetails] = useState(false);

  const { incompleteActivities, hasAnyIncomplete } = checkAllActivitiesCompletion(activities, teams, scores);

  // Etapas de revelação da cerimônia:
  // 0 = Nenhum revelado (Suspense total)
  // 1 = 4º Lugar revelado
  // 2 = 3º Lugar revelado
  // 3 = 2º e 1º Lugares revelados juntos (Prata e Campeão)
  const [revealStep, setRevealStep] = useState<number>(0);

  // Estados de controle da revelação com áudio dos tambores:
  const [isDrumming, setIsDrumming] = useState(false);
  const [targetStep, setTargetStep] = useState<number | null>(null);

  const drumAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentRepetitionRef = useRef<number>(0);
  const targetRepetitionsRef = useRef<number>(0);
  const targetStepRef = useRef<number | null>(null);
  const confettiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearConfettiInterval = () => {
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }
  };

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

  // 1. Confete para o 4º Lugar (4 segundos)
  const triggerFourthPlaceConfetti = useCallback(() => {
    clearConfettiInterval();
    const end = Date.now() + 4 * 1000;
    const colors = ['#78c8fb', '#38bdf8', '#f59e0b', '#ffffff', '#a855f7'];

    confetti({
      particleCount: 180,
      spread: 85,
      origin: { y: 0.6 },
      colors,
    });

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 65,
        origin: { x: 0.1, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 65,
        origin: { x: 0.9, y: 0.65 },
        colors,
      });
    }, 380);

    confettiIntervalRef.current = interval;
  }, []);

  // 2. Confete para o 3º Lugar (6 segundos)
  const triggerThirdPlaceConfetti = useCallback(() => {
    clearConfettiInterval();
    const end = Date.now() + 6 * 1000;
    const colors = ['#d97706', '#f59e0b', '#fbbf24', '#78c8fb', '#ffffff', '#10b981'];

    confetti({
      particleCount: 260,
      spread: 100,
      origin: { y: 0.55 },
      colors,
    });

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 55,
        angle: 55,
        spread: 75,
        origin: { x: 0.05, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 55,
        angle: 125,
        spread: 75,
        origin: { x: 0.95, y: 0.6 },
        colors,
      });
    }, 360);

    confettiIntervalRef.current = interval;
  }, []);

  // 3. Chuva épica de confete para o 2º e 1º Lugares (10 segundos)
  const triggerChampionConfetti = useCallback(() => {
    clearConfettiInterval();
    const end = Date.now() + 10 * 1000;
    const colors = ['#f59e0b', '#fbbf24', '#eab308', '#78c8fb', '#bb94ff', '#ffffff', '#10b981', '#ec4899'];

    confetti({
      particleCount: 320,
      spread: 130,
      origin: { y: 0.45 },
      colors,
    });
    confetti({
      particleCount: 160,
      angle: 60,
      spread: 85,
      origin: { x: 0, y: 0.55 },
      colors,
    });
    confetti({
      particleCount: 160,
      angle: 120,
      spread: 85,
      origin: { x: 1, y: 0.55 },
      colors,
    });

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 75,
        origin: { x: 0.02, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 75,
        origin: { x: 0.98, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 85,
        spread: 120,
        origin: { x: 0.5, y: 0.25 },
        colors: ['#fbbf24', '#f59e0b', '#ffffff', '#fef08a'],
      });
    }, 340);

    confettiIntervalRef.current = interval;
  }, []);

  // Finaliza a bateria de suspense e revela o ganhador
  const finishDrumRevelation = useCallback(() => {
    const step = targetStepRef.current;
    if (drumAudioRef.current) {
      drumAudioRef.current.onended = null;
      drumAudioRef.current.pause();
      drumAudioRef.current.currentTime = 0;
    }
    setIsDrumming(false);
    setTargetStep(null);
    targetStepRef.current = null;

    if (step !== null) {
      setRevealStep(step);
      if (step === 1) triggerFourthPlaceConfetti();
      else if (step === 2) triggerThirdPlaceConfetti();
      else if (step === 3) triggerChampionConfetti();
    }
  }, [triggerFourthPlaceConfetti, triggerThirdPlaceConfetti, triggerChampionConfetti]);

  // Inicia a execução dos tambores (1x para 4º, 2x para 3º, 4x para campeão)
  const startDrumRevelation = useCallback((step: number, repetitions: number) => {
    setIsDrumming(true);
    setTargetStep(step);
    targetStepRef.current = step;
    targetRepetitionsRef.current = repetitions;
    currentRepetitionRef.current = 1;

    let audio = drumAudioRef.current;
    if (!audio) {
      audio = new Audio('/Tambores.mp3');
      audio.preload = 'auto';
      audio.volume = 1.0;
      drumAudioRef.current = audio;
    }

    audio.onended = () => {
      if (currentRepetitionRef.current < targetRepetitionsRef.current) {
        currentRepetitionRef.current += 1;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        finishDrumRevelation();
      }
    };

    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn('Erro ao reproduzir Tambores.mp3:', err);
      finishDrumRevelation();
    });
  }, [finishDrumRevelation]);

  const advanceStep = useCallback(() => {
    if (isDrumming && targetStepRef.current !== null) {
      finishDrumRevelation();
      return;
    }

    if (revealStep === 0) {
      startDrumRevelation(1, 1); // 4º Lugar: 1x tambores
    } else if (revealStep === 1) {
      startDrumRevelation(2, 2); // 3º Lugar: 2x tambores
    } else if (revealStep === 2) {
      startDrumRevelation(3, 4); // 2º e 1º Lugares: 4x tambores
    } else if (revealStep === 3) {
      triggerChampionConfetti();
    }
  }, [isDrumming, revealStep, startDrumRevelation, finishDrumRevelation, triggerChampionConfetti]);

  const resetCeremony = useCallback(() => {
    if (drumAudioRef.current) {
      drumAudioRef.current.onended = null;
      drumAudioRef.current.pause();
      drumAudioRef.current.currentTime = 0;
    }
    clearConfettiInterval();
    setIsDrumming(false);
    setTargetStep(null);
    targetStepRef.current = null;
    setRevealStep(0);
  }, []);

  useEffect(() => {
    return () => {
      if (drumAudioRef.current) {
        drumAudioRef.current.onended = null;
        drumAudioRef.current.pause();
        drumAudioRef.current.currentTime = 0;
      }
      clearConfettiInterval();
    };
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        advanceStep();
      } else if (e.code === 'KeyR') {
        resetCeremony();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceStep, resetCeremony]);

  const firstPlace = standings[0];
  const secondPlace = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;
  const fourthPlace = standings.length > 3 ? standings[3] : null;

  const isFourthRevealed = revealStep >= 1;
  const isThirdRevealed = revealStep >= 2;
  const isTopTwoRevealed = revealStep >= 3;

  const isDrummingTop = isDrumming && targetStep === 3;
  const isDrumming3rd = isDrumming && targetStep === 2;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none overflow-x-hidden relative transition-colors duration-500 ${
        isLight
          ? 'bg-[#78c8fb] [background-image:radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.55)_0%,transparent_35%),radial-gradient(circle_at_88%_20%,rgba(187,148,255,0.35)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(159,224,255,0.50)_0%,transparent_55%),linear-gradient(145deg,#78c8fb_0%,#6bc0f5_45%,#7ecdfb_100%)] text-slate-900'
          : 'bg-[#090d16] [background-image:radial-gradient(circle_at_12%_14%,rgba(120,200,251,0.12)_0%,transparent_35%),radial-gradient(circle_at_88%_20%,rgba(187,148,255,0.15)_0%,transparent_40%),radial-gradient(circle_at_50%_85%,rgba(91,33,182,0.25)_0%,transparent_60%),linear-gradient(160deg,#090d16_0%,#0f172a_45%,#1e1b4b_100%)] text-white'
      }`}
    >
      {/* Luzes Volumétricas */}
      <div className="fixed inset-0 pointer-events-none opacity-25">
        <div className={`absolute top-10 left-10 w-96 h-96 ${isLight ? 'bg-white' : 'bg-[#78c8fb]'} rounded-full blur-[140px]`} />
        <div className={`absolute bottom-10 right-10 w-96 h-96 ${isLight ? 'bg-sky-200' : 'bg-[#bb94ff]'} rounded-full blur-[140px]`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] ${isLight ? 'bg-amber-200' : 'bg-[#f59e0b]'} rounded-full blur-[180px] opacity-30`} />
      </div>

      {/* Header Superior */}
      <header className={`relative z-20 flex items-center justify-between border-b pb-4 ${isLight ? 'border-sky-300/60' : 'border-white/10'}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/telao"
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors border shrink-0 ${
              isLight
                ? 'bg-white/80 hover:bg-white text-slate-800 border-white/90 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            title="Voltar ao Telão Regular"
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
                <h1 className={`text-base sm:text-2xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <span>Resultado Final</span>
                  <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
                </h1>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black bg-amber-500/30 text-amber-300 border border-amber-400/50">
                  CERIMÔNIA
                </span>
              </div>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-sky-950 font-bold' : 'text-slate-400 font-medium'}`}>
                Ministério Infantil Tô na Bênção • Treinando Campeões (Filipenses 3:14)
              </p>
              <p className={`text-sm sm:text-base md:text-lg font-bold italic leading-snug mt-1 max-w-3xl drop-shadow-sm ${
                isLight ? 'text-amber-950 font-extrabold' : 'text-amber-200/95'
              }`}>
                “Corro direto para a linha de chegada a fim de conseguir o prêmio da vitória. Esse prêmio é a nova vida para a qual Deus me chamou por meio de Cristo Jesus.”
              </p>
            </div>
          </div>
        </div>

        {/* Controles do Cabeçalho */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-md ${
              isLight
                ? 'bg-white/80 hover:bg-white text-slate-800 border-white/90'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            title="Alternar tema"
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-sky-800" />
                <span className="hidden sm:inline text-sky-900 font-extrabold">Escuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-amber-300 font-extrabold">Claro</span>
              </>
            )}
          </button>

          <VinylAudioPlayer />

          <Link
            href="/telao"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              isLight
                ? 'bg-white/80 hover:bg-white text-slate-800 border-white/90 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
            }`}
          >
            <Tv className="w-4 h-4 text-[#0284c7]" />
            <span>Ver Telão de Provas</span>
          </Link>

          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            isLight ? 'bg-white/60 border-white/80 text-slate-800' : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <Wifi className={`w-3.5 h-3.5 ${realtimeConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{realtimeConnected ? 'Ao Vivo' : 'Offline'}</span>
          </div>

          <button
            onClick={() => {
              if (revealStep === 3) triggerChampionConfetti();
              else if (revealStep === 2) triggerThirdPlaceConfetti();
              else triggerFourthPlaceConfetti();
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-300 shadow-sm'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
            }`}
            title="Soltar Confetes"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isLight ? 'bg-white/80 hover:bg-white text-slate-800 border-white/90 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white border-transparent'
            }`}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Alerta de Auditoria Preventiva (Provas Pendentes) */}
      {hasAnyIncomplete && (
        <section className="relative z-20 my-3 max-w-3xl mx-auto w-full text-left">
          <div className="p-4 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 backdrop-blur-xl shadow-2xl space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-tight text-white">
                  Atenção: Há tarefas não finalizadas por algumas equipes!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPendingDetails(!showPendingDetails)}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {showPendingDetails ? 'Ocultar' : `Ver ${incompleteActivities.length} Provas`}
              </button>
            </div>
            <p className="text-xs text-amber-100/90 font-medium">
              Antes de anunciar o campeão no telão, verifique se todas as notas e rodadas já foram devidamente registradas.
            </p>

            {showPendingDetails && (
              <div className="space-y-1.5 pt-2 border-t border-amber-400/30">
                {incompleteActivities.map((act) => (
                  <div key={act.activity.id} className="text-xs bg-black/40 p-2.5 rounded-xl border border-amber-400/20">
                    <span className="font-black text-amber-300">📌 {act.activity.title}:</span>{' '}
                    <span className="text-slate-200">
                      Falta para{' '}
                      {act.missingTeams.map((m) => `${m.team?.name || 'Equipe'} (${m.scoresCount}/${act.requiredRounds})`).join(', ')}
                    </span>
                  </div>
                ))}
                <div className="pt-1 flex justify-end">
                  <Link
                    href="/"
                    className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>Lançar Pontos Pendentes no Painel</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Painel Central de Controle do Mestre de Cerimônias */}
      <section className="relative z-20 my-4 max-w-3xl mx-auto w-full text-center">
        <div className={`p-3 sm:p-4 rounded-3xl backdrop-blur-xl border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'bg-white/80 border-white/90 text-slate-900' : 'bg-white/10 border-white/20 text-white'
        }`}>
          <div className="text-left w-full sm:w-auto">
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block ${
              isDrumming ? 'text-amber-500 animate-pulse' : isLight ? 'text-sky-800' : 'text-[#78c8fb]'
            }`}>
              {isDrumming ? '🥁 Rufando os Tambores...' : revealStep === 0 ? 'Passo 0 de 3 • Aguardando Início' : revealStep === 1 ? 'Passo 1 de 3 • 4º Lugar Revelado' : revealStep === 2 ? 'Passo 2 de 3 • 3º Lugar Revelado' : 'Passo 3 de 3 • Pódio Completo Revelado! 🎉'}
            </span>
            <h2 className={`text-sm sm:text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isDrumming ? (
                targetStep === 1
                  ? 'Segura a emoção! Revelando o 4º Lugar...'
                  : targetStep === 2
                  ? 'Quem será o 3º Lugar? Rufem os tambores!'
                  : 'É a grande hora! Conhecendo o Grande Campeão!'
              ) : (
                revealStep === 0
                  ? 'Prepare a plateia para o resultado final!'
                  : revealStep === 1
                  ? 'Parabéns ao 4º Lugar! Próximo: 3º Lugar.'
                  : revealStep === 2
                  ? 'Hora de conhecer o 2º e o grande Campeão!'
                  : 'Glória a Deus! Parabéns a todas as equipes!'
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {revealStep > 0 && (
              <button
                onClick={resetCeremony}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isLight ? 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title="Reiniciar Cerimônia do Início (Tecla R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            )}

            <button
              onClick={advanceStep}
              className={`px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial ${
                isDrumming
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-amber-950 ring-4 ring-amber-400 animate-pulse shadow-amber-500/50'
                  : revealStep === 3
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-amber-950 hover:brightness-110 shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-gradient-to-r from-[#0284c7] via-[#78c8fb] to-[#bb94ff] text-white hover:opacity-95 shadow-blue-500/30'
              }`}
            >
              {isDrumming ? (
                <>
                  <Drum className="w-5 h-5 text-amber-950 animate-bounce" />
                  <span>🥁 Rufando os Tambores...</span>
                </>
              ) : revealStep === 0 ? (
                <>
                  <PartyPopper className="w-5 h-5" />
                  <span>Iniciar Revelação (Mostrar 4º Lugar)</span>
                </>
              ) : revealStep === 1 ? (
                <>
                  <Medal className="w-5 h-5" />
                  <span>Revelar 3º Lugar (Bronze)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : revealStep === 2 ? (
                <>
                  <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span>Revelar 2º e 1º Lugares!</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Soltar Mais Confetes! 🎉</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* PÓDIO MONUMENTAL (Ordem: 2º Lugar | 1º Lugar | 3º Lugar | 4º Lugar) */}
      <main className="relative z-10 flex-1 my-2 sm:my-4 flex flex-col justify-center w-full max-w-[98vw] 2xl:max-w-[1850px] mx-auto px-1 sm:px-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 items-end mx-auto w-full max-w-[98vw] 2xl:max-w-[1850px] pt-4 sm:pt-6">
          {/* 2º LUGAR */}
          {secondPlace && (
            <div className="flex flex-col items-center w-full">
              {isTopTwoRevealed ? (
                (() => {
                  const style = getTeamStyle(secondPlace.team);
                  const logo = getTeamLogo(secondPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-75 fade-in duration-700">
                      {logo && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden mb-2 shadow-2xl border-2 border-white/60 bg-white/10 relative hover:scale-105 transition-transform flex-shrink-0">
                          <Image src={logo} alt={`Logo ${secondPlace.team.name}`} fill className="object-contain p-1" />
                        </div>
                      )}

                      <div
                        className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                        style={{ backgroundColor: secondPlace.team.color, boxShadow: style.boxShadow }}
                      >
                        {logo && (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden relative flex-shrink-0 border border-white/40 bg-white/10">
                            <Image src={logo} alt="" fill className="object-contain p-0.5" />
                          </div>
                        )}
                        <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                          {secondPlace.team.name}
                        </span>
                      </div>

                      <p className={`text-lg sm:text-2xl md:text-3xl font-black my-1 sm:my-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
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
                  );
                })()
              ) : (
                <div className={`flex flex-col items-center w-full transition-all duration-300 ${isDrummingTop ? 'scale-105' : 'opacity-60'}`}>
                  <div className={`w-full max-w-[260px] py-2.5 sm:py-3.5 px-3 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center gap-2 ${
                    isDrummingTop
                      ? 'bg-slate-200 text-slate-950 border-white ring-4 ring-slate-300 shadow-2xl animate-pulse'
                      : isLight
                      ? 'bg-white/70 border-white/90 text-slate-800 border-dashed'
                      : 'bg-slate-900 border-slate-700 border-dashed'
                  }`}>
                    {isDrummingTop ? (
                      <span className="text-xs sm:text-sm font-black uppercase">🥁 RUFANDO...</span>
                    ) : (
                      <>
                        <HelpCircle className="w-5 h-5 text-slate-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold uppercase">???</span>
                      </>
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-bold my-1 sm:my-2 opacity-60">? pts</span>

                  <div className={`w-full h-28 sm:h-38 md:h-44 rounded-t-3xl border-t-2 border-x-2 flex flex-col items-center justify-center ${
                    isDrummingTop ? 'bg-slate-700/50 border-slate-400 animate-pulse' : 'bg-slate-900/60 border-slate-800 border-dashed'
                  }`}>
                    <span className="text-2xl sm:text-4xl font-black opacity-40">2º</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1º LUGAR */}
          {firstPlace && (
            <div className="flex flex-col items-center w-full relative -top-4 sm:-top-6">
              {isTopTwoRevealed ? (
                (() => {
                  const style = getTeamStyle(firstPlace.team);
                  const logo = getTeamLogo(firstPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-50 fade-in duration-1000">
                      <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] mb-1" />

                      {logo && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden mb-2 shadow-[0_0_30px_rgba(251,191,36,0.6)] border-2 border-amber-300 bg-white/20 relative hover:scale-105 transition-transform flex-shrink-0">
                          <Image src={logo} alt={`Logo ${firstPlace.team.name}`} fill className="object-contain p-1" />
                        </div>
                      )}

                      <div
                        className={`w-full max-w-md py-3 sm:py-4 px-2 sm:px-5 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 text-center shadow-2xl transition-all ${style.textColor} ${style.border}`}
                        style={{ backgroundColor: firstPlace.team.color, boxShadow: style.boxShadow }}
                      >
                        {logo && (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden relative flex-shrink-0 border border-white/50 bg-white/10">
                            <Image src={logo} alt="" fill className="object-contain p-0.5" />
                          </div>
                        )}
                        <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-wider truncate px-1">
                          {firstPlace.team.name}
                        </span>
                      </div>

                      <p className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black my-1 sm:my-2 drop-shadow-lg ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
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
                  );
                })()
              ) : (
                <div className={`flex flex-col items-center w-full transition-all duration-300 ${isDrummingTop ? 'scale-105' : 'opacity-60'}`}>
                  <div className={`w-full max-w-md py-3 sm:py-4 px-3 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center gap-2 ${
                    isDrummingTop
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)] animate-pulse'
                      : isLight
                      ? 'bg-amber-300/40 border-amber-400 text-amber-950 border-dashed'
                      : 'bg-slate-900 border-amber-500/50 border-dashed'
                  }`}>
                    {isDrummingTop ? (
                      <span className="text-sm sm:text-lg font-black uppercase">👑 RUFANDO TAMBORES...</span>
                    ) : (
                      <>
                        <Crown className="w-6 h-6 text-amber-500 animate-bounce" />
                        <span className="text-sm sm:text-lg font-black uppercase">???</span>
                      </>
                    )}
                  </div>

                  <span className="text-sm sm:text-base font-black my-1 sm:my-2 opacity-50">? pts</span>

                  <div className={`w-full h-36 sm:h-52 md:h-60 rounded-t-3xl border-t-2 border-x-2 flex flex-col items-center justify-center ${
                    isDrummingTop ? 'bg-amber-500/40 border-amber-300 animate-pulse' : 'bg-slate-900/60 border-amber-500/30 border-dashed'
                  }`}>
                    <span className="text-3xl sm:text-6xl font-black opacity-30">1º</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3º LUGAR */}
          {thirdPlace && (
            <div className="flex flex-col items-center w-full">
              {isThirdRevealed ? (
                (() => {
                  const style = getTeamStyle(thirdPlace.team);
                  const logo = getTeamLogo(thirdPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-75 fade-in duration-700">
                      {logo && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden mb-2 shadow-2xl border-2 border-white/60 bg-white/10 relative hover:scale-105 transition-transform flex-shrink-0">
                          <Image src={logo} alt={`Logo ${thirdPlace.team.name}`} fill className="object-contain p-1" />
                        </div>
                      )}

                      <div
                        className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                        style={{ backgroundColor: thirdPlace.team.color, boxShadow: style.boxShadow }}
                      >
                        {logo && (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden relative flex-shrink-0 border border-white/40 bg-white/10">
                            <Image src={logo} alt="" fill className="object-contain p-0.5" />
                          </div>
                        )}
                        <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                          {thirdPlace.team.name}
                        </span>
                      </div>

                      <p className={`text-base sm:text-xl md:text-2xl font-black my-1 sm:my-2 ${isLight ? 'text-amber-900' : 'text-amber-500'}`}>
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
                  );
                })()
              ) : (
                <div className={`flex flex-col items-center w-full transition-all duration-300 ${isDrumming3rd ? 'scale-105' : 'opacity-60'}`}>
                  <div className={`w-full max-w-sm py-2.5 sm:py-3.5 px-3 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center gap-2 ${
                    isDrumming3rd
                      ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-300 animate-pulse'
                      : isLight
                      ? 'bg-white/70 border-white/90 text-slate-800 border-dashed'
                      : 'bg-slate-900 border-slate-700 border-dashed'
                  }`}>
                    {isDrumming3rd ? (
                      <span className="text-xs sm:text-sm font-black uppercase">🥁 RUFANDO...</span>
                    ) : (
                      <>
                        <HelpCircle className="w-5 h-5 text-slate-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold uppercase">???</span>
                      </>
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-bold my-1 sm:my-2 opacity-60">? pts</span>

                  <div className={`w-full h-22 sm:h-30 md:h-36 rounded-t-3xl border-t-2 border-x-2 flex flex-col items-center justify-center ${
                    isDrumming3rd ? 'bg-amber-500/30 border-amber-400 animate-pulse' : 'bg-slate-900/60 border-slate-800 border-dashed'
                  }`}>
                    <span className="text-xl sm:text-3xl font-black opacity-40">3º</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4º LUGAR */}
          {fourthPlace && (
            <div className="flex flex-col items-center w-full">
              {isFourthRevealed ? (
                (() => {
                  const style = getTeamStyle(fourthPlace.team);
                  const logo = getTeamLogo(fourthPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-75 fade-in duration-700">
                      {logo && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden mb-2 shadow-2xl border-2 border-white/60 bg-white/10 relative hover:scale-105 transition-transform flex-shrink-0">
                          <Image src={logo} alt={`Logo ${fourthPlace.team.name}`} fill className="object-contain p-1" />
                        </div>
                      )}

                      <div
                        className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                        style={{ backgroundColor: fourthPlace.team.color, boxShadow: style.boxShadow }}
                      >
                        {logo && (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden relative flex-shrink-0 border border-white/40 bg-white/10">
                            <Image src={logo} alt="" fill className="object-contain p-0.5" />
                          </div>
                        )}
                        <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase tracking-wider truncate px-1">
                          {fourthPlace.team.name}
                        </span>
                      </div>

                      <p className={`text-sm sm:text-lg md:text-xl font-black my-1 sm:my-2 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
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
                  );
                })()
              ) : (
                <div className="flex flex-col items-center w-full opacity-60">
                  <div className={`w-full max-w-sm py-2.5 sm:py-3.5 px-3 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center gap-2 ${
                    isLight ? 'bg-white/70 border-white/90 text-slate-800 border-dashed' : 'bg-slate-900 border-slate-700 border-dashed'
                  }`}>
                    <HelpCircle className="w-5 h-5 text-slate-400 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold uppercase">???</span>
                  </div>

                  <span className="text-xs sm:text-sm font-bold my-1 sm:my-2 opacity-60">? pts</span>

                  <div className="w-full h-18 sm:h-24 md:h-28 rounded-t-3xl border-t-2 border-x-2 border-dashed border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl font-black opacity-40">4º</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


      </main>

      {/* Footer */}
      <footer className={`relative z-20 border-t border-white/10 pt-3 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-2 ${
        isLight ? 'text-sky-950 font-bold' : 'text-slate-400'
      }`}>
        <span>© {new Date().getFullYear()} Ministério Infantil Tô na Bênção • IBP</span>
        <span className={`italic font-bold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
          &quot;Alegrei-me quando me disseram: Vamos à casa do Senhor&quot; (Salmos 122:1)
        </span>
        <div className="flex items-center gap-3">
          <Link href="/telao" className="hover:text-sky-400 font-bold transition-colors">
            Modo Telão
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
