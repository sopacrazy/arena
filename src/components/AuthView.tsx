import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthViewProps {
  onAuthenticated: () => void;
  onBack?: () => void;
}

type AuthMode = 'login' | 'register';

export default function AuthView({ onAuthenticated, onBack }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha invalidos.' : err.message);
      return;
    }
    onAuthenticated();
  };

  const handleRegister = async () => {
    setError(null);
    if (!username.trim()) { setError('Escolha um nome de invocador.'); return; }
    if (password.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); return; }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setLoading(false); setError(err.message); return; }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.trim(),
        gold: 500,
        gems: 10,
        wins: 0,
        losses: 0,
        pb_record: 30,
      });
    }
    setLoading(false);
    setSuccess('Conta criada! Verifique seu e-mail para confirmar, depois faca o login.');
    setMode('login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') handleLogin();
    else handleRegister();
  };

  const switchMode = (m: AuthMode) => { setMode(m); setError(null); setSuccess(null); };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: 'url(/arena.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white/80 text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      )}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <img src="/logo.webp" alt="Arcane Crusade" className="w-48 h-auto mb-2" />
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase">Realms Fantasy Souls</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0d0d10]/90 border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex mb-8 bg-white/5 rounded-xl p-1 gap-1">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                  mode === m ? 'bg-[#c9a84c] text-black shadow' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Nome de Invocador</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Seu nome epico..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="......"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c9a84c] hover:bg-[#e0bc5a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
              ) : mode === 'login' ? (
                'Entrar no Reino'
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-6 tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} Realms Fantasy Souls
        </p>
      </div>
    </div>
  );
}
