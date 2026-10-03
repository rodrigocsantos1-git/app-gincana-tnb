'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Team, Activity, TeamStanding, Score } from '@/lib/types';
import {
  X,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  Info,
  Trophy,
  Medal,
  Award,
  Check,
  RotateCw,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CaboDeGuerraTable } from '@/components/CaboDeGuerraTable';
import { getActivityRoundLimit, checkActivityCompletion } from '@/lib/taskCompletion';

export { getActivityRoundLimit };

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  activities: Activity[];
  scores?: Score[];
  standings?: TeamStanding[];
  initialTeamId?: string;
  initialActivityId?: string;
  onSubmitScore: (data: {
    team_id: string;
    activity_id?: string | null;
    points: number;
    notes?: string | null;
  }) => Promise<any>;
  onUpdateScore?: (
    scoreId: string,
    data: { team_id?: string; activity_id?: string | null; points?: number; notes?: string | null }
  ) => Promise<any>;
  onDeleteScore?: (scoreId: string) => Promise<any>;
}

const QUICK_PRESETS_POSITIVE = [5, 10, 20, 50, 100];
const QUICK_PRESETS_NEGATIVE = [-1, -2, -5, -10, -20];

export function ScoreModal({
  isOpen,
  onClose,
  teams,
  activities,
  scores = [],
  standings = [],
  initialTeamId,
  initialActivityId,
  onSubmitScore,
  onUpdateScore,
  onDeleteScore,
}: ScoreModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [points, setPoints] = useState<number | string>('');
  const [hasChangedPoints, setHasChangedPoints] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingRoundScore, setEditingRoundScore] = useState<Score | null>(null);
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<{
    teamName: string;
    teamColor: string;
    points: number;
    round?: number;
    roundLimit?: number;
    activityTitle?: string;
    message?: string;
    isTeamFinished?: boolean;
    pendingTeams?: {
      id: string;
      name: string;
      color: string;
      scoresCount: number;
      requiredRounds: number;
      missing: number;
      notStarted: boolean;
    }[];
  } | null>(null);

  // Mapa de pontuação atual por equipe
  const teamPointsMap = useMemo(() => {
    const map = new Map<string, number>();
    (standings || []).forEach((s) => {
      if (s?.team?.id) {
        map.set(s.team.id, s.totalPoints || 0);
      }
    });
    return map;
  }, [standings]);

  // Pontuações da equipe selecionada na atividade atual (ordem cronológica para mapear rodadas 1, 2, 3...)
  const selectedTeamActivityScores = useMemo(() => {
    if (!selectedTeamId || !selectedActivityId || !scores) return [];
    return scores
      .filter((s) => s.team_id === selectedTeamId && s.activity_id === selectedActivityId)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [scores, selectedTeamId, selectedActivityId]);

  // Mapa de rodadas concluídas por equipe na atividade atual
  const teamRoundsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (selectedActivityId && scores) {
      scores
        .filter((s) => s.activity_id === selectedActivityId)
        .forEach((s) => {
          map.set(s.team_id, (map.get(s.team_id) || 0) + 1);
        });
    }
    return map;
  }, [scores, selectedActivityId]);

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    // Quando o modal abre pela primeira vez:
    if (!wasOpen && isOpen) {
      setSelectedTeamId((prev) => {
        if (initialTeamId) return initialTeamId;
        if (prev && teams.some((t) => t.id === prev)) return prev;
        return teams.length > 0 ? teams[0].id : '';
      });

      setSelectedActivityId((prev) => {
        if (initialActivityId) return initialActivityId;
        if (prev && activities.some((a) => a.id === prev)) return prev;
        return activities.length > 0 ? activities[0].id : '';
      });

      setPoints('');
      setHasChangedPoints(false);
      setNotes('');
      setErrorMsg(null);
      setSuccessFeedback(null);
      setEditingRoundScore(null);
      setEditingRoundIndex(null);
    } else if (isOpen) {
      // Quando o modal JÁ estava aberto e os dados atualizam em segundo plano (ex: ao salvar ou via realtime):
      // NUNCA altera nem reseta a equipe e nem a tarefa escolhidas pelo voluntário!
      setSelectedTeamId((prev) => {
        if (prev && teams.some((t) => t.id === prev)) {
          return prev; // MANTÉM RIGOROSAMENTE A MESMA EQUIPE ESCOLHIDA!
        }
        return prev || initialTeamId || (teams.length > 0 ? teams[0].id : '');
      });

      setSelectedActivityId((prev) => {
        if (prev && activities.some((a) => a.id === prev)) {
          return prev; // MANTÉM RIGOROSAMENTE A MESMA TAREFA ESCOLHIDA!
        }
        return prev || initialActivityId || (activities.length > 0 ? activities[0].id : '');
      });
    }
  }, [isOpen, initialTeamId, initialActivityId, teams, activities]);

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedActivityId),
    [activities, selectedActivityId]
  );
  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  // Status de conclusão da atividade atual por equipe (chamado incondicionalmente no topo de hooks)
  const activityCompletion = useMemo(() => {
    if (!selectedActivity || !teams || teams.length === 0) return null;
    return checkActivityCompletion(selectedActivity, teams, scores);
  }, [selectedActivity, teams, scores]);

  if (!isOpen) return null;

  const currentTeamPoints = selectedTeamId ? teamPointsMap.get(selectedTeamId) ?? 0 : 0;
  const numPoints = points === '' ? 0 : Number(points);
  const willBeNegative = numPoints < 0 && currentTeamPoints + numPoints < 0;
  const isCaboDeGuerra = (selectedActivity?.title || '').toLowerCase().includes('cabo de guerra');

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

  const roundLimit = getActivityRoundLimit(selectedActivity);
  const roundsCompleted = selectedTeamActivityScores.length;
  const currentRound = roundsCompleted + 1;
  const isRoundLimitReached = roundLimit !== null && roundsCompleted >= roundLimit;
  const isFormDisabled = isRoundLimitReached && !editingRoundScore;

  const handleStartEditRound = (scoreToEdit: Score, roundIdx: number) => {
    setEditingRoundScore(scoreToEdit);
    setEditingRoundIndex(roundIdx);
    setPoints(scoreToEdit.points);
    setHasChangedPoints(true);
    setNotes(scoreToEdit.notes || '');
    setErrorMsg(null);
    setSuccessFeedback(null);
  };

  const handleCancelRoundEdit = () => {
    setEditingRoundScore(null);
    setEditingRoundIndex(null);
    setPoints('');
    setHasChangedPoints(false);
    setNotes('');
    setErrorMsg(null);
  };

  const handleSaveRoundEdit = async () => {
    if (!editingRoundScore || !onUpdateScore) return;

    if (points === '' || isNaN(numPoints)) {
      setErrorMsg('Por favor, selecione uma colocação ou informe uma pontuação válida.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const roundNumStr = editingRoundIndex !== null ? `${editingRoundIndex + 1}ª Rodada` : 'Rodada';
      let finalNotes = notes.trim();
      if (!finalNotes) {
        finalNotes = roundNumStr;
      }

      await onUpdateScore(editingRoundScore.id, {
        team_id: selectedTeamId,
        activity_id: selectedActivityId || null,
        points: numPoints,
        notes: finalNotes || null,
      });

      const updatedPoints = numPoints;
      const updatedRoundIdx = editingRoundIndex;
      handleCancelRoundEdit();

      setSuccessFeedback({
        teamName: selectedTeam?.name || 'Equipe',
        teamColor: selectedTeam?.color || '#0284c7',
        points: updatedPoints,
        round: updatedRoundIdx !== null ? updatedRoundIdx + 1 : undefined,
        roundLimit: roundLimit || undefined,
        activityTitle: selectedActivity?.title,
        message: `Pontuação da ${updatedRoundIdx !== null ? `${updatedRoundIdx + 1}ª Rodada` : 'Rodada'} atualizada com sucesso para ${updatedPoints} pts!`,
      });
    } catch (err) {
      setErrorMsg('Erro ao salvar a correção da rodada.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoundScore = async () => {
    if (!editingRoundScore || !onDeleteScore) return;

    const roundNumStr = editingRoundIndex !== null ? `${editingRoundIndex + 1}ª Rodada` : 'esta rodada';
    const confirmDelete = window.confirm(
      `Deseja realmente excluir o lançamento da ${roundNumStr} da equipe "${selectedTeam?.name}"?`
    );
    if (!confirmDelete) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await onDeleteScore(editingRoundScore.id);

      handleCancelRoundEdit();

      setSuccessFeedback({
        teamName: selectedTeam?.name || 'Equipe',
        teamColor: selectedTeam?.color || '#0284c7',
        points: 0,
        activityTitle: selectedActivity?.title,
        message: `Lançamento da ${roundNumStr} excluído com sucesso!`,
      });
    } catch (err) {
      setErrorMsg('Erro ao excluir rodada. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      setErrorMsg('Por favor, selecione uma equipe.');
      return;
    }

    // Regra: Limite de rodadas obrigatório
    if (isRoundLimitReached) {
      setErrorMsg(
        `Limite atingido: A equipe "${selectedTeam?.name}" já realizou todas as ${roundLimit} rodadas desta prova.`
      );
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

      // Auto-rotular a rodada na anotação caso seja prova com rodadas
      const roundTag = roundLimit ? `Rodada ${currentRound} de ${roundLimit}` : '';
      let finalNotes = notes.trim();
      if (roundTag) {
        if (!finalNotes) {
          finalNotes = roundTag;
        } else if (!finalNotes.toLowerCase().includes('rodada')) {
          finalNotes = `${finalNotes} (${roundTag})`;
        }
      }

      await onSubmitScore({
        team_id: selectedTeamId,
        activity_id: selectedActivityId || null,
        points: numPoints,
        notes: finalNotes || null,
      });

      if (numPoints > 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#78c8fb', '#bb94ff', '#10b981', '#f59e0b'],
        });
      }

      // Se a equipe atingiu o limite de rodadas (ex: 5 rodadas), verifica se faltam outras equipes
      const willBeTeamFinished = roundLimit ? currentRound >= roundLimit : false;
      const pendingTeamsAfterThis = teams.filter((t) => {
        if (t.id === selectedTeamId) {
          return !willBeTeamFinished;
        }
        const tScores = scores.filter((s) => s.activity_id === selectedActivityId && s.team_id === t.id);
        const req = roundLimit || 1;
        return tScores.length < req;
      });

      // Feedback de sucesso elegante para o voluntário
      setSuccessFeedback({
        teamName: selectedTeam?.name || 'Equipe',
        teamColor: selectedTeam?.color || '#3b82f6',
        points: numPoints,
        round: roundLimit ? currentRound : undefined,
        roundLimit: roundLimit || undefined,
        activityTitle: selectedActivity?.title,
        isTeamFinished: willBeTeamFinished,
        pendingTeams: pendingTeamsAfterThis.map((t) => {
          const tScores = scores.filter((s) => s.activity_id === selectedActivityId && s.team_id === t.id);
          const req = roundLimit || 1;
          return {
            id: t.id,
            name: t.name,
            color: t.color,
            scoresCount: tScores.length,
            requiredRounds: req,
            missing: Math.max(0, req - tScores.length),
            notStarted: tScores.length === 0,
          };
        }),
      });

      // Permanece na mesma tela conforme solicitado pelo usuário!
      // Reseta inputs de pontos para o próximo lançamento
      setPoints('');
      setHasChangedPoints(false);
      setNotes('');
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
        {/* Top Header com Botão Voltar Evidente para Idosos */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-slate-800/80 dark:to-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer active:scale-95"
            title="Voltar para a tela anterior"
          >
            <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
            <span>Voltar</span>
          </button>

          <div className="text-right">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Lançar Pontuação
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Gincana TNB • Treinando Campeões
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Feedback de Sucesso Elegante ao Lançar Ponto (Continua na Tela) */}
          {successFeedback && (
            successFeedback.isTeamFinished ? (
              successFeedback.pendingTeams && successFeedback.pendingTeams.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-500 text-amber-950 dark:text-amber-100 shadow-md space-y-2.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300">
                          🎉 A equipe &quot;{successFeedback.teamName}&quot; finalizou todas as {successFeedback.roundLimit} rodadas!
                        </p>
                        <div className="p-3 rounded-xl bg-amber-100/90 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700/80 space-y-2 mt-1">
                          <p className="text-xs font-black text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
                            <span>ATENÇÃO: Está faltando completar esta tarefa para {successFeedback.pendingTeams.length} {successFeedback.pendingTeams.length === 1 ? 'equipe' : 'equipes'}:</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {successFeedback.pendingTeams.map((pt) => (
                              <button
                                type="button"
                                key={pt.id}
                                onClick={() => {
                                  setSelectedTeamId(pt.id);
                                  setSuccessFeedback(null);
                                }}
                                className="px-3 py-2 rounded-xl font-black text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-amber-400 dark:border-amber-500 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pt.color }} />
                                <span>{pt.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                                  {pt.notStarted ? '0 rodadas' : `${pt.scoresCount}/${pt.requiredRounds}`}
                                </span>
                                <span className="text-[11px] text-[#0284c7] dark:text-[#78c8fb] font-black">👉 Pontuar</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuccessFeedback(null)}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg cursor-pointer flex-shrink-0"
                      title="Dispensar aviso"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300">
                        🏆 PARABÉNS! Todas as equipes concluíram com sucesso todas as tarefas desta prova!
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
                        Nenhuma equipe possui pontuação pendente nesta atividade.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccessFeedback(null)}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg cursor-pointer flex-shrink-0"
                    title="Dispensar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm">
                      {successFeedback.message ? (
                        <strong>{successFeedback.message}</strong>
                      ) : (
                        <>
                          <strong>+{successFeedback.points} pts</strong> aplicados para{' '}
                          <strong>{successFeedback.teamName}</strong>
                          {successFeedback.round && ` • Rodada ${successFeedback.round}/${successFeedback.roundLimit}`}!
                        </>
                      )}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Tela mantida aberta para continuar lançando. Selecione a próxima equipe ou finalize abaixo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessFeedback(null)}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg cursor-pointer flex-shrink-0"
                  title="Dispensar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Seleção de Prova / Atividade (no topo para definir as regras da tela) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Prova / Atividade:
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
                setErrorMsg(null);
                if (editingRoundScore) {
                  handleCancelRoundEdit();
                }
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

          {/* CABO DE GUERRA: Duelos Todos Contra Todos com Seleção de V (Vitória) e D (Derrota) */}
          {isCaboDeGuerra && selectedActivity ? (
            <div className="space-y-4 pt-1">
              <CaboDeGuerraTable
                teams={teams}
                activity={selectedActivity}
                scores={scores}
                onSubmitScore={onSubmitScore}
                onUpdateScore={onUpdateScore}
                onSuccess={() => {
                  setSuccessFeedback({
                    teamName: 'Todas as Equipes',
                    teamColor: '#f59e0b',
                    points: 4,
                    message: 'Pontuações do Cabo de Guerra calculadas e salvas com sucesso!',
                  });
                }}
              />

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-5 text-sm font-black rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
                  <span>Voltar ao Placar</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Alerta em Tela: Falta completar a tarefa para equipes pendentes */}
              {activityCompletion && activityCompletion.hasAnyScore && (
                activityCompletion.isIncomplete ? (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/15 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-500/80 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-100">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
                        <span>Falta completar esta tarefa para:</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                        {activityCompletion.missingTeams.length} {activityCompletion.missingTeams.length === 1 ? 'equipe pendente' : 'equipes pendentes'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activityCompletion.missingTeams.map(({ team, scoresCount, requiredRounds, notStarted }) => {
                        const tId = team?.id || '';
                        const tName = team?.name || 'Equipe';
                        const tColor = team?.color || '#0284c7';
                        const isSelected = selectedTeamId === tId;
                        return (
                          <button
                            type="button"
                            key={tId || Math.random().toString()}
                            onClick={() => {
                              if (tId) setSelectedTeamId(tId);
                              setErrorMsg(null);
                              if (editingRoundScore) handleCancelRoundEdit();
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] ring-2 ring-blue-300'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-amber-300 dark:border-amber-700 hover:scale-105 active:scale-95'
                            }`}
                          >
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tColor }} />
                            <span>{tName}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            }`}>
                              {notStarted ? '0 rodadas' : `${scoresCount}/${requiredRounds}`}
                            </span>
                            {!isSelected && <span className="text-[10px] text-[#0284c7] dark:text-[#78c8fb]">👉 Selecionar</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : activityCompletion.isFullyCompleted ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-700 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Tarefa 100% concluída por todas as {teams.length} equipes!</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-black">
                      Finalizada ✅
                    </span>
                  </div>
                ) : null
              )}

              {/* 2. Seleção de Equipe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    2. Selecione a Equipe:
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
                    const completedRoundsForTeam = teamRoundsMap.get(team.id) ?? 0;
                    const isTeamDone = roundLimit !== null && completedRoundsForTeam >= roundLimit;

                    return (
                      <button
                        type="button"
                        key={team.id}
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setErrorMsg(null);
                          if (editingRoundScore) {
                            handleCancelRoundEdit();
                          }
                        }}
                        className={`flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0284c7] dark:border-[#78c8fb] bg-blue-50/90 dark:bg-blue-950/60 shadow-sm ring-2 ring-[#0284c7]/30 dark:ring-[#78c8fb]/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        } ${isTeamDone ? 'opacity-90' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm border ${
                                (team?.name || '').toLowerCase().includes('branc') || (team?.color || '').toLowerCase() === '#ffffff'
                                  ? 'border-slate-400 dark:border-slate-500 ring-1 ring-slate-900/10'
                                  : 'border-black/10'
                              }`}
                              style={{ backgroundColor: team?.color || '#0284c7' }}
                            />
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {team?.name || 'Equipe'}
                            </span>
                          </div>
                          <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
                            {pts}p
                          </span>
                        </div>

                        {/* Indicador de Rodada por Equipe */}
                        {roundLimit && (
                          <div className="mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] w-full">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">Rodada:</span>
                            <span
                              className={`font-black px-1.5 py-0.2 rounded-md ${
                                isTeamDone
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-blue-100 dark:bg-blue-950 text-[#0284c7] dark:text-[#78c8fb] border border-blue-200 dark:border-blue-900/60'
                              }`}
                            >
                              {isTeamDone ? `✅ 5/5 Concluída` : `${completedRoundsForTeam + 1}ª de ${roundLimit}`}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
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

              {/* Rastreador Visual de Rodadas Obrigatórias (Máx 5 Rodadas) */}
              {roundLimit && selectedTeam && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-slate-800/90 dark:to-indigo-950/40 border border-blue-200/80 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#78c8fb]" />
                      Controle de Rodadas: {roundsCompleted} de {roundLimit} Realizadas
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Equipe: <strong className="text-slate-900 dark:text-white">{selectedTeam.name}</strong>
                    </span>
                  </div>

                  {/* Barra das 5 Rodadas */}
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5 pt-1">
                    {Array.from({ length: roundLimit }).map((_, idx) => {
                      const roundNum = idx + 1;
                      const isDone = roundNum <= roundsCompleted;
                      const isCurrent = roundNum === currentRound && !isRoundLimitReached;
                      const scoreForRound = selectedTeamActivityScores[idx];

                      return isDone && scoreForRound ? (
                        <button
                          key={roundNum}
                          type="button"
                          onClick={() => handleStartEditRound(scoreForRound, idx)}
                          title={`Clique para editar a pontuação da ${roundNum}ª Rodada (+${scoreForRound.points}p)`}
                          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center border transition-all cursor-pointer group active:scale-95 ${
                            editingRoundIndex === idx
                              ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400 text-amber-950 dark:text-amber-200 shadow-sm'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-200/90 hover:border-emerald-400 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-0.5 text-[10px] font-black uppercase">
                            <span>{roundNum}ª Rod.</span>
                            <Pencil className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 opacity-70 group-hover:opacity-100" />
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-black mt-0.5 underline decoration-emerald-500/50">
                            +{scoreForRound.points}p
                          </span>
                          <span className="text-[8px] font-bold text-emerald-800 dark:text-emerald-300">
                            {editingRoundIndex === idx ? '✏️ Editando' : 'Editar ✏️'}
                          </span>
                        </button>
                      ) : (
                        <div
                          key={roundNum}
                          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center border transition-all ${
                            isCurrent
                              ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-400 dark:border-[#78c8fb] text-[#0284c7] dark:text-white ring-2 ring-[#0284c7]/40 font-black'
                              : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase">
                            {roundNum}ª Rod.
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-extrabold mt-0.5">
                            {isCurrent ? '👉 Atual' : 'Pendente'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botões Rápidos para Editar Pontuação das Rodadas Realizadas */}
                  {roundsCompleted > 0 && (
                    <div className="pt-2 border-t border-blue-200/60 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5 text-amber-500" />
                          Editar pontuação das rodadas:
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                          Toque na rodada para alterar
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedTeamActivityScores.map((scoreItem, sIdx) => {
                          const rNum = sIdx + 1;
                          const isThisEditing = editingRoundIndex === sIdx;
                          return (
                            <button
                              key={scoreItem.id}
                              type="button"
                              onClick={() => handleStartEditRound(scoreItem, sIdx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs cursor-pointer active:scale-95 ${
                                isThisEditing
                                  ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 font-black'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400'
                              }`}
                            >
                              <Pencil className="w-3 h-3 text-amber-500" />
                              <span>✏️ Editar {rNum}ª Rodada ({scoreItem.points}p)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Alerta de 5 Rodadas Concluídas */}
                  {isRoundLimitReached && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        A equipe <strong>{selectedTeam.name}</strong> já finalizou as {roundLimit} rodadas obrigatórias desta prova (Total:{' '}
                        <strong>{selectedTeamActivityScores.reduce((acc, s) => acc + s.points, 0)} pts</strong>).
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Lançamentos Anteriores em Provas Sem Limite de Rodadas */}
              {!roundLimit && selectedTeamActivityScores.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5 text-amber-500" />
                    Lançamentos já realizados para esta equipe:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedTeamActivityScores.map((scoreItem, sIdx) => (
                      <button
                        key={scoreItem.id}
                        type="button"
                        onClick={() => handleStartEditRound(scoreItem, sIdx)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-amber-50 hover:border-amber-400 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Pencil className="w-3 h-3 text-amber-500" />
                        <span>✏️ Editar ({scoreItem.points}p)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Banner em Destaque Quando em Modo Edição de Rodada */}
              {editingRoundScore && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
                      ✏️
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black uppercase text-amber-950 dark:text-amber-200 truncate">
                        Corrigindo {editingRoundIndex !== null ? `${editingRoundIndex + 1}ª Rodada` : 'Rodada'}
                      </div>
                      <div className="text-xs text-amber-900/90 dark:text-amber-300 font-medium">
                        Equipe: <strong>{selectedTeam?.name}</strong> • Pontuação gravada:{' '}
                        <strong>{editingRoundScore.points} pts</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelRoundEdit}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer flex-shrink-0"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              )}

              {/* 3. Tabela de Colocação Oficial (1-Clique) */}
              {placementPresets && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    {editingRoundScore
                      ? `3. Selecione a Nova Colocação (${editingRoundIndex !== null ? `${editingRoundIndex + 1}ª Rodada` : 'Rodada'}):`
                      : '3. Tabela de Colocação (Clique para Pontuar):'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {placementPresets.map((preset) => {
                      const isSelected = hasChangedPoints && numPoints === preset.points;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          disabled={isFormDisabled}
                          onClick={() => handleSelectPlacement(preset.points, preset.label)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            isFormDisabled
                              ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800'
                              : isSelected
                              ? 'border-[#0284c7] dark:border-[#78c8fb] bg-[#0284c7]/10 dark:bg-[#78c8fb]/20 shadow-md ring-2 ring-[#0284c7]/40 cursor-pointer'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
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
                  {!hasChangedPoints && !isFormDisabled && (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      ⚠️ Escolha ou digite a pontuação
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    disabled={isFormDisabled}
                    value={points}
                    onChange={(e) => handlePointsInputChange(e.target.value)}
                    placeholder="Ex: 4"
                    step="1"
                    required
                    className={`w-full px-4 py-2.5 rounded-xl text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb] ${
                      isFormDisabled
                        ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700'
                        : !hasChangedPoints
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
                        disabled={isFormDisabled}
                        onClick={() => {
                          setPoints(val);
                          setHasChangedPoints(true);
                          setErrorMsg(null);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          isFormDisabled
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                            : hasChangedPoints && numPoints === val
                            ? 'bg-emerald-500 text-white shadow-sm cursor-pointer'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer'
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
                        disabled={isFormDisabled}
                        onClick={() => {
                          setPoints(val);
                          setHasChangedPoints(true);
                          setErrorMsg(null);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          isFormDisabled
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                            : hasChangedPoints && numPoints === val
                            ? 'bg-rose-500 text-white shadow-sm cursor-pointer'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer'
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
                  placeholder="Ex: 1º Lugar na prova, melhor grito..."
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>

              {/* Botões de Ação com Alta Visibilidade para Idosos */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                {editingRoundScore ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelRoundEdit}
                      className="w-full sm:w-auto px-4 py-3 text-sm font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 order-3 sm:order-1"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
                      <span>Cancelar Edição</span>
                    </button>

                    {onDeleteScore && (
                      <button
                        type="button"
                        onClick={handleDeleteRoundScore}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-4 py-3 text-xs sm:text-sm font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 order-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir Rodada</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveRoundEdit}
                      disabled={isSubmitting || points === '' || isNaN(numPoints)}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer order-1 sm:order-3"
                    >
                      {isSubmitting ? (
                        <span>Salvando Correção...</span>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Salvar Correção da {editingRoundIndex !== null ? `${editingRoundIndex + 1}ª Rodada` : 'Rodada'}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-5 py-3 text-sm font-black rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 order-2 sm:order-1"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
                      <span>Voltar ao Placar</span>
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isRoundLimitReached ||
                        !hasChangedPoints ||
                        points === '' ||
                        numPoints === 0 ||
                        willBeNegative
                      }
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-[#0284c7] via-[#0284c7] to-[#7c3aed] hover:brightness-110 shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer order-1 sm:order-2"
                    >
                      {isSubmitting ? (
                        <span>Salvando...</span>
                      ) : isRoundLimitReached ? (
                        <span>5 Rodadas Concluídas</span>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          <span>Confirmar e Salvar Pontos</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
