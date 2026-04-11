import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Heart, Trophy, X } from 'lucide-react';

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

const INITIAL_HAND: Card[] = [
  { id: 'h1', name: 'Warlord', type: 'Guerreiro', cost: 4, atk: 28, hp: 20, maxHp: 20, desc: '', color: 'orange', image: '/Warlord.png', canAttack: false },
  { id: 'h2', name: 'Witch', type: 'Mago', cost: 3, atk: 15, hp: 10, maxHp: 10, desc: '', color: 'purple', image: '/witch.png', canAttack: false },
  { id: 'h3', name: 'Guerreiro Orc', type: 'Guerreiro', cost: 2, atk: 18, hp: 12, maxHp: 12, desc: '', color: 'green', image: '/Guerreiro_Orc.png', canAttack: false },
  { id: 'h4', name: 'Rato Esquelético', type: 'Morto-Vivo', cost: 1, atk: 8, hp: 4, maxHp: 4, desc: '', color: 'gray', image: '/Rato_Esquelético.png', canAttack: false },
];

const INITIAL_FIELD: Card[] = [
  { id: 'f1', name: 'Warlord', type: 'Guerreiro', cost: 4, atk: 28, hp: 20, maxHp: 20, desc: '', color: 'orange', image: '/Warlord.png', canAttack: true },
];

const ENEMY_FIELD_DATA: Card[] = [
  { id: 'e1', name: 'Orc Enfurecido', type: 'Inimigo', cost: 2, atk: 20, hp: 10, maxHp: 10, desc: '', color: 'red', image: '/Guerreiro_Orc.png', canAttack: true },
  { id: 'e2', name: 'Rato de Esgoto', type: 'Inimigo', cost: 1, atk: 12, hp: 5, maxHp: 5, desc: '', color: 'red', image: '/Rato_Esquelético.png', canAttack: true },
  { id: 'e3', name: 'General Orc', type: 'Inimigo', cost: 5, atk: 35, hp: 25, maxHp: 25, desc: '', color: 'red', image: '/Guerreiro_Orc.png', canAttack: true },
];

interface ArenaProps {
  onClose: () => void;
}

