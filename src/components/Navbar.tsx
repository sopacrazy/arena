import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  onArenaClick: () => void;
}

export default function Navbar({ onArenaClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-dark-bg/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gold flex items-center justify-center font-display font-bold text-dark-bg">
              A
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-white">AETHERIA</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-gold transition-colors">Features</a>
            <a href="#cards" className="text-sm font-medium text-gray-300 hover:text-gold transition-colors">Cards</a>
            <a href="#community" className="text-sm font-medium text-gray-300 hover:text-gold transition-colors">Community</a>
            <button 
              onClick={onArenaClick}
              className="bg-gold hover:bg-gold-hover text-dark-bg font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)] cursor-pointer"
            >
              Play Now
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white cursor-pointer">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-dark-card border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-gold">Features</a>
            <a href="#cards" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-gold">Cards</a>
            <button 
              onClick={() => {
                onArenaClick();
                setIsOpen(false);
              }}
              className="w-full mt-4 bg-gold text-dark-bg font-bold py-2 px-6 rounded-full cursor-pointer"
            >
              Play Now
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
