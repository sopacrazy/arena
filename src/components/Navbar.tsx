import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  onArenaClick: () => void;
  onAdminClick: () => void;
}

export default function Navbar({ onArenaClick, onAdminClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-500 bg-transparent hover:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-24">
          
          {/* Logo Area (Left) */}
          <div className="flex items-center justify-start gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <img 
              src="/logo.webp" 
              alt="Arcane Crusade" 
              className="h-9 w-auto object-contain transition-transform group-hover:scale-110 duration-300" 
            />
          </div>
          
          {/* Desktop Navigation (Center) */}
          <div className="hidden lg:flex items-center justify-center space-x-10">
            {[
              { en: 'Announcements', pt: 'Anúncios' },
              { en: 'Overview', pt: 'Visão Geral' },
              { en: 'Shop', pt: 'Loja' },
              { en: 'Community', pt: 'Comunidade' },
              { en: 'Support', pt: 'Suporte' }
            ].map((item) => (
              <a 
                key={item.en} 
                href={`#${item.en.toLowerCase()}`} 
                className="text-[11px] font-bold text-white/70 hover:text-gold transition-all tracking-[0.2em] uppercase relative group whitespace-nowrap"
              >
                {item.pt}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all group-hover:w-full" />
              </a>
            ))}
            <button 
                onClick={onAdminClick}
                className="text-[11px] font-black text-gold/60 hover:text-gold transition-all tracking-[0.2em] uppercase cursor-pointer whitespace-nowrap"
              >
                Forjar
            </button>
          </div>

          {/* Empty Space / Future Actions (Right) */}
          <div className="hidden lg:flex items-center justify-end">
             {/* Reserved for profile/login button if needed later */}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-gold cursor-pointer transition-colors p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-gold/20"
        >
          <div className="px-6 pt-4 pb-8 space-y-4">
            {[
              { en: 'Announcements', pt: 'Anúncios' },
              { en: 'Overview', pt: 'Visão Geral' },
              { en: 'Shop', pt: 'Loja' },
              { en: 'Community', pt: 'Comunidade' },
              { en: 'Support', pt: 'Suporte' }
            ].map((item) => (
              <a 
                key={item.en} 
                href={`#${item.en.toLowerCase()}`} 
                className="block text-sm font-bold text-white/80 hover:text-gold tracking-[0.2em] uppercase py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.pt}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

