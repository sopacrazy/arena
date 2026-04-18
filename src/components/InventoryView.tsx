import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, SlidersHorizontal, Sword, Shield, Sparkles,
  Flame, Droplets, Wind, Zap, Sun, Moon, Filter, X,
  BookOpen, Star, ChevronRight, PackageOpen
} from 'lucide-react';
import { getUserCards } from '../lib/supabase';
import { CATALOG } from '../lib/catalog';

// ── Tipos ───────────────────────────────────────────────────────────────────
type Rarity = 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
type Element = 'Fogo' | 'Agua' | 'Vento' | 'Trevas' | 'Luz' | 'Terra';

interface InventoryCard {
  id: string;
  name: string;
  rarity: Rarity;
  element: Element;
  raca: string;
  classe: string;
  atq: number;
  def: number;
  desc: string;
  image: string;
  copies: number;
  foil?: boolean;
}

// ── Paletas ────────────────────────────────────────────────────────────────
const RARITY_CONFIG: Record<Rarity, { border: string; glow: string; badge: string; text: string; dot: string }> = {
  Neutro: {
    border: 'border-zinc-600/50',
    glow:   'shadow-zinc-700/20',
    badge:  'bg-zinc-800/80 text-zinc-400 border-zinc-600/40',
    text:   'text-zinc-400',
    dot:    'bg-zinc-500',
  },
  Bronze: {
    border: 'border-amber-700/60',
    glow:   'shadow-amber-700/30',
    badge:  'bg-amber-900/50 text-amber-400 border-amber-700/40',
    text:   'text-amber-400',
    dot:    'bg-amber-500',
  },
  Prata: {
    border: 'border-slate-400/60',
    glow:   'shadow-slate-400/30',
    badge:  'bg-slate-800/60 text-slate-300 border-slate-500/40',
    text:   'text-slate-300',
    dot:    'bg-slate-400',
  },
  Ouro: {
    border: 'border-yellow-500/70',
    glow:   'shadow-yellow-500/40',
    badge:  'bg-yellow-900/50 text-yellow-300 border-yellow-500/40',
    text:   'text-yellow-300',
    dot:    'bg-yellow-400',
  },
};

const ELEMENT_CONFIG: Record<Element, { icon: React.ReactNode; color: string; bg: string }> = {
  Fogo:   { icon: <Flame   className="w-3 h-3" />, color: 'text-red-400',    bg: 'bg-red-500/10'     },
  Agua:   { icon: <Droplets className="w-3 h-3" />, color: 'text-blue-400',  bg: 'bg-blue-500/10'    },
  Vento:  { icon: <Wind    className="w-3 h-3" />, color: 'text-cyan-400',   bg: 'bg-cyan-500/10'    },
  Trevas: { icon: <Moon    className="w-3 h-3" />, color: 'text-purple-400', bg: 'bg-purple-500/10'  },
  Luz:    { icon: <Sun     className="w-3 h-3" />, color: 'text-yellow-200', bg: 'bg-yellow-200/10'  },
  Terra:  { icon: <Sparkles className="w-3 h-3" />, color: 'text-amber-600', bg: 'bg-amber-700/10'   },
};

// ── Dados de exemplo ────────────────────────────────────────────────────────
const SAMPLE_CARDS: InventoryCard[] = [
  {
    id: '1', name: 'Soldado 60',      rarity: 'Neutro', element: 'Fogo',
    raca: 'Humano', classe: 'Guerreiro', atq: 13, def: 9,
    desc: 'Veterano endurecido das guerras do norte.',
    image: '/RECK 1/NIVEL NEUTRO/60.webp', copies: 3,
  },
  {
    id: '2', name: 'Fargan, Lâmina do Caminho', rarity: 'Bronze', element: 'Trevas',
    raca: 'Humano', classe: 'Caçador', atq: 20, def: 12,
    desc: 'Perseguidor implacável das sombras.',
    image: '/RECK 1/PRATA/Fargan, Lâmina do Caminho Estreito (1).webp', copies: 2,
  },
  {
    id: '3', name: 'Raskel, Sangue da Campanha', rarity: 'Prata', element: 'Fogo',
    raca: 'Humano', classe: 'Comandante', atq: 26, def: 20,
    desc: 'Revelar: cause 5 de dano direto nos PB do oponente.',
    image: '/RECK 1/PRATA/_Raskel, Sangue da Campanha.webp', copies: 1, foil: true,
  },
  {
    id: '4', name: 'Aldren, Veterano da Fronteira', rarity: 'Ouro', element: 'Terra',
    raca: 'Humano', classe: 'General', atq: 38, def: 30,
    desc: 'Perfuração de Bloqueio: a diferença de ATQ causa dano de PB.',
    image: '/RECK 1/OURO/Aldren, Veterano da Fronteira Quebrada (5).webp', copies: 1, foil: true,
  },
  {
    id: '5', name: 'Patrulheiro 11',  rarity: 'Neutro', element: 'Vento',
    raca: 'Humano', classe: 'Arqueiro', atq: 10, def: 7,
    desc: 'Guarda os portões com olhos de falcão.',
    image: '/RECK 1/NIVEL NEUTRO/11 - Copia - Copia - Copia - Copia - Copia - Copia.webp', copies: 3,
  },
  {
    id: '6', name: 'Caelan, Lâmina do Juramento', rarity: 'Bronze', element: 'Luz',
    raca: 'Humano', classe: 'Paladino', atq: 18, def: 14,
    desc: 'Revelar: todos os Neutros aliados ganham +3 ATQ.',
    image: '/RECK 1/PRATA/Caelan, Lâmina do Juramento.webp', copies: 2,
  },
  {
    id: '7', name: 'Iskand, Sobrevivente', rarity: 'Ouro', element: 'Trevas',
    raca: 'Humano', classe: 'Campeão', atq: 40, def: 28,
    desc: 'Revelar: destrua 1 combatente inimigo com ATQ ≤ 20.',
    image: '/RECK 1/OURO/Iskand, Sobrevivente do Campo Vermelho.webp', copies: 1, foil: true,
  },
  {
    id: '8', name: 'Sentinela 43',    rarity: 'Neutro', element: 'Terra',
    raca: 'Humano', classe: 'Guardião', atq: 7, def: 12,
    desc: 'Defesa inabalável nas muralhas do reino.',
    image: '/RECK 1/NIVEL NEUTRO/43 - Copia - Copia - Copia - Copia - Copia - Copia.webp', copies: 3,
  },
];

