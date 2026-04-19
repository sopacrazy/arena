import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Edit2, Shield, Sword, Type, FileText, X, Save,
  Image as ImageIcon, Lock, User, Sparkles, ChevronRight,
  Search, Wand2, Gavel, Heart, Loader2, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Raridade = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';

interface Card {
  id: string;
  name: string;
  level: 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
  element: 'Agua' | 'Terra' | 'Luz' | 'Trevas' | 'Vento' | 'Fogo';
  raca: 'Humano' | 'Zumbi' | 'Fada';
  classe: 'Guerreiro' | 'Mago' | 'Necromance';
  raridade: Raridade;
  atq: number;
  def: number;
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

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedCards: Card[] = data.map(c => ({
        id: c.id,
        name: c.name,
        level: c.level,
        element: c.element,
        raca: c.raca,
        classe: c.classe,
        raridade: (c.raridade as Raridade) || 'Comum',
        atq: c.atq,
        def: c.def,
        desc: c.description || '',
        image: c.image_url || '/fundo.webp',
        color: getColor(c.level)
      }));
      setCards(mappedCards);
    }
    setLoading(false);
  };

  const [activeTab, setActiveTab] = useState<'archive' | 'forge'>('archive');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    atq: 1,
    def: 1,
    desc: '',
    level: 'Neutro' as Card['level'],
    element: 'Agua' as Card['element'],
    raca: 'Humano',
    classe: 'Guerreiro' as Card['classe'],
    raridade: 'Comum' as Raridade,
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

  const convertToWebP = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const webpUrl = canvas.toDataURL('image/webp', 0.8);
          resolve(webpUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const webpUrl = await convertToWebP(file);
      setFormData(prev => ({ ...prev, image: webpUrl }));
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      setNotification({ message: 'O nome do combatente é obrigatório!', type: 'error' });
      return;
    }

    setSaving(true);
    console.log('--- Iniciando Processo de Salvamento ---');
    
    try {
      let imageUrl = formData.image;

      // Check if the image is a new base64 upload
      if (formData.image && formData.image.startsWith('data:image/')) {
        console.log('Processando imagem para upload...');
        const fileName = `${Date.now()}-${formData.name.replace(/\s+/g, '-').toLowerCase()}.webp`;
        
        try {
          const base64Data = formData.image.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/webp' });

          console.log('Enviando para Supabase Storage (bucket: card-images)...');
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('card-images')
            .upload(fileName, blob);

          if (uploadError) {
            console.warn('Erro no Storage (prosseguindo com base64):', uploadError);
            // We proceed with base64, but this might hit database size limits
          } else if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('card-images')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
            console.log('Upload concluído com sucesso:', imageUrl);
          }
        } catch (imgError) {
          console.error('Erro ao processar imagem:', imgError);
          // Fallback to original image string
        }
      }

      const cardData = {
        name: formData.name,
        level: formData.level,
        element: formData.element,
        raca: formData.raca,
        classe: formData.classe,
        raridade: formData.raridade,
        atq: formData.atq,
        def: formData.def,
        description: formData.desc,
        image_url: imageUrl
      };

      console.log('Enviando dados para a tabela "cards":', cardData);

      if (editingCard) {
        const { error: updateError } = await supabase
          .from('cards')
          .update(cardData)
          .eq('id', editingCard.id);
        
        if (updateError) throw updateError;
        console.log('Unidade atualizada com sucesso!');
      } else {
        const { error: insertError } = await supabase
          .from('cards')
          .insert([cardData]);
        
        if (insertError) throw insertError;
        console.log('Nova unidade impregnada com sucesso!');
      }
      
      await fetchCards();
      resetForm();
      setActiveTab('archive');
      setNotification({ message: 'Combatente salvo com sucesso no Grimório!', type: 'success' });
    } catch (error: any) {
      console.error('Erro crítico no salvamento:', error);
      setNotification({ message: `ERRO AO SALVAR: ${error.message || 'Verifique sua conexão.'}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getRaridadeGlow = (raridade: Raridade) => {
    switch (raridade) {
      case 'Comum':    return 'shadow-[0_0_18px_rgba(255,255,255,0.25)] border-white/20';
      case 'Incomum':  return 'shadow-[0_0_18px_rgba(180,180,210,0.35)] border-zinc-400/30';
      case 'Raro':     return 'shadow-[0_0_24px_rgba(59,130,246,0.55)] border-blue-500/40';
      case 'Épico':    return 'shadow-[0_0_28px_rgba(147,51,234,0.55)] border-purple-500/40 epic-glow';
      case 'Lendário': return 'shadow-[0_0_32px_rgba(212,175,55,0.65)] border-yellow-500/50 legendary-glow';
    }
  };

  const getRaridadeBadge = (raridade: Raridade) => {
    switch (raridade) {
      case 'Comum':    return 'text-white/50 bg-white/5 border-white/10';
      case 'Incomum':  return 'text-zinc-300 bg-zinc-400/10 border-zinc-400/20';
      case 'Raro':     return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Épico':    return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Lendário': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getColor = (level: string) => {
    if (level === 'Ouro') return 'yellow';
    if (level === 'Prata') return 'silver';
    if (level === 'Bronze') return 'orange';
    return 'gray';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      atq: 1,
      def: 1,
      desc: '',
      level: 'Neutro',
      element: 'Agua',
      raca: 'Humano',
      classe: 'Guerreiro',
      raridade: 'Comum',
      image: '/fundo.webp'
    });
    setEditingCard(null);
  };

  const startEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      atq: card.atq,
      def: card.def,
      desc: card.desc,
      level: card.level,
      element: card.element,
      raca: card.raca,
      classe: card.classe,
      raridade: card.raridade,
      image: card.image
    });
    setActiveTab('forge');
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setCards(prev => prev.filter(c => c.id !== id));
      setNotification({ message: 'Combatente banido para o vácuo com sucesso.', type: 'success' });
    } catch (error: any) {
      setNotification({ message: 'Falha ao banir combatente.', type: 'error' });
    } finally {
      setCardToDelete(null);
    }
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
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mr-4">
            <button 
              onClick={() => setActiveTab('archive')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/40 hover:text-white'}`}
            >
              Biblioteca de Lendas
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('forge'); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'forge' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/40 hover:text-white'}`}
            >
              Forjar Unidade
            </button>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
            <X className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'archive' ? (
            <motion.div 
              key="archive"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Arquivo de Lendas</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{cards.length} Unidades Catalogadas no Grimório</p>
                </div>

                <div className="flex gap-4">
                  <div className="relative group w-[300px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
                    <input 
                      type="text"
                      placeholder="PROCURAR NA BIBLIOTECA..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-14 py-4 text-[11px] font-black text-white outline-none focus:border-gold/40 transition-all tracking-widest"
                    />
                  </div>
                  <button 
                    onClick={() => { resetForm(); setActiveTab('forge'); }}
                    className="px-8 bg-gold hover:bg-gold-hover text-black rounded-2xl font-black uppercase text-[11px] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-gold/10"
                  >
                    <Plus className="w-5 h-5" /> Nova Unidade
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-gold animate-spin" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Convocando Registro do Éter...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {cards.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(card => (
                    <motion.div
                      key={card.id}
                      layout
                      whileHover={{ y: -5 }}
                      onClick={() => startEdit(card)}
                      className={`relative bg-white/[0.03] border rounded-[2.5rem] p-6 cursor-pointer group hover:bg-white/[0.05] transition-all ${getRaridadeGlow(card.raridade)}`}
                    >
                      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 mb-6 bg-black shadow-2xl">
                        <img src={card.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-x-4 bottom-4 flex justify-between">
                          <div className="px-3 py-1.5 bg-red-600/20 backdrop-blur-md rounded-xl border border-red-500/30 flex items-center gap-2">
                             <Sword className="w-3 h-3 text-red-500" />
                             <span className="text-xs font-black text-white">{card.atq}</span>
                          </div>
                          <div className="px-3 py-1.5 bg-emerald-600/20 backdrop-blur-md rounded-xl border border-emerald-500/30 flex items-center gap-2">
                             <span className="text-xs font-black text-white">{card.def}</span>
                             <Shield className="w-3 h-3 text-emerald-500" />
                          </div>
                        </div>
                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${card.level === 'Ouro' ? 'bg-yellow-400' : card.level === 'Prata' ? 'bg-zinc-400' : card.level === 'Bronze' ? 'bg-orange-400' : 'bg-zinc-600'} shadow-lg shadow-black/50`} />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-black uppercase tracking-widest text-white mb-1">{card.name}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                               <p className="text-[10px] font-black text-gold/60 uppercase">{card.level}</p>
                               <span className="text-white/20">•</span>
                               <p className="text-[10px] font-black text-white/40 uppercase">{card.element}</p>
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getRaridadeBadge(card.raridade)}`}>{card.raridade}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); startEdit(card); }}
                              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={(e) => { e.stopPropagation(); setCardToDelete(card); }}
                               className="p-3 bg-red-500/5 hover:bg-red-500/20 rounded-xl text-red-500/40 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/30 italic uppercase font-bold tracking-widest line-clamp-2 leading-relaxed">"{card.desc}"</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="forge"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="h-full flex flex-col p-10 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-start py-10">
                {/* FORGE CONTROLS (FORM) */}
                <div className="lg:col-span-7 space-y-10">
                   <div className="space-y-2">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gold/10 rounded-3xl flex items-center justify-center border border-gold/40">
                           <Wand2 className="w-8 h-8 text-gold" />
                        </div>
                        <div>
                          <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
                            {editingCard ? 'Modificar Lenda' : 'Auscultar Matéria'}
                          </h2>
                          <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Canalize a essência para manifestar a unidade</p>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

                      {/* ── Linha 1: Nome ── */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] flex items-center gap-2">
                          <Type className="w-3 h-3 text-gold/50" /> Nome do Combatente
                        </label>
                        <input
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/40 text-base font-bold transition-all outline-none placeholder:text-white/10"
                          placeholder="Ex: Arcanista Primordial"
                        />
                      </div>

                      {/* ── Linha 2: Raça + Classe + ATQ + DEF ── */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em]">Raça</label>
                          <select
                            value={formData.raca}
                            onChange={e => setFormData({ ...formData, raca: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold/40 transition-all outline-none cursor-pointer"
                          >
                            <option value="Humano" className="bg-[#0d0d10]">Humano</option>
                            <option value="Zumbi"  className="bg-[#0d0d10]">Zumbi</option>
                            <option value="Fada"   className="bg-[#0d0d10]">Fada</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em]">Classe</label>
                          <select
                            value={formData.classe}
                            onChange={e => setFormData({ ...formData, classe: e.target.value as any })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold/40 transition-all outline-none cursor-pointer"
                          >
                            {['Guerreiro', 'Mago', 'Necromance'].map(c => (
                              <option key={c} value={c} className="bg-[#111]">{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-red-500/50 tracking-[0.25em] flex items-center gap-1"><Sword className="w-3 h-3" /> ATK</label>
                          <input
                            type="number"
                            value={formData.atq}
                            onChange={e => setFormData({ ...formData, atq: parseInt(e.target.value) || 0 })}
                            className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-2xl font-black text-white focus:border-red-500/50 transition-all outline-none text-center"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-emerald-500/50 tracking-[0.25em] flex items-center gap-1"><Shield className="w-3 h-3" /> DEF</label>
                          <input
                            type="number"
                            value={formData.def}
                            onChange={e => setFormData({ ...formData, def: parseInt(e.target.value) || 0 })}
                            className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-2xl font-black text-white focus:border-emerald-500/50 transition-all outline-none text-center"
                          />
                        </div>
                      </div>

                      {/* ── Linha 3: Nível + Elemento ── */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Nível */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em] flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-gold/50" /> Nível
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              { v: 'Neutro', dot: 'bg-zinc-500',   active: 'bg-zinc-700/40 border-zinc-500   text-zinc-200 shadow-zinc-500/20',  idle: 'border-zinc-700/40 text-zinc-600' },
                              { v: 'Bronze', dot: 'bg-orange-500', active: 'bg-orange-600/20 border-orange-500 text-orange-300 shadow-orange-500/20', idle: 'border-orange-900/40 text-orange-800' },
                              { v: 'Prata',  dot: 'bg-zinc-300',   active: 'bg-zinc-400/20 border-zinc-300   text-zinc-100 shadow-zinc-400/20',  idle: 'border-zinc-600/40 text-zinc-600' },
                              { v: 'Ouro',   dot: 'bg-yellow-400', active: 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-yellow-400/20', idle: 'border-yellow-900/40 text-yellow-900' },
                            ] as { v: Card['level']; dot: string; active: string; idle: string }[]).map(l => (
                              <button
                                key={l.v}
                                onClick={() => setFormData({ ...formData, level: l.v })}
                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 shadow-lg
                                  ${formData.level === l.v ? `${l.active} shadow-lg` : `bg-white/[0.03] ${l.idle} hover:bg-white/5`}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${l.dot} ${formData.level === l.v ? 'opacity-100' : 'opacity-30'}`} />
                                {l.v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Elemento */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em] flex items-center gap-2">
                            <Shield className="w-3 h-3 text-gold/50" /> Elemento
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {([
                              { name: 'Agua',   dot: 'bg-blue-400',   active: 'border-blue-500/60 text-blue-300 bg-blue-500/10',     idle: 'border-blue-900/30   text-blue-900' },
                              { name: 'Terra',  dot: 'bg-amber-600',  active: 'border-amber-600/60 text-amber-400 bg-amber-600/10',   idle: 'border-amber-900/30  text-amber-900' },
                              { name: 'Luz',    dot: 'bg-yellow-200', active: 'border-yellow-200/60 text-yellow-100 bg-yellow-200/10', idle: 'border-yellow-900/20 text-yellow-900/40' },
                              { name: 'Trevas', dot: 'bg-purple-500', active: 'border-purple-600/60 text-purple-300 bg-purple-600/10', idle: 'border-purple-900/30  text-purple-900' },
                              { name: 'Vento',  dot: 'bg-cyan-400',   active: 'border-cyan-400/60 text-cyan-300 bg-cyan-400/10',      idle: 'border-cyan-900/30   text-cyan-900' },
                              { name: 'Fogo',   dot: 'bg-red-500',    active: 'border-red-500/60 text-red-300 bg-red-500/10',          idle: 'border-red-900/30    text-red-900' },
                            ] as { name: Card['element']; dot: string; active: string; idle: string }[]).map(e => (
                              <button
                                key={e.name}
                                onClick={() => setFormData({ ...formData, element: e.name })}
                                className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all border flex items-center justify-center gap-1.5
                                  ${formData.element === e.name ? `${e.active} shadow-lg` : `bg-white/[0.03] ${e.idle} hover:bg-white/5`}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${e.dot} ${formData.element === e.name ? 'opacity-100' : 'opacity-25'}`} />
                                {e.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ── Linha 4: Raridade (horizontal) ── */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em] flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-gold/50" /> Raridade
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {([
                            { value: 'Comum',    dot: 'bg-white/60',      active: 'border-white/40    text-white    bg-white/8    shadow-white/10',    idle: 'border-white/10    text-white/25' },
                            { value: 'Incomum',  dot: 'bg-zinc-300',      active: 'border-zinc-400/60 text-zinc-200 bg-zinc-400/10 shadow-zinc-400/10', idle: 'border-zinc-600/20 text-zinc-600' },
                            { value: 'Raro',     dot: 'bg-blue-400',      active: 'border-blue-500/60 text-blue-300 bg-blue-500/10 shadow-blue-500/20', idle: 'border-blue-900/20 text-blue-900/60' },
                            { value: 'Épico',    dot: 'bg-purple-400',    active: 'border-purple-500/60 text-purple-300 bg-purple-500/10 shadow-purple-500/20', idle: 'border-purple-900/20 text-purple-900/60' },
                            { value: 'Lendário', dot: 'bg-yellow-400',    active: 'border-yellow-500/60 text-yellow-300 bg-yellow-500/10 shadow-yellow-500/20', idle: 'border-yellow-900/20 text-yellow-900/60' },
                          ] as { value: Raridade; dot: string; active: string; idle: string }[]).map(r => (
                            <button
                              key={r.value}
                              onClick={() => setFormData({ ...formData, raridade: r.value })}
                              className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all border flex flex-col items-center gap-1.5 shadow-lg
                                ${formData.raridade === r.value ? `${r.active} shadow-lg` : `bg-white/[0.03] ${r.idle} hover:bg-white/5`}`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${r.dot} ${formData.raridade === r.value ? 'opacity-100 shadow-lg' : 'opacity-20'}`} />
                              {r.value}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ── Linha 5: Imagem ── */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em] flex items-center gap-2">
                          <ImageIcon className="w-3 h-3 text-gold/50" /> Imagem
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => document.getElementById('imageUploadLarge')?.click()}
                            className="shrink-0 bg-gold/5 border border-gold/20 hover:border-gold/50 rounded-xl px-5 py-3 text-[10px] font-black uppercase text-gold flex items-center gap-2 transition-all"
                          >
                            <ImageIcon className="w-4 h-4" /> Upload
                          </button>
                          <input id="imageUploadLarge" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <input
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white/40 focus:text-white focus:border-gold/40 transition-all outline-none text-[10px] font-mono"
                            placeholder="ou cole a URL da imagem..."
                          />
                        </div>
                      </div>

                      {/* ── Divisor + Descrição + Ações ── */}
                      <div className="pt-6 border-t border-white/8 space-y-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.25em] flex items-center gap-2">
                            <FileText className="w-3 h-3 text-gold/50" /> Descrição
                          </label>
                          <textarea
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/40 transition-all outline-none resize-none leading-relaxed text-sm italic placeholder:text-white/10"
                            placeholder="Descreva o destino inabalável desta alma no campo de batalha..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setActiveTab('archive')}
                            className="flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/8 hover:bg-white/5 transition-all text-white/25 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-[3] py-4 bg-gradient-to-r from-gold/90 to-gold hover:brightness-110 active:scale-[0.98] transition-all rounded-xl text-black text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-gold/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
                            ) : (
                              <><Sparkles className="w-5 h-5" /> {editingCard ? 'Salvar Alterações' : 'Criar Combatente'}</>
                            )}
                          </button>
                        </div>
                      </div>
                   </div>
                </div>

                {/* VISUAL PREVIEW (SIDE) */}
                <div className="lg:col-span-5 sticky top-10 space-y-6">
                   <div className="text-center space-y-1">
                      <h5 className="text-[11px] font-black uppercase text-gold tracking-[0.4em]">Preview</h5>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Passe o mouse para revelar</p>
                   </div>

                   <div className="flex justify-center">
                      <div className={`relative w-[320px] h-[460px] rounded-[2.5rem] border-[6px] p-2 bg-black overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all duration-700 group/preview
                        ${formData.raridade === 'Lendário' ? 'border-yellow-400/60 legendary-glow' :
                          formData.raridade === 'Épico'    ? 'border-purple-500/60 epic-glow' :
                          formData.raridade === 'Raro'     ? 'border-blue-500/50 shadow-blue-500/20' :
                          formData.raridade === 'Incomum'  ? 'border-zinc-400/40 shadow-zinc-400/10' :
                          formData.level === 'Ouro'        ? 'border-yellow-500/50 shadow-yellow-500/15' :
                          formData.level === 'Prata'       ? 'border-zinc-400/40 shadow-zinc-400/10' :
                          formData.level === 'Bronze'      ? 'border-orange-500/40 shadow-orange-500/10' :
                          'border-zinc-700/40 shadow-white/5'}`}>
                         <div className="absolute inset-0 border-2 border-white/5 rounded-[2.6rem] m-2 pointer-events-none z-10" />
                         
                         <div className="relative w-full h-full bg-[#050505] rounded-[2.2rem] overflow-hidden flex flex-col group">
                            <div className="w-full h-full relative overflow-hidden">
                               <img src={formData.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/preview:opacity-100 transition-all duration-700 flex flex-col justify-end p-10 translate-y-10 group-hover/preview:translate-y-0">
                               <div className="space-y-6">
                                  <div className="space-y-2">
                                     <h4 className="font-black text-3xl uppercase tracking-tighter text-white leading-none">{formData.name || 'Nova Unidade'}</h4>
                                     <div className="flex flex-wrap items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${formData.level === 'Ouro' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : formData.level === 'Prata' ? 'bg-zinc-400' : formData.level === 'Bronze' ? 'bg-orange-500' : 'bg-zinc-600'}`} />
                                        <p className="text-[12px] font-black text-gold uppercase tracking-widest">{formData.level}</p>
                                        <span className="text-white/20">•</span>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">{formData.element}</p>
                                     </div>
                                  </div>
                                  
                                  <p className="text-xs text-white/50 leading-relaxed font-bold uppercase italic tracking-wider">
                                    "{formData.desc || 'A descrição ecoará através do tempo assim que as runas forem escritas...'}"
                                  </p>
                                  
                                  <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                     <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Ataque</span>
                                        <span className="text-3xl font-black text-red-500 flex items-center gap-3">
                                          <Sword className="w-8 h-8" /> {formData.atq}
                                        </span>
                                     </div>
                                     <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Defesa</span>
                                        <span className="text-3xl font-black text-emerald-500 flex items-center gap-3">
                                          {formData.def} <Shield className="w-8 h-8" />
                                        </span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   {/* Raridade badge no preview */}
                   <div className="flex justify-center">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRaridadeBadge(formData.raridade)}`}>
                       {formData.raridade}
                     </span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
              className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl backdrop-blur-3xl border shadow-2xl flex items-center gap-4 min-w-[300px]
                ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {notification.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {cardToDelete && (
            <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#0a0a0b] border border-white/10 rounded-[3rem] p-10 max-w-sm w-full text-center space-y-8 shadow-[0_0_100px_rgba(255,0,0,0.1)]"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 mb-4">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Banir para o Vácuo?</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] leading-relaxed">
                    Você está prestes a apagar permanentemente <span className="text-white">{cardToDelete.name}</span> do arquivo de lendas.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => deleteCard(cardToDelete.id)}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-red-600/20"
                  >
                    Confirmar Banimento
                  </button>
                  <button 
                    onClick={() => setCardToDelete(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all"
                  >
                    Preservar Unidade
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.3); }

        @keyframes epic-pulse {
          0%, 100% { box-shadow: 0 0 28px rgba(147,51,234,0.55), 0 0 8px rgba(147,51,234,0.3); }
          50%       { box-shadow: 0 0 45px rgba(147,51,234,0.9), 0 0 16px rgba(192,132,252,0.6); }
        }
        @keyframes legendary-pulse {
          0%, 100% { box-shadow: 0 0 32px rgba(212,175,55,0.65), 0 0 10px rgba(212,175,55,0.3); }
          50%       { box-shadow: 0 0 55px rgba(212,175,55,1), 0 0 22px rgba(255,220,100,0.7); }
        }
        .epic-glow      { animation: epic-pulse 2s ease-in-out infinite; }
        .legendary-glow { animation: legendary-pulse 1.8s ease-in-out infinite; }

        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          92%, 96%      { opacity: 1; }
          94%           { opacity: 0.4; }
        }
        .epic-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, transparent 40%, rgba(192,132,252,0.6) 50%, transparent 60%);
          animation: lightning 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