export default function Arena({ onClose }: ArenaProps) {
  const [hand, setHand] = useState<Card[]>(INITIAL_HAND);
  const [field, setField] = useState<Card[]>(INITIAL_FIELD);
  const [enemyField, setEnemyField] = useState<Card[]>(ENEMY_FIELD_DATA);
  const [enemyHandCount, setEnemyHandCount] = useState(5);
  const [playerHp, setPlayerHp] = useState(280);
  const [enemyHp, setEnemyHp] = useState(230);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [gameStatus, setGameStatus] = useState<'playing' | 'victory' | 'defeat'>('playing');
  const [isTransitioning, setIsTransitioning] = useState<string | null>(null);
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [attackingInfo, setAttackingInfo] = useState<{ id: string, targetType: 'card' | 'hero', isOpponent?: boolean } | null>(null);
  
  const [history, setHistory] = useState<string[]>([
    "● COMBATE INICIADO",
    "● BOA SORTE, HERÓI"
  ]);

  const resetGame = () => {
    setHand(INITIAL_HAND);
    setField(INITIAL_FIELD);
    setEnemyField(ENEMY_FIELD_DATA);
    setEnemyHandCount(5);
    setPlayerHp(280);
    setEnemyHp(230);
    setTurn('player');
    setGameStatus('playing');
    setHistory(["● BLOCO DE NOTAS LIMPO", "● PARTIDA REINICIADA"]);
    setSelectedCardId(null);
  };

  const endTurn = async () => {
    if (turn !== 'player') return;
    setTurn('opponent');
    setSelectedCardId(null);
    setIsTransitioning("TURNO DO ADVERSÁRIO");
    setTimeout(() => setIsTransitioning(null), 1500);

    // AI Logic Start
    await new Promise(r => setTimeout(r, 2000));
    runOpponentAI();
  };

  const runOpponentAI = async () => {
    // 1. Play a card if possible
    if (enemyField.length < 3 && enemyHandCount > 0) {
      const genericEnemy: Card = {
        id: `ebot-${Date.now()}`,
        name: 'Reforço Orc',
        type: 'Inimigo',
        cost: 3,
        atk: 15 + Math.floor(Math.random() * 10),
        hp: 15,
        maxHp: 15,
        desc: 'Convocado pelo bot',
        color: 'red',
        image: '/Guerreiro_Orc.png',
        canAttack: false
      };
      setEnemyField(prev => [...prev, genericEnemy]);
      setEnemyHandCount(prev => prev - 1);
      setHistory(prev => ["● Inimigo jogou 'Reforço Orc'", ...prev]);
      await new Promise(r => setTimeout(r, 1000));
    }

    // 2. Attack with existing cards
    const capableAttackers = enemyField.filter(c => c.canAttack);
    for (const attacker of capableAttackers) {
      const target = field.length > 0 ? field[0].id : 'hero';
      await handleOpponentAttack(attacker.id, target);
      await new Promise(r => setTimeout(r, 800));
    }

    // 3. End Turn
    setEnemyField(prev => prev.map(c => ({ ...c, canAttack: true })));
    setTurn('player');
    setIsTransitioning("SEU TURNO");
    setHistory(prev => ["● SEU TURNO: Compre uma carta!", ...prev]);
    setTimeout(() => setIsTransitioning(null), 1500);
  };

  const handleOpponentAttack = async (attackerId: string, targetId: string | 'hero') => {
    const attacker = enemyField.find(c => c.id === attackerId);
    if (!attacker) return;

    setAttackingInfo({ id: attackerId, targetType: targetId === 'hero' ? 'hero' : 'card', isOpponent: true });
    await new Promise(r => setTimeout(r, 350));

    if (targetId === 'hero') {
      setPlayerHp(prev => Math.max(0, prev - attacker.atk));
      setHistory(prev => [`● PUNCH! ${attacker.name} causou ${attacker.atk} a você!`, ...prev]);
      if (playerHp - attacker.atk <= 0) setGameStatus('defeat');
    } else {
      const target = field.find(c => c.id === targetId);
      if (target) {
        setField(prev => prev.map(c => c.id === targetId ? { ...c, hp: c.hp - attacker.atk } : c).filter(c => c.hp > 0));
        setEnemyField(prev => prev.map(c => c.id === attackerId ? { ...c, hp: c.hp - target.atk, canAttack: false } : c).filter(c => c.hp > 0));
        setHistory(prev => [`● Defesa! ${attacker.name} atacou sua unidade`, ...prev]);
      }
    }
    setAttackingInfo(null);
  };

  const playCard = (card: Card) => {
    if (field.length >= 3 || turn !== 'player') return;
    setHand(prev => prev.filter(c => c.id !== card.id));
    setField(prev => [...prev, { ...card, canAttack: false }]);
    setHistory(prev => [`● Jogou '${card.name}'`, ...prev]);
  };

  const handleCombat = async (attackerId: string, targetId: string | 'hero', isEnemyHero: boolean = false) => {
    const attacker = field.find(c => c.id === attackerId);
    if (!attacker || !attacker.canAttack || turn !== 'player') return;

    setAttackingInfo({ id: attackerId, targetType: isEnemyHero ? 'hero' : 'card' });
    await new Promise(resolve => setTimeout(resolve, 350));

    if (isEnemyHero) {
      const newHp = enemyHp - attacker.atk;
      setEnemyHp(Math.max(0, newHp));
      if (newHp <= 0) setGameStatus('victory');
      setHistory(prev => [`● Direct Hit! ${attacker.name} causou ${attacker.atk} ao Herói`, ...prev]);
      setField(prev => prev.map(c => c.id === attackerId ? { ...c, canAttack: false } : c));
    } else {
      const target = enemyField.find(c => c.id === targetId);
      if (target) {
        const newAttackerHp = attacker.hp - target.atk;
        const newTargetHp = target.hp - attacker.atk;
        setField(prev => prev.map(c => c.id === attackerId ? { ...c, hp: newAttackerHp, canAttack: false } : c).filter(c => c.hp > 0));
        setEnemyField(prev => prev.map(c => c.id === targetId ? { ...c, hp: newTargetHp } : c).filter(c => c.hp > 0));
        setHistory(prev => [`● Combate: ${attacker.name} causou dano`, ...prev]);
      }
    }

    setSelectedCardId(null);
    setAttackingInfo(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black flex flex-col font-display text-white">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/arena.png")' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full text-white backdrop-blur-md transition-all group pointer-events-auto"
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

      {/* Main Game Interface */}
      <div className={`relative z-10 w-full h-full flex flex-col justify-between p-4 overflow-hidden transition-opacity duration-1000 ${gameStatus !== 'playing' ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
        
        {/* HUDs Section (Top) */}
        <section className="w-full flex justify-between items-start">
          {/* Opponent HUD */}
          <div 
            onClick={() => selectedCardId && handleCombat(selectedCardId, 'hero', true)}
            className={`flex items-center gap-6 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border transition-all cursor-pointer
              ${selectedCardId ? 'border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}
              ${turn === 'opponent' ? 'opacity-50 grayscale' : ''}`}
          >
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
               <div className="relative w-14 h-14 rounded-xl border border-red-500/40 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <img src="/enemy_avatar.png" alt="Malakor" className="w-full h-full object-cover" />
               </div>
               <div className="space-y-1">
                  <div className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest leading-none">Inimigo</div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">Malakor, o Sombrio</div>
                  <div className="w-40 h-2.5 bg-black/60 rounded-full border border-white/5 overflow-hidden">
                    <motion.div initial={{ width: '100%' }} animate={{ width: `${(enemyHp / 230) * 100}%` }} className="h-full bg-gradient-to-r from-red-600 to-red-400" />
                  </div>
                  <div className="flex gap-3 text-[9px] font-bold">
                    <span className="text-red-400 flex items-center gap-1"><Heart className="w-2.5 h-2.5" /> {enemyHp}/230</span>
                    <span className="text-blue-400 flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> 5/5</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[9px] text-gray-500 uppercase font-black">Mão</span>
               <div className="text-lg font-black text-white">{enemyHandCount}</div>
            </div>
          </div>

          {/* Enemy Hand Visualization */}
          <div className="flex -space-x-8 pr-12">
            {Array.from({ length: enemyHandCount }).map((_, i) => (
              <motion.div
                key={`enemy-card-${i}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-14 h-20 rounded-lg overflow-hidden border border-white/10 shadow-2xl relative bg-cover bg-center"
                style={{ 
                  backgroundImage: 'url("/fundo.png")',
                  transform: `rotate(${(i - Math.floor(enemyHandCount / 2)) * 6}deg)`
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
              </motion.div>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="flex justify-center gap-4 py-2">
            {enemyField.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  y: (attackingInfo?.id === card.id && attackingInfo.isOpponent) 
                     ? (attackingInfo.targetType === 'hero' ? 250 : 100) 
                     : 0,
                  zIndex: (attackingInfo?.id === card.id && attackingInfo.isOpponent) ? 999 : 1
                }}
                transition={{
                  y: { type: "spring", stiffness: 300, damping: 20 },
                  default: { duration: 0.3 }
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => selectedCardId && handleCombat(selectedCardId, card.id)}
                className={`w-28 h-40 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all cursor-pointer
                  ${selectedCardId ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black animate-pulse' : ''}
                  ${card.image ? 'border-transparent' : 'border-red-500/40 bg-gradient-to-br from-red-950/80 to-black backdrop-blur-md flex flex-col p-2.5'}`}
              >
                {card.image ? (
                   <div className="relative w-full h-full">
                     <img src={card.image} alt={card.name} className="w-full h-full object-contain pointer-events-none" />
                     {/* Overlay HP bar for cards during combat */}
                     <div className="absolute bottom-1 left-2 right-2 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(card.hp / card.maxHp) * 100}%` }} />
                     </div>
                   </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[7px] font-bold text-red-400 uppercase tracking-tighter">{card.type}</span>
                      <span className="w-4 h-4 rounded-full bg-red-600/50 border border-red-400 text-white flex items-center justify-center text-[8px] font-bold">{card.cost}</span>
                    </div>
                    <div className="w-full aspect-[4/3] rounded-lg bg-black/60 border border-red-500/20 mb-1.5 overflow-hidden">
                       <div className="w-full h-full bg-gradient-to-tr from-red-500/10 animate-pulse" />
                    </div>
                    <h4 className="text-[9px] font-bold text-white mb-0.5 tracking-tight">{card.name}</h4>
                    <p className="text-[7px] text-gray-500 leading-tight">{card.desc}</p>
                    <div className="mt-auto flex justify-between border-t border-white/10 pt-1">
                      <span className="flex items-center gap-1 text-[8px] text-red-500 font-bold"><Sword className="w-2 h-2" /> {card.atk}</span>
                      <span className="flex items-center gap-1 text-[8px] text-gray-400 font-bold"><Shield className="w-2 h-2" /> {card.hp}</span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* TURN INDICATOR */}
        <div className="flex flex-col items-center relative py-1">
          <div className="h-[1px] w-full max-w-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-1/2 -translate-y-1/2" />
          <motion.div 
             animate={{ scale: [1, 1.05, 1] }} 
             transition={{ repeat: Infinity, duration: 3 }}
             className="relative z-10 px-6 py-1 bg-gold/10 backdrop-blur-md border border-gold/30 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,215,0,0.1)]"
          >
            <div className="w-1 h-1 rounded-full bg-gold shadow-[0_0_10px_#FFD700]" />
            <span className="text-gold font-bold uppercase tracking-[0.3em] text-[10px]">
              {turn === 'player' ? 'Seu Turno' : 'Turno de Malakor'}
            </span>
          </motion.div>
        </div>

        {/* BOTTOM FIELD (Player) */}
        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="flex justify-center gap-4 py-2">
            <AnimatePresence>
              {field.map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    y: attackingInfo?.id === card.id 
                      ? (attackingInfo.targetType === 'hero' ? -250 : -100) 
                      : 0,
                    zIndex: attackingInfo?.id === card.id ? 999 : 1
                  }}
                  transition={{
                    y: { type: "spring", stiffness: 300, damping: 20 },
                    default: { duration: 0.3 }
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => card.canAttack && turn === 'player' && setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                  className={`relative w-28 h-40 rounded-xl overflow-hidden transition-all cursor-pointer
                    ${selectedCardId === card.id ? 'ring-4 ring-gold shadow-[0_0_30px_rgba(255,215,0,0.4)] z-[100] scale-110' : 'shadow-[0_0_25px_rgba(0,0,0,0.5)]'}
                    ${card.canAttack && !selectedCardId && turn === 'player' ? 'ring-2 ring-emerald-500/50' : ''}
                    ${card.image ? 'border-transparent' : 'bg-gradient-to-br from-gold/20 to-dark-card/90 border-2 border-gold/40 flex flex-col p-2.5'}`}
                >
                  {card.image ? (
                    <div className="relative w-full h-full">
                      <img src={card.image} alt={card.name} className="w-full h-full object-contain pointer-events-none" />
                      {/* HP Bar */}
                      <div className="absolute bottom-1 left-2 right-2 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(card.hp / card.maxHp) * 100}%` }} />
                      </div>
                      {/* Can Attack Badge */}
                      {card.canAttack && (
                        <div className="absolute top-1 right-1 bg-emerald-500 text-[6px] font-bold px-1 rounded-sm shadow-lg animate-bounce">PRONTO</div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[7px] font-bold text-gold uppercase tracking-tighter">{card.type}</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-600/50 border border-blue-400 text-white flex items-center justify-center text-[7px] font-bold">{card.cost}</span>
                      </div>
                      <div className="w-full aspect-[4/3] rounded-lg bg-black/40 border border-white/5 mb-1.5 overflow-hidden">
                         <div className="w-full h-full bg-gradient-to-tr from-gold/5 animate-pulse" />
                      </div>
                      <h4 className="text-[9px] font-bold text-white mb-0.5 tracking-tight">{card.name}</h4>
                      <p className="text-[7px] text-gray-400 leading-tight">{card.desc}</p>
                      <div className="mt-auto flex justify-between border-t border-white/10 pt-1">
                        <span className="flex items-center gap-1 text-[8px] text-red-400 font-bold"><Sword className="w-2 h-2" /> {card.atk}</span>
                        <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold"><Shield className="w-2 h-2" /> {card.hp}</span>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
              {Array.from({ length: Math.max(0, 3 - field.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-28 h-40 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                   <span className="text-white/5 font-bold uppercase text-[8px] tracking-widest">Livre</span>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* PLAYER SECTION (Bottom) */}
        <section className="w-full flex items-end justify-between px-6 pb-2 pointer-events-none">
          {/* Player Sidebar */}
          <div className="w-64 pointer-events-auto">
              <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-gold/30 shadow-[0_0_30px_rgba(255,215,0,0.05)]">
                 <div className="flex items-center gap-3 mb-3">
                    <img src="/hero_avatar.png" alt="Aeliana" className="w-12 h-12 rounded-lg border border-gold/40 shadow-inner" />
                    <div>
                      <div className="text-[9px] font-bold text-gold/60 uppercase tracking-widest leading-none">Você</div>
                      <div className="text-xs font-black text-white uppercase tracking-wider">Aeliana Solari</div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-emerald-400"><span>VIDA</span><span>{playerHp}/280</span></div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-500" style={{ width: `${(playerHp / 280) * 100}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-blue-400"><span>MANA</span><span>3/5</span></div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                        <div className="h-full w-[60%] bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                      </div>
                    </div>
                 </div>
              </div>
          </div>

          {/* Hand - Simplified Deck Look & Play Logic */}
          <div className="flex-1 flex justify-center -space-x-12 px-12 pointer-events-auto">
            <AnimatePresence>
              {hand.map((card, i) => (
                <motion.div 
                  key={card.id} 
                  layoutId={card.id}
                  whileHover="hover"
                  initial="initial"
                  exit={{ opacity: 0, scale: 0.5, y: -200 }}
                  onClick={() => playCard(card)}
                  className="relative w-24 h-48 cursor-pointer flex items-end"
                >
                  <motion.div
                    variants={{
                      initial: { y: 0, scale: 1, rotate: (i - Math.floor(hand.length/2)) * 5, zIndex: 10 + i },
                      hover: { 
                        scale: 1.2, 
                        y: -80,
                        rotate: 0,
                        zIndex: 100,
                        transition: { type: "spring", stiffness: 150, damping: 25 }
                      }
                    }}
                    className={`w-24 h-34 rounded-lg overflow-hidden shadow-2xl relative
                      ${card.image ? '' : 'bg-[#0a0c10] border border-white/10 flex flex-col p-2.5 bg-[url("https://www.transparenttextures.com/patterns/dark-matter.png")]'}`}
                  >
                    {card.image ? (
                      <>
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="w-full h-full object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{card.type}</span>
                          <span className="w-4 h-4 rounded-full bg-indigo-600/50 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-white/10">{card.cost}</span>
                        </div>
                        <div className="w-full h-14 rounded-lg bg-black/60 border border-white/5 mb-2 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white/5" />
                        </div>
                        <h4 className="text-[9px] font-bold text-white/80 mb-0.5 tracking-tight">{card.name}</h4>
                        <p className="text-[7px] text-white/30 leading-tight">Clique para jogar</p>
                        <div className="mt-auto pt-1 border-t border-white/5 flex justify-between text-[7px] font-bold text-white/20">
                          <span>ATK {card.atk}</span>
                          <span>DEF {card.def}</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* History Sidebar */}
          <div className="w-64 pointer-events-auto">
             <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-2 shadow-xl">
                <div className="flex items-center justify-between text-[9px] font-bold text-gold border-b border-white/5 pb-2">
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> HISTÓRICO</span>
                  <span className="text-white/40">v1.2.4</span>
                </div>
                <div className="space-y-1.5 h-16 overflow-y-auto pr-2 custom-scrollbar text-[7px] leading-tight">
                  {history.map((msg, idx) => (
                    <p key={idx} className={msg.includes('Jogou') ? 'text-emerald-400' : 'text-gray-400'}>{msg}</p>
                  ))}
                </div>
                <button 
                  onClick={endTurn}
                  disabled={turn !== 'player'}
                  className={`w-full py-2 border rounded-lg font-bold text-[9px] transition-all uppercase tracking-widest
                    ${turn === 'player' 
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/30 text-emerald-400' 
                      : 'bg-gray-800/20 border-gray-700 text-gray-600 cursor-not-allowed'}`}
                >
                  {turn === 'player' ? 'FINALIZAR TURNO' : 'AGUARDE...'}
                </button>
             </div>
          </div>
        </section>
      </div>
      
      {/* Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>
    </div>
  );
}