const RARITIES: Rarity[]   = ['Neutro', 'Bronze', 'Prata', 'Ouro'];
const ELEMENTS: Element[]  = ['Fogo', 'Agua', 'Vento', 'Trevas', 'Luz', 'Terra'];

// ── Componente Card ────────────────────────────────────────────────────────
function CardTile({ card, onClick }: { card: InventoryCard; onClick: () => void; key?: React.Key }) {
  const r = RARITY_CONFIG[card.rarity];
  const e = ELEMENT_CONFIG[card.element];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className={`relative group cursor-pointer rounded-[1.8rem] border-2 ${r.border} bg-[#0d0d10] overflow-hidden shadow-xl ${r.glow} transition-shadow hover:shadow-2xl`}
    >
      {/* Foil shimmer */}
      {card.foil && (
        <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}

      {/* Card image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[1.6rem]">
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { (e.target as HTMLImageElement).src = '/fundo.webp'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 inset-x-3 flex justify-between items-start">
          {/* Rarity dot */}
          <div className={`w-3 h-3 rounded-full ${r.dot} shadow-[0_0_8px_currentColor]`} />
          {/* Foil badge */}
          {card.foil && (
            <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-yellow-400/40 rounded-full flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[8px] font-black text-yellow-300 uppercase tracking-widest">Foil</span>
            </div>
          )}
        </div>

        {/* ATQ / DEF bar at bottom of image */}
        <div className="absolute bottom-3 inset-x-3 flex justify-between">
          <div className="px-2.5 py-1 bg-black/70 backdrop-blur-sm border border-red-500/30 rounded-xl flex items-center gap-1.5">
            <Sword className="w-3 h-3 text-red-400" />
            <span className="text-[10px] font-black text-white">{card.atq}</span>
          </div>
          <div className="px-2.5 py-1 bg-black/70 backdrop-blur-sm border border-blue-500/30 rounded-xl flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-black text-white">{card.def}</span>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[11px] font-black text-white uppercase tracking-wide leading-tight line-clamp-2 flex-1">
            {card.name}
          </h4>
          <div className="shrink-0 text-[9px] font-black text-white/30 font-mono">×{card.copies}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Rarity */}
          <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${r.badge}`}>
            {card.rarity}
          </span>
          {/* Element */}
          <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-[8px] font-black uppercase ${e.bg} ${e.color}`}>
            {e.icon} {card.element}
          </span>
        </div>

        <p className="text-[9px] text-white/30 italic leading-relaxed line-clamp-2">{card.desc}</p>
      </div>
    </motion.div>
  );
}

