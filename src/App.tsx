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

export default function App() {
  const [showArena, setShowArena] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  if (showArena) {
    return <Arena onClose={() => setShowArena(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 flex flex-col">
      <Navbar onArenaClick={() => setShowArena(true)} onAdminClick={() => setShowAdmin(true)} />
      <main className="flex-grow">
        <Hero />
      </main>
      
      <footer className="bg-black py-6 text-center text-gray-600 text-[10px] tracking-[0.3em] uppercase">
        <p>&copy; {new Date().getFullYear()} Realms Fantasy Souls. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
