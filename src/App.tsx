/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Arena from './components/Arena';
import AdminPanel from './components/AdminPanel';
import PlayerPanel from './components/PlayerPanel';
import AuthView from './components/AuthView';
import PVPLobby from './components/PVPLobby';
import PVPArena from './components/PVPArena';

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard' | 'arena' | 'admin' | 'pvp-lobby' | 'pvp-arena'>('landing');
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [pvpRoom,   setPvpRoom]   = useState('');
  const [pvpIsHost, setPvpIsHost] = useState(false);
  const [pvpOpponent, setPvpOpponent] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) ensureProfile(data.session.user.id, data.session.user.email ?? '');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) ensureProfile(s.user.id, s.user.email ?? '');
      else setView('landing');
    });
    return () => subscription.unsubscribe();
  }, []);

  // Garante que o perfil existe — cria se o usuário é antigo e não tinha linha
  async function ensureProfile(userId: string, email: string) {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!data) {
      const username = email.split('@')[0];
      await supabase.from('profiles').insert({
        id: userId,
        username,
        gold: 500,
        gems: 10,
        wins: 0,
        losses: 0,
        pb_record: 30,
      });
    }
  }

  // Aguardando verificação inicial da sessão
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === 'admin') {
    return <AdminPanel onClose={() => setView('landing')} session={session} />;
  }

  if (view === 'arena') {
    return <Arena onClose={() => setView('dashboard')} userId={session?.user.id} />;
  }

  if (view === 'pvp-lobby') {
    return (
      <PVPLobby
        userId={session!.user.id}
        username={session!.user.email?.split('@')[0] ?? 'Jogador'}
        onMatch={(roomId, isHost, opponentName) => {
          setPvpRoom(roomId); setPvpIsHost(isHost); setPvpOpponent(opponentName);
          setView('pvp-arena');
        }}
        onClose={() => setView('dashboard')}
      />
    );
  }

  if (view === 'pvp-arena') {
    return (
      <PVPArena
        roomId={pvpRoom}
        isHost={pvpIsHost}
        userId={session!.user.id}
        username={session!.user.email?.split('@')[0] ?? 'Jogador'}
        opponentName={pvpOpponent}
        onClose={() => setView('dashboard')}
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <PlayerPanel
        userId={session!.user.id}
        onStartGame={() => setView('arena')}
        onStartPVP={() => setView('pvp-lobby')}
        onLogout={async () => {
          await supabase.auth.signOut();
          setView('landing');
        }}
      />
    );
  }

  if (view === 'auth') {
    return (
      <AuthView
        onAuthenticated={() => setView('dashboard')}
        onBack={() => setView('landing')}
      />
    );
  }

  // Landing page — visível a todos
  const handlePlay = () => {
    if (session) setView('dashboard');
    else setView('auth');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 flex flex-col">
      <Navbar
        onArenaClick={handlePlay}
        onAdminClick={() => setView('admin')}
        onLoginClick={() => setView('auth')}
        session={session}
        onDashboardClick={() => setView('dashboard')}
        onLogout={async () => { await supabase.auth.signOut(); }}
      />
      <main className="flex-grow">
        <Hero onPlay={handlePlay} />
      </main>
      <footer className="bg-black py-6 text-center text-gray-600 text-[10px] tracking-[0.3em] uppercase">
        <p>&copy; {new Date().getFullYear()} Realms Fantasy Souls. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
