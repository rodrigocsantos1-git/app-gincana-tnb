'use client';

import React, { useState } from 'react';
import { Team, TeamStanding } from '@/lib/types';
import { Plus, Edit2, Trash2, Shield, Check, X, Palette } from 'lucide-react';

interface TeamManagerProps {
  teams: Team[];
  standings: TeamStanding[];
  onAddTeam: (data: { name: string; color: string }) => Promise<any>;
  onUpdateTeam: (id: string, data: { name: string; color: string }) => Promise<any>;
  onDeleteTeam: (id: string) => Promise<any>;
}

const PRESET_COLORS = [
  { name: 'Branco Paz', hex: '#ffffff' },
  { name: 'Vermelho Fogo', hex: '#ef4444' },
  { name: 'Azul Real', hex: '#3b82f6' },
  { name: 'Amarelo Ouro', hex: '#f59e0b' },
  { name: 'Verde Esmeralda', hex: '#10b981' },
  { name: 'Roxo Vibrante', hex: '#8b5cf6' },
  { name: 'Rosa Choque', hex: '#ec4899' },
  { name: 'Laranja Radiante', hex: '#f97316' },
  { name: 'Ciano Céu', hex: '#06b6d4' },
];

export function TeamManager({
  teams,
  standings,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
}: TeamManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ef4444');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startAdd = () => {
    setName('');
    setColor(PRESET_COLORS[teams.length % PRESET_COLORS.length].hex);
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (team: Team) => {
    setName(team.name);
    setColor(team.color);
    setEditingId(team.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        await onUpdateTeam(editingId, { name: name.trim(), color });
      } else {
        await onAddTeam({ name: name.trim(), color });
      }
      cancelForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (team: Team) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a equipe "${team.name}"? Todas as pontuações desta equipe serão removidas.`
    );
    if (!confirmDelete) return;

    await onDeleteTeam(team.id);
  };

  const getPoints = (teamId: string) => {
    return standings.find((s) => s.team.id === teamId)?.totalPoints ?? 0;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#0284c7] dark:text-[#78c8fb]" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Gerenciamento de Equipes
          </h2>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0284c7] to-[#78c8fb] hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Equipe
          </button>
        )}
      </div>

      {/* Formulário de Adicionar / Editar */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="glass-card rounded-2xl p-5 mb-6 border-2 border-[#78c8fb]/60 animate-in fade-in"
        >
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#78c8fb]" />
            {editingId ? 'Editar Equipe' : 'Cadastrar Nova Equipe'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nome da Equipe:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leão de Judá, Guerreiros da Fé..."
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Cor Representativa:
              </label>
              {/* Paleta Rápida de Cores */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {PRESET_COLORS.map((c) => {
                  const isWhitePreset = c.hex.toLowerCase() === '#ffffff';
                  const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        isWhitePreset ? 'border border-slate-300 dark:border-slate-500' : ''
                      } ${
                        isSelected
                          ? 'ring-3 ring-offset-2 ring-slate-800 dark:ring-white scale-110'
                          : ''
                      }`}
                      title={c.name}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 drop-shadow ${
                            isWhitePreset ? 'text-slate-950' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Seletor Customizado Hex */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>
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
                {isSubmitting ? 'Salvando...' : 'Salvar Equipe'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid de Equipes Cadastradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {teams.map((team) => {
          const points = getPoints(team.id);

          return (
            <div
              key={team.id}
              className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shadow-sm border-2 flex-shrink-0 ${
                    (team?.name || '').toLowerCase().includes('branc') || (team?.color || '').toLowerCase() === '#ffffff' || (team?.color || '').toLowerCase() === '#fff'
                      ? 'text-slate-950 border-slate-400 dark:border-slate-500 ring-1 ring-slate-900/10'
                      : (team?.name || '').toLowerCase().includes('amar') || (team?.color || '').toLowerCase() === '#f59e0b'
                      ? 'text-amber-950 border-amber-300/80'
                      : 'text-white border-white dark:border-slate-700'
                  }`}
                  style={{ backgroundColor: team?.color || '#0284c7' }}
                >
                  {(team?.name || 'EQ').substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {team.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {points} {points === 1 ? 'ponto' : 'pontos'} acumulados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(team)}
                  className="p-2 rounded-xl text-slate-400 hover:text-[#0284c7] dark:hover:text-[#78c8fb] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Editar equipe"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(team)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Excluir equipe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
