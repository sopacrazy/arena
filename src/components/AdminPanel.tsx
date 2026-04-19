import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Edit2, Shield, Sword, Type, FileText, X, Save,
  Image as ImageIcon, Lock, User, Sparkles, ChevronRight,
  Search, Wand2, Gavel, Heart, Loader2, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Card {
  id: string;
  name: string;
  level: 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
  element: 'Agua' | 'Terra' | 'Luz' | 'Trevas' | 'Vento' | 'Fogo';
  raca: string;
  classe: 'Guerreiro' | 'Mago' | 'Necromance';
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
    raca: '',
    classe: 'Guerreiro' as Card['classe'],
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
      raca: '',
      classe: 'Guerreiro',
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
                      className="relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-6 cursor-pointer group hover:border-gold/30 hover:bg-white/[0.05] transition-all"
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
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] font-black text-gold/60 uppercase">{card.level}</p>
                               <span className="text-white/20">•</span>
                               <p className="text-[10px] font-black text-white/40 uppercase">{card.element}</p>
                            </div>
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

                   <div className="space-y-12 bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Information Group */}
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase text-gold/60 tracking-[0.3em] pl-2 flex items-center gap-2">
                                <Type className="w-3 h-3" /> Nome do Combatente
                              </label>
                              <input 
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white focus:border-gold/40 text-lg font-bold transition-all outline-none placeholder:text-white/5"
                                placeholder="Ex: Arcanista Primordial"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase text-white/30 tracking-[0.3em] pl-2">Raça</label>
                                <input 
                                  value={formData.raca}
                                  onChange={e => setFormData({ ...formData, raca: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-4 text-white focus:border-gold/40 transition-all outline-none"
                                  placeholder="Ex: Humano"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase text-white/30 tracking-[0.3em] pl-2">Classe</label>
                                <select 
                                  value={formData.classe}
                                  onChange={e => setFormData({ ...formData, classe: e.target.value as any })}
                                  className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-[1.15rem] text-white focus:border-gold/40 transition-all outline-none appearance-none cursor-pointer font-bold"
                                >
                                  {['Guerreiro', 'Mago', 'Necromance'].map(c => (
                                    <option key={c} value={c} className="bg-[#111] text-white">{c}</option>
                                  ))}
                                </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6 pt-4">
                              <div className="bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10 space-y-4">
                                <label className="text-[11px] font-black uppercase text-red-500/60 tracking-[0.3em] flex items-center gap-2">
                                  <Sword className="w-3 h-3" /> Poder (ATK)
                                </label>
                                <input 
                                  type="number"
                                  value={formData.atq}
                                  onChange={e => setFormData({ ...formData, atq: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-3xl font-black text-white focus:border-red-500/50 transition-all outline-none text-center"
                                />
                              </div>
                              <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10 space-y-4">
                                <label className="text-[11px] font-black uppercase text-emerald-500/60 tracking-[0.3em] flex items-center gap-2">
                                   <Shield className="w-3 h-3" /> Defesa (DEF)
                                </label>
                                <input 
                                  type="number"
                                  value={formData.def}
                                  onChange={e => setFormData({ ...formData, def: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-3xl font-black text-white focus:border-emerald-500/50 transition-all outline-none text-center"
                                />
                              </div>
                           </div>
                        </div>

                        {/* Visuals & Logic Group */}
                        <div className="space-y-8">
                           <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase text-gold/60 tracking-[0.3em] pl-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Essência da Raridade (Nível)
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                {['Neutro', 'Bronze', 'Prata', 'Ouro'].map(t => (
                                  <button 
                                    key={t}
                                    onClick={() => setFormData({ ...formData, level: t as any })}
                                    className={`py-5 rounded-2xl text-[10px] font-black uppercase transition-all border ${formData.level === t ? 'bg-gold/20 border-gold/50 text-gold shadow-2xl shadow-gold/20' : 'bg-white/5 border-white/10 text-white/20'}`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase text-gold/60 tracking-[0.3em] pl-2 flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Elemento Harmonizado
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { name: 'Agua', color: 'border-blue-500/50 text-blue-400 bg-blue-500/10' },
                                  { name: 'Terra', color: 'border-amber-700/50 text-amber-600 bg-amber-700/10' },
                                  { name: 'Luz', color: 'border-yellow-200/50 text-yellow-200 bg-yellow-200/10' },
                                  { name: 'Trevas', color: 'border-purple-600/50 text-purple-400 bg-purple-600/10' },
                                  { name: 'Vento', color: 'border-cyan-400/50 text-cyan-400 bg-cyan-400/10' },
                                  { name: 'Fogo', color: 'border-red-500/50 text-red-500 bg-red-500/10' }
                                ].map(e => (
                                  <button 
                                    key={e.name}
                                    onClick={() => setFormData({ ...formData, element: e.name as any })}
                                    className={`py-4 rounded-2xl text-[9px] font-black uppercase transition-all border ${formData.element === e.name ? `${e.color} shadow-2xl` : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'}`}
                                  >
                                    {e.name}
                                  </button>
                                ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase text-gold/60 tracking-[0.3em] pl-2 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Manifestação Visual
                              </label>
                              <div className="flex flex-col gap-3">
                                <button 
                                  onClick={() => document.getElementById('imageUploadLarge')?.click()}
                                  className="w-full bg-gold/5 border border-gold/20 hover:border-gold/50 rounded-[1.2rem] py-4 text-[10px] font-black uppercase text-gold flex items-center justify-center gap-3 transition-all group/upload"
                                >
                                  <ImageIcon className="w-5 h-5 group-hover/upload:rotate-12 transition-transform" /> Carregar Matéria Visual (WebP)
                                </button>
                                <input id="imageUploadLarge" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <div className="relative group/url">
                                   <input 
                                     value={formData.image}
                                     onChange={e => setFormData({ ...formData, image: e.target.value })}
                                     className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-4 text-white/40 focus:text-white focus:border-gold/40 transition-all outline-none text-[10px] font-mono"
                                     placeholder="OU COLE A URL DA IMAGEM..."
                                   />
                                </div>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/10 space-y-6">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black uppercase text-gold/60 tracking-[0.3em] pl-2 flex items-center gap-2">
                             <FileText className="w-3 h-3" /> Lore & Destino (Descrição)
                           </label>
                           <textarea 
                             value={formData.desc}
                             onChange={e => setFormData({ ...formData, desc: e.target.value })}
                             rows={4}
                             className="w-full bg-white/5 border border-white/10 rounded-[1.8rem] px-8 py-6 text-white focus:border-gold/40 transition-all outline-none resize-none leading-relaxed text-sm italic"
                             placeholder="Descreva aqui o destino inabalável desta alma no campo de batalha..."
                           />
                        </div>

                        <div className="flex gap-4">
                           <button 
                             onClick={() => setActiveTab('archive')}
                             className="flex-1 py-6 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] border border-white/5 hover:bg-white/5 transition-all text-white/30 hover:text-white"
                           >
                             Abandonar Ritual
                           </button>
                           <button 
                             onClick={handleSave}
                             disabled={saving}
                             className="flex-[2] py-6 bg-gradient-to-br from-gold/90 to-gold hover:scale-[1.02] active:scale-[0.98] transition-all rounded-[1.5rem] text-black text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-gold/20 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             {saving ? (
                               <>
                                 <Loader2 className="w-6 h-6 animate-spin" /> Transmutando...
                               </>
                             ) : (
                               <>
                                 <Sparkles className="w-6 h-6 animate-pulse" /> {editingCard ? 'Consolidar Lenda' : 'Impregnar Unidade'}
                               </>
                             )}
                           </button>
                        </div>
                      </div>
                   </div>
                </div>

                {/* VISUAL PREVIEW (SIDE) */}
                <div className="lg:col-span-5 sticky top-10 space-y-10">
                   <div className="text-center space-y-2">
                      <h5 className="text-[12px] font-black uppercase text-gold tracking-[0.5em]">Manifestação em Tempo Real</h5>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">O resultado de suas runas aparecerá aqui</p>
                   </div>

                   <div className="flex justify-center">
                      <div className={`relative w-[380px] h-[540px] rounded-[3rem] border-8 p-2 bg-black overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-1000 group/preview ${formData.level === 'Ouro' ? 'border-yellow-500/50 shadow-yellow-500/20' : formData.level === 'Prata' ? 'border-zinc-400/50 shadow-zinc-400/20' : formData.level === 'Bronze' ? 'border-orange-500/50 shadow-orange-500/20' : 'border-zinc-700/50 shadow-white/5'}`}>
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
                   <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.4em] animate-pulse">Passe o mouse para revelação completa</p>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
