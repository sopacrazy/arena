import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Gem, Package, Star, Sparkles, ChevronRight, X, Lock, Zap, Shield, Crown, Gift, Check } from 'lucide-react';
import { hasOpenedChest, openChest } from '../lib/supabase';
import { CATALOG, STARTER_POOL_INDICES, pickRandomCards } from '../lib/catalog';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface ChestReward {
  label: string;
  guaranteed: boolean;
  rarity?: 'comum' | 'raro' | 'epico' | 'lendario';
}

interface Chest {
  id: string;
  name: string;
  subtitle: string;
  tier: 'bronze' | 'prata' | 'ouro';
  priceGold: number;
  priceGems: number;
  cardCount: string;
  rewards: ChestReward[];
  gradient: string;
  glowColor: string;
  borderColor: string;
  badgeColor: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface OpenResult {
  chestName: string;
  tier: Chest['tier'];
  cards: { name: string; level: string; foil: boolean }[];
}

// ─── DADOS DOS BAÚS ───────────────────────────────────────────────────────────

const CHESTS: Chest[] = [
  {
    id: 'bronze',
    name: 'Baú de Bronze',
    subtitle: 'Para iniciantes do reino',
    tier: 'bronze',
    priceGold: 500,
    priceGems: 10,
    cardCount: '3–5 cartas',
    rewards: [
      { label: '3–5 Cartas Neutro',   guaranteed: true,  rarity: 'comum'    },
      { label: '1 Carta Bronze',       guaranteed: false, rarity: 'raro'     },
      { label: '1 Carta Foil',         guaranteed: false, rarity: 'epico'    },
    ],
    gradient:    'from-amber-900/40 via-amber-800/20 to-transparent',
    glowColor:   'rgba(180,83,9,0.35)',
    borderColor: 'border-amber-700/40',
    badgeColor:  'bg-amber-700/30 text-amber-300 border-amber-600/30',
    icon: <Package className="w-16 h-16" />,
  },
  {
    id: 'prata',
    name: 'Baú de Prata',
    subtitle: 'Combatentes de elite',
    tier: 'prata',
    priceGold: 1500,
    priceGems: 30,
    cardCount: '5–8 cartas',
    rewards: [
      { label: '2–4 Cartas Neutro',   guaranteed: true,  rarity: 'comum'    },
      { label: '1–2 Cartas Bronze',    guaranteed: true,  rarity: 'raro'     },
      { label: '1 Carta Prata',        guaranteed: false, rarity: 'epico'    },
      { label: '1 Carta Foil Rara',    guaranteed: false, rarity: 'epico'    },
    ],
    gradient:    'from-slate-600/40 via-slate-500/20 to-transparent',
    glowColor:   'rgba(148,163,184,0.35)',
    borderColor: 'border-slate-400/40',
    badgeColor:  'bg-slate-600/30 text-slate-200 border-slate-400/30',
    icon: <Shield className="w-16 h-16" />,
    highlight: true,
  },
  {
    id: 'ouro',
    name: 'Baú de Ouro',
    subtitle: 'Lendas do campo de batalha',
    tier: 'ouro',
    priceGold: 5000,
    priceGems: 100,
    cardCount: '8–12 cartas',
    rewards: [
      { label: '3–5 Cartas Neutro/Bronze', guaranteed: true,  rarity: 'raro'     },
      { label: '2–3 Cartas Prata',          guaranteed: true,  rarity: 'epico'    },
      { label: '1 Carta Ouro',              guaranteed: true,  rarity: 'lendario' },
      { label: 'Carta Foil Exclusiva',      guaranteed: false, rarity: 'lendario' },
      { label: 'Deck Temático Completo',    guaranteed: false, rarity: 'lendario' },
    ],
    gradient:    'from-yellow-900/50 via-yellow-700/20 to-transparent',
    glowColor:   'rgba(234,179,8,0.4)',
    borderColor: 'border-yellow-500/50',
    badgeColor:  'bg-yellow-700/30 text-yellow-300 border-yellow-500/30',
    icon: <Crown className="w-16 h-16" />,
  },
];

// Cards que podem sair de cada baú (simulação)
const POOL: Record<Chest['tier'], { name: string; level: string }[]> = {
  bronze: [
    { name: 'Recruta 06',    level: 'Neutro' },
    { name: 'Patrulheiro 11',level: 'Neutro' },
    { name: 'Sentinela 43',  level: 'Neutro' },
    { name: 'Militante 50',  level: 'Neutro' },
    { name: 'Soldado 60',    level: 'Neutro' },
    { name: 'Fargan, Lâmina do Caminho', level: 'Bronze' },
  ],
  prata: [
    { name: 'Soldado 60',    level: 'Neutro' },
    { name: 'Mercenário 67', level: 'Neutro' },
    { name: 'Fargan, Lâmina do Caminho', level: 'Bronze' },
    { name: 'Caelan, Lâmina do Juramento', level: 'Bronze' },
    { name: 'Raskel, Sangue da Campanha', level: 'Prata' },
  ],
  ouro: [
    { name: 'Caelan, Lâmina do Juramento', level: 'Bronze' },
    { name: 'Raskel, Sangue da Campanha',   level: 'Prata' },
    { name: 'Aldren, Veterano da Fronteira',level: 'Ouro' },
    { name: 'Iskand, Sobrevivente',          level: 'Ouro' },
  ],
};

const RARITY_COLORS: Record<string, string> = {
  comum:    'text-gray-400 bg-gray-800/60 border-gray-600/30',
  raro:     'text-blue-300 bg-blue-900/40 border-blue-500/30',
  epico:    'text-purple-300 bg-purple-900/40 border-purple-500/30',
  lendario: 'text-yellow-300 bg-yellow-900/40 border-yellow-500/30',
};

const LEVEL_COLORS: Record<string, string> = {
  Neutro: 'text-gray-300 bg-gray-700/60',
  Bronze: 'text-amber-300 bg-amber-900/60',
  Prata:  'text-slate-300 bg-slate-600/60',
  Ouro:   'text-yellow-300 bg-yellow-800/60',
};

// ─── SIMULAÇÃO DE ABERTURA ────────────────────────────────────────────────────

const simulateOpen = (chest: Chest): OpenResult => {
  const pool = POOL[chest.tier];
  const count = chest.tier === 'bronze' ? 4 : chest.tier === 'prata' ? 6 : 9;
  const cards = Array.from({ length: count }, () => {
    const c = pool[Math.floor(Math.random() * pool.length)];
    return { ...c, foil: Math.random() < (chest.tier === 'ouro' ? 0.25 : chest.tier === 'prata' ? 0.12 : 0.05) };
  });
  return { chestName: chest.name, tier: chest.tier, cards };
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

interface ShopViewProps {
  userId: string;
  onCardsChanged?: () => void;
}

export default function ShopView({ userId, onCardsChanged }: ShopViewProps) {
  const [openResult, setOpenResult]   = useState<OpenResult | null>(null);
  const [opening,    setOpening]      = useState<string | null>(null);
  const [currency,   setCurrency]     = useState<'gold' | 'gems'>('gold');
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [starterOpened, setStarterOpened] = useState<boolean | null>(null);
  const [openingStarter, setOpeningStarter] = useState(false);
  const [starterError, setStarterError] = useState<string | null>(null);

  useEffect(() => {
    hasOpenedChest(userId, 'starter').then(setStarterOpened);
  }, [userId]);

  const handleOpenStarter = async () => {
    setOpeningStarter(true);
    setStarterError(null);
    const indices = pickRandomCards(STARTER_POOL_INDICES, 5);
    const result = await openChest(userId, 'starter', indices);

    if (!result.success) {
      setOpeningStarter(false);
      setStarterError(result.error ?? 'Erro desconhecido. Verifique se as tabelas foram criadas no Supabase.');
      return;
    }

    const cards = indices.map(i => ({ name: CATALOG[i].name, level: CATALOG[i].level, foil: false }));
    setStarterOpened(true);
    setOpeningStarter(false);
    setOpenResult({ chestName: 'Baú Inicial Gratuito', tier: 'bronze', cards });
    setRevealedCards(new Set());
    onCardsChanged?.();
  };

  const handlePurchase = async (chest: Chest) => {
    setOpening(chest.id);
    await new Promise(r => setTimeout(r, 1200));
    setOpening(null);
    const result = simulateOpen(chest);
    setOpenResult(result);
    setRevealedCards(new Set());
  };

  const handleRevealCard = (idx: number) => {
    setRevealedCards(prev => new Set([...prev, idx]));
  };

  const handleRevealAll = () => {
    if (!openResult) return;
    setRevealedCards(new Set(openResult.cards.map((_, i) => i)));
  };

  const tierGlow: Record<Chest['tier'], string> = {
    bronze: '0 0 60px rgba(180,83,9,0.4)',
    prata:  '0 0 60px rgba(148,163,184,0.4)',
    ouro:   '0 0 80px rgba(234,179,8,0.5)',
  };

  return (
    <div className="p-10 space-y-12 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
              Loja do <span className="text-yellow-400">Reino</span>
            </h1>
          </div>
          <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">
            Baús · Decks · Coleções Exclusivas
          </p>
        </div>

        {/* Toggle moeda */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setCurrency('gold')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
              ${currency === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-white/30 hover:text-white'}`}
          >
            <Coins className="w-3.5 h-3.5" /> Ouro
          </button>
          <button
            onClick={() => setCurrency('gems')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
              ${currency === 'gems' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/30 hover:text-white'}`}
          >
            <Gem className="w-3.5 h-3.5" /> Gemas
          </button>
        </div>
      </div>


      {/* ── Baús ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-yellow-400 rounded-full" />
          <h2 className="text-sm font-black text-white/50 uppercase tracking-[0.4em]">Baús Disponíveis</h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {CHESTS.map((chest, ci) => (
            <motion.div
              key={chest.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.1 }}
              className={`relative flex flex-col rounded-3xl border ${chest.borderColor} bg-gradient-to-b ${chest.gradient} bg-black/40 overflow-hidden group
                ${chest.highlight ? 'ring-1 ring-slate-400/20' : ''}`}
              style={{ boxShadow: chest.highlight ? tierGlow[chest.tier] : undefined }}
            >
              {/* Badge "Mais Popular" */}
              {chest.highlight && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-slate-500/30 border border-slate-400/30 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-200 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-slate-300" /> Mais Popular
                </div>
              )}

              {/* Ícone / imagem do baú */}
              <div className="flex items-center justify-center py-10 relative">
                <div
                  className={`text-amber-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500
                    ${chest.tier === 'prata' ? 'text-slate-400' : chest.tier === 'ouro' ? 'text-yellow-400' : ''}`}
                  style={{ filter: `drop-shadow(0 0 20px ${chest.glowColor})` }}
                >
                  {chest.icon}
                </div>
                {/* Partículas decorativas */}
                {[...Array(4)].map((_, pi) => (
                  <motion.div
                    key={pi}
                    animate={{ y: [-4, 4, -4], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2 + pi * 0.4, repeat: Infinity, delay: pi * 0.3 }}
                    className={`absolute w-1 h-1 rounded-full
                      ${chest.tier === 'ouro' ? 'bg-yellow-400' : chest.tier === 'prata' ? 'bg-slate-300' : 'bg-amber-600'}`}
                    style={{
                      left: `${20 + pi * 20}%`,
                      top: `${30 + (pi % 2) * 20}%`,
                    }}
                  />
                ))}
              </div>

              {/* Conteúdo */}
              <div className="flex flex-col flex-1 px-6 pb-6 gap-4">
                <div>
                  <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-md border ${chest.badgeColor}`}>
                    {chest.cardCount}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mt-2">{chest.name}</h3>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{chest.subtitle}</p>
                </div>

                {/* Lista de recompensas */}
                <ul className="space-y-1.5 flex-1">
                  {chest.rewards.map((r, ri) => (
                    <li key={ri} className="flex items-center gap-2">
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${r.rarity ? RARITY_COLORS[r.rarity] : ''}`}>
                        {r.guaranteed ? 'GARANTE' : 'CHANCE'}
                      </span>
                      <span className="text-[10px] font-bold text-white/60">{r.label}</span>
                    </li>
                  ))}
                </ul>

                {/* Preço + Botão */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    {currency === 'gold' ? (
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-2xl font-black text-white font-mono">
                          {chest.priceGold.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-white/30 font-black uppercase">Ouro</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gem className="w-4 h-4 text-cyan-400" />
                        <span className="text-2xl font-black text-white font-mono">{chest.priceGems}</span>
                        <span className="text-[9px] text-white/30 font-black uppercase">Gemas</span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePurchase(chest)}
                    disabled={opening === chest.id}
                    className={`w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                      ${chest.tier === 'ouro'
                        ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300'
                        : chest.tier === 'prata'
                          ? 'bg-slate-500/20 hover:bg-slate-500/30 border border-slate-400/40 text-slate-200'
                          : 'bg-amber-700/20 hover:bg-amber-700/30 border border-amber-600/40 text-amber-300'}
                      ${opening === chest.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opening === chest.id ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        />
                        Abrindo...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Abrir Baú
                        <ChevronRight className="w-3 h-3" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Decks Pré-montados ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-purple-400 rounded-full" />
          <h2 className="text-sm font-black text-white/50 uppercase tracking-[0.4em]">Decks Pré-montados</h2>
          <span className="ml-2 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[7px] font-black text-purple-400 uppercase tracking-widest">Novo</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Deck Iniciante: Chama da Aurora', cards: 40, level: 'Neutro/Bronze', price: 800,  gems: 15, color: 'from-orange-900/30', border: 'border-orange-700/30', badge: 'text-orange-300', img: '/arena.webp' },
            { name: 'Deck Elite: Guardiões de Ferro',  cards: 40, level: 'Bronze/Prata',  price: 2500, gems: 50, color: 'from-slate-700/30', border: 'border-slate-500/30', badge: 'text-slate-200',  img: '/battle_preview.webp' },
          ].map((deck, di) => (
            <motion.div
              key={di}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + di * 0.1 }}
              className={`relative flex gap-6 p-6 rounded-2xl bg-gradient-to-r ${deck.color} to-transparent border ${deck.border} bg-black/30 group overflow-hidden hover:border-white/20 transition-all`}
            >
              <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-white/20 transition-all">
                <img src={deck.img} className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div className="space-y-1">
                  <span className={`text-[7px] font-black uppercase tracking-widest ${deck.badge} bg-white/5 px-2 py-0.5 rounded`}>{deck.level}</span>
                  <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight">{deck.name}</h3>
                  <p className="text-white/30 text-[9px] font-bold uppercase">{deck.cards} cartas selecionadas</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {currency === 'gold'
                      ? <><Coins className="w-3.5 h-3.5 text-yellow-400" /><span className="text-sm font-black font-mono">{deck.price.toLocaleString()}</span></>
                      : <><Gem className="w-3.5 h-3.5 text-cyan-400" /><span className="text-sm font-black font-mono">{deck.gems}</span></>}
                  </div>
                  <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white transition-all flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Comprar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Modal de abertura ── */}
      <AnimatePresence>
        {openResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-8"
            onClick={() => setOpenResult(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              style={{ boxShadow: tierGlow[openResult.tier] }}
            >
              {/* Header do modal */}
              <div className={`px-8 py-6 border-b border-white/5 flex items-center justify-between
                ${openResult.tier === 'ouro' ? 'bg-yellow-900/20' : openResult.tier === 'prata' ? 'bg-slate-700/20' : 'bg-amber-900/20'}`}>
                <div className="space-y-0.5">
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Você recebeu</div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{openResult.chestName}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRevealAll}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3" /> Revelar Todas
                  </button>
                  <button onClick={() => setOpenResult(null)} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Grade de cartas */}
              <div className="p-8">
                <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
                  {openResult.cards.map((card, idx) => {
                    const revealed = revealedCards.has(idx);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: revealed ? 0 : 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: revealed ? 0 : 0 }}
                        onClick={() => handleRevealCard(idx)}
                        className="aspect-[2/3] rounded-xl overflow-hidden cursor-pointer relative group"
                        style={{ perspective: 600 }}
                      >
                        {revealed ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full h-full bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-xl flex flex-col items-center justify-center p-2 gap-1 relative"
                          >
                            {card.foil && (
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-yellow-500/30 border border-yellow-400/40 rounded text-[6px] font-black text-yellow-300 uppercase">
                                FOIL
                              </div>
                            )}
                            <Sparkles className={`w-8 h-8 ${
                              card.level === 'Ouro'   ? 'text-yellow-400' :
                              card.level === 'Prata'  ? 'text-slate-300'  :
                              card.level === 'Bronze' ? 'text-amber-400'  : 'text-gray-400'
                            }`} />
                            <div className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${LEVEL_COLORS[card.level] ?? 'text-gray-300 bg-gray-700/60'}`}>
                              {card.level}
                            </div>
                            <p className="text-[7px] font-black text-white text-center leading-tight">{card.name}</p>
                          </motion.div>
                        ) : (
                          <div className="w-full h-full bg-[url('/fundo.webp')] bg-cover rounded-xl border border-white/10 group-hover:border-white/30 transition-all flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border border-white/10 bg-black/40 flex items-center justify-center group-hover:border-white/30 transition-all">
                              <div className="w-3 h-3 rounded-full bg-white/10 group-hover:bg-white/30 transition-all animate-pulse" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setOpenResult(null)}
                    className="px-8 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest text-yellow-400 transition-all"
                  >
                    Coletar Cartas
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
