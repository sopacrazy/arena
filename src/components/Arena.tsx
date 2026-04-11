import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Heart, Trophy, X, Eye, Search, History, Skull, RefreshCw } from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: string;
  cost: number;
  atk: number;
  hp: number;
  maxHp: number;
  desc: string;
  color: string;
  image?: string;
  canAttack: boolean;
  hasTaunt?: boolean;
}

// Catalog base for game cards from 'RECK 1'
const CARD_CATALOG = {
  neutro: [
    { name: "Recruta 06", img: "/RECK 1/NIVEL NEUTRO/06 - Copia - Copia - Copia - Copia - Copia - Copia.png" },
    { name: "Patrulheiro 11", img: "/RECK 1/NIVEL NEUTRO/11 - Copia - Copia - Copia - Copia - Copia - Copia.png" },
    { name: "Sentinela 43", img: "/RECK 1/NIVEL NEUTRO/43 - Copia - Copia - Copia - Copia - Copia - Copia.png" },
    { name: "Aldeão 49", img: "/RECK 1/NIVEL NEUTRO/49 - Copia - Copia - Copia - Copia - Copia - Copia.png" },
    { name: "Militante 50", img: "/RECK 1/NIVEL NEUTRO/50 - Copia - Copia - Copia - Copia - Copia - Copia.png" },
    { name: "Guarda 51", img: "/RECK 1/NIVEL NEUTRO/51 - Copia - Copia - Copia - Copia - Copia - Copia.png" },
    { name: "Vigilante 53", img: "/RECK 1/NIVEL NEUTRO/53 - Copia - Copia - Copia.png" },
    { name: "Soldado 60", img: "/RECK 1/NIVEL NEUTRO/60.png" },
    { name: "Mercenário 67", img: "/RECK 1/NIVEL NEUTRO/67 - Copia - Copia.png" },
    { name: "Andarilho", img: "/RECK 1/NIVEL NEUTRO/Design sem nome (10).png" },
  ],
  prata: [
    { name: "Caelan", img: "/RECK 1/PRATA/Caelan, Lâmina do Juramento.png" },
    { name: "Fargan", img: "/RECK 1/PRATA/Fargan, Lâmina do Caminho Estreito (1).png" },
    { name: "Raskel", img: "/RECK 1/PRATA/_Raskel, Sangue da Campanha.png" },
  ],
  ouro: [
    { name: "Aldren Veterano", img: "/RECK 1/OURO/Aldren, Veterano da Fronteira Quebrada (5).png" },
    { name: "Iskand Sobrevivente", img: "/RECK 1/OURO/Iskand, Sobrevivente do Campo Vermelho.png" },
  ]
};

// Map catalog to full Card objects
const DECK_POOL: Card[] = [
  ...CARD_CATALOG.neutro.map((c, i) => ({
    id: `n-${i}`,
    name: c.name,
    type: 'Neutro',
    atk: 1 + Math.floor(Math.random() * 3),
    hp: 2 + Math.floor(Math.random() * 3),
    maxHp: 5,
    cost: 1 + Math.floor(i/3),
    desc: 'Unidade básica',
    color: 'gray',
    image: c.img,
    canAttack: false
  })),
  ...CARD_CATALOG.prata.map((c, i) => ({
    id: `p-${i}`,
    name: c.name,
    type: 'Prata',
    atk: 4 + Math.floor(Math.random() * 3),
    hp: 4 + Math.floor(Math.random() * 3),
    maxHp: 8,
    cost: 4 + i,
    desc: 'Unidade de elite',
    color: 'silver',
    image: c.img,
    canAttack: false
  })),
  ...CARD_CATALOG.ouro.map((c, i) => ({
    id: `o-${i}`,
    name: c.name,
    type: 'Ouro',
    atk: 7 + Math.floor(Math.random() * 4),
    hp: 8 + Math.floor(Math.random() * 4),
    maxHp: 12,
    cost: 7 + i,
    desc: 'Lenda do campo',
    color: 'yellow',
    image: c.img,
    canAttack: false
  }))
];


interface ArenaProps {
  onClose: () => void;
}

