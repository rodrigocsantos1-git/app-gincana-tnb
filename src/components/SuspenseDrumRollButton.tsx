'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Drum } from 'lucide-react';

interface SuspenseDrumRollButtonProps {
  className?: string;
  variant?: 'compact' | 'normal' | 'full';
}

export function SuspenseDrumRollButton({
  className = '',
  variant = 'compact',
}: SuspenseDrumRollButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Instancia o áudio usando o arquivo Tambores.mp3 presente no projeto
    const audio = new Audio('/Tambores.mp3');
    audio.preload = 'auto';
    audio.volume = 1.0;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleStopCustom = () => {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    window.addEventListener('stop-drum-roll', handleStopCustom);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      window.removeEventListener('stop-drum-roll', handleStopCustom);
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Erro ao reproduzir Tambores.mp3:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer relative ${
          isPlaying
            ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-300 animate-pulse shadow-lg shadow-amber-500/50'
            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
        } ${className}`}
        title={isPlaying ? 'Clique para parar os tambores' : 'Tocar Bateria de Suspense (Rufar de Tambores)'}
        aria-label="Tocar Bateria de Suspense"
      >
        <Drum className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-slate-950' : 'text-amber-300'}`} />
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-md ${
        isPlaying
          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 shadow-amber-500/40 animate-pulse'
          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 hover:text-amber-200'
      } ${className}`}
      title={isPlaying ? 'Clique para parar os tambores' : 'Tocar Bateria de Suspense (Rufar de Tambores)'}
      aria-label="Tocar Bateria de Suspense"
    >
      <Drum className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? 'animate-bounce text-slate-950' : 'text-amber-300'}`} />
      <span>{isPlaying ? '🥁 Rufando Tambores...' : '🥁 Bateria de Suspense'}</span>
    </button>
  );
}
