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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const timerRef = useRef<any>(null);

  const stopDrumRoll = (withCrash = true) => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const ctx = audioCtxRef.current;
    if (withCrash && ctx && ctx.state !== 'closed') {
      try {
        const t = ctx.currentTime;

        // Cymbal crash (rufar terminando em prato triunfal!)
        const bufferSize = Math.floor(ctx.sampleRate * 0.9);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
        }

        const crash = ctx.createBufferSource();
        crash.buffer = buffer;

        const crashFilter = ctx.createBiquadFilter();
        crashFilter.type = 'highpass';
        crashFilter.frequency.setValueAtTime(2800, t);

        const crashGain = ctx.createGain();
        crashGain.gain.setValueAtTime(0.9, t);
        crashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

        crash.connect(crashFilter);
        crashFilter.connect(crashGain);
        crashGain.connect(ctx.destination);
        crash.start(t);

        // Bumbo de impacto final
        const kick = ctx.createOscillator();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(170, t);
        kick.frequency.exponentialRampToValueAtTime(35, t + 0.22);

        const kickGain = ctx.createGain();
        kickGain.gain.setValueAtTime(0.95, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.start(t);
        kick.stop(t + 0.25);
      } catch (e) {
        console.warn('Erro no crash de finalização:', e);
      }
    }

    // Fecha AudioContext com segurança após o decaimento do crash
    setTimeout(() => {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch {}
      audioCtxRef.current = null;
    }, 1200);
  };

  const startDrumRoll = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      isPlayingRef.current = true;
      setIsPlaying(true);

      const startTime = Date.now();
      const baseSpeed = 40; // ms entre batidas

      const playSnareHit = (intensity: number) => {
        if (!isPlayingRef.current || !audioCtxRef.current || ctx.state === 'closed') return;
        const t = ctx.currentTime;

        // Esteira da caixa (ruído branco filtrado)
        const hitSamples = Math.floor(ctx.sampleRate * 0.05);
        const noiseBuf = ctx.createBuffer(1, hitSamples, ctx.sampleRate);
        const nData = noiseBuf.getChannelData(0);
        for (let i = 0; i < hitSamples; i++) {
          nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1100, t);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(intensity * 0.65, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);

        // Corpo acústico da caixa
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(195 + (Math.random() * 20 - 10), t);
        osc.frequency.exponentialRampToValueAtTime(85, t + 0.04);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(intensity * 0.45, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      };

      const loop = () => {
        if (!isPlayingRef.current) return;
        const elapsed = (Date.now() - startTime) / 1000;
        // Crescendo progressivo de volume
        const intensity = Math.min(1.0, 0.25 + elapsed * 0.16);
        playSnareHit(intensity);

        // Variação orgânica e aceleração natural do rufar
        const jitter = (Math.random() - 0.5) * 8;
        const currentDelay = Math.max(28, baseSpeed - elapsed * 2.2) + jitter;

        timerRef.current = setTimeout(loop, currentDelay);
      };

      loop();
    } catch (err) {
      console.warn('Falha ao iniciar suspense drumroll:', err);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPlaying) {
      stopDrumRoll(true);
    } else {
      startDrumRoll();
    }
  };

  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        stopDrumRoll(false);
      }
    };
  }, []);

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
        title={isPlaying ? 'Clique para parar e finalizar com prato!' : 'Tocar Bateria de Suspense (Rufar de Tambores)'}
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
      title={isPlaying ? 'Clique para parar e finalizar!' : 'Tocar Bateria de Suspense (Rufar de Tambores)'}
      aria-label="Tocar Bateria de Suspense"
    >
      <Drum className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? 'animate-bounce text-slate-950' : 'text-amber-300'}`} />
      <span>{isPlaying ? '🥁 Rufando Tambores...' : '🥁 Bateria de Suspense'}</span>
    </button>
  );
}