export default function Arena({ onClose }: ArenaProps) {
  // Helper to shuffle any array
  const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Initial Logic: Prepare Deck and Hand
  const shuffledDeck = useMemo(() => shuffle(DECK_POOL), []);
  const [deck, setDeck] = useState<Card[]>(shuffledDeck.slice(5));
  const [hand, setHand] = useState<Card[]>(shuffledDeck.slice(0, 5));
  const [field, setField] = useState<(Card | null)[]>(Array(9).fill(null));
  const [enemyField, setEnemyField] = useState<(Card | null)[]>(Array(9).fill(null));
  const [enemyHandCount, setEnemyHandCount] = useState(4);
  const [playerHp, setPlayerHp] = useState(30);
  const [enemyHp, setEnemyHp] = useState(30);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [turnCount, setTurnCount] = useState(1);
  const [playedCardThisTurn, setPlayedCardThisTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'victory' | 'defeat'>('playing');
  const [isTransitioning, setIsTransitioning] = useState<string | null>(null);
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<{ card: Card, index: number } | null>(null);
  const [attackingInfo, setAttackingInfo] = useState<{ id: string, targetType: 'card' | 'hero', isOpponent?: boolean } | null>(null);
  
  const [history, setHistory] = useState<string[]>([
    "● COMBATE INICIADO",
    "● BOA SORTE, HERÓI"
  ]);

  const drawCard = () => {
    if (deck.length > 0) {
      const nextCard = deck[0];
      setDeck(prev => prev.slice(1));
      setHand(prev => [...prev, nextCard]);
      setHistory(prev => [`● Fase de Compra: +1 carta`, ...prev]);
    }
  };

  const resetGame = () => {
    const freshDeck = shuffle(DECK_POOL);
    setDeck(freshDeck.slice(5));
    setHand(freshDeck.slice(0, 5));
    setField(Array(9).fill(null));
    setEnemyField(Array(9).fill(null));
    setEnemyHandCount(4);
    setPlayerHp(30);
    setEnemyHp(30);
    setTurn('player');
    setTurnCount(1);
    setPlayedCardThisTurn(false);
    setGameStatus('playing');
    setHistory(["● BLOCO DE NOTAS LIMPO", "● PARTIDA REINICIADA"]);
    setSelectedCardId(null);
    setInspectedCard(null);
  };

  const handleInspect = (e: React.MouseEvent, card: Card) => {
    e.preventDefault();
    setInspectedCard(card);
  };

  const endTurn = async () => {
    if (turn !== 'player') return;
    setTurn('opponent');
    setPlayedCardThisTurn(false);
    setSelectedCardId(null);
    setActiveActionMenu(null);
    setIsTransitioning("TURNO DO ADVERSÁRIO");
    setTimeout(() => setIsTransitioning(null), 1500);

    // AI Logic Start
    await new Promise(r => setTimeout(r, 2000));
    
    // AI Draw Phase
    setHistory(prev => [`● Oponente: Fase de Compra`, ...prev]);
    setEnemyHandCount(prev => prev + 1);
    
    runOpponentAI();
  };

  const runOpponentAI = async () => {
    // 1. Play a card if possible (Rule: 1 per turn)
    const emptySlots = enemyField.slice(0, 5).map((s, i) => s === null ? i : -1).filter(i => i !== -1);
    
    if (emptySlots.length > 0 && enemyHandCount > 0) {
      const randomIndex = Math.floor(Math.random() * DECK_POOL.length);
      const enemyCardSource = DECK_POOL[randomIndex];
      const newEnemyCard: Card = {
        ...enemyCardSource,
        id: `enemy-${Date.now()}-${Math.random()}`
      };

      const targetSlot = emptySlots[0];
      const newEnemyField = [...enemyField];
      newEnemyField[targetSlot] = newEnemyCard;
      
      setEnemyField(newEnemyField);
      setEnemyHandCount(prev => prev - 1);
      setHistory(prev => [`● Malakor invocou: ${newEnemyCard.name}`, ...prev]);
      await new Promise(r => setTimeout(r, 1000));
    }

    // 2. Attack with existing cards (Restriction: First turn no attacks)
    if (turnCount > 1) { 
      const capableAttackers = enemyField.slice(0, 5).filter((c): c is Card => c !== null);
      for (const attacker of capableAttackers) {
        // Simple logic: attack first player card, or hero if none
        const playerCardIndex = field.slice(0, 5).findIndex(c => c !== null);
        const target = playerCardIndex !== -1 ? field[playerCardIndex]!.id : 'hero';
        
        await handleOpponentAttack(attacker.id, target);
        await new Promise(r => setTimeout(r, 800));
      }
    }

    // 3. End Opponent Turn
    setTimeout(() => {
        setTurn('player');
        setTurnCount(prev => prev + 1);
        setPlayedCardThisTurn(false);
        setIsTransitioning("SEU TURNO");
        setHistory(prev => ["● SEU TURNO: Planeje sua estratégia!", ...prev]);
        drawCard();
        setTimeout(() => setIsTransitioning(null), 1500);
    }, 1000);
  };

  const handleOpponentAttack = async (attackerId: string, targetId: string | 'hero') => {
    const attacker = enemyField.find(c => c?.id === attackerId);
    if (!attacker) return;

    setAttackingInfo({ id: attackerId, targetType: targetId === 'hero' ? 'hero' : 'card', isOpponent: true });
    await new Promise(r => setTimeout(r, 350));

    if (targetId === 'hero') {
      setPlayerHp(prev => Math.max(0, prev - attacker.atk));
      setHistory(prev => [`● PUNCH! ${attacker.name} causou ${attacker.atk} a você!`, ...prev]);
      if (playerHp - attacker.atk <= 0) setGameStatus('defeat');
    } else {
      const target = field.find(c => c?.id === targetId);
      if (target) {
        setField(prev => prev.map(c => (c?.id === targetId) ? (c.hp - attacker.atk <= 0 ? null : { ...c, hp: c.hp - attacker.atk }) : c));
        setEnemyField(prev => prev.map(c => (c?.id === attackerId) ? (c.hp - target.atk <= 0 ? null : { ...c, hp: c.hp - target.atk, canAttack: false }) : c));
        setHistory(prev => [`● Defesa! ${attacker.name} atacou sua unidade`, ...prev]);
      }
    }
    setAttackingInfo(null);
  };

  const playCard = (card: Card) => {
    if (turn !== 'player' || playedCardThisTurn) {
      if (playedCardThisTurn) setHistory(prev => ["● Limite: 1 combatente por turno!", ...prev]);
      return;
    }
    
    // Find first empty Combatant slot (0-4)
    const emptyIndex = field.findIndex((s, i) => s === null && i < 5);
    if (emptyIndex === -1) {
      setHistory(prev => ["● Campo de Combatentes cheio!", ...prev]);
      return;
    }

    setHand(prev => prev.filter(c => c.id !== card.id));
    setField(prev => {
      const next = [...prev];
      next[emptyIndex] = { ...card, canAttack: false };
      return next;
    });
    setPlayedCardThisTurn(true);
    setHistory(prev => [`● Jogou '${card.name}'`, ...prev]);
  };

  const handleCombat = async (attackerId: string, targetId: string | 'hero', isEnemyHero: boolean = false) => {
    const attacker = field.find(c => c?.id === attackerId);
    if (!attacker || !attacker.canAttack || turn !== 'player') return;

    setAttackingInfo({ id: attackerId, targetType: isEnemyHero ? 'hero' : 'card' });
    await new Promise(resolve => setTimeout(resolve, 350));

    if (isEnemyHero) {
      if (turnCount === 1) {
        setHistory(prev => ["● Regra: Sem ataques no primeiro turno!", ...prev]);
        setSelectedCardId(null);
        setAttackingInfo(null);
        return;
      }
      const newHp = enemyHp - attacker.atk;
      setEnemyHp(Math.max(0, newHp));
      if (newHp <= 0) setGameStatus('victory');
      setHistory(prev => [`● Direct Hit! ${attacker.name} causou ${attacker.atk} ao Herói`, ...prev]);
      setField(prev => prev.map(c => c?.id === attackerId ? { ...c, canAttack: false } : c));
    } else {
      const target = enemyField.find(c => c?.id === targetId);
      if (target) {
        setField(prev => prev.map(c => (c?.id === attackerId) ? (c.hp - target.atk <= 0 ? null : { ...c, hp: c.hp - target.atk, canAttack: false }) : c));
        setEnemyField(prev => prev.map(c => (c?.id === targetId) ? (c.hp - attacker.atk <= 0 ? null : { ...c, hp: c.hp - attacker.atk }) : c));
        setHistory(prev => [`● Combate: ${attacker.name} vs ${target.name}`, ...prev]);
      }
    }

    setSelectedCardId(null);
    setAttackingInfo(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-display text-white">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/arena.png")' }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full text-white backdrop-blur-md transition-all group pointer-events-auto"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* TURN AND GAME OVER OVERLAYS */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/80 backdrop-blur-2xl px-12 py-6 rounded-full border-2 border-gold/50 shadow-[0_0_100px_rgba(255,215,0,0.3)]">
              <h2 className="text-4xl font-black text-gold uppercase tracking-[0.5em] italic animate-pulse">{isTransitioning}</h2>
            </div>
          </motion.div>
        )}

        {gameStatus !== 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="text-center space-y-8 p-12 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <motion.h1 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className={`text-7xl font-black uppercase tracking-tighter ${gameStatus === 'victory' ? 'text-emerald-500 shadow-emerald-500/50' : 'text-red-600 shadow-red-500/50'} drop-shadow-[0_0_30px_rgba(0,0,0,1)]`}
              >
                {gameStatus === 'victory' ? 'Vitória Gloriosa' : 'Derrota Humilhante'}
              </motion.h1>
              <p className="text-gray-400 max-w-md mx-auto">
                {gameStatus === 'victory' 
                  ? 'Você derrotou Malakor e salvou o reino das sombras. Sua lenda será contada por gerações!' 
                  : 'As sombras consumiram sua alma. Malakor agora reina soberano sobre a arena.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={resetGame}
                  className="px-8 py-4 bg-gold text-black font-black rounded-xl hover:scale-105 transition-transform uppercase tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                >
                  Jogar Novamente
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-4 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-all uppercase tracking-widest"
                >
                  Sair da Arena
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative z-10 w-full h-full flex flex-col p-4 transition-opacity duration-1000 ${gameStatus !== 'playing' ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
        
        {/* Enemy HUD (Top Left) */}
        <div className="fixed top-6 left-10 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border border-red-500/20 transition-all z-50">
           <div className="w-10 h-10 rounded-xl border border-red-500/30 p-0.5 overflow-hidden bg-black shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <img src="/enemy_avatar.png" className="w-full h-full object-cover rounded-lg grayscale hover:grayscale-0 transition-all" />
           </div>
           <div className="space-y-1">
              <div className="text-[10px] font-black text-red-500 uppercase tracking-wider">Malakor</div>
              <div className="flex items-center gap-2">
                 <div className="w-28 h-1 bg-black/60 rounded-full border border-white/5 overflow-hidden">
                    <motion.div initial={{ width: '100%' }} animate={{ width: `${(enemyHp / 30) * 100}%` }} className="h-full bg-red-600 shadow-[0_0_8px_#dc2626]" />
                 </div>
                 <span className="text-[9px] font-black text-red-400 font-mono tracking-tighter">{enemyHp}/30</span>
              </div>
           </div>
        </div>

        {/* Enemy Hand (Top Right - Fixed) */}
        <div className="fixed top-6 right-10 flex flex-col items-end gap-1 z-50">
            <span className="text-[7px] font-black text-red-500/30 uppercase tracking-[0.4em] pr-4">Mão do Oponente</span>
            <div className="flex justify-end -space-x-10">
              {[...Array(enemyHandCount)].map((_, i) => (
                <motion.div 
                  key={`enemy-hand-card-${i}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ rotate: (i - Math.floor(enemyHandCount/2)) * -3 }}
                  className="w-14 h-20 rounded-lg border border-white/10 shadow-xl bg-cover bg-center bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('/fundo.png')] bg-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-black/20">
                    <div className="w-4 h-4 rounded-full bg-red-500/10 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
        </div>

        {/* BOARD AREA: BATTLEFIELD & SIDEBAR */}
        <div className="flex-1 flex gap-10 items-center justify-center relative" onClick={() => setActiveActionMenu(null)}>
          
          {/* LEFT SIDEBAR (BAN AREA) */}
          <div className="w-32 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-22 h-30 rounded-xl border-2 border-red-500/20 bg-black/40 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-red-500/40">
                 <div className="text-xl font-black text-white/40 group-hover:text-white/60 transition-colors uppercase">BAN</div>
                 <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* BATTLEFIELD (4 ROWS TOTAL) */}
          <div className="flex flex-col gap-6 max-w-[85%] mt-16">
            
            {/* ENEMY SIDE (2 ROWS) */}
            <div className="flex flex-col gap-2">
              {/* ENEMY ROW 2: REAÇÕES & BENÇÃO (REAÇÕES ESQUERDA, BENÇÃO DIREITA) */}
              <div className="flex gap-2">
                 {/* Reações (Index 6-8) */}
                 <div className="flex gap-2 justify-start">
                   {[6, 7, 8].map((i) => (
                     <div key={`enemy-reaction-${i}`} className="w-20 h-28 rounded-xl border-dashed border-2 border-red-500/5 bg-red-500/5 flex items-center justify-center">
                       <span className="text-white/40 font-black text-[6px] uppercase tracking-widest">Reações</span>
                     </div>
                   ))}
                 </div>
                 
                 <div className="flex-1" />

                 {/* Benção (Index 5 - Extrema Direita) */}
                 <div className="w-22 h-30 rounded-xl border-dashed border-2 border-red-500/10 bg-red-500/5 flex items-center justify-center">
                    <span className="text-white/40 font-black text-[7px] uppercase tracking-widest leading-none">Benção</span>
                 </div>
              </div>

              {/* ENEMY ROW 1: COMBATENTES (Index 0-4) */}
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={`enemy-combatant-${i}`} className="w-24 h-32 rounded-xl border-2 border-dashed border-red-500/20 bg-black/40 flex items-center justify-center relative">
                    {enemyField[i] ? (
                      <motion.div 
                        layoutId={enemyField[i]?.id}
                        initial={{ opacity: 0, scale: 0.3, x: 500, y: -500, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="w-full h-full relative p-0 bg-cover bg-center rounded-xl overflow-hidden shadow-2xl" 
                        style={{ backgroundImage: `url("${enemyField[i]?.image || '/fundo.png'}")` }}
                      >
                         <div className="absolute inset-0 bg-black/10" />
                         {/* Stats Overlay */}
                         <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                            <span className="text-[10px] font-black text-red-500 drop-shadow-lg">{enemyField[i]?.atk}</span>
                            <span className="text-[10px] font-black text-emerald-500 drop-shadow-lg">{enemyField[i]?.hp}</span>
                         </div>
                         {/* Hover info or something if needed */}
                         <button 
                            onContextMenu={(e) => enemyField[i] && handleInspect(e, enemyField[i]!)}
                            onClick={() => enemyField[i] && setInspectedCard(enemyField[i]!)}
                            className="absolute inset-0 z-10 opacity-0 bg-white/5 hover:opacity-100 transition-opacity"
                         />
                      </motion.div>
                    ) : (
                      <span className="text-white/30 font-black text-[8px] uppercase font-serif">Combatentes</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Battle Divider */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent flex items-center justify-center relative">
               <div className="absolute inset-0 bg-white/5 blur-sm" />
               <div className="relative px-6 py-1 bg-black/80 border border-white/10 rounded-full text-[6px] font-black text-gold uppercase tracking-[0.5em] shadow-2xl">
                 Linhagem de Combate
               </div>
            </div>

            {/* PLAYER SIDE (2 ROWS) */}
            <div className="flex flex-col gap-2">
              {/* PLAYER ROW 1: COMBATENTES (Index 0-4) */}
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={`player-combatant-${i}`} className="relative">
                    <div className={`w-24 h-32 rounded-xl border-2 border-dashed transition-all duration-500 ${selectedCardId && field[i] && selectedCardId === field[i]?.id ? 'border-gold bg-gold/5' : (selectedCardId && !field[i] ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-black/20')} flex items-center justify-center relative`}>
                      {field[i] ? (
                        <>
                          {/* Floating Action Menu (ABOVE THE CARD) */}
                          <AnimatePresence>
                            {activeActionMenu?.index === i && (
                              <motion.div 
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -8, scale: 1 }}
                                exit={{ opacity: 0, y: 0, scale: 0.5 }}
                                className="absolute -top-10 inset-x-0 flex justify-center gap-2 z-[60]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                    <button 
                                      onClick={() => {
                                        if (turnCount === 1) {
                                          setHistory(prev => ["● Regra: Ataques proibidos no Turno 1", ...prev]);
                                          setActiveActionMenu(null);
                                          return;
                                        }
                                        setSelectedCardId(field[i]!.id);
                                        setActiveActionMenu(null);
                                      }}
                                      title="Atacar"
                                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90 border border-white/20 ${turnCount === 1 ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}
                                    >
                                       <Sword className="w-5 h-5 text-white" />
                                    </button>
                                 <button 
                                   onClick={() => {
                                     setHistory(prev => [`● ${field[i]!.name} em posição de Defesa`, ...prev]);
                                     setActiveActionMenu(null);
                                   }}
                                   title="Defender"
                                   className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all hover:scale-110 active:scale-90 border border-white/20"
                                 >
                                    <Shield className="w-5 h-5 text-white" />
                                 </button>
                                 <button 
                                   onClick={() => {
                                     setInspectedCard(field[i]!);
                                     setActiveActionMenu(null);
                                   }}
                                   title="Visualizar"
                                   className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all hover:scale-110 active:scale-90 border border-white/20"
                                 >
                                    <Eye className="w-5 h-5 text-white" />
                                 </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.div
                            layoutId={field[i]?.id}
                            onContextMenu={(e) => field[i] && handleInspect(e, field[i]!)}
                            className={`w-full h-full rounded-xl overflow-hidden shadow-xl cursor-pointer ${selectedCardId === field[i]?.id ? 'ring-2 ring-gold' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (field[i]) {
                                setActiveActionMenu(activeActionMenu?.index === i ? null : { card: field[i]!, index: i });
                              }
                            }}
                          >
                             <div className="relative w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${field[i]?.image}")` }}>
                                 <div className="absolute inset-0 bg-black/10" />
                                 <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                                    <span className="text-[10px] font-black text-red-500 drop-shadow-lg">{field[i]?.atk}</span>
                                    <span className="text-[10px] font-black text-emerald-500 drop-shadow-lg">{field[i]?.hp}</span>
                                 </div>
                              </div>
                          </motion.div>
                        </>
                      ) : (
                        <span className="text-white/20 font-black text-[8px] uppercase font-serif">Combatentes</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* PLAYER ROW 2: REAÇÕES (ESQUERDA) & BENÇÃO (DIREITA) */}
              <div className="flex gap-2">
                 {/* Reações (Index 6-8 - À ESQUERDA) */}
                 <div className="flex gap-2">
                   {[6, 7, 8].map((i) => (
                     <div key={`player-reaction-${i}`} className="w-20 h-28 rounded-xl border-dashed border-2 border-emerald-500/10 bg-emerald-500/5 flex items-center justify-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 cursor-pointer">
                       {field[i] ? (
                         <div className="w-full h-full rounded-xl bg-cover bg-center opacity-80" style={{ backgroundImage: `url("${field[i]!.image}")` }} />
                       ) : (
                         <span className="text-white/30 font-black text-[6px] uppercase tracking-widest">Reações</span>
                       )}
                     </div>
                   ))}
                 </div>

                 <div className="flex-1" />

                 {/* Benção (Index 5 - Extrema Direita) */}
                 <div className="w-22 h-30 rounded-xl border-dashed border-2 border-gold/10 bg-gold/5 flex items-center justify-center transition-all hover:bg-gold/10 hover:border-gold/30 cursor-pointer">
                    {field[5] ? (
                      <div className="w-full h-full rounded-xl bg-cover bg-center opacity-80" style={{ backgroundImage: `url("${field[5].image}")` }} />
                    ) : (
                      <span className="text-white/50 font-black text-[7px] uppercase tracking-widest leading-none">Benção</span>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Fixed column) */}
          <div className="w-32 flex flex-col gap-4 items-center h-[70vh] justify-center pb-10">
            {/* EXÍLIO */}
            <div className="flex flex-col items-center gap-1 group">
              <div className="w-22 h-30 rounded-xl border-2 border-white/5 bg-black/40 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-white/20">
                 <div className="text-lg font-black text-white/40 group-hover:text-white/60 transition-colors uppercase leading-tight italic text-center px-2 font-serif">Exílio</div>
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
              </div>
            </div>

            {/* DECK (Bottom) */}
            <div className="flex flex-col items-center gap-2 group">
              <motion.div 
                layoutId="game-deck"
                className="relative w-22 h-30 rounded-xl border-2 border-white/20 bg-cover bg-center shadow-xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:border-white/40 cursor-pointer"
                style={{ backgroundImage: 'url("/fundo.png")' }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </motion.div>
              {/* Deck Label & Count (BELOW) */}
              <div className="flex flex-col items-center leading-none">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-serif">Deck</span>
                 <span className="text-sm font-mono text-white/80 font-black">{deck.length}</span>
              </div>
            </div>
            
            {/* END TURN */}
            <div className="mt-4 w-full">
               <button 
                onClick={endTurn}
                disabled={turn !== 'player'}
                className={`group relative overflow-hidden px-4 py-4 rounded-xl font-black text-[9px] transition-all uppercase tracking-[0.2em] w-full shadow-lg border
                  ${turn === 'player' 
                    ? 'bg-emerald-600 border-emerald-400/40 text-gold hover:bg-emerald-500 active:scale-95' 
                    : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'}`}
               >
                 {turn === 'player' ? 'Finalizar Turno' : 'Aguarde'}
               </button>
            </div>
          </div>
        </div>

        {/* HUD Player */}
        <div className="w-full flex justify-between items-end gap-12 mt-auto px-10 pb-6 pointer-events-none">
            {/* Player Info (Fixed Bottom Left) */}
            <div 
              onClick={() => selectedCardId && handleCombat(selectedCardId, 'hero', true)}
              className="pointer-events-auto flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/5 transition-all cursor-pointer mb-2"
            >
               <div className="w-10 h-10 rounded-xl border border-gold/30 p-0.5 overflow-hidden bg-black">
                  <img src="/hero_avatar.png" className="w-full h-full object-cover rounded-lg" />
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] font-black text-white uppercase tracking-wider">Aeliana Solari</div>
                  <div className="flex items-center gap-2">
                     <div className="w-28 h-1 bg-black/60 rounded-full border border-white/5 overflow-hidden">
                        <motion.div initial={{ width: '100%' }} animate={{ width: `${(playerHp / 30) * 100}%` }} className="h-full bg-emerald-500" />
                     </div>
                     <span className="text-[9px] font-black text-emerald-400 font-mono tracking-tighter">{playerHp}/30</span>
                  </div>
               </div>
            </div>

            {/* Hand (Pinned to Bottom Right - Fixed) */}
            <div className="fixed bottom-10 right-10 pointer-events-auto flex flex-col items-end gap-1">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em] pr-2">Sua Mão</span>
                <div className="flex justify-end -space-x-8">
                  <AnimatePresence>
                    {hand.map((card, i) => (
                      <motion.div 
                        key={card.id} 
                        layoutId={card.id}
                        whileHover="hover"
                        initial="initial"
                        exit={{ opacity: 0, scale: 0.5, y: -200 }}
                        onContextMenu={(e) => handleInspect(e, card)}
                        onClick={() => playCard(card)}
                        className="relative w-18 h-26 cursor-pointer flex items-end"
                      >
                        <motion.div
                          variants={{
                            initial: { opacity: 0, scale: 0.5, x: 800, y: -300, rotate: 45 },
                            animate: { 
                              opacity: 1, 
                              scale: 1, 
                              x: 0, 
                              y: 0, 
                              rotate: (i - Math.floor(hand.length/2)) * 3,
                              transition: { type: "spring", stiffness: 150, damping: 25 }
                            },
                            hover: { 
                              scale: 1.3, 
                              y: -35,
                              rotate: 0,
                              zIndex: 100,
                              transition: { type: "spring", stiffness: 200, damping: 20 }
                            }
                          }}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          className="w-full h-full rounded-lg overflow-hidden shadow-2xl relative bg-cover bg-center border border-white/20"
                          style={{ backgroundImage: card.image ? `url("${card.image}")` : 'url("/fundo.png")' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60" />
                          {!card.image && (
                            <div className="p-2 flex flex-col h-full items-center justify-center">
                                <h4 className="text-[7px] font-black text-white text-center drop-shadow-lg uppercase leading-tight">{card.name}</h4>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
        </div>
      </div>
      
      {/* Visual FX Layers */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <div 
          className="absolute inset-0" 
          style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)' }} 
        />
        <div 
          className="absolute inset-0 bg-black/10 mix-blend-overlay opacity-30" 
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' }} 
        />
      </div>

      {/* Card Inspection Modal */}
      <AnimatePresence>
        {inspectedCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectedCard(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 cursor-pointer"
          >
             <motion.div
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0 }}
               onClick={(e) => e.stopPropagation()}
               className="flex flex-row max-w-6xl w-full gap-8 items-stretch p-4 bg-black/40 rounded-lg border border-white/5"
             >
                {/* LEFT: FULL CARD VIEW */}
                <div className="flex-1 flex items-center justify-center">
                   <div 
                     className="w-[450px] aspect-[2/3] bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                   >
                     <img 
                       src={inspectedCard.image || '/fundo.png'} 
                       className="w-full h-full object-contain"
                       alt={inspectedCard.name}
                     />
                   </div>
                </div>

                {/* RIGHT: INFO PANEL */}
                <div className="flex-1 flex flex-col gap-6 py-4">
                   {/* Name Box */}
                   <div className="p-4 bg-white/5 border-l-4 border-red-600 rounded-sm">
                      <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">Combatente</span>
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{inspectedCard.name}</h2>
                   </div>

                   {/* Description/Type Box */}
                   <div className="flex-1 p-6 bg-white/5 border border-white/10 rounded-sm flex flex-col gap-4">
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-sm text-xs font-black uppercase tracking-widest ${inspectedCard.type === 'Ouro' ? 'bg-gold text-black' : inspectedCard.type === 'Prata' ? 'bg-silver text-white' : 'bg-gray-600 text-white'}`}>
                           Raridade: {inspectedCard.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <span className="text-gold font-black text-xs uppercase tracking-wider underline decoration-gold/30">Habilidades & Efeito:</span>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed italic">{inspectedCard.desc || 'Esta carta possui efeitos ancestrais que se manifestam durante a batalha.'}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 text-[10px] text-white/20 uppercase tracking-widest flex justify-between">
                        <span>ID: {inspectedCard.id}</span>
                        <span>Custo Energético: {inspectedCard.cost}</span>
                      </div>
                   </div>

                   {/* Stats Grid (ATK & DEF Box) */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-red-950/20 border-2 border-red-500/30 flex flex-col items-center justify-center gap-1 group transition-all hover:bg-red-500/10">
                         <div className="flex items-center gap-2 mb-2">
                            <Sword className="w-6 h-6 text-red-500" />
                            <span className="text-gray-400 font-black text-xs uppercase">Ataque</span>
                         </div>
                         <span className="text-5xl font-black text-white drop-shadow-lg">{inspectedCard.atk}</span>
                      </div>
                      
                      <div className="p-6 bg-emerald-950/20 border-2 border-emerald-500/30 flex flex-col items-center justify-center gap-1 group transition-all hover:bg-emerald-500/10">
                         <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-6 h-6 text-emerald-500" />
                            <span className="text-gray-400 font-black text-xs uppercase">Defesa</span>
                         </div>
                         <span className="text-5xl font-black text-white drop-shadow-lg">{inspectedCard.hp}/{inspectedCard.maxHp}</span>
                      </div>
                   </div>

                   {/* Close Button Button */}
                   <button 
                     onClick={() => setInspectedCard(null)}
                     className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-[0.5em] text-xs transition-all mt-2"
                   >
                     Fechar Detalhes [ESC]
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
