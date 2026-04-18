import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Mail, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsViewProps {
  userId: string;
  currentUsername: string;
  onUsernameChanged: (newName: string) => void;
}

type Section = 'avatar' | 'username' | 'password' | 'email';

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

export default function SettingsView({ userId, currentUsername, onUsernameChanged }: SettingsViewProps) {
  const [openSection, setOpenSection] = useState<Section | null>(null);

  // username
  const [newUsername, setNewUsername] = useState('');
  // password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]          = useState('');
  const [confirmPassword, setConfirmPassword]  = useState('');
  // email
  const [newEmail, setNewEmail] = useState('');

  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const showFeedback = (type: FeedbackState['type'], message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const toggleSection = (s: Section) => {
    setOpenSection(prev => prev === s ? null : s);
    setFeedback(null);
    setNewUsername('');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setNewEmail('');
  };

  // ── Mudar username ────────────────────────────────────────────────────────
  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newUsername.trim();
    if (!name || name.length < 3) { showFeedback('error', 'Nome deve ter ao menos 3 caracteres'); return; }
    if (name === currentUsername) { showFeedback('error', 'O nome é igual ao atual'); return; }
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ username: name }).eq('id', userId);
    setLoading(false);
    if (error) { showFeedback('error', error.message); return; }
    onUsernameChanged(name);
    showFeedback('success', 'Nome atualizado com sucesso!');
    setNewUsername('');
  };

  // ── Mudar senha ───────────────────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { showFeedback('error', 'Nova senha deve ter ao menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { showFeedback('error', 'As senhas não coincidem'); return; }
    setLoading(true);
    // Reautenticar antes de mudar senha
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setLoading(false); showFeedback('error', 'Erro ao obter usuário'); return; }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (signInErr) { setLoading(false); showFeedback('error', 'Senha atual incorreta'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) { showFeedback('error', error.message); return; }
    showFeedback('success', 'Senha alterada com sucesso!');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  // ── Mudar email ───────────────────────────────────────────────────────────
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim();
    if (!email.includes('@')) { showFeedback('error', 'E-mail inválido'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);
    if (error) { showFeedback('error', error.message); return; }
    showFeedback('success', 'Confirmação enviada para o novo e-mail. Verifique sua caixa de entrada.');
    setNewEmail('');
  };

  const sections: { id: Section; label: string; icon: React.ElementType; disabled?: boolean }[] = [
    { id: 'avatar',   label: 'Selecionar Avatar',  icon: Camera,  disabled: true },
    { id: 'username', label: 'Mudar Nome',          icon: User },
    { id: 'password', label: 'Alterar Senha',       icon: Lock },
    { id: 'email',    label: 'Alterar E-mail',      icon: Mail },
  ];

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-3">
      <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-6">Configurações da Conta</h2>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border mb-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {sections.map(({ id, label, icon: Icon, disabled }) => (
        <div key={id} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
          <button
            onClick={() => !disabled && toggleSection(id)}
            disabled={disabled}
            className={`w-full flex items-center gap-4 px-5 py-4 transition-all ${
              disabled
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-white/5 cursor-pointer'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              openSection === id ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'bg-white/5 text-white/40'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-white/70 uppercase tracking-widest flex-1 text-left">{label}</span>
            {disabled && <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Em Breve</span>}
            {!disabled && (
              <motion.div animate={{ rotate: openSection === id ? 180 : 0 }} className="text-white/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            )}
          </button>

          <AnimatePresence>
            {openSection === id && !disabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1 border-t border-white/5">

                  {/* Avatar (placeholder) */}
                  {id === 'avatar' && (
                    <p className="text-white/30 text-sm">Avatares em breve.</p>
                  )}

                  {/* Nome */}
                  {id === 'username' && (
                    <form onSubmit={handleUsernameChange} className="space-y-3">
                      <p className="text-[11px] text-white/30 uppercase tracking-widest">Nome atual: <span className="text-white/60">{currentUsername}</span></p>
                      <input
                        type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                        placeholder="Novo nome de jogador"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                      />
                      <button type="submit" disabled={loading}
                        className="w-full py-3 bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 border border-[#c9a84c]/30 text-[#c9a84c] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Nome'}
                      </button>
                    </form>
                  )}

                  {/* Senha */}
                  {id === 'password' && (
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      {[
                        { val: currentPassword, set: setCurrentPassword, label: 'Senha atual' },
                        { val: newPassword,     set: setNewPassword,     label: 'Nova senha' },
                        { val: confirmPassword, set: setConfirmPassword, label: 'Confirmar nova senha' },
                      ].map(({ val, set, label }) => (
                        <input key={label} type="password" value={val} onChange={e => set(e.target.value)}
                          placeholder={label}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 transition-colors" />
                      ))}
                      <button type="submit" disabled={loading}
                        className="w-full py-3 bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 border border-[#c9a84c]/30 text-[#c9a84c] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Alterar Senha'}
                      </button>
                    </form>
                  )}

                  {/* Email */}
                  {id === 'email' && (
                    <form onSubmit={handleEmailChange} className="space-y-3">
                      <p className="text-[11px] text-white/30 uppercase tracking-widest">Um e-mail de confirmação será enviado ao novo endereço.</p>
                      <input
                        type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                        placeholder="Novo e-mail"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                      />
                      <button type="submit" disabled={loading}
                        className="w-full py-3 bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 border border-[#c9a84c]/30 text-[#c9a84c] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Alterar E-mail'}
                      </button>
                    </form>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
