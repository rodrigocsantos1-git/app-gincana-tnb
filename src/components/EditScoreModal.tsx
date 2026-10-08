'use client';

import React, { useState, useEffect } from 'react';
import { Score, Team, Activity } from '@/lib/types';
import { ArrowLeft, Check, Trash2, AlertCircle, Sparkles, Trophy, HelpCircle } from 'lucide-react';
import { getActivityRoundLimit } from '@/components/ScoreModal';
import { sortActivitiesNumerically } from '@/lib/taskCompletion';

interface EditScoreModalProps {
  isOpen: boolean;
  score: Score | null;
  onClose: () => void;
  teams: Team[];
  activities: Activity[];
  onUpdateScore: (
    scoreId: string,
    data: { team_id?: string; activity_id?: string | null; points?: number; notes?: string | null }
  ) => Promise<any>;
  onDeleteScore?: (scoreId: string) => Promise<any>;
}

export function EditScoreModal({
  isOpen,
  score,
  onClose,
  teams,
  activities,
  onUpdateScore,
  onDeleteScore,
}: EditScoreModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [points, setPoints] = useState<number | string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && score) {
      setSelectedTeamId(score.team_id);
      setSelectedActivityId(score.activity_id || '');
      setPoints(score.points);
      setNotes(score.notes || '');
      setErrorMsg(null);
    }
  }, [isOpen, score]);

  if (!isOpen || !score) return null;

  const sortedActivities = React.useMemo(() => sortActivitiesNumerically(activities), [activities]);
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const numPoints = points === '' ? 0 : Number(points);

  // Colocações oficiais para facilitar o clique de pessoas idosas
  const getPlacementPresets = (activity?: Activity) => {
    if (!activity) return null;
    const title = (activity.title || '').toLowerCase();

    if (title.includes('tesouro')) {
      return [
        { label: '1º Lugar', points: 10, desc: '10 pontos' },
        { label: '2º Lugar', points: 8, desc: '8 pontos' },
        { label: '3º Lugar', points: 6, desc: '6 pontos' },
        { label: '4º Lugar', points: 4, desc: '4 pontos' },
      ];
    }

    if (
      title.includes('prova 1') ||
      title.includes('prova 2') ||
      title.includes('cabo de guerra') ||
      title.includes('prova 3') ||
      title.includes('prova 4') ||
      title.includes('prova 5') ||
      title.includes('jornada') ||
      title.includes('correr') ||
      title.includes('corpo') ||
      title.includes('voz') ||
      title.includes('jesus')
    ) {
      return [
        { label: '1º Lugar', points: 4, desc: '4 pontos' },
        { label: '2º Lugar', points: 3, desc: '3 pontos' },
        { label: '3º Lugar', points: 2, desc: '2 pontos' },
        { label: '4º Lugar', points: 1, desc: '1 ponto' },
      ];
    }

    return [
      { label: '1º Lugar (4 pts)', points: 4, desc: '4 pts' },
      { label: '2º Lugar (3 pts)', points: 3, desc: '3 pts' },
      { label: '3º Lugar (2 pts)', points: 2, desc: '2 pts' },
      { label: '4º Lugar (1 pt)', points: 1, desc: '1 pt' },
    ];
  };

  const placementPresets = getPlacementPresets(selectedActivity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      setErrorMsg('Selecione a equipe.');
      return;
    }

    if (points === '' || isNaN(numPoints)) {
      setErrorMsg('Informe a pontuação correta.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await onUpdateScore(score.id, {
        team_id: selectedTeamId,
        activity_id: selectedActivityId || null,
        points: numPoints,
        notes: notes || null,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg('Ocorreu um erro ao atualizar os pontos. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteScore) return;
    const confirmDelete = window.confirm(
      `Deseja realmente apagar este lançamento de ${score.points} pontos para a equipe "${score.team?.name || 'Equipe'}"?`
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await onDeleteScore(score.id);
      onClose();
    } catch (err: any) {
      setErrorMsg('Erro ao excluir a pontuação.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Amigável com Botão Voltar Bem Visível */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
            <span>Voltar</span>
          </button>

          <div className="text-right">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Corrigir Pontuação
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ajuste pontos ou equipe caso tenha errado
            </p>
          </div>
        </div>

        {/* Formulário Simples com Elementos Grandes */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Escolha da Equipe com Cartões Grandes */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
              1. Qual é a Equipe Correta?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {teams.map((t) => {
                const isSelected = selectedTeamId === t.id;
                const isWhite = (t.name || '').toLowerCase().includes('branc') || (t.color || '').toLowerCase() === '#ffffff';
                const isYellow = (t.name || '').toLowerCase().includes('amar') || (t.color || '').toLowerCase() === '#f59e0b';
                const textColor = isWhite ? 'text-slate-950' : isYellow ? 'text-amber-950' : 'text-white';

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-between gap-2 shadow-sm cursor-pointer ${
                      isSelected
                        ? 'ring-4 ring-[#0284c7] ring-offset-2 scale-[1.02] shadow-md'
                        : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
                    } ${textColor}`}
                    style={{ backgroundColor: t.color }}
                  >
                    <span className="uppercase truncate">{t.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0 text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Escolha da Prova */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
              2. Qual foi a Prova / Atividade?
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] cursor-pointer"
            >
              <option value="">Nenhuma Prova Específica (Pontuação Avulsa)</option>
              {sortedActivities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Pontuação com Botões Grandes */}
          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
              3. Quantidade Correta de Pontos:
            </label>

            {/* Atalhos Rápidos por Colocação */}
            {placementPresets && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {placementPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setPoints(preset.points);
                      setNotes(preset.label);
                    }}
                    className={`py-3 px-2 rounded-2xl text-center font-black transition-all flex flex-col items-center justify-center gap-0.5 border-2 cursor-pointer ${
                      numPoints === preset.points
                        ? 'bg-amber-400/20 border-amber-500 text-amber-900 dark:text-amber-200 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{preset.label}</span>
                    <span className="text-xs opacity-75 font-bold">+{preset.points} pts</span>
                  </button>
                ))}
              </div>
            )}

            {/* Ajuste Fino (+ / -) e Campo Numérico */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPoints(Math.max(0, numPoints - 1))}
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-xl text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                title="Diminuir 1 ponto"
              >
                -1
              </button>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 h-12 text-center text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => setPoints(numPoints + 1)}
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-xl text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                title="Aumentar 1 ponto"
              >
                +1
              </button>
            </div>
          </div>

          {/* 4. Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              4. Observação / Motivo (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: 1º Lugar, vencedor no desempate..."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          {/* Botões de Ação Grandes e Simples para Celular */}
          <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
            {/* Botão de Salvar Correção (Principal) */}
            <button
              type="submit"
              disabled={isSubmitting || points === ''}
              className="w-full py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isSubmitting ? 'Salvando Correção...' : 'Confirmar e Salvar Correção'}</span>
            </button>

            {/* Botões Secundários: Excluir Lançamento e Voltar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-3 px-3 rounded-xl font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Apagar este lançamento por completo"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>{isDeleting ? 'Apagando...' : 'Excluir Lançamento'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-3 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar sem Alterar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
