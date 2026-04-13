/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureIcons from './components/FeatureIcons';
import CardPreview from './components/CardPreview';
import Arena from './components/Arena';
import AdminPanel from './components/AdminPanel';
import PlayerPanel from './components/PlayerPanel';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'arena' | 'admin'>('landing');

  if (view === 'admin') {
    return <AdminPanel onClose={() => setView('landing')} />;
  }

  if (view === 'arena') {
    return <Arena onClose={() => setView('dashboard')} />;
  }

  if (view === 'dashboard') {
    return (
      <PlayerPanel 
        onStartGame={() => setView('arena')} 
        onLogout={() => setView('landing')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 flex flex-col">
      <Navbar onArenaClick={() => setView('arena')} onAdminClick={() => setView('admin')} />
      <main className="flex-grow">
        <Hero onPlay={() => setView('dashboard')} />
      </main>
      
      <footer className="bg-black py-6 text-center text-gray-600 text-[10px] tracking-[0.3em] uppercase">
        <p>&copy; {new Date().getFullYear()} Realms Fantasy Souls. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
