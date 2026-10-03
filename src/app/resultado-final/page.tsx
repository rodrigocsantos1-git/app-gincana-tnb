'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RotateCcw,
  ChevronRight,
  Tv,
  HelpCircle,
  PartyPopper,
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

export default function ResultadoFinalPage() {
  const { standings, realtimeConnected } = useGincanaData();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Etapas de revelação da cerimônia:
  // 0 = Nenhum revelado (Suspense total)
  // 1 = 4º Lugar revelado (último colocado)
  // 2 = 3º Lugar revelado (Bronze)
  // 3 = 2º e 1º Lugares revelados juntos (Prata e Grande Campeão Ouro!)
  const [revealStep, setRevealStep] = useState<number>(0);

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

  // Confete moderado para o 4º Lugar
  const triggerFourthPlaceConfetti = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#78c8fb', '#94a3b8', '#ffffff'],
    });
  }, []);

  // Confete moderado para o 3º Lugar
  const triggerThirdPlaceConfetti = useCallback(() => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d97706', '#f59e0b', '#78c8fb', '#ffffff'],
    });
  }, []);

  // Confete massivo e prolongado para o 2º e 1º Lugares (Grande Final!)
  const triggerChampionConfetti = useCallback(() => {
    // 1ª Salva Central imediata
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#78c8fb', '#bb94ff', '#ffffff', '#10b981'],
    });

    // 2ª Salva Lateral Esquerda após 300ms
    setTimeout(() => {
      confetti({
        particleCount: 130,
        angle: 60,
        spread: 75,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#bb94ff', '#ffffff'],
      });
    }, 300);

    // 3ª Salva Lateral Direita após 600ms
    setTimeout(() => {
      confetti({
        particleCount: 130,
        angle: 120,
        spread: 75,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#78c8fb', '#f59e0b', '#bb94ff', '#ffffff'],
      });
    }, 600);

    // 4ª Chuva Cascata Dourada após 900ms
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 120,
        origin: { y: 0.35 },
        colors: ['#fbbf24', '#f59e0b', '#ffffff', '#10b981'],
      });
    }, 900);
  }, []);

  // Avançar passo com disparo automático do efeito de confete
  const advanceStep = () => {
    if (revealStep === 0) {
      setRevealStep(1);
      triggerFourthPlaceConfetti();
    } else if (revealStep === 1) {
      setRevealStep(2);
      triggerThirdPlaceConfetti();
    } else if (revealStep === 2) {
      setRevealStep(3);
      triggerChampionConfetti();
    } else if (revealStep === 3) {
      // Já está completo, se clicar novamente, comemora com chuva de confetes
      triggerChampionConfetti();
    }
  };

  const resetCeremony = () => {
    setRevealStep(0);
  };

  // Atalho de teclado: Barra de espaço ou Seta para a direita avança a revelação
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
  }, [revealStep, triggerFourthPlaceConfetti, triggerThirdPlaceConfetti, triggerChampionConfetti]);

  const firstPlace = standings[0];
  const secondPlace = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;
  const fourthPlace = standings.length > 3 ? standings[3] : null;

  const isFourthRevealed = revealStep >= 1;
  const isThirdRevealed = revealStep >= 2;
  const isTopTwoRevealed = revealStep >= 3;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none overflow-x-hidden relative">
      {/* Luzes Volumétricas e Efeitos Visuais de Fundo */}
      <div className="fixed inset-0 pointer-events-none opacity-25">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#78c8fb] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#bb94ff] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-[#f59e0b] rounded-full blur-[180px] opacity-30" />
      </div>

      {/* Barra Superior de Navegação e Controles */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/telao"
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Voltar ao Telão Regular"
          >
            <ArrowLeft className="w-5 h-5" />
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
                <h1 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-2">
                  <span>Resultado Final</span>
                  <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
                </h1>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black bg-amber-500/30 text-amber-300 border border-amber-400/50">
                  CERIMÔNIA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:block">
                Ministério Infantil Tô na Bênção • Treinando Campeões (Filipenses 3:14)
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Apresentação e Tela Cheia */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/telao"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
            title="Ver pontuação por provas executadas"
          >
            <Tv className="w-4 h-4 text-[#78c8fb]" />
            <span>Ver Telão de Provas</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
            <Wifi className={`w-3.5 h-3.5 ${realtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{realtimeConnected ? 'Ao Vivo' : 'Offline'}</span>
          </div>

          <button
            onClick={() => {
              if (revealStep === 3) triggerChampionConfetti();
              else if (revealStep === 2) triggerThirdPlaceConfetti();
              else triggerFourthPlaceConfetti();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 cursor-pointer"
            title="Soltar Confetes Manualmente"
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

      {/* Painel Central de Controle do Apresentador (O Botão de Revelação) */}
      <section className="relative z-20 my-4 max-w-3xl mx-auto w-full text-center">
        <div className="p-3 sm:p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Indicador de Status da Revelação */}
          <div className="text-left w-full sm:w-auto">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#78c8fb] block">
              {revealStep === 0 && 'Passo 0 de 3 • Aguardando Início'}
              {revealStep === 1 && 'Passo 1 de 3 • 4º Lugar Revelado'}
              {revealStep === 2 && 'Passo 2 de 3 • 3º Lugar Revelado'}
              {revealStep === 3 && 'Passo 3 de 3 • Pódio Completo Revelado! 🎉'}
            </span>
            <h2 className="text-sm sm:text-base font-black text-white">
              {revealStep === 0 && 'Prepare a plateia para o resultado final!'}
              {revealStep === 1 && 'Parabéns ao 4º Lugar! Próximo: 3º Lugar.'}
              {revealStep === 2 && 'Hora de conhecer o 2º e o grande Campeão!'}
              {revealStep === 3 && 'Glória a Deus! Parabéns a todas as equipes!'}
            </h2>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {revealStep > 0 && (
              <button
                onClick={resetCeremony}
                className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reiniciar Cerimônia do Início"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            )}

            <button
              onClick={advanceStep}
              className={`px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial ${
                revealStep === 3
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-amber-950 hover:brightness-110 shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-gradient-to-r from-[#0284c7] via-[#78c8fb] to-[#bb94ff] text-white hover:opacity-95 shadow-blue-500/30'
              }`}
            >
              {revealStep === 0 && (
                <>
                  <PartyPopper className="w-5 h-5" />
                  <span>Iniciar Revelação (Mostrar 4º Lugar)</span>
                </>
              )}
              {revealStep === 1 && (
                <>
                  <Medal className="w-5 h-5" />
                  <span>Revelar 3º Lugar (Bronze)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
              {revealStep === 2 && (
                <>
                  <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span>Revelar 2º e 1º Lugares!</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
              {revealStep === 3 && (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Soltar Mais Confetes! 🎉</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* O PÓDIO DA REVELAÇÃO (Ordem: 2º Lugar | 1º Lugar | 3º Lugar | 4º Lugar) */}
      <main className="relative z-10 flex-1 my-2 sm:my-4 flex flex-col justify-center w-full max-w-[98vw] 2xl:max-w-[1850px] mx-auto px-1 sm:px-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 items-end mx-auto w-full max-w-[98vw] 2xl:max-w-[1850px] pt-4 sm:pt-6">
          {/* ========================================================== */}
          {/* 2º LUGAR (Prata - Revelado no Passo 3 junto com o 1º Lugar) */}
          {/* ========================================================== */}
          {secondPlace && (
            <div className="flex flex-col items-center w-full">
              {isTopTwoRevealed ? (
                (() => {
                  const style = getTeamStyle(secondPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-75 fade-in duration-700">
                      {/* Placa / Banner da Equipe 2º Lugar */}
                      <div
                        className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                        style={{
                          backgroundColor: secondPlace.team.color,
                          boxShadow: style.boxShadow,
                        }}
                        title={secondPlace.team.name}
                      >
                        <span className="text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis block text-center px-1">
                          {secondPlace.team.name}
                        </span>
                      </div>

                      {/* Pontos da Equipe */}
                      <p className="text-lg sm:text-2xl md:text-3xl font-black text-slate-200 my-1 sm:my-2">
                        {secondPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold text-slate-400">pts</span>
                      </p>

                      {/* Pilar do Pódio 2º Lugar */}
                      <div className="w-full h-28 sm:h-38 md:h-44 rounded-t-3xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-x-4 border-slate-500 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                        <Medal className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-300 mb-1 relative z-10" />
                        <span className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-200 relative z-10">2º</span>
                        <span className="text-[9px] sm:text-xs md:text-sm uppercase font-extrabold tracking-widest text-slate-300 relative z-10 text-center px-1">
                          Medalha de Prata
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Card de Suspense - 2º Lugar */
                <div className="flex flex-col items-center w-full opacity-60">
                  <div className="w-full max-w-[260px] py-2.5 sm:py-3.5 px-3 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">???</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-600 my-1 sm:my-2">? pts</span>
                  <div className="w-full h-28 sm:h-38 md:h-44 rounded-t-3xl bg-slate-900/60 border-t-2 border-x-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-4xl font-black text-slate-700">2º</span>
                    <span className="text-[9px] sm:text-xs uppercase font-bold text-slate-600 mt-1">Aguardando</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 1º LUGAR (Ouro / Grande Campeão - Revelado no Passo 3!)     */}
          {/* ========================================================== */}
          {firstPlace && (
            <div className="flex flex-col items-center w-full relative -top-4 sm:-top-6">
              {isTopTwoRevealed ? (
                (() => {
                  const style = getTeamStyle(firstPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-50 fade-in duration-1000">
                      {/* Coroa Flutuante Gloriosa */}
                      <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400 animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] mb-1" />

                      {/* Placa / Banner do Time Campeão */}
                      <div
                        className={`w-full max-w-md py-3 sm:py-4 px-2 sm:px-5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-2xl transition-all ${style.textColor} ${style.border}`}
                        style={{
                          backgroundColor: firstPlace.team.color,
                          boxShadow: style.boxShadow,
                        }}
                        title={firstPlace.team.name}
                      >
                        <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis block text-center px-1">
                          {firstPlace.team.name}
                        </span>
                      </div>

                      {/* Pontos do Campeão */}
                      <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-amber-400 my-1 sm:my-2 drop-shadow-lg">
                        {firstPlace.totalPoints} <span className="text-xs sm:text-base font-bold text-amber-300/80">pts</span>
                      </p>

                      {/* Pilar do Pódio 1º Lugar */}
                      <div className="w-full h-36 sm:h-52 md:h-60 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 border-t-4 border-x-4 border-amber-300 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
                        <Trophy className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 text-amber-950 mb-1 relative z-10" />
                        <span className="text-3xl sm:text-6xl md:text-7xl font-black text-amber-950 relative z-10">1º</span>
                        <span className="text-[10px] sm:text-xs md:text-sm uppercase font-black tracking-widest text-amber-950 relative z-10 text-center px-1">
                          Campeã Geral TNB!
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Card de Suspense - 1º Lugar */
                <div className="flex flex-col items-center w-full opacity-60">
                  <div className="w-full max-w-md py-3 sm:py-4 px-3 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-dashed border-amber-500/50 flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500/50 animate-pulse" />
                    <span className="text-sm sm:text-base font-black text-amber-400/50 uppercase tracking-widest">???</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-amber-500/40 my-1 sm:my-2">? pts</span>
                  <div className="w-full h-36 sm:h-52 md:h-60 rounded-t-3xl bg-slate-900/60 border-t-2 border-x-2 border-dashed border-amber-500/30 flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-6xl font-black text-slate-700">1º</span>
                    <span className="text-[10px] sm:text-xs uppercase font-bold text-amber-500/50 mt-1">O Grande Campeão</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 3º LUGAR (Bronze - Revelado no Passo 2)                     */}
          {/* ========================================================== */}
          {thirdPlace && (
            <div className="flex flex-col items-center w-full">
              {isThirdRevealed ? (
                (() => {
                  const style = getTeamStyle(thirdPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-75 fade-in duration-700">
                      {/* Placa / Banner da Equipe 3º Lugar */}
                      <div
                        className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                        style={{
                          backgroundColor: thirdPlace.team.color,
                          boxShadow: style.boxShadow,
                        }}
                        title={thirdPlace.team.name}
                      >
                        <span className="text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis block text-center px-1">
                          {thirdPlace.team.name}
                        </span>
                      </div>

                      {/* Pontos da Equipe */}
                      <p className="text-base sm:text-xl md:text-2xl font-black text-amber-500 my-1 sm:my-2">
                        {thirdPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold text-amber-400/70">pts</span>
                      </p>

                      {/* Pilar do Pódio 3º Lugar */}
                      <div className="w-full h-22 sm:h-30 md:h-36 rounded-t-3xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-x-4 border-amber-700 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                        <Award className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-amber-300 mb-0.5 relative z-10" />
                        <span className="text-xl sm:text-3xl md:text-4xl font-black text-amber-200 relative z-10">3º</span>
                        <span className="text-[9px] sm:text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-amber-300 relative z-10 text-center px-1">
                          Medalha de Bronze
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Card de Suspense - 3º Lugar */
                <div className="flex flex-col items-center w-full opacity-60">
                  <div className="w-full max-w-sm py-2.5 sm:py-3.5 px-3 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">???</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-600 my-1 sm:my-2">? pts</span>
                  <div className="w-full h-22 sm:h-30 md:h-36 rounded-t-3xl bg-slate-900/60 border-t-2 border-x-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-3xl font-black text-slate-700">3º</span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-600 mt-1">Aguardando</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 4º LUGAR (Honra - Revelado Primeiro, no Passo 1!)           */}
          {/* ========================================================== */}
          {fourthPlace && (
            <div className="flex flex-col items-center w-full">
              {isFourthRevealed ? (
                (() => {
                  const style = getTeamStyle(fourthPlace.team);
                  return (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-75 fade-in duration-700">
                      {/* Placa / Banner da Equipe 4º Lugar */}
                      <div
                        className={`w-full max-w-sm py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-2xl sm:rounded-3xl flex items-center justify-center text-center shadow-xl transition-all ${style.textColor} ${style.border}`}
                        style={{
                          backgroundColor: fourthPlace.team.color,
                          boxShadow: style.boxShadow,
                        }}
                        title={fourthPlace.team.name}
                      >
                        <span className="text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis block text-center px-1">
                          {fourthPlace.team.name}
                        </span>
                      </div>

                      {/* Pontos da Equipe */}
                      <p className="text-sm sm:text-lg md:text-xl font-black text-slate-300 my-1 sm:my-2">
                        {fourthPlace.totalPoints} <span className="text-xs sm:text-sm font-semibold text-slate-400">pts</span>
                      </p>

                      {/* Pilar do Pódio 4º Lugar */}
                      <div className="w-full h-18 sm:h-24 md:h-28 rounded-t-3xl bg-gradient-to-t from-slate-900 to-slate-800 border-t-4 border-x-4 border-slate-600 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                        <Star className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-300 mb-0.5 relative z-10" />
                        <span className="text-lg sm:text-2xl md:text-3xl font-black text-slate-300 relative z-10">4º</span>
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400 relative z-10 text-center px-1">
                          Honra & Esforço
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Card de Suspense - 4º Lugar */
                <div className="flex flex-col items-center w-full opacity-60">
                  <div className="w-full max-w-sm py-2.5 sm:py-3.5 px-3 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">???</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 my-1 sm:my-2">? pts</span>
                  <div className="w-full h-18 sm:h-24 md:h-28 rounded-t-3xl bg-slate-900/60 border-t-2 border-x-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl font-black text-slate-700">4º</span>
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-600 mt-1">Aguardando</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Rodapé Oficial da Cerimônia */}
      <footer className="relative z-20 border-t border-white/10 pt-3 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Ministério Infantil Tô na Bênção • IBP</span>
        <span className="italic font-bold text-slate-300">&quot;Crianças com os olhos fixos em Jesus!&quot;</span>
        <div className="flex items-center gap-3">
          <Link href="/telao" className="hover:text-white transition-colors">Telão Geral</Link>
          <span>•</span>
          <Link href="/" className="hover:text-white transition-colors">Painel Admin</Link>
        </div>
      </footer>
    </div>
  );
}
