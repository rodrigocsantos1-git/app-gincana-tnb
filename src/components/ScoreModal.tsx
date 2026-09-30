'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Team, Activity, TeamStanding } from '@/lib/types';
import { X, Sparkles, AlertCircle, Plus, Minus, Info, Trophy, Medal, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  activities: Activity[];
  standings?: TeamStanding[];
  initialTeamId?: string;
  onSubmitScore: (data: {
    team_id: string;
    activity_id?: string | null;
    points: number;
    notes?: string | null;
  }) => Promise<any>;
}

const QUICK_PRESETS_POSITIVE = [5, 10, 20, 50, 100];
const QUICK_PRESETS_NEGATIVE = [-1, -2, -5, -10, -20];

export function ScoreModal({
  isOpen,
  onClose,
  teams,
  activities,
  standings = [],
  initialTeamId,
  onSubmitScore,
}: ScoreModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [points, setPoints] = useState<number | string>('');
  const [hasChangedPoints, setHasChangedPoints] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mapa de pontuação atual por equipe
  const teamPointsMap = useMemo(() => {
    const map = new Map<string, number>();
    standings.forEach((s) => map.set(s.team.id, s.totalPoints));
    return map;
  }, [standings]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeamId(initialTeamId || (teams.length > 0 ? teams[0].id : ''));
      setSelectedActivityId(activities.length > 0 ? activities[0].id : '');
      setPoints('');
      setHasChangedPoints(false);
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, initialTeamId, teams, activities]);

  if (!isOpen) return null;

  const selectedActivity = activities.find((a) => a.id === selectedActivityId);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const currentTeamPoints = selectedTeamId ? teamPointsMap.get(selectedTeamId) ?? 0 : 0;
  const numPoints = points === '' ? 0 : Number(points);
  const willBeNegative = numPoints < 0 && currentTeamPoints + numPoints < 0;

  // Gerador de botões de colocação conforme o regulamento oficial da prova
  const getPlacementPresets = (activity?: Activity) => {
    if (!activity) return null;
    const title = (activity.title || '').toLowerCase();

    // Prova Especial - Caça ao Tesouro (1°=10, 2°=8, 3°=6, 4°=4)
    if (title.includes('tesouro')) {
      return [
        { label: '1º Lugar', points: 10, icon: '🥇', desc: '10 pontos' },
        { label: '2º Lugar', points: 8, icon: '🥈', desc: '8 pontos' },
        { label: '3º Lugar', points: 6, icon: '🥉', desc: '6 pontos' },
        { label: '4º Lugar', points: 4, icon: '🏅', desc: '4 pontos' },
      ];
    }

    // Provas 1 a 5 e Cabo de Guerra (1°=4, 2°=3, 3°=2, 4°=1)
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
        { label: '1º Lugar', points: 4, icon: '🥇', desc: '4 pontos' },
        { label: '2º Lugar', points: 3, icon: '🥈', desc: '3 pontos' },
        { label: '3º Lugar', points: 2, icon: '🥉', desc: '2 pontos' },
        { label: '4º Lugar', points: 1, icon: '🏅', desc: '1 ponto' },
      ];
    }

    // Grito de Guerra ou Melhor Fantasia
    if (title.includes('grito') || title.includes('fantasia')) {
      return [
        { label: 'Nota Máxima', points: 50, icon: '🌟', desc: '50 pts' },
        { label: 'Excelente', points: 40, icon: '👏', desc: '40 pts' },
        { label: 'Muito Bom', points: 30, icon: '👍', desc: '30 pts' },
        { label: 'Bom', points: 20, icon: '✨', desc: '20 pts' },
      ];
    }

    return null;
  };

  const placementPresets = getPlacementPresets(selectedActivity);

  const handleSelectPlacement = (presetPoints: number, presetLabel: string) => {
    setPoints(presetPoints);
    setHasChangedPoints(true);
    setErrorMsg(null);
    if (!notes || notes.includes('Lugar') || notes.includes('Nota') || notes.includes('Excelente')) {
      setNotes(presetLabel);
    }
  };

  const handlePointsInputChange = (val: string) => {
    setPoints(val);
    setHasChangedPoints(true);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      setErrorMsg('Por favor, selecione uma equipe.');
      return;
    }

    // Regra: Não deixar salvar sem trocar/escolher a pontuação
    if (!hasChangedPoints || points === '' || isNaN(numPoints) || numPoints === 0) {
      setErrorMsg('Por favor, selecione uma colocação ou informe a pontuação antes de salvar.');
      return;
    }

    // Regra: Não deixar nenhuma equipe negativa
    if (currentTeamPoints + numPoints < 0) {
      setErrorMsg(
        `Operação bloqueada: nenhuma equipe pode ficar com pontuação negativa! A equipe "${selectedTeam?.name}" possui ${currentTeamPoints} pts. O desconto máximo permitido é de -${currentTeamPoints} pts.`
      );
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden my-auto"
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
                Atribua os pontos ou penalidade à equipe
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Seleção de Equipe */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Selecione a Equipe:
              </label>
              {selectedTeam && (
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Total atual: <strong className="text-slate-900 dark:text-white">{currentTeamPoints} pts</strong>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {teams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                const pts = teamPointsMap.get(team.id) ?? 0;
                return (
                  <button
                    type="button"
                    key={team.id}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setErrorMsg(null);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0284c7] dark:border-[#78c8fb] bg-blue-50/90 dark:bg-blue-950/60 shadow-sm ring-2 ring-[#0284c7]/30 dark:ring-[#78c8fb]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-black/10"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {team.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-1">
                      {pts}p
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Seleção de Prova / Atividade */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                2. Prova / Atividade:
              </label>
              {selectedActivity?.max_points && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Máx: {selectedActivity.max_points} pts
                </span>
              )}
            </div>
            <select
              value={selectedActivityId}
              onChange={(e) => {
                setSelectedActivityId(e.target.value);
                setPoints('');
                setHasChangedPoints(false);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
            >
              <option value="">-- Prova Geral / Sem Prova Específica --</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title}
                </option>
              ))}
            </select>
          </div>

          {/* Regras e Descrição da Prova Selecionada */}
          {selectedActivity && selectedActivity.description && (
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284c7] dark:text-[#78c8fb]">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Regras da Atividade:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pl-5">
                {selectedActivity.description}
              </p>
            </div>
          )}

          {/* Botões Rápidos de Colocação Oficial (1-Clique) */}
          {placementPresets && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                3. Tabela de Colocação (Clique para Pontuar):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {placementPresets.map((preset) => {
                  const isSelected = hasChangedPoints && numPoints === preset.points;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPlacement(preset.points, preset.label)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-[#0284c7] dark:border-[#78c8fb] bg-[#0284c7]/10 dark:bg-[#78c8fb]/20 shadow-md ring-2 ring-[#0284c7]/40'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{preset.icon}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {preset.label}
                      </span>
                      <span className="text-[11px] font-black text-[#0284c7] dark:text-[#78c8fb]">
                        +{preset.points} pts
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Valor da Pontuação Manual & Ajustes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {placementPresets ? 'Ou Defina a Quantidade Manualmente:' : '3. Quantidade de Pontos:'}
              </label>
              {!hasChangedPoints && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  ⚠️ Escolha ou digite a pontuação
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={points}
                onChange={(e) => handlePointsInputChange(e.target.value)}
                placeholder="Ex: 4"
                step="1"
                required
                className={`w-full px-4 py-2.5 rounded-xl text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb] ${
                  !hasChangedPoints
                    ? 'border-amber-400/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>

            {/* Aviso visual de pontuação negativa bloqueada */}
            {willBeNegative && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Bloqueado: o desconto de {numPoints} pts deixaria a equipe negativa ({currentTeamPoints + numPoints} pts).
                </span>
              </div>
            )}

            {/* Presets Rápidos Avulsos */}
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mr-1 flex items-center">
                  <Plus className="w-3 h-3" /> Pontos:
                </span>
                {QUICK_PRESETS_POSITIVE.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setPoints(val);
                      setHasChangedPoints(true);
                      setErrorMsg(null);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      hasChangedPoints && numPoints === val
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
                    onClick={() => {
                      setPoints(val);
                      setHasChangedPoints(true);
                      setErrorMsg(null);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      hasChangedPoints && numPoints === val
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

          {/* 4. Observações / Motivo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              4. Motivo / Observação (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: 1º Lugar no cabo de guerra, melhor grito..."
              className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChangedPoints || points === '' || numPoints === 0 || willBeNegative}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0284c7] via-[#78c8fb] to-[#bb94ff] hover:opacity-95 shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
