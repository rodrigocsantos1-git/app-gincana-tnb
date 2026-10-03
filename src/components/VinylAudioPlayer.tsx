'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

interface VinylAudioPlayerProps {
  audioSrc?: string;
  label?: string;
  className?: string;
  autoPlay?: boolean;
}

export function VinylAudioPlayer({
  audioSrc = '/Mais que Vencedores.mpeg',
  label = 'Mais que Vencedores',
  className = '',
  autoPlay = true,
}: VinylAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tentativa segura de reproduzir o áudio
  const startAudioPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = isMuted ? 0 : volume;
      await audio.play();
      setIsPlaying(true);
      setHasError(false);
    } catch (err) {
      console.log('Autoplay bloqueado pelo navegador aguardando interação do usuário:', err);
      // Registra gatilho na primeira interação do usuário na página
      const handleUserGesture = () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            setHasError(false);
          }).catch(() => {});
        }
        cleanupGestureListeners();
      };

      const cleanupGestureListeners = () => {
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
        window.removeEventListener('pointerdown', handleUserGesture);
        window.removeEventListener('keydown', handleUserGesture);
      };

      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('touchstart', handleUserGesture, { once: true });
      window.addEventListener('pointerdown', handleUserGesture, { once: true });
      window.addEventListener('keydown', handleUserGesture, { once: true });
    }
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => {
      setIsPlaying(true);
      setHasError(false);
    };

    const fallbackSources = [
      '/Mais que Vencedores.mpeg',
      '/Mais_que_Vencedores.mpeg',
      '/Mais que Vencedores.mp3',
      '/Mais_que_Vencedores.mp3',
      '/Audio_Acampa.mpeg',
      '/Audio_Acampa.mp3',
    ];

    const handleError = () => {
      const currentSrc = audio.currentSrc || audio.src;
      // Procura próxima fonte disponível
      const nextSource = fallbackSources.find((src) => !currentSrc.includes(encodeURI(src)) && !currentSrc.includes(src));
      if (nextSource) {
        audio.src = nextSource;
        audio.load();
        if (isPlaying || autoPlay) {
          audio.play().catch(() => {});
        }
      } else {
        setHasError(true);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    // Se autoPlay ativado, inicia imediatamente ao entrar na tela
    if (autoPlay) {
      startAudioPlayback();
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
    };
  }, [autoPlay, startAudioPlayback, volume, isMuted, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Falha ao iniciar áudio:', err);
        setHasError(true);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Audio Element invisível */}
      <audio ref={audioRef} preload="auto" autoPlay={autoPlay}>
        <source src={audioSrc} type="audio/mpeg" />
        <source src="/Mais que Vencedores.mpeg" type="audio/mpeg" />
        <source src="/Mais_que_Vencedores.mpeg" type="audio/mpeg" />
        <source src="/Mais que Vencedores.mp3" type="audio/mp3" />
        <source src="/Mais_que_Vencedores.mp3" type="audio/mp3" />
        <source src="/Audio_Acampa.mpeg" type="audio/mpeg" />
        <source src="/Audio_Acampa.mp3" type="audio/mp3" />
      </audio>

      <button
        type="button"
        onClick={togglePlay}
        className={`relative group flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border backdrop-blur-md transition-all cursor-pointer active:scale-95 shadow-md ${
          isPlaying
            ? 'bg-purple-950/70 border-purple-400/80 text-white shadow-purple-500/20'
            : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200 hover:text-white'
        }`}
        title={isPlaying ? `Clique para pausar ${label}` : `Clique para tocar ${label}`}
        aria-label={`Tocar ${label}`}
      >
        {/* O Disco de Vinil Animado */}
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black p-1 shadow-lg border-2 border-zinc-700/80 transition-transform ${
              isPlaying ? 'animate-[spin_3s_linear_infinite]' : 'group-hover:rotate-12'
            }`}
            style={{
              boxShadow: isPlaying
                ? '0 0 16px rgba(187, 148, 255, 0.7), 0 0 4px rgba(245, 158, 11, 0.5)'
                : '0 4px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Ranhura externa */}
            <div className="w-full h-full rounded-full border border-zinc-700/60 flex items-center justify-center p-0.5 sm:p-1">
              {/* Ranhura média */}
              <div className="w-full h-full rounded-full border border-zinc-800 flex items-center justify-center">
                {/* Selo Central Colorido do Vinil */}
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-inner">
                  {/* Furo central do disco */}
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black shadow-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Ícone de Play / Pause no Centro do Vinil */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity ${
              isPlaying
                ? 'bg-black/30 opacity-0 group-hover:opacity-100'
                : 'bg-black/40 opacity-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-white fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300 ml-0.5" />
            )}
          </div>
        </div>

        {/* Textos & Barras de Onda de Áudio */}
        <div className="flex flex-col text-left pr-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider truncate">
              {isPlaying ? 'Tocando Áudio' : label}
            </span>

            {/* Equalizador animado em tempo real enquanto toca */}
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0">
                <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2.5" />
                <span className="w-0.5 bg-purple-400 rounded-full animate-[pulse_0.35s_ease-in-out_infinite] h-3.5" />
                <span className="w-0.5 bg-sky-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-[pulse_0.45s_ease-in-out_infinite] h-3" />
              </div>
            ) : (
              <Music className="w-3 h-3 text-amber-300 opacity-70 group-hover:opacity-100 flex-shrink-0" />
            )}
          </div>

          <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium truncate">
            {isPlaying ? 'Toque para pausar' : 'Vinil • Mais que Vencedores'}
          </span>
        </div>

        {/* Botão de Mudo rápido quando tocando */}
        {isPlaying && (
          <span
            onClick={toggleMute}
            className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer ml-0.5"
            title={isMuted ? 'Desmutar' : 'Mutar áudio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </span>
        )}
      </button>
    </div>
  );
}
