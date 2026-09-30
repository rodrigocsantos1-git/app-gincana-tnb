'use client';

import React, { useState } from 'react';
import { Activity } from '@/lib/types';
import { Plus, Edit2, Trash2, Target, Award } from 'lucide-react';

interface ActivityManagerProps {
  activities: Activity[];
  onAddActivity: (data: {
    title: string;
    description?: string;
    max_points?: number;
  }) => Promise<any>;
  onUpdateActivity: (
    id: string,
    data: { title: string; description?: string; max_points?: number }
  ) => Promise<any>;
  onDeleteActivity: (id: string) => Promise<any>;
  onSyncOfficial?: () => Promise<any>;
}

export function ActivityManager({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onSyncOfficial,
}: ActivityManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxPoints, setMaxPoints] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startAdd = () => {
    setTitle('');
    setDescription('');
    setMaxPoints('100');
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (act: Activity) => {
    setTitle(act.title);
    setDescription(act.description || '');
    setMaxPoints(act.max_points ? String(act.max_points) : '');
    setEditingId(act.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setMaxPoints('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        max_points: maxPoints ? Number(maxPoints) : undefined,
      };

      if (editingId) {
        await onUpdateActivity(editingId, payload);
      } else {
        await onAddActivity(payload);
      }
      cancelForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (act: Activity) => {
    const confirmDelete = window.confirm(
      `Deseja realmente remover a prova "${act.title}"? Os pontos já atribuídos continuarão no histórico.`
    );
    if (!confirmDelete) return;

    await onDeleteActivity(act.id);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#0284c7] dark:text-[#78c8fb]" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Provas & Atividades da Gincana
          </h2>
        </div>

        {!isAdding && !editingId && (
          <div className="flex items-center gap-2">
            {onSyncOfficial && (
              <button
                type="button"
                disabled={isSyncing}
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    await onSyncOfficial();
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all cursor-pointer"
                title="Sincronizar todas as 9 provas oficiais do acampamento"
              >
                <span>{isSyncing ? 'Sincronizando...' : 'Provas Oficiais'}</span>
              </button>
            )}
            <button
              onClick={startAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0284c7] to-[#78c8fb] hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Prova
            </button>
          </div>
        )}
      </div>

      {/* Formulário de Adicionar / Editar */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="glass-card rounded-2xl p-5 mb-6 border-2 border-[#78c8fb]/60 animate-in fade-in"
        >
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#78c8fb]" />
            {editingId ? 'Editar Prova' : 'Cadastrar Nova Prova'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nome / Título da Prova:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Circuito Radical, Quiz Bíblico, Caça ao Tesouro..."
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Descrição ou Regras da Atividade:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Explique brevemente a dinâmica, regras ou orientações aos líderes..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Pontuação Máxima Sugerida (Opcional):
              </label>
              <input
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                placeholder="Ex: 100"
                min="0"
                className="w-40 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelForm}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#0284c7] to-[#78c8fb] hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Prova'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid de Provas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act) => (
          <div
            key={act.id}
            className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 transition-all hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  {act.title}
                </h3>
                {act.max_points && (
                  <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    até {act.max_points} pts
                  </span>
                )}
              </div>

              {act.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {act.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => startEdit(act)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#0284c7] dark:hover:text-[#78c8fb] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Editar prova"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(act)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Excluir prova"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
