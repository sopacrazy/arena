import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Edit2, Shield, Sword, Type, FileText, X, Save, 
  Image as ImageIcon, Lock, User, Sparkles, ChevronRight, 
  Search, Wand2, Gavel, Heart
} from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: string;
  atk: number;
  hp: number;
  desc: string;
  image: string;
  color: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);

  const [cards, setCards] = useState<Card[]>([
    { id: '1', name: 'Guerreiro de Elite', type: 'Prata', atk: 5, hp: 6, desc: 'Um bravo defensor do reino.', color: 'silver', image: '/RECK 1/PRATA/Caelan, Lâmina do Juramento.webp' },
    { id: '2', name: 'Dragão Arcano', type: 'Ouro', atk: 9, hp: 10, desc: 'Uma criatura mística devastadora.', color: 'yellow', image: '/RECK 1/OURO/Aldren, Veterano da Fronteira Quebrada (5).webp' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    atk: 1,
    hp: 1,
    desc: '',
    type: 'Neutro',
    image: '/fundo.webp'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.user === 'admin' && loginData.pass === 'admin') {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingCard) {
      setCards(prev => prev.map(c => c.id === editingCard.id ? { ...editingCard, ...formData, color: getColor(formData.type) } : c));
    } else {
      const newCard: Card = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        color: getColor(formData.type)
      };
      setCards(prev => [...prev, newCard]);
    }
    resetForm();
  };

  const getColor = (type: string) => {
    if (type === 'Ouro') return 'yellow';
    if (type === 'Prata') return 'silver';
    return 'gray';
  };

  const resetForm = () => {
    setFormData({ name: '', atk: 1, hp: 1, desc: '', type: 'Neutro', image: '/fundo.webp' });
    setIsAdding(false);
    setEditingCard(null);
  };

  const startEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      atk: card.atk,
      hp: card.hp,
      desc: card.desc,
      type: card.type,
      image: card.image
    });
    setIsAdding(true);
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center font-sans overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/10 blur-[120px] rounded-full animate-pulse" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md p-10 bg-black/40 border border-white/10 rounded-[2rem] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.1)]"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-gold/30 to-black border-2 border-gold/40 rounded-3xl flex items-center justify-center rotate-45 mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <Lock className="w-10 h-10 text-gold -rotate-45" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-white text-center">Acesso Restrito</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold mt-2">Câmara da Forjaria Real</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gold/60 tracking-widest pl-2">Usuário Mestre</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text"
                  value={loginData.user}
                  onChange={e => setLoginData({ ...loginData, user: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white outline-none focus:border-gold/40 transition-all font-mono"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gold/60 tracking-widest pl-2">Senha do Éter</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
                <input 
                  type="password"
                  value={loginData.pass}
                  onChange={e => setLoginData({ ...loginData, pass: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white outline-none focus:border-gold/40 transition-all font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">
                Credenciais Inválidas, Aprendiz.
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-gold/90 hover:bg-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-4"
            >
              Impregnar Energia
            </button>
          </form>

          <button onClick={onClose} className="w-full text-center text-white/20 hover:text-white/60 transition-colors text-[9px] font-black uppercase tracking-widest mt-8">
            Voltar para a Arena
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-[#050505] flex flex-col font-sans text-white overflow-hidden">
      {/* PROFESSIONAL NAVBAR */}
      <nav className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gold blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
            <Gavel className="w-8 h-8 text-gold relative" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-[0.2em]">Grimório do Mestre</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Forjaria Ativa: Conectado</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
            <X className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: CARD ARCHIVE */}
        <aside className="w-[450px] border-r border-white/5 flex flex-col bg-black/20">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-sm font-black text-gold/80 uppercase tracking-[0.2em]">Arquivo de Lendas</h3>
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">{cards.length} Unidades Catalogadas</p>
              </div>
              <button 
                onClick={() => { resetForm(); setIsAdding(true); }}
                className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center hover:bg-gold hover:text-black transition-all group"
              >
                <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
              <input 
                type="text"
                placeholder="PROCURAR CARD..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-[10px] font-black text-white outline-none focus:border-gold/40 transition-all tracking-[0.1em]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cards.map(card => (
                <motion.div 
                  key={card.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => startEdit(card)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4 ${editingCard?.id === card.id ? 'bg-gold/10 border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'bg-white/[0.03] border-white/10 hover:border-gold/30'}`}
                >
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-white/20 bg-black shadow-lg">
                    <img src={card.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-x-1 bottom-1 flex justify-between">
                       <span className="text-[px] font-black text-red-500">{card.atk}</span>
                       <span className="text-[8px] font-black text-emerald-500">{card.hp}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <h4 className="font-black text-xs uppercase tracking-widest">{card.name}</h4>
                       <div className={`w-1.5 h-1.5 rounded-full ${card.type === 'Ouro' ? 'bg-yellow-400' : card.type === 'Prata' ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
                    </div>
                    <p className="text-[8px] font-bold text-white/30 truncate mt-1 uppercase italic tracking-wider">{card.desc}</p>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-xl transition-all text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </aside>

        {/* RIGHT: THE FORGE (ALTAR) */}
        <main className="flex-1 p-12 bg-black/40 relative overflow-y-auto custom-scrollbar">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />

          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-4xl mx-auto flex gap-12"
              >
                {/* Visual Card Preview */}
                <div className="w-[300px] space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] text-center">Visualização Real</h5>
                  <div className={`relative w-[280px] h-[400px] rounded-[2rem] border-4 p-1.5 bg-black overflow-hidden shadow-2xl transition-all duration-700 group/preview ${formData.type === 'Ouro' ? 'border-yellow-500/50 shadow-yellow-500/20' : formData.type === 'Prata' ? 'border-zinc-400/50 shadow-zinc-400/20' : 'border-zinc-700/50 shadow-white/5'}`}>
                      {/* Inner Border */}
                      <div className="absolute inset-0 border border-white/5 rounded-[1.8rem] m-1 pointer-events-none z-10" />
                      
                      {/* Card Surface */}
                      <div className="relative w-full h-full bg-[#050505] rounded-[1.6rem] overflow-hidden flex flex-col group">
                        <div className="w-full h-full relative overflow-hidden">
                           <img src={formData.image} alt="" className="w-full h-full object-contain" />
                        </div>
                        
                        {/* Hover Overlay with Stats and Info */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 group-hover/preview:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-4 group-hover/preview:translate-y-0">
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <h4 className="font-black text-lg uppercase tracking-widest text-white leading-tight break-words">{formData.name || 'Nova Unidade'}</h4>
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${formData.type === 'Ouro' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : formData.type === 'Prata' ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
                                    <p className="text-[10px] font-black text-gold/80 uppercase tracking-widest">{formData.type}</p>
                                 </div>
                              </div>
                              
                              <p className="text-[10px] text-white/60 leading-relaxed font-bold uppercase italic tracking-tighter">
                                {formData.desc || 'Descreva as habilidades deste combatente nas linhas do grimório...'}
                              </p>
                              
                              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                 <div className="flex flex-col">
                                    <span className="text-[16px] font-black text-red-500 flex items-center gap-2">
                                      <Sword className="w-4 h-4" /> {formData.atk}
                                    </span>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className="text-[16px] font-black text-emerald-500 flex items-center gap-2">
                                      {formData.hp} <Heart className="w-4 h-4" />
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                  </div>
                  <p className="text-[9px] font-black text-white/20 text-center uppercase tracking-widest">Passe o mouse para ver detalhes</p>
                </div>

                {/* Edit Form */}
                <div className="flex-1 space-y-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gold/10 rounded-xl">
                       <Wand2 className="w-6 h-6 text-gold" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em]">{editingCard ? 'Modificar Lenda' : 'Auscultar Matéria'}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gold/50 tracking-widest pl-2">Batismo da Unidade</label>
                        <input 
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/40 transition-all outline-none"
                          placeholder="Ex: Arcanista Primordial"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-red-500/50 tracking-widest pl-2">Poder (ATK)</label>
                          <input 
                            type="number"
                            value={formData.atk}
                            onChange={e => setFormData({ ...formData, atk: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-500/40 transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-emerald-500/50 tracking-widest pl-2">Vida (HP)</label>
                          <input 
                            type="number"
                            value={formData.hp}
                            onChange={e => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-emerald-500/40 transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gold/50 tracking-widest pl-2">Essência da Raridade</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Neutro', 'Prata', 'Ouro'].map(t => (
                            <button 
                              key={t}
                              onClick={() => setFormData({ ...formData, type: t })}
                              className={`py-3 rounded-2xl text-[9px] font-black uppercase transition-all border ${formData.type === t ? 'bg-gold/20 border-gold/50 text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-white/5 border-white/10 text-white/20'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gold/50 tracking-widest pl-2">Invocação Visual (URL)</label>
                        <div className="flex gap-2">
                          <input 
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/40 transition-all outline-none text-[10px] font-mono"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-[10px]">
                        <label className="font-black uppercase text-gold/50 tracking-widest pl-2">Grimório de Descrição</label>
                        <textarea 
                          value={formData.desc}
                          onChange={e => setFormData({ ...formData, desc: e.target.value })}
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/40 transition-all outline-none resize-none leading-relaxed"
                          placeholder="Inscreva aqui o destino desta unidade..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={resetForm}
                          className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all text-white/40 hover:text-white"
                        >
                          Dissipar
                        </button>
                        <button 
                          onClick={handleSave}
                          className="flex-[2] py-4 bg-gradient-to-br from-gold/80 to-gold hover:scale-[1.02] transition-all rounded-2xl text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" /> {editingCard ? 'Consolidar Lenda' : 'Forjar Unidade'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-8">
                <div className="relative group">
                   <div className="absolute inset-0 bg-gold blur-[60px] opacity-10 animate-pulse" />
                   <div className="relative w-40 h-40 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-center shadow-2xl scale-110">
                      <Gavel className="w-20 h-20 text-white/5 group-hover:text-gold/20 transition-all duration-700 group-hover:rotate-12" />
                   </div>
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white/60">Altar da Criação</h3>
                  <p className="max-w-xs mx-auto text-[10px] font-black text-white/20 uppercase tracking-[0.3em] leading-loose italic">
                    "O destino das almas agora repousa em suas mãos, Mestre de Runas."
                  </p>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="mt-8 px-10 py-4 bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold transition-all rounded-full text-[10px] font-black uppercase tracking-widest"
                  >
                    Iniciar Ritual de Forja
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.3);
        }
      `}</style>
    </div>
  );
}
