'use client';

import React, { useState, useEffect } from 'react';
import { AllowedAdmin } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { ShieldCheck, UserPlus, Trash2, Mail, User, Shield, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function AdminManager() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AllowedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem('tnb_allowed_admins');
        if (stored) {
          setAdmins(JSON.parse(stored));
        } else {
          const defaults: AllowedAdmin[] = [
            { id: '1', name: 'Rodrigo Correa', email: 'rodrigocsantos1@gmail.com', role: 'admin' },
            { id: '2', name: 'Luciano Tomaz', email: 'lucianort@gmail.com', role: 'admin' },
          ];
          setAdmins(defaults);
          localStorage.setItem('tnb_allowed_admins', JSON.stringify(defaults));
        }
        return;
      }

      const { data, error } = await supabase
        .from('allowed_admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar administradores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setMsg(null);
    setSubmitting(true);
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    try {
      if (!isSupabaseConfigured) {
        const newAdmin: AllowedAdmin = {
          id: 'admin-' + Date.now(),
          name: cleanName,
          email: cleanEmail,
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        const updated = [...admins, newAdmin];
        setAdmins(updated);
        localStorage.setItem('tnb_allowed_admins', JSON.stringify(updated));
        setMsg({ type: 'success', text: `Administrador ${cleanName} adicionado com sucesso!` });
        setName('');
        setEmail('');
        setIsAdding(false);
        return;
      }

      // Insere no banco
      const { data, error } = await supabase
        .from('allowed_admins')
        .insert([{ name: cleanName, email: cleanEmail, role: 'admin' }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este e-mail já está cadastrado na lista de administradores.');
        }
        throw error;
      }

      setAdmins((prev) => [...prev, data]);
      setMsg({ type: 'success', text: `Administrador ${cleanName} liberado no banco com sucesso!` });
      setName('');
      setEmail('');
      setIsAdding(false);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao adicionar administrador.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (admin: AllowedAdmin) => {
    // Evita que o usuário exclua a si mesmo por engano
    if (admin.email.toLowerCase() === user?.email?.toLowerCase()) {
      alert('Por segurança, você não pode remover o seu próprio acesso de administrador.');
      return;
    }

    const confirmDelete = window.confirm(
      `Deseja realmente revogar o acesso de administrador de "${admin.name}" (${admin.email})?`
    );
    if (!confirmDelete) return;

    try {
      if (!isSupabaseConfigured) {
        const updated = admins.filter((a) => a.id !== admin.id);
        setAdmins(updated);
        localStorage.setItem('tnb_allowed_admins', JSON.stringify(updated));
        setMsg({ type: 'success', text: `Acesso de ${admin.name} revogado.` });
        return;
      }

      const { error } = await supabase.from('allowed_admins').delete().eq('id', admin.id);
      if (error) throw error;

      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setMsg({ type: 'success', text: `Acesso de ${admin.name} revogado no banco.` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao revogar acesso.' });
    }
  };

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0284c7] dark:text-[#78c8fb]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Controle de Acessos & Administradores
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Apenas os e-mails cadastrados nesta lista têm permissão para acessar e gerenciar a gincana
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
            Liberar Novo Administrador
          </button>
        )}
      </div>

      {/* Alertas de Sucesso / Erro */}
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

      {/* Formulário de Cadastro de Novo Administrador */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="glass-card rounded-2xl p-5 mb-6 border-2 border-[#78c8fb]/60 animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#78c8fb]" />
              Liberar Acesso para Novo Líder/Administrador
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Liberação instantânea
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nome Completo:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Luciano Tomaz"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                E-mail (Google / Gmail):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#78c8fb]"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            💡 Assim que for adicionado, esse usuário poderá acessar <strong>[gincana-tnb.vercel.app](https://gincana-tnb.vercel.app)</strong> e entrar com o botão do Google ou criar sua senha.
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
              {submitting ? 'Salvando...' : 'Liberar Acesso no Banco'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Administradores */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Administradores Ativos ({admins.length})
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acesso Total Liberado
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {admins.map((adm) => {
            const isMe = adm.email.toLowerCase() === user?.email?.toLowerCase();
            return (
              <div
                key={adm.id || adm.email}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#78c8fb] to-[#bb94ff] flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
                    {adm.name ? adm.name.substring(0, 2).toUpperCase() : 'AD'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {adm.name}
                      </h4>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-[#0284c7] dark:text-[#78c8fb] border border-blue-200 dark:border-blue-800">
                          Você
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-[#5b21b6] dark:text-[#bb94ff] border border-purple-200 dark:border-purple-800">
                        Administrador
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {adm.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(adm)}
                    disabled={isMe}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isMe
                        ? 'opacity-30 cursor-not-allowed text-slate-300'
                        : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                    title={isMe ? 'Você não pode revogar seu próprio acesso' : 'Revogar acesso de administrador'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
