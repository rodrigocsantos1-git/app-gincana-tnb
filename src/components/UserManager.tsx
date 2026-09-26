'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Trash2,
  Mail,
  User,
  Shield,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export function UserManager() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'admin' | 'volunteer'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'volunteer'>('volunteer');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carrega todos os perfis
  const fetchProfiles = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('tnb_demo_profiles');
      if (stored) {
        setProfiles(JSON.parse(stored));
      } else {
        const defaults: Profile[] = [
          { id: '1', name: 'Rodrigo Correa', email: 'rodrigocsantos1@gmail.com', role: 'admin', approved: true },
          { id: '2', name: 'Luciano Tomaz', email: 'lucianort@gmail.com', role: 'admin', approved: true },
          { id: '3', name: 'Voluntário Exemplo', email: 'voluntario@igreja.com', role: 'volunteer', approved: false },
        ];
        setProfiles(defaults);
        localStorage.setItem('tnb_demo_profiles', JSON.stringify(defaults));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar perfis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Aprovar ou desaprovar usuário
  const handleToggleApproval = async (profile: Profile) => {
    const newApprovalState = !profile.approved;
    try {
      if (!isSupabaseConfigured) {
        const updated = profiles.map((p) =>
          p.id === profile.id ? { ...p, approved: newApprovalState } : p
        );
        setProfiles(updated);
        localStorage.setItem('tnb_demo_profiles', JSON.stringify(updated));
        setMsg({
          type: 'success',
          text: `Usuário ${profile.name} foi ${newApprovalState ? 'aprovado' : 'suspenso'}.`,
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ approved: newApprovalState })
        .eq('id', profile.id);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, approved: newApprovalState } : p))
      );
      setMsg({
        type: 'success',
        text: `Usuário ${profile.name} foi ${newApprovalState ? 'aprovado' : 'suspenso'} com sucesso!`,
      });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao alterar aprovação.' });
    }
  };

  // Alternar cargo entre Administrador e Voluntário
  const handleToggleRole = async (profile: Profile) => {
    if (profile.email?.toLowerCase() === user?.email?.toLowerCase()) {
      alert('Você não pode alterar o seu próprio cargo.');
      return;
    }

    const nextRole: 'admin' | 'volunteer' = profile.role === 'admin' ? 'volunteer' : 'admin';
    try {
      if (!isSupabaseConfigured) {
        const updated = profiles.map((p) =>
          p.id === profile.id ? { ...p, role: nextRole } : p
        );
        setProfiles(updated);
        localStorage.setItem('tnb_demo_profiles', JSON.stringify(updated));
        setMsg({
          type: 'success',
          text: `Cargo de ${profile.name} alterado para ${nextRole === 'admin' ? 'Administrador' : 'Voluntário'}.`,
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', profile.id);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, role: nextRole } : p))
      );
      setMsg({
        type: 'success',
        text: `Cargo de ${profile.name} alterado para ${nextRole === 'admin' ? 'Administrador' : 'Voluntário'}.`,
      });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao alterar cargo.' });
    }
  };

  // Excluir usuário
  const handleDeleteUser = async (profile: Profile) => {
    if (profile.email?.toLowerCase() === user?.email?.toLowerCase()) {
      alert('Você não pode excluir o seu próprio usuário.');
      return;
    }

    const confirmDelete = window.confirm(
      `Deseja realmente remover o acesso de "${profile.name}" (${profile.email})?`
    );
    if (!confirmDelete) return;

    try {
      if (!isSupabaseConfigured) {
        const updated = profiles.filter((p) => p.id !== profile.id);
        setProfiles(updated);
        localStorage.setItem('tnb_demo_profiles', JSON.stringify(updated));
        setMsg({ type: 'success', text: `Usuário ${profile.name} removido.` });
        return;
      }

      // Tenta RPC segura delete_user_by_admin
      const { error: rpcErr } = await supabase.rpc('delete_user_by_admin', {
        target_user_id: profile.id,
      });

      if (rpcErr) {
        // Fallback: exclusão direta da linha do perfil
        const { error: delErr } = await supabase.from('profiles').delete().eq('id', profile.id);
        if (delErr) throw delErr;
      }

      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
      setMsg({ type: 'success', text: `Usuário ${profile.name} removido com sucesso!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao remover usuário.' });
    }
  };

  // Pré-cadastrar ou convidar novo usuário já com perfil definido
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setSubmitting(true);
    setMsg(null);
    const cleanEmail = newEmail.toLowerCase().trim();
    const cleanName = newName.trim();
    const isGmailAccount = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');
    const passwordToUse =
      newPassword.trim() ||
      (isGmailAccount
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(-8) + 'Tnb1!');

    try {
      if (!isSupabaseConfigured) {
        const newProf: Profile = {
          id: 'user-' + Date.now(),
          name: cleanName,
          email: cleanEmail,
          role: newRole,
          approved: true,
          created_at: new Date().toISOString(),
        };
        const updated = [newProf, ...profiles];
        setProfiles(updated);
        localStorage.setItem('tnb_demo_profiles', JSON.stringify(updated));
        setMsg({
          type: 'success',
          text: `Usuário ${cleanName} pré-cadastrado como ${newRole === 'admin' ? 'Administrador' : 'Voluntário'}!`,
        });
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setIsAdding(false);
        return;
      }

      // 1. Tenta criar diretamente via RPC segura admin_create_user
      const { error: rpcErr } = await supabase.rpc('admin_create_user', {
        new_name: cleanName,
        new_email: cleanEmail,
        new_password: passwordToUse,
        new_role: newRole,
      });

      if (rpcErr) {
        // Fallback: upsert direto na tabela profiles
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(
            [
              {
                name: cleanName,
                email: cleanEmail,
                role: newRole,
                approved: true,
              },
            ],
            { onConflict: 'email' }
          );

        if (upsertErr) {
          const { error: insErr } = await supabase.from('profiles').insert([
            {
              name: cleanName,
              email: cleanEmail,
              role: newRole,
              approved: true,
            },
          ]);
          if (insErr) throw insErr;
        }
      }

      await fetchProfiles();
      if (isGmailAccount && !newPassword.trim()) {
        setMsg({
          type: 'success',
          text: `Usuário "${cleanName}" liberado com sucesso como ${newRole === 'admin' ? 'Administrador' : 'Voluntário'}! Ele já pode acessar clicando diretamente em "Entrar com o Google".`,
        });
      } else {
        setMsg({
          type: 'success',
          text: `Usuário "${cleanName}" cadastrado com sucesso! E-mail: ${cleanEmail} | Senha inicial: ${passwordToUse}`,
        });
      }

      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setIsAdding(false);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao cadastrar usuário.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Métricas
  const totalUsers = profiles.length;
  const pendingCount = profiles.filter((p) => !p.approved).length;
  const adminCount = profiles.filter((p) => p.role === 'admin' && p.approved).length;
  const volunteerCount = profiles.filter((p) => p.role === 'volunteer' && p.approved).length;

  const filteredProfiles = profiles.filter((p) => {
    if (filter === 'pending') return !p.approved;
    if (filter === 'admin') return p.role === 'admin';
    if (filter === 'volunteer') return p.role === 'volunteer';
    return true;
  });

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0284c7] dark:text-[#78c8fb]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Gestão de Acessos & Usuários
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de aprovação de líderes e definição de perfis (Administrador ou Voluntário)
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setMsg(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0284c7] to-[#78c8fb] hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Liberar Novo Acesso
          </button>
        )}
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-3.5 text-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400">Total Usuários</span>
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalUsers}</p>
        </div>

        <div className="glass-card rounded-2xl p-3.5 text-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-purple-600 dark:text-purple-400">Administradores</span>
          <p className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">{adminCount}</p>
        </div>

        <div className="glass-card rounded-2xl p-3.5 text-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Voluntários</span>
          <p className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{volunteerCount}</p>
        </div>

        <div className="glass-card rounded-2xl p-3.5 text-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Pendentes</span>
          <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300 mt-0.5">{pendingCount}</p>
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {msg && (
        <div
          className={`mb-5 p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Formulário de Adicionar / Liberar Usuário */}
      {isAdding && (
        <form
          onSubmit={handleAddUser}
          className="glass-card rounded-2xl p-5 mb-6 border-2 border-[#78c8fb]/60 animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#78c8fb]" />
              Liberar / Convidar Usuário para a Plataforma
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Nasce Aprovado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nome Completo:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Luciano Tomaz"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                E-mail (Google / Outro):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Senha Inicial (Opcional):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Opcional para Google"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Perfil de Acesso:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'volunteer')}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
              >
                <option value="volunteer">Voluntário (Lança pontos e provas)</option>
                <option value="admin">Administrador (Acesso total + Usuários)</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            💡 <strong>Dica:</strong> Se a pessoa for entrar pelo botão <em>&quot;Entrar com Google&quot;</em>, deixe a senha em branco. Caso use login por e-mail e senha, informe uma senha inicial com pelo menos 6 dígitos.
          </p>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setMsg(null);
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#0284c7] to-[#78c8fb] hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Liberar no Banco'}
            </button>
          </div>
        </form>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: `Pendentes (${pendingCount})` },
            { id: 'admin', label: 'Administradores' },
            { id: 'volunteer', label: 'Voluntários' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filter === item.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchProfiles}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-[#0284c7] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Recarregar usuários"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Lista de Usuários */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredProfiles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Nenhum usuário encontrado para este filtro.
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isMe = p.email?.toLowerCase() === user?.email?.toLowerCase();

              return (
                <div
                  key={p.id || p.email}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !p.approved
                      ? 'bg-amber-50/50 dark:bg-amber-950/20'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Info do Usuário */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0 text-white ${
                        p.role === 'admin'
                          ? 'bg-gradient-to-br from-[#78c8fb] to-[#bb94ff]'
                          : 'bg-gradient-to-br from-[#0284c7] to-[#78c8fb]'
                      }`}
                    >
                      {p.name ? p.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {p.name}
                        </h4>

                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-[#0284c7] dark:text-[#78c8fb] border border-blue-200 dark:border-blue-800">
                            Você
                          </span>
                        )}

                        {/* Badge de Status */}
                        {p.approved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Aprovado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}

                        {/* Badge de Cargo */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            p.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-[#5b21b6] dark:text-[#bb94ff] border-purple-200 dark:border-purple-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {p.role === 'admin' ? 'Administrador' : 'Voluntário'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {p.email || 'Sem e-mail'}
                      </p>
                    </div>
                  </div>

                  {/* Ações do Administrador */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    {/* Botão de Aprovação / Suspensão */}
                    <button
                      onClick={() => handleToggleApproval(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        p.approved
                          ? 'bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 dark:bg-slate-800 dark:hover:bg-amber-950/50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                      title={p.approved ? 'Suspender aprovação do usuário' : 'Aprovar usuário para acessar o site'}
                    >
                      {p.approved ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Suspender
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Aprovar Acesso
                        </>
                      )}
                    </button>

                    {/* Botão de Alternar Cargo */}
                    {!isMe && (
                      <button
                        onClick={() => handleToggleRole(p)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title={`Alternar para ${p.role === 'admin' ? 'Voluntário' : 'Administrador'}`}
                      >
                        {p.role === 'admin' ? 'Tornar Voluntário' : 'Tornar Administrador'}
                      </button>
                    )}

                    {/* Botão Excluir */}
                    {!isMe && (
                      <button
                        onClick={() => handleDeleteUser(p)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remover usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
