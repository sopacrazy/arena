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

export default function App() {
  const [showArena, setShowArena] = useState(false);

  if (showArena) {
    return <Arena onClose={() => setShowArena(false)} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-gold/30">
      <Navbar onArenaClick={() => setShowArena(true)} />
      <main>
        <Hero />
        <FeatureIcons />
        <CardPreview />
      </main>
      
      <footer className="bg-dark-bg border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Aetheria Legends. All rights reserved.</p>
      </footer>
    </div>
  );
}