// ── Modal de detalhe ───────────────────────────────────────────────────────
function CardModal({ card, onClose }: { card: InventoryCard; onClose: () => void }) {
  const r = RARITY_CONFIG[card.rarity];
  const e = ELEMENT_CONFIG[card.element];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm bg-[#0d0d10] border-2 ${r.border} rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)]`}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 z-30 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
          <X className="w-4 h-4 text-white/60" />
        </button>

        {/* Image */}
        <div className="relative aspect-[3/4] max-h-72 overflow-hidden">
          <img src={card.image} alt={card.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/fundo.webp'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-[#0d0d10]/20 to-transparent" />
        </div>

        {/* Details */}
        <div className="p-8 space-y-6 -mt-4 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${r.badge}`}>{card.rarity}</span>
              <span className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase ${e.bg} ${e.color}`}>
                {e.icon} {card.element}
              </span>
              {card.foil && (
                <span className="px-3 py-1 rounded-full flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 text-[9px] font-black text-yellow-300 uppercase">
                  <Star className="w-2.5 h-2.5 fill-yellow-400" /> Foil
                </span>
              )}
            </div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${r.text}`}>{card.name}</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{card.raca} · {card.classe}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex flex-col items-center gap-2">
              <Sword className="w-5 h-5 text-red-400" />
              <span className="text-3xl font-black text-red-400">{card.atq}</span>
              <span className="text-[8px] font-black text-red-400/50 uppercase tracking-widest">Ataque</span>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex flex-col items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-3xl font-black text-blue-400">{card.def}</span>
              <span className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest">Defesa</span>
            </div>
          </div>

          {/* Lore */}
          <div className="border-l-2 border-white/10 pl-4">
            <p className="text-xs text-white/50 italic leading-relaxed">"{card.desc}"</p>
          </div>

          {/* Copies */}
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-white/30">Cópias no inventário</span>
            <span className="text-white font-mono text-sm">×{card.copies}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Componente principal: Inventário ─────────────────────────────────────
export default function InventoryView({ userId }: { userId: string }) {
  const [allCards, setAllCards]   = useState<InventoryCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [search, setSearch]       = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'Todos'>('Todos');
  const [elementFilter, setElementFilter] = useState<Element | 'Todos'>('Todos');
  const [selected, setSelected]   = useState<InventoryCard | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getUserCards(userId).then((rows) => {
      const mapped: InventoryCard[] = rows.map((row) => {
        const cat = CATALOG[row.card_catalog_index];
        return {
          id: row.id,
          name: cat.name,
          rarity: cat.level as Rarity,
          element: cat.element as Element,
          raca: cat.raca,
          classe: cat.classe,
          atq: cat.atq,
          def: cat.def,
          desc: cat.desc,
          image: cat.image,
          copies: row.quantity,
        };
      });
      setAllCards(mapped);
      setLoadingCards(false);
    });
  }, [userId]);

  const cards = allCards.filter((c) => {
    const matchSearch  = c.name.toLowerCase().includes(search.toLowerCase());
    const matchRarity  = rarityFilter  === 'Todos' || c.rarity  === rarityFilter;
    const matchElement = elementFilter === 'Todos' || c.element === elementFilter;
    return matchSearch && matchRarity && matchElement;
  });

  // Stats
  const totalCards  = allCards.reduce((s, c) => s + c.copies, 0);
  const uniqueCards = allCards.length;
  const foilCount   = 0;
  const ouroCount   = allCards.filter(c => c.rarity === 'Ouro').length;

  if (loadingCards) {
    return (
      <div className="flex-1 flex items-center justify-center py-40">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4">
            <BookOpen className="w-9 h-9 text-gold" />
            Inventário
          </h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            Sua coleção de lendas e combatentes
          </p>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Cartas',  value: totalCards,  accent: 'text-white' },
          { label: 'Cartas Únicas',    value: uniqueCards, accent: 'text-gold' },
          { label: 'Cartas Foil',      value: foilCount,   accent: 'text-yellow-300' },
          { label: 'Cartas de Ouro',   value: ouroCount,   accent: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-1">
            <div className={`text-2xl font-black font-mono ${s.accent}`}>{s.value}</div>
            <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            placeholder="BUSCAR CARTA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-black tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-2">
                {/* Rarity */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest w-16 shrink-0">Raridade</span>
                  {(['Todos', ...RARITIES] as (Rarity | 'Todos')[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRarityFilter(r)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        rarityFilter === r
                          ? r === 'Todos' ? 'bg-white/10 border-white/20 text-white' : `${RARITY_CONFIG[r as Rarity].badge}`
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {/* Element */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest w-16 shrink-0">Elemento</span>
                  {(['Todos', ...ELEMENTS] as (Element | 'Todos')[]).map((el) => (
                    <button
                      key={el}
                      onClick={() => setElementFilter(el as Element | 'Todos')}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${
                        elementFilter === el
                          ? el === 'Todos' ? 'bg-white/10 border-white/20 text-white' : `${ELEMENT_CONFIG[el as Element].bg} ${ELEMENT_CONFIG[el as Element].color} border-current/30`
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      {el !== 'Todos' && ELEMENT_CONFIG[el as Element].icon}
                      {el}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            {cards.length} carta{cards.length !== 1 ? 's' : ''} encontrada{cards.length !== 1 ? 's' : ''}
          </span>
          <button className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/40 hover:text-white transition-all">
            Ver Todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {allCards.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 space-y-4">
              <PackageOpen className="w-16 h-16 text-white/10" />
              <p className="text-white/20 uppercase font-black tracking-[0.4em] text-xs text-center">
                Seu inventário está vazio.<br />
                <span className="text-amber-400/60">Vá ao Mercado e abra seu baú gratuito!</span>
              </p>
            </motion.div>
          ) : cards.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-10">
              {cards.map((card) => (
                <CardTile key={card.id} card={card} onClick={() => setSelected(card)} />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 space-y-4">
              <Filter className="w-12 h-12 text-white/10" />
              <p className="text-white/20 uppercase font-black tracking-[0.4em] text-xs">Nenhuma carta encontrada</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card detail modal */}
      <AnimatePresence>
        {selected && <CardModal card={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
