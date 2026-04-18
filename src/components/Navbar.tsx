import { Menu, X, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';

interface NavbarProps {
  onArenaClick: () => void;
  onAdminClick: () => void;
  onLoginClick?: () => void;
  onDashboardClick?: () => void;
  onLogout?: () => Promise<void>;
  session?: Session | null;
}

export default function Navbar({
  onArenaClick,
  onAdminClick,
  onLoginClick,
  onDashboardClick,
  onLogout,
  session,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { pt: 'Anúncios' },
    { pt: 'Visão Geral' },
    { pt: 'Loja' },
    { pt: 'Comunidade' },
    { pt: 'Suporte' },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-500 bg-transparent hover:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-24">

          {/* Logo */}
          <div
            className="flex items-center justify-start gap-3 group cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <img
              src="/logo.webp"
              alt="Arcane Crusade"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-110 duration-300"
            />
          </div>

          {/* Links centrais */}
          <div className="hidden lg:flex items-center justify-center space-x-10">
            {navLinks.map((item) => (
              <a
                key={item.pt}
                href="#"
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

          {/* Área direita — login ou avatar */}
          <div className="hidden lg:flex items-center justify-end gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#c9a84c]" />
                  </div>
                  <span className="text-xs text-white/70 font-semibold tracking-wide max-w-[100px] truncate">
                    {session.user.email?.split('@')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-[#0d0d10] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                      <button
                        onClick={() => { setUserMenuOpen(false); onDashboardClick?.(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Painel
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); onLogout?.(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all border-t border-white/5"
                      >
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-xl transition-all"
              >
                <LogIn className="w-4 h-4" /> Entrar
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center justify-end">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gold cursor-pointer transition-colors p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-gold/20"
          >
            <div className="px-6 pt-4 pb-8 space-y-4">
              {navLinks.map((item) => (
                <a
                  key={item.pt}
                  href="#"
                  className="block text-sm font-bold text-white/80 hover:text-gold tracking-[0.2em] uppercase py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.pt}
                </a>
              ))}
              <div className="pt-2 border-t border-white/10">
                {session ? (
                  <>
                    <button
                      onClick={() => { setIsOpen(false); onDashboardClick?.(); }}
                      className="w-full text-left text-sm text-white/70 py-2 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Painel
                    </button>
                    <button
                      onClick={() => { setIsOpen(false); onLogout?.(); }}
                      className="w-full text-left text-sm text-red-400 py-2 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsOpen(false); onLoginClick?.(); }}
                    className="w-full text-left text-sm text-[#c9a84c] py-2 flex items-center gap-2 font-bold"
                  >
                    <LogIn className="w-4 h-4" /> Entrar / Cadastrar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
