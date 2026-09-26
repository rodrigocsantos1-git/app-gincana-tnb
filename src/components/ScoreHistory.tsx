'use client';

import React, { useState, useMemo } from 'react';
import { Score, Team, Activity } from '@/lib/types';
import { Trash2, History, Filter, AlertTriangle, Clock } from 'lucide-react';

interface ScoreHistoryProps {
  scores: Score[];
  teams: Team[];
  activities: Activity[];
  onDeleteScore: (id: string) => Promise<any>;
}

export function ScoreHistory({
  scores,
  teams,
  activities,
  onDeleteScore,
}: ScoreHistoryProps) {
  const [filterTeamId, setFilterTeamId] = useState<string>('all');
  const [filterActivityId, setFilterActivityId] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredScores = useMemo(() => {
    return scores.filter((s) => {
      if (filterTeamId !== 'all' && s.team_id !== filterTeamId) return false;
      if (filterActivityId !== 'all' && s.activity_id !== filterActivityId) return false;
      return true;
    });
  }, [scores, filterTeamId, filterActivityId]);

  const handleDelete = async (score: Score) => {
    const confirmDelete = window.confirm(
      `Deseja realmente excluir o lançamento de ${score.points > 0 ? '+' : ''}${score.points} pontos para a equipe "${score.team?.name || 'Equipe'}"?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(score.id);
      await onDeleteScore(score.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#0284c7] dark:text-[#78c8fb]" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Histórico de Pontuações
          </h2>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterTeamId}
              onChange={(e) => setFilterTeamId(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Todas as Equipes</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
            <select
              value={filterActivityId}
              onChange={(e) => setFilterActivityId(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Todas as Provas</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Registros */}
      {filteredScores.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            Nenhum lançamento encontrado
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {scores.length === 0
              ? 'Nenhuma pontuação foi registrada ainda na gincana.'
              : 'Nenhum registro corresponde aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredScores.map((score) => {
            const isPositive = Number(score.points) >= 0;
            const formattedTime = new Date(score.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const formattedDate = new Date(score.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            });

            return (
              <div
                key={score.id}
                className="glass-card rounded-2xl p-3.5 sm:p-4 transition-all hover:shadow-md flex items-center justify-between gap-3 group"
              >
                {/* Lado Esquerdo: Info da Equipe e Prova */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3.5 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: score.team?.color || '#94a3b8' }}
                    title={`Equipe: ${score.team?.name || 'Desconhecida'}`}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {score.team?.name || 'Equipe'}
                      </span>
                      {score.activity?.title && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0284c7] dark:text-[#78c8fb] border border-blue-200 dark:border-blue-900/60">
                          {score.activity.title}
                        </span>
                      )}
                    </div>

                    {score.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic truncate mt-0.5">
                        &quot;{score.notes}&quot;
                      </p>
                    )}

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formattedDate} às {formattedTime}
                    </span>
                  </div>
                </div>

                {/* Lado Direito: Pontuação e Botão Excluir */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <span
                    className={`text-lg sm:text-2xl font-black tracking-tight ${
                      isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPositive ? `+${score.points}` : score.points}
                  </span>

                  <button
                    onClick={() => handleDelete(score)}
                    disabled={deletingId === score.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Excluir este lançamento de pontos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
