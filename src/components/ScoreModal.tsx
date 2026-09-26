'use client';

import React, { useState, useEffect } from 'react';
import { Team, Activity } from '@/lib/types';
import { X, Sparkles, AlertCircle, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  activities: Activity[];
  initialTeamId?: string;
  onSubmitScore: (data: {
    team_id: string;
    activity_id?: string | null;
    points: number;
    notes?: string | null;
  }) => Promise<any>;
}

const QUICK_PRESETS_POSITIVE = [10, 20, 50, 100, 200, 500];
const QUICK_PRESETS_NEGATIVE = [-10, -20, -50];

export function ScoreModal({
  isOpen,
  onClose,
  teams,
  activities,
  initialTeamId,
  onSubmitScore,
}: ScoreModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [points, setPoints] = useState<number | string>(50);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeamId(initialTeamId || (teams.length > 0 ? teams[0].id : ''));
      setSelectedActivityId(activities.length > 0 ? activities[0].id : '');
      setPoints(50);
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, initialTeamId, teams, activities]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setErrorMsg('Por favor, selecione uma equipe.');
      return;
    }

    const numPoints = Number(points);
    if (isNaN(numPoints) || numPoints === 0) {
      setErrorMsg('Informe um valor de pontuação válido diferente de zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmitScore({
        team_id: selectedTeamId,
        activity_id: selectedActivityId || null,
        points: numPoints,
        notes: notes.trim() || null,
      });

      if (numPoints > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#78c8fb', '#bb94ff', '#10b981'],
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg('Ocorreu um erro ao salvar o ponto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-slate-800/60 dark:to-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#78c8fb] to-[#bb94ff] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Lançar Pontuação
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atribua pontos ou penalidades à equipe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seleção de Equipe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              1. Selecione a Equipe:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {teams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <button
                    type="button"
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0284c7] dark:border-[#78c8fb] bg-blue-50/80 dark:bg-blue-950/50 shadow-sm ring-2 ring-[#0284c7]/20 dark:ring-[#78c8fb]/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {team.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção de Prova / Atividade */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                2. Prova / Atividade:
              </label>
              {selectedActivity?.max_points && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Máx sugerido: {selectedActivity.max_points} pts
                </span>
              )}
            </div>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
            >
              <option value="">-- Prova Geral / Sem Prova Específica --</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title} {act.max_points ? `(até ${act.max_points} pts)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Valor da Pontuação & Atalhos Rápidos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              3. Quantidade de Pontos:
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                step="1"
                required
                className="w-full px-4 py-2.5 rounded-xl text-center text-xl font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>

            {/* Botões Rápidos de Pontos */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mr-1 flex items-center">
                  <Plus className="w-3 h-3" /> Pontos:
                </span>
                {QUICK_PRESETS_POSITIVE.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPoints(val)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      Number(points) === val
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 mr-1 flex items-center">
                  <Minus className="w-3 h-3" /> Penalidades:
                </span>
                {QUICK_PRESETS_NEGATIVE.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPoints(val)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      Number(points) === val
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Observações / Motivo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              4. Motivo / Observação (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: 1º Lugar no cabo de guerra, bônus disciplina..."
              className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0284c7] via-[#78c8fb] to-[#bb94ff] hover:opacity-95 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirmar Pontos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
