import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Heart, Trophy, X, Eye, Search, History, Skull, RefreshCw, Moon, Ghost, Type } from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: string;
  atk: number;
  def: number;
  stars: number;
  desc: string;
  color: string;
  image?: string;
  canAttack: boolean;
  position: 'attack' | 'defense';
  isFaceDown?: boolean;
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
    atk: 10 + Math.floor(Math.random() * 5), // Stats scaled to YGO style (e.g. 10 atk base)
    def: 8 + Math.floor(Math.random() * 5),
    stars: 1 + Math.floor(Math.random() * 2),
    desc: 'Unidade básica de infantaria.',
    color: 'gray',
    image: c.img,
    canAttack: false,
    position: 'attack'
  })),
  ...CARD_CATALOG.prata.map((c, i) => ({
    id: `p-${i}`,
    name: c.name,
    type: 'Prata',
    atk: 22 + Math.floor(Math.random() * 5),
    def: 18 + Math.floor(Math.random() * 5),
    stars: 3 + Math.floor(Math.random() * 2),
    desc: 'Comandante de elite.',
    color: 'silver',
    image: c.img,
    canAttack: false,
    position: 'attack'
  })),
  ...CARD_CATALOG.ouro.map((c, i) => ({
    id: `o-${i}`,
    name: c.name,
    type: 'Ouro',
    atk: 35 + Math.floor(Math.random() * 10),
    def: 30 + Math.floor(Math.random() * 10),
    stars: 6 + Math.floor(Math.random() * 3),
    desc: 'Entidade lendária do campo de batalha.',
    color: 'yellow',
    image: c.img,
    canAttack: false,
    position: 'attack'
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
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<{ card: Card, index: number } | null>(null);
  const [playerExile, setPlayerExile] = useState<Card[]>([]);
  const [enemyExile, setEnemyExile] = useState<Card[]>([]);
  const [attackingInfo, setAttackingInfo] = useState<{ id: string, targetId: string, isOpponent?: boolean, xOffset?: number } | null>(null);
  
  const [history, setHistory] = useState<string[]>([
    "● COMBATE INICIADO",
    "● BOA SORTE, HERÓI"
  ]);

  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [isViewingExile, setIsViewingExile] = useState<null | 'player' | 'enemy'>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const fieldRef = React.useRef(field);
  const enemyFieldRef = React.useRef(enemyField);

  const [summoningConfig, setSummoningConfig] = useState<{ card: Card, mode: 'attack' | 'defense' | null } | null>(null);

  React.useEffect(() => { fieldRef.current = field; }, [field]);
  React.useEffect(() => { enemyFieldRef.current = enemyField; }, [enemyField]);

  // Turn Timer Logic
  React.useEffect(() => {
    if (gameStatus !== 'playing' || isTransitioning) return;
    
    // Reset timer to 30 when turn changes
    setTimeLeft(30);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (turn === 'player') {
            endTurn();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameStatus, isTransitioning]);

  const drawCard = () => {
    setDeck(currentDeck => {
      if (currentDeck.length === 0) return currentDeck;
      
      const nextCard = currentDeck[0];
      const remainingDeck = currentDeck.slice(1);
      
      // Update hand based on the card we just took from the deck
      setHand(prevHand => {
        // Double check we aren't adding the same card again if called twice
        if (prevHand.some(c => c.id === nextCard.id)) return prevHand;
        return [...prevHand, nextCard];
      });
      
      setHistory(prev => [`● Fase de Compra: +1 carta`, ...prev]);
      return remainingDeck;
    });
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
    setIsViewingExile(null);
  };

  const handleInspect = (e: React.MouseEvent, card: Card) => {
    e.preventDefault();
    setInspectedCard(card);
  };

  const endTurn = async () => {
    if (turn !== 'player') return;

    // RULE 9.1: Blessing goes to Exile at end of turn
    if (field[5]) {
      const blessingCard = field[5];
      setPlayerExile(prev => [...prev, blessingCard]);
      setField(prev => {
        const next = [...prev];
        next[5] = null;
        return next;
      });
      setHistory(prev => [`● BENÇÃO: '${blessingCard.name}' retornou ao éter (Exílio)`, ...prev]);
    }

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
    
    // Recover enemy units fatigue
    setEnemyField(prev => prev.map(c => c ? { ...c, canAttack: true } : null));
    
    runOpponentAI();
  };

  const runOpponentAI = async () => {
    // 1. Play card logic (MORE AGGRESSIVE)
    const availableSlots = enemyFieldRef.current.slice(0, 5).map((s, i) => s === null ? i : -1).filter(i => i !== -1);
    
    // Regular: play up to 2 cards if board is empty, but Turn 1 only 1
    let maxToPlay = (availableSlots.length > 3 && turnCount > 2) ? 2 : 1;
    const cardsToPlay = Math.min(enemyHandCount, availableSlots.length, maxToPlay);
    
    for (let p = 0; p < cardsToPlay; p++) {
      const currentSlot = availableSlots[p];
      const randomIndex = Math.floor(Math.random() * DECK_POOL.length);
      const enemyCardSource = DECK_POOL[randomIndex];
      const newEnemyCard: Card = {
        ...enemyCardSource,
        canAttack: false, // Summoning Sickness
        id: `enemy-${Date.now()}-${Math.random()}`
      };

      setEnemyField(prev => {
        const next = [...prev];
        next[currentSlot] = newEnemyCard;
        return next;
      });
      setEnemyHandCount(prev => prev - 1);
      setHistory(prev => [`● Malakor invocou: ${newEnemyCard.name}`, ...prev]);
      await new Promise(r => setTimeout(r, 800)); // Pequena pausa entre invocações
    }

    // 2. Attack logic (Restriction: No turn 1 attacks)
    if (turnCount > 1) { 
      // Find attackers using REF for fresh state
      const capableAttackers = enemyFieldRef.current.slice(0, 5).filter((c): c is Card => c !== null);
      
      for (const attacker of capableAttackers) {
        // Find target using REF for fresh state INSIDE the loop
        const currentPlayerField = fieldRef.current.slice(0, 5);
        const playerCardIndex = currentPlayerField.findIndex(c => c !== null);
        const target = playerCardIndex !== -1 ? currentPlayerField[playerCardIndex]!.id : 'hero';
        
        await handleOpponentAttack(attacker.id, target);
      }
    }

    // 3. End Turn (FLUID TRANSITION)
    setEnemyField(prev => prev.map(c => c ? { ...c, canAttack: true } : null)); 
    setTurn('player');
    setTurnCount(prev => prev + 1);
    setPlayedCardThisTurn(false);
    setIsTransitioning("SEU TURNO");
    setHistory(prev => ["● SEU TURNO: Planeje sua jogada!", ...prev]);
    drawCard();
    setTimeout(() => setIsTransitioning(null), 1500);
  };

  const handleOpponentAttack = async (attackerId: string, targetId: string | 'hero') => {
    try {
      const attacker = enemyFieldRef.current.find(c => c?.id === attackerId);
      if (!attacker) return;

      let xOffset = 0;
      const attackerIndex = enemyField.findIndex(c => c?.id === attackerId);
      if (targetId !== 'hero') {
        const targetIndex = field.findIndex(c => c?.id === targetId);
        if (attackerIndex !== -1 && targetIndex !== -1) {
          xOffset = (targetIndex - attackerIndex) * 120;
        }
      }

      setAttackingInfo({ id: attackerId, targetId: targetId === 'hero' ? 'hero' : targetId, isOpponent: true, xOffset });
      await new Promise(r => setTimeout(r, 400));

      if (targetId === 'hero') {
        const hasBlockers = fieldRef.current.slice(0, 5).some(c => c !== null);
        if (hasBlockers) {
          // AI redirect logic to first available unit
          const currentPlayerField = fieldRef.current.slice(0, 5);
          const firstTarget = currentPlayerField.find(c => c !== null);
          if (firstTarget) await handleOpponentAttack(attackerId, firstTarget.id);
        } else {
          setPlayerHp(prev => Math.max(0, prev - attacker.atk));
          setHistory(prev => [`● IMPACTO! ${attacker.name} causou -${attacker.atk} LP direto!`, ...prev]);
        }
      } else {
        const defender = fieldRef.current.find(c => c?.id === targetId);
        if (defender) {
          await new Promise(r => setTimeout(r, 50));
          
          if (defender.position === 'attack') {
            if (attacker.atk > defender.atk) {
              const diff = attacker.atk - defender.atk;
              setPlayerHp(prev => Math.max(0, prev - diff));
              setField(prev => prev.map(c => c?.id === defender.id ? null : c));
              setPlayerExile(prev => [...prev, defender]);
              setHistory(prev => [`● DERROTA! ${defender.name} destruído. Você perdeu ${diff} LP!`, ...prev]);
            } else if (attacker.atk < defender.atk) {
              const diff = defender.atk - attacker.atk;
              setEnemyHp(prev => Math.max(0, prev - diff));
              setEnemyField(prev => prev.map(c => c?.id === attacker.id ? null : c));
              setEnemyExile(prev => [...prev, attacker]);
              setHistory(prev => [`● CONTRA-ATAQUE! ${defender.name} venceu! Malakor perdeu ${diff} LP!`, ...prev]);
            } else {
              setField(prev => prev.map(c => c?.id === defender.id ? null : c));
              setEnemyField(prev => prev.map(c => c?.id === attacker.id ? null : c));
              setPlayerExile(prev => [...prev, defender]);
              setEnemyExile(prev => [...prev, attacker]);
              setHistory(prev => [`● EMPATE! Ambos ${attacker.name} e ${defender.name} destruídos!`, ...prev]);
            }
          } else { // Defense Mode
            if (attacker.atk > defender.def) {
              setField(prev => prev.map(c => c?.id === defender.id ? null : c));
              setPlayerExile(prev => [...prev, defender]);
              setHistory(prev => [`● QUEBRA DE DEFESA! ${defender.name} foi destruído!`, ...prev]);
            } else if (attacker.atk < defender.def) {
              const diff = defender.def - attacker.atk;
              setEnemyHp(prev => Math.max(0, prev - diff));
              setHistory(prev => [`● DEFESA SÓLIDA! Malakor sofreu -${diff} de recoil!`, ...prev]);
            }
          }
        }
      }
      await new Promise(r => setTimeout(r, 200));
    } finally {
      setAttackingInfo(null);
    }
  };

  const playCard = (card: Card, index: number) => {
    if (turn !== 'player' || index === undefined) return;

    // Determine target area
    const isCombatantSlot = index >= 0 && index <= 4;
    const isBlessingSlot = index === 5;
    const isReactionSlot = index >= 6 && index <= 8;

    // RULE 1: Summon Limit - Max 1 combatant per turn
    if (isCombatantSlot && playedCardThisTurn) {
      setHistory(prev => ["● Regra: Max 1 combatente por turno!", ...prev]);
      return;
    }

    const existingCard = field[index];

    // RULE 8: Level & Substitution Logic (Scale Only for now)
    if (isCombatantSlot) {
      const levels = ['Neutro', 'Bronze', 'Prata', 'Ouro'];
      const cardTypeLabel = card.type || 'Neutro';
      const cardLevelIdx = levels.indexOf(cardTypeLabel);
      const existingLevelIdx = existingCard ? levels.indexOf(existingCard.type || 'Neutro') : -1;

      // Neutro units can be played freely on empty slots
      if (cardTypeLabel === 'Neutro' && !existingCard) {
        // Normal Summon
      } 
      // Substitution Scale (Regra 8.1)
      else if (existingCard && cardLevelIdx === existingLevelIdx + 1) {
        setHistory(prev => [`● ESCALA: ${card.name} (${cardTypeLabel}) substituiu ${existingCard.name}`, ...prev]);
        setPlayerExile(prev => [...prev, existingCard]);
      }
      // Level Block
      else {
        if (!existingCard) {
          setHistory(prev => [`● BLOQUEADO: ${card.name} (${cardTypeLabel}) exige uma substituição de Escala.`, ...prev]);
        } else {
          setHistory(prev => [`● ERRO DE NÍVEL: ${cardTypeLabel} não pode substituir ${existingCard.type || 'Neutro'} diretamente.`, ...prev]);
        }
        return;
      }
    }

    // Handle Blessing specific rules (max 1 activated per turn)
    if (isBlessingSlot && existingCard) {
      setHistory(prev => ["● Espaço de Benção ocupado!", ...prev]);
      return;
    }

    setField(prev => {
      const next = [...prev];
      next[index] = { 
        ...card, 
        canAttack: false, 
        position: summoningConfig?.mode || 'attack',
        isFaceDown: summoningConfig?.mode === 'defense'
      };
      return next;
    });
    
    setHand(prev => prev.filter(c => c.id !== card.id));
    
    if (isCombatantSlot) {
      setPlayedCardThisTurn(true);
      setHistory(prev => [`● Invocou '${card.name}' em MODO DE ${summoningConfig?.mode === 'attack' ? 'ATAQUE' : 'DEFESA (OCULTO)'}`, ...prev]);
    } else if (isBlessingSlot) {
      setHistory(prev => [`● Ativou Benção: '${card.name}'`, ...prev]);
    } else {
      setHistory(prev => [`● Preparou Reação no campo`, ...prev]);
    }

    setSummoningConfig(null);
    setSelectedHandCardId(null);
  };

  const togglePosition = (index: number) => {
    if (turn !== 'player') return;
    setField(prev => {
      const next = [...prev];
      const card = next[index];
      if (card) {
        const newPos = card.position === 'attack' ? 'defense' : 'attack';
        next[index] = { ...card, position: newPos };
        setHistory(p => [`● ${card.name} mudou para MODO DE ${newPos === 'attack' ? 'ATAQUE' : 'DEFESA'}`, ...p]);
      }
      return next;
    });
    setActiveActionMenu(null);
  };

  const handleCombat = async (attackerId: string, targetId: string | 'hero', targetIndex?: number) => {
    try {
      const attacker = fieldRef.current.find(c => c?.id === attackerId);
      if (turn !== 'player' || !attacker) return;
      
      const isHeroAttack = targetId === 'hero';

      if (turnCount === 1 && isHeroAttack) {
        setHistory(prev => ["● Regra: LP Protegidos no Turno 1", ...prev]);
        return;
      }

      if (isHeroAttack) {
        const hasBlockers = enemyField.some(c => c !== null);
        if (hasBlockers) {
          setHistory(prev => ["● BLOQUEIO: Destrua os combatentes antes do ataque direto!", ...prev]);
          return;
        }
      }

      let xOffset = 0;
      const attackerIndex = field.findIndex(c => c?.id === attackerId);
      if (targetIndex !== undefined) {
        xOffset = (targetIndex - attackerIndex) * 120; 
      } else if (targetId === 'hero') {
        xOffset = ( -2 - attackerIndex) * 120;
      }

      setAttackingInfo({ id: attackerId, targetId, isOpponent: false, xOffset });
      await new Promise(r => setTimeout(r, 400));

      if (isHeroAttack) {
        setEnemyHp(prev => Math.max(0, prev - attacker.atk));
        setHistory(prev => [`● ATAQUE DIRETO! -${attacker.atk} LP de Malakor`, ...prev]);
      } else {
        const defender = enemyFieldRef.current.find(c => c?.id === targetId);
        if (defender) {
          if (defender.position === 'attack') {
            if (attacker.atk > defender.atk) {
              const diff = attacker.atk - defender.atk;
              setEnemyHp(prev => Math.max(0, prev - diff));
              setEnemyField(prev => prev.map(c => c?.id === defender.id ? null : c));
              setEnemyExile(prev => [...prev, defender]);
              setHistory(prev => [`● VITÓRIA! ${defender.name} destruído. Malakor perdeu ${diff} LP!`, ...prev]);
            } else if (attacker.atk < defender.atk) {
              const diff = defender.atk - attacker.atk;
              setPlayerHp(prev => Math.max(0, prev - diff));
              setField(prev => prev.map(c => c?.id === attacker.id ? null : c));
              setPlayerExile(prev => [...prev, attacker]);
              setHistory(prev => [`● DERROTA! Seu ${attacker.name} destruído. Você perdeu ${diff} LP!`, ...prev]);
            } else {
              setField(prev => prev.map(c => c?.id === attacker.id ? null : c));
              setEnemyField(prev => prev.map(c => c?.id === defender.id ? null : c));
              setPlayerExile(prev => [...prev, attacker]);
              setEnemyExile(prev => [...prev, defender]);
              setHistory(prev => [`● ANULAÇÃO! Ambos combatentes destruídos em combate equilibrado!`, ...prev]);
            }
          } else { // Defense Mode
            if (attacker.atk > defender.def) {
              setEnemyField(prev => prev.map(c => c?.id === defender.id ? null : c));
              setEnemyExile(prev => [...prev, defender]);
              setHistory(prev => [`● QUEBRA! A defesa de ${defender.name} foi rompida!`, ...prev]);
            } else if (attacker.atk < defender.def) {
              const diff = defender.def - attacker.atk;
              setPlayerHp(prev => Math.max(0, prev - diff));
              setHistory(prev => [`● RECOIL! Sua investida falhou. Perdido ${diff} LP!`, ...prev]);
            }
          }
        }
      }
      
      setField(prev => prev.map(c => c?.id === attackerId ? { ...c!, canAttack: false } : c));
      await new Promise(r => setTimeout(r, 200));
    } finally {
      setAttackingInfo(null);
      setSelectedCardId(null);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex flex-col font-display text-white transition-all`}
      style={{ 
        cursor: selectedCardId 
          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m14.5 17.5-11.5-11.5v-3h3l11.5 11.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3C/svg%3E"), crosshair` 
          : 'default' 
      }}
    >
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

      <div className={`relative z-10 w-full h-full flex flex-col pt-2 pb-4 px-4 transition-opacity duration-1000 ${gameStatus !== 'playing' ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
        
        {/* Enemy HUD (Top Left) */}
        <div 
          onClick={() => {
            if (selectedCardId) {
              handleCombat(selectedCardId, 'hero');
            }
          }}
          className={`fixed top-6 left-10 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border transition-all z-50 ${selectedCardId ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105' : 'border-red-500/20'}`}
          style={{ cursor: selectedCardId ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m14.5 17.5-11.5-11.5v-3h3l11.5 11.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3C/svg%3E"), crosshair` : 'pointer' }}
        >
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
        <div className="flex-1 flex gap-10 items-start justify-center relative pt-2" onClick={() => setActiveActionMenu(null)}>
          
          {/* LEFT SIDEBAR (HUD) */}
          <div className="w-40 flex flex-col items-center justify-center gap-6 self-center">
            {/* TURN TIMER */}
            <div className="flex flex-col items-center gap-1 mb-2">
                <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Tempo Restante</div>
                <div className={`text-2xl font-black font-mono transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gold'}`}>
                  {String(timeLeft).padStart(2, '0')}s
                </div>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                   <motion.div 
                     initial={{ width: '100%' }}
                     animate={{ width: `${(timeLeft / 30) * 100}%` }}
                     className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gold'}`}
                   />
                </div>
            </div>

            {/* COMPACT END TURN BUTTON */}
            <button 
                onClick={endTurn}
                disabled={turn !== 'player'}
                className={`group relative overflow-hidden px-2 py-4 rounded-lg font-black text-[7px] transition-all uppercase tracking-[0.1em] w-20 h-24 shadow-xl border flex flex-col items-center justify-center gap-1
                  ${turn === 'player' 
                    ? 'bg-emerald-600/90 border-emerald-400/40 text-white hover:bg-emerald-500 active:scale-95' 
                    : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'}`}
               >
                  <RefreshCw className={`w-4 h-4 ${turn === 'player' ? 'animate-spin-slow' : ''}`} />
                  <span className="text-center leading-tight">Finalizar<br/>Turno</span>
            </button>
          </div>

          {/* BATTLEFIELD (4 ROWS TOTAL) */}
          <div className="flex flex-col gap-2 max-w-[85%] mt-0">
            
            {/* ENEMY SIDE (2 ROWS) */}
            <div className="flex flex-col gap-2">
              {/* ENEMY ROW 1: BAN, REAÇÕES & BENÇÃO (Topo/Fundo) */}
              <div className="flex gap-2 justify-center items-center">
                 {/* BAN DO OPONENTE */}
                 <div className="w-28 h-40 rounded-xl border-2 border-red-500/20 bg-black/40 flex items-center justify-center relative overflow-hidden transition-all hover:border-red-500/40 group">
                     <div className="text-[10px] font-black text-white/20 group-hover:text-white/40 transition-colors uppercase text-center leading-tight tracking-widest">BAN<br/>Inimigo</div>
                     <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent" />
                 </div>

                 {/* Reações (Index 6-8) */}
                 <div className="flex gap-2">
                   {[6, 7, 8].map((i) => (
                     <div key={`enemy-reaction-${i}`} className="w-28 h-40 rounded-xl border-dashed border-2 border-red-500/5 bg-red-500/5 flex items-center justify-center">
                        <span className="text-white/40 font-black text-[8px] uppercase tracking-widest">Reações</span>
                     </div>
                   ))}
                 </div>

                 {/* Benção Oponente */}
                 <div className="w-28 h-40 rounded-xl border-dashed border-2 border-red-500/10 bg-red-500/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-white/40 font-black text-xs uppercase tracking-widest leading-none">Benção</span>
                 </div>
                 
                 {/* Espaço para alinhamento com Exilio abaixo */}
                 <div className="w-28 h-40 invisible" />
              </div>

              {/* ENEMY ROW 2: COMBATENTES & EXILIO (Perto da Linha) */}
              <div className="flex gap-2 justify-center items-center">

                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={`enemy-combatant-${i}`} className="w-28 h-40 rounded-xl border-2 border-dashed border-red-500/20 bg-black/40 flex items-center justify-center relative">
                    <AnimatePresence mode="popLayout">
                      {enemyField[i] && (
                        <motion.div 
                          key={enemyField[i]?.id}
                          layoutId={enemyField[i]?.id}
                          layout
                          initial={{ opacity: 0, scale: 0.2, y: -200 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            rotate: (enemyField[i]?.stats?.position === 'defense' || enemyField[i]?.stats?.isFaceDown || enemyField[i]?.isFaceDown) ? 0 : 0,
                            y: (attackingInfo?.id === enemyField[i]?.id) ? 120 : 0,
                            x: (attackingInfo?.id === enemyField[i]?.id) ? (attackingInfo.xOffset || 0) : 0,
                            filter: (attackingInfo?.targetId === enemyField[i]?.id) ? "brightness(2) saturate(2) hue-rotate(-50deg)" : "brightness(1)"
                          }}
                          exit={{ opacity: 0, scale: 1.2, rotate: 45, filter: "brightness(4) blur(10px)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onMouseEnter={() => setHoveredCard(enemyField[i])}
                          onMouseLeave={() => setHoveredCard(null)}
                          className={`w-full h-full relative bg-contain bg-center bg-no-repeat transition-all ${selectedCardId ? 'ring-2 ring-red-500 group-hover:ring-offset-2 hover:scale-105' : ''}`} 
                          style={{ 
                            backgroundImage: (enemyField[i]?.isFaceDown) ? 'url("/fundo.png")' : `url("${enemyField[i]?.image || '/fundo.png'}")` 
                          }}
                        >
                           <div className="absolute inset-x-1 bottom-1 flex justify-between px-1">
                              {!enemyField[i]?.isFaceDown && (
                                <>
                                  <span className="text-[10px] font-black text-red-500">{enemyField[i]?.atk}</span>
                                  <span className="text-[10px] font-black text-emerald-500">{enemyField[i]?.def}</span>
                                </>
                              )}
                           </div>
                           <button 
                              onClick={() => selectedCardId ? handleCombat(selectedCardId, enemyField[i]!.id, i) : setInspectedCard(enemyField[i]!)}
                              className="absolute inset-0 z-30 cursor-crosshair" 
                           />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!enemyField[i] && <span className="text-white/30 font-black text-[8px] uppercase">Combatentes</span>}
                  </div>
                ))}

                {/* ENEMY EXILIO */}
                <div 
                  onClick={() => enemyExile.length > 0 && setIsViewingExile('enemy')}
                  className="w-28 h-40 rounded-xl border-2 border-dashed border-red-500/10 bg-red-500/5 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-red-500/30 transition-all font-serif"
                >
                  {enemyExile.length > 0 ? (
                    <div className="w-full h-full bg-contain bg-center bg-no-repeat grayscale opacity-40" style={{ backgroundImage: `url("${enemyExile[enemyExile.length-1].image}")` }} />
                  ) : <Skull className="w-8 h-8 text-red-500/10" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Exílio Inimigo</span>
                    {enemyExile.length > 0 && <span className="text-sm font-mono text-red-500/40 font-black">{enemyExile.length}</span>}
                  </div>
                </div>
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
              {/* PLAYER ROW 1: COMBATENTES & EXILIO */}
              <div className="flex gap-2 justify-center items-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={`player-combatant-${i}`} className="relative z-50">
                    <div 
                      className={`w-28 h-40 rounded-xl border-2 border-dashed transition-all duration-500 flex items-center justify-center relative pointer-events-auto ${selectedHandCardId ? 'border-amber-400 bg-amber-400/10 cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.3)]' : (selectedCardId && field[i] && selectedCardId === field[i]?.id ? 'border-gold bg-gold/5' : 'border-white/10 bg-black/20')}`}
                      onClick={(e) => {
                         if (selectedHandCardId) {
                           const card = hand.find(c => c.id === selectedHandCardId);
                           if (card) playCard(card, i);
                         }
                      }}
                    >
                      {field[i] ? (
                        <>
                           <AnimatePresence>
                             {activeActionMenu?.index === i && (
                                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, y: -8, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute -top-10 inset-x-0 flex justify-center gap-2 z-[60]" onClick={(e) => e.stopPropagation()}>
                                    {field[i]?.position === 'attack' && (
                                      <button onClick={() => (setSelectedCardId(field[i]!.id), setActiveActionMenu(null))} className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"><Sword className="w-5 h-5 text-white" /></button>
                                    )}
                                    <button onClick={() => togglePosition(i)} className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"><RefreshCw className="w-5 h-5 text-white" /></button>
                                    <button onClick={() => (setInspectedCard(field[i]!), setActiveActionMenu(null))} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(37,99,235,0.5)]"><Eye className="w-5 h-5 text-white" /></button>
                                </motion.div>
                             )}
                           </AnimatePresence>
                           <AnimatePresence mode="popLayout">
                             {field[i] && (
                               <motion.div 
                                 key={field[i]?.id} 
                                 layoutId={field[i]?.id} 
                                 animate={{ 
                                   rotate: 0,
                                   y: (attackingInfo?.id === field[i]?.id) ? -120 : 0, 
                                   x: (attackingInfo?.id === field[i]?.id) ? (attackingInfo.xOffset || 0) : 0,
                                   filter: (attackingInfo?.targetId === field[i]?.id) ? "brightness(2) saturate(2) hue-rotate(50deg)" : "brightness(1)" 
                                 }} 
                                 exit={{ opacity: 0, scale: 1.5, rotate: -45, filter: "brightness(4) blur(10px)" }}
                                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                 onMouseEnter={() => setHoveredCard(field[i])} 
                                 onMouseLeave={() => setHoveredCard(null)} 
                                 className={`w-full h-full overflow-visible cursor-pointer relative z-20 transition-all ${selectedCardId === field[i]?.id ? 'ring-2 ring-gold shadow-[0_0_20px_rgba(255,215,0,0.5)]' : ''}`} 
                                 onClick={(e) => { 
                                   e.stopPropagation(); 
                                   if (selectedHandCardId) { 
                                     const card = hand.find(c => c.id === selectedHandCardId); 
                                     if (card) playCard(card, i); 
                                   } else if (field[i]) {
                                     setActiveActionMenu(activeActionMenu?.index === i ? null : { card: field[i]!, index: i }); 
                                   }
                                 }}
                               >
                                  <div className="relative w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${field[i]?.image}")` }}>
                                     <div className={`absolute inset-0 ${field[i]?.isFaceDown ? 'bg-black/60 backdrop-blur-sm group-hover:bg-black/40' : 'bg-black/10'}`} />
                                     {field[i]?.isFaceDown && (
                                       <div className="absolute inset-0 flex items-center justify-center">
                                          <Ghost className="w-8 h-8 text-white/20 animate-pulse" />
                                       </div>
                                     )}
                                     <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                                       <span className="text-[10px] font-black text-red-500">{field[i]?.atk}</span>
                                       <span className="text-[10px] font-black text-emerald-500">{field[i]?.def}</span>
                                     </div>
                                  </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </>
                      ) : <span className="text-white/20 font-black text-[8px] uppercase font-serif">Combatentes</span>}
                    </div>
                  </div>
                ))}

                {/* PLAYER EXILIO (AGORA NA DIREITA) */}
                <div 
                  onClick={() => playerExile.length > 0 && setIsViewingExile('player')}
                  className="w-28 h-40 rounded-xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-white/20 transition-all font-serif"
                >
                  {playerExile.length > 0 ? (
                    <div className="w-full h-full bg-contain bg-center bg-no-repeat grayscale opacity-40" style={{ backgroundImage: `url("${playerExile[playerExile.length-1].image}")` }} />
                  ) : (
                    <History className="w-8 h-8 text-white/5" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Seu Exílio</span>
                     {playerExile.length > 0 && <span className="text-sm font-mono text-white/40 font-black">{playerExile.length}</span>}
                  </div>
                </div>
              </div>

              {/* PLAYER ROW 2: BAN JOGADOR & REAÇÕES & BENÇÃO (TODOS ALINHADOS) */}
              <div className="flex gap-2 justify-center items-center">
                 {/* BAN DO JOGADOR */}
                 <div className="w-28 h-40 rounded-xl border-2 border-gold/20 bg-black/40 flex items-center justify-center relative overflow-hidden transition-all hover:border-gold/40 group">
                     <div className="text-[10px] font-black text-white/20 group-hover:text-white/40 transition-colors uppercase text-center leading-tight tracking-widest">Seu<br/>BAN</div>
                     <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent" />
                 </div>

                 {/* Reações (Index 6-8) */}
                 <div className="flex gap-2">
                   {[6, 7, 8].map((i) => (
                     <div key={`player-reaction-${i}`} className="w-28 h-40 rounded-xl border-dashed border-2 border-emerald-500/10 bg-emerald-500/5 flex items-center justify-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 cursor-pointer">
                       {field[i] ? (
                         <div className="w-full h-full rounded-xl bg-contain bg-center bg-no-repeat opacity-80" style={{ backgroundImage: `url("${field[i]!.image}")` }} />
                       ) : (
                         <span className="text-white/30 font-black text-[8px] uppercase tracking-widest">Reações</span>
                       )}
                     </div>
                   ))}
                 </div>

                 {/* Benção (Index 5) */}
                 <div className="w-28 h-40 rounded-xl border-dashed border-2 border-gold/10 bg-gold/5 flex items-center justify-center transition-all hover:bg-gold/10 hover:border-gold/30 cursor-pointer flex-shrink-0">
                    {field[5] ? (
                      <div className="w-full h-full rounded-xl bg-contain bg-center bg-no-repeat opacity-80" style={{ backgroundImage: `url("${field[5].image}")` }} />
                    ) : (
                      <span className="text-white/50 font-black text-xs uppercase tracking-widest leading-none">Benção</span>
                    )}
                 </div>

                 {/* Espaço invisível para alinhamento com Exílio acima */}
                 <div className="w-28 h-40 invisible" />
              </div>
            </div>
          </div>

           <div className="w-32 flex flex-col gap-10 items-center h-[70vh] justify-center pb-10 self-center">
             <div className="flex-1" />

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
           </div>
        </div>

        {/* HUD Player */}
        <div className="w-full flex justify-between items-end gap-12 mt-auto px-10 pb-6 pointer-events-none">
            {/* Player Info (Fixed Bottom Left) */}
            <div 
              onClick={() => selectedCardId && handleCombat(selectedCardId, 'hero')}
              className={`pointer-events-auto flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border transition-all mb-2 ${selectedCardId ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105' : 'border-white/5'}`}
              style={{ cursor: selectedCardId ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m14.5 17.5-11.5-11.5v-3h3l11.5 11.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3C/svg%3E"), crosshair` : 'pointer' }}
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
            <div className="fixed bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em]">Sua Mão</span>
                <div className="flex justify-center -space-x-2">
                  <AnimatePresence>
                    {hand.map((card, i) => (
                      <motion.div 
                        key={card.id} 
                        layoutId={card.id}
                        whileHover="hover"
                        initial="initial"
                        exit={{ opacity: 0, scale: 0.5, y: -200 }}
                        onContextMenu={(e) => handleInspect(e, card)}
                        onClick={() => {
                          if (selectedHandCardId === card.id) {
                             setSelectedHandCardId(null);
                             setSummoningConfig(null);
                          } else {
                             setSelectedHandCardId(card.id);
                             setSummoningConfig({ card, mode: null });
                             setSelectedCardId(null);
                          }
                        }}
                        className={`relative w-24 h-34 cursor-pointer flex items-end -ml-2 first:ml-0 transition-transform ${selectedHandCardId === card.id ? '-translate-y-12 scale-110 z-50' : 'hover:-translate-y-2'}`}
                      >
                         {/* SELECTION GLOW */}
                         {selectedHandCardId === card.id && (
                           <div className="absolute -inset-2 bg-amber-500/20 blur-xl rounded-full animate-pulse z-0" />
                         )}
                         
                         <motion.div
                           variants={{
                             initial: { opacity: 0, scale: 0.5, x: 800, y: -300, rotate: 0 },
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
                          onMouseEnter={() => setHoveredCard(card)}
                                 onMouseLeave={() => setHoveredCard(null)}
                                 className="w-full h-full overflow-visible relative bg-contain bg-center bg-no-repeat"
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
      
            {/* SUMMONING MODE SELECTOR (OVERLAY) */}
            <AnimatePresence>
              {summoningConfig && selectedHandCardId && !playedCardThisTurn && summoningConfig.mode === null && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                   <motion.div className="flex flex-col items-center gap-6 p-8 bg-black/80 backdrop-blur-2xl rounded-[2rem] border border-gold/30 shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-black text-gold uppercase tracking-[0.2em] italic">Preparar Invocação</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Escolha a posição de batalha para "{summoningConfig.card.name}"</p>
                      </div>

                      <div className="flex gap-8">
                         <button 
                           onClick={() => setSummoningConfig({ ...summoningConfig, mode: 'attack' })}
                           className="group relative w-40 h-56 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-red-500 hover:bg-red-500/10 transition-all flex flex-col items-center justify-between p-4 overflow-hidden"
                         >
                            <div className="relative z-10 text-center space-y-1">
                               <Sword className="w-8 h-8 mx-auto text-white/20 group-hover:text-red-500" />
                               <div className="text-xs font-black text-white uppercase tracking-widest">Ataque</div>
                            </div>
                            <div 
                              className="w-full h-32 rounded-lg bg-contain bg-center bg-no-repeat transition-all grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100"
                              style={{ backgroundImage: `url("${summoningConfig.card.image}")` }}
                            />
                            <div className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full text-center">Face-Up</div>
                         </button>

                         <button 
                           onClick={() => setSummoningConfig({ ...summoningConfig, mode: 'defense' })}
                           className="group relative w-40 h-56 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all flex flex-col items-center justify-between p-4 overflow-hidden"
                         >
                            <div className="relative z-10 text-center space-y-1">
                               <Shield className="w-8 h-8 mx-auto text-white/20 group-hover:text-emerald-500" />
                               <div className="text-xs font-black text-white uppercase tracking-widest">Defesa</div>
                            </div>
                            <div 
                              className="w-full h-32 rounded-lg bg-contain bg-center bg-no-repeat transition-all grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 scale-95"
                              style={{ backgroundImage: `url("${summoningConfig.card.image}")` }}
                            />
                            <div className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full text-center">Face-Down</div>
                         </button>
                      </div>

                      <div className="text-[10px] font-black text-gold/60 animate-pulse tracking-[0.3em] uppercase">Selecione uma posição para liberar o campo</div>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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
                         <span>Raridade: {inspectedCard.stars}★</span>
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
                            <span className="text-gray-400 font-black text-xs uppercase">Vida</span>
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

        {/* EXILE LIST PANEL (Side Panel) */}
        {isViewingExile && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-1/2 -translate-y-1/2 right-4 z-[110] w-72 max-h-[85vh] flex flex-col bg-black/60 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${isViewingExile === 'player' ? 'bg-white/10 border-white/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  {isViewingExile === 'player' ? <History className="w-4 h-4 text-white" /> : <Skull className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-widest">
                    {isViewingExile === 'player' ? 'Cripta Pessoal' : 'Cripta Inimiga'}
                  </h2>
                  <p className="text-[8px] font-mono text-white/40 uppercase">
                    {isViewingExile === 'player' ? 'Onde jazem seus heróis' : 'Restos do oponente'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewingExile(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-all text-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-1 gap-4 pb-4">
                {(isViewingExile === 'player' ? playerExile : enemyExile).slice().reverse().map((card, idx) => (
                  <motion.div
                    key={`${isViewingExile}-exile-${card.id}-${idx}`}
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <img 
                         src={card.image} 
                         className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                         <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{card.name}</span>
                         <div className="flex justify-between mt-1">
                            <span className="text-[9px] font-bold text-red-500">{card.atk}</span>
                            <span className="text-[9px] font-bold text-emerald-500">{card.hp}</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(isViewingExile === 'player' ? playerExile : enemyExile).length === 0 && (
                   <div className="py-20 text-center space-y-2 opacity-20">
                      <Ghost className="w-8 h-8 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
                   </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-black/40 text-center border-t border-white/5">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                 Fim do Registro
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT INFORMATION PANEL (Fixed Side Panel) */}
      <div className="fixed top-1/2 left-8 -translate-y-1/2 z-40 w-80 pointer-events-none">
        <AnimatePresence>
          {hoveredCard && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto"
            >
              <div className="relative aspect-[2/3] overflow-visible">
                <img src={hoveredCard.image} className="w-full h-full object-contain" alt={hoveredCard.name} />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Stats in overlay for compactness */}
                <div className="absolute bottom-4 inset-x-6 flex justify-between items-end">
                   <div className="flex flex-col">
                      <span className="text-xs font-black text-red-500 uppercase leading-none">Ataque</span>
                      <span className="text-4xl font-black text-white italic">{hoveredCard.atk}</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-emerald-500 uppercase leading-none">Vida</span>
                      <span className="text-4xl font-black text-white italic">{hoveredCard.hp}/{hoveredCard.maxHp}</span>
                   </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${hoveredCard.type === 'Ouro' ? 'bg-gold text-black' : hoveredCard.type === 'Prata' ? 'bg-silver text-white' : 'bg-gray-600 text-white'}`}>
                      {hoveredCard.type}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-white/40 text-[9px] font-black font-mono">ID: {hoveredCard.id}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-md">
                    {hoveredCard.name}
                  </h3>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-gray-300 text-[11px] font-medium leading-relaxed italic">
                    "{hoveredCard.desc || 'Efeitos ancestrais se manifestam nesta unidade.'}"
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <div className="flex items-center gap-1.5">
                       <Type className="w-3 h-3 text-gold" />
                       <span>Nível: {hoveredCard.type}</span>
                    </div>
                   <div className="flex items-center gap-1.5">
                      <Trophy className="w-3 h-3 text-gold" />
                      <span>Raridade: {hoveredCard.stars}★</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
