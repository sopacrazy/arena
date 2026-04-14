import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Eye, X, History, Skull, RefreshCw, Ghost, ChevronRight } from 'lucide-react';
import LoadingScreen from './LoadingScreen';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

/** Hierarquia de poder: Neutro → Bronze → Prata → Ouro */
type CardLevel = 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
/** Tipos de carta conforme o livro de regras */
type CardType  = 'Normal' | 'Especial' | 'Bencao' | 'Reacao';
/**
 * Posições de combate (regra oficial):
 *  attack         → face-up vertical  — pode declarar ataques
 *  defense-open   → face-up horizontal — atributos visíveis, NÃO ataca
 *  defense-closed → face-down         — atributos ocultos
 */
type Position    = 'attack' | 'defense-open' | 'defense-closed';
type TurnPhase   = 'organize' | 'confront';
type GameStatus  = 'playing' | 'victory' | 'defeat';

interface Card {
  id: string;
  name: string;
  level: CardLevel;
  cardType: CardType;
  element: 'Agua' | 'Terra' | 'Luz' | 'Trevas' | 'Vento' | 'Fogo';
  raca: string;
  classe: string;
  atq: number;
  def: number;
  desc: string;
  image?: string;
  hasPierce?: boolean;      // Perfuração de Bloqueio
  revealEffect?: string;    // Efeito "Revelar" de Combatentes Especiais
  // Estado de runtime (por turno / por instância no campo)
  position: Position;
  positionChangedThisTurn: boolean;
  attackedThisTurn: boolean;
}

interface ArenaProps {
  onClose: () => void;
}

// ─── CATÁLOGO DE CARTAS ───────────────────────────────────────────────────────

interface CatalogEntry {
  name: string; level: CardLevel; cardType: CardType;
  element: Card['element']; raca: string; classe: string;
  atq: number; def: number; desc: string; img: string;
  hasPierce?: boolean; revealEffect?: string;
}

const CATALOG: CatalogEntry[] = [
  // ── Neutros (Combatentes Normais / Especiais de baixo custo) ──────────────
  { name: 'Recruta 06',      level: 'Neutro', cardType: 'Normal',   element: 'Terra', raca: 'Humano', classe: 'Guerreiro', atq: 8,  def: 10, desc: 'Soldado recém-recrutado nas fileiras da guarda.',           img: '/RECK 1/NIVEL NEUTRO/06 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Patrulheiro 11',  level: 'Neutro', cardType: 'Normal',   element: 'Vento', raca: 'Humano', classe: 'Arqueiro',  atq: 10, def: 7,  desc: 'Guarda os portões com olhos de falcão.',                  img: '/RECK 1/NIVEL NEUTRO/11 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Sentinela 43',    level: 'Neutro', cardType: 'Normal',   element: 'Terra', raca: 'Humano', classe: 'Guardião', atq: 7,  def: 12, desc: 'Defesa inabalável nas muralhas do reino.',                  img: '/RECK 1/NIVEL NEUTRO/43 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Aldeão 49',       level: 'Neutro', cardType: 'Normal',   element: 'Terra', raca: 'Humano', classe: 'Civil',    atq: 5,  def: 8,  desc: 'Cidadão comum empunhando uma foice.',                      img: '/RECK 1/NIVEL NEUTRO/49 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Militante 50',    level: 'Neutro', cardType: 'Normal',   element: 'Fogo',  raca: 'Humano', classe: 'Lutador',  atq: 12, def: 6,  desc: 'Combatente agressivo sem treinamento formal.',              img: '/RECK 1/NIVEL NEUTRO/50 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Guarda 51',       level: 'Neutro', cardType: 'Normal',   element: 'Luz',   raca: 'Humano', classe: 'Guardião', atq: 9,  def: 11, desc: 'Protetor devotado da coroa.',                               img: '/RECK 1/NIVEL NEUTRO/51 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Vigilante 53',    level: 'Neutro', cardType: 'Normal',   element: 'Vento', raca: 'Humano', classe: 'Batedor', atq: 11, def: 8,  desc: 'Olhos nas sombras, espada afiada.',                         img: '/RECK 1/NIVEL NEUTRO/53 - Copia - Copia - Copia.webp' },
  { name: 'Soldado 60',      level: 'Neutro', cardType: 'Normal',   element: 'Fogo',  raca: 'Humano', classe: 'Guerreiro',atq: 13, def: 9,  desc: 'Veterano endurecido das guerras do norte.',                 img: '/RECK 1/NIVEL NEUTRO/60.webp' },
  { name: 'Mercenário 67',   level: 'Neutro', cardType: 'Normal',   element: 'Trevas',raca: 'Humano', classe: 'Mercenário',atq: 14,def: 7,  desc: 'Luta pelo maior pagador.',                                  img: '/RECK 1/NIVEL NEUTRO/67 - Copia - Copia.webp' },
  // Combatente Especial Neutro — efeito "Revelar: comprar 1 carta"
  { name: 'Andarilho',       level: 'Neutro', cardType: 'Especial', element: 'Vento', raca: 'Humano', classe: 'Viajante', atq: 9,  def: 9,  desc: 'Revelar: compre 1 carta do seu deck.',                     img: '/RECK 1/NIVEL NEUTRO/Design sem nome (10).webp', revealEffect: 'draw' },

  // ── Bronze (substituem Neutros — Escala ou 1 Sacrifício) ─────────────────
  // Especial — efeito "Revelar: Neutros aliados ganham +3 ATQ"
  { name: 'Caelan, Lâmina do Juramento',  level: 'Bronze', cardType: 'Especial', element: 'Luz',   raca: 'Humano', classe: 'Paladino', atq: 18, def: 14, desc: 'Revelar: todos os Neutros aliados ganham +3 ATQ até o fim do turno.', img: '/RECK 1/PRATA/Caelan, Lâmina do Juramento.webp', revealEffect: 'buff-neutro-atq' },
  { name: 'Fargan, Lâmina do Caminho',    level: 'Bronze', cardType: 'Normal',   element: 'Trevas',raca: 'Humano', classe: 'Caçador',  atq: 20, def: 12, desc: 'Perseguidor implacável das sombras.',                              img: '/RECK 1/PRATA/Fargan, Lâmina do Caminho Estreito (1).webp' },

  // ── Prata (substituem Bronze — Escala ou 2 Sacrifícios) ──────────────────
  // Especial — efeito "Revelar: 5 de dano direto ao oponente"
  { name: 'Raskel, Sangue da Campanha',   level: 'Prata',  cardType: 'Especial', element: 'Fogo',  raca: 'Humano', classe: 'Comandante',atq: 26, def: 20, desc: 'Revelar: cause 5 de dano direto nos Pontos de Batalha do oponente.', img: '/RECK 1/PRATA/_Raskel, Sangue da Campanha.webp', revealEffect: 'direct-damage-5' },

  // ── Ouro (substituem Prata — Escala ou 3 Sacrifícios) ────────────────────
  // Normal com Perfuração de Bloqueio
  { name: 'Aldren, Veterano da Fronteira',level: 'Ouro',   cardType: 'Normal',   element: 'Terra', raca: 'Humano', classe: 'General',  atq: 38, def: 30, desc: 'Perfuração de Bloqueio: ao destruir um bloqueador a diferença causa dano de PB.', img: '/RECK 1/OURO/Aldren, Veterano da Fronteira Quebrada (5).webp', hasPierce: true },
  // Especial — efeito "Revelar: destruir 1 combatente do oponente com ATQ ≤ 20"
  { name: 'Iskand, Sobrevivente',          level: 'Ouro',   cardType: 'Especial', element: 'Trevas',raca: 'Humano', classe: 'Campeão',  atq: 40, def: 28, desc: 'Revelar: destrua 1 combatente inimigo com ATQ ≤ 20.', img: '/RECK 1/OURO/Iskand, Sobrevivente do Campo Vermelho.webp', revealEffect: 'destroy-weak' },
];

// ─── CONSTRUÇÃO DO POOL DE DECK ───────────────────────────────────────────────
// Regra: Combatentes — até 3 cópias; Reações/Bênçãos — apenas 1 cópia (sem Reações/Bênçãos no catálogo por ora)
const LEVEL_COPIES: Record<CardLevel, number> = { Neutro: 3, Bronze: 3, Prata: 2, Ouro: 1 };

const DECK_POOL: Card[] = CATALOG.flatMap((entry, ci) =>
  Array.from({ length: LEVEL_COPIES[entry.level] }, (_, copy) => ({
    id: `base-${ci}-${copy}`,
    name: entry.name, level: entry.level, cardType: entry.cardType,
    element: entry.element, raca: entry.raca, classe: entry.classe,
    atq: entry.atq, def: entry.def, desc: entry.desc, image: entry.img,
    hasPierce: entry.hasPierce, revealEffect: entry.revealEffect,
    position: 'attack' as Position,
    positionChangedThisTurn: false, attackedThisTurn: false,
  }))
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const LEVEL_ORDER: CardLevel[] = ['Neutro', 'Bronze', 'Prata', 'Ouro'];

const levelColor: Record<CardLevel, string> = {
  Neutro: 'text-gray-300 bg-gray-700',
  Bronze: 'text-amber-300 bg-amber-900/60',
  Prata:  'text-slate-300 bg-slate-600',
  Ouro:   'text-yellow-300 bg-yellow-800/60',
};

const positionLabel: Record<Position, string> = {
  'attack':         'Ataque',
  'defense-open':   'Defesa Aberta',
  'defense-closed': 'Defesa Fechada',
};

// ─── COMPONENTE ARENA ─────────────────────────────────────────────────────────

export default function Arena({ onClose }: ArenaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const arenaImages = [
    '/arena.webp', '/enemy_avatar.webp', '/hero_avatar.webp', '/fundo.webp',
    ...CATALOG.map(c => c.img),
  ];

  // ── Inicialização do estado do jogo ─────────────────────────────────────
  const dealInitial = () => {
    const s = shuffle(DECK_POOL);
    const uniquify = (cards: Card[], prefix: string) =>
      cards.map((c, i) => ({ ...c, id: `${prefix}-${i}-${c.id}` }));
    return { deck: uniquify(s.slice(5), 'pd'), hand: uniquify(s.slice(0, 5), 'ph') };
  };

  // Pontos de Batalha (regra: 30 para partidas casuais)
  const [playerPB, setPlayerPB]     = useState(30);
  const [opponentPB, setOpponentPB] = useState(30);

  // Deck e mão do jogador
  const [{ deck: initDeck, hand: initHand }] = useState(dealInitial);
  const [playerDeck, setPlayerDeck] = useState<Card[]>(initDeck);
  const [playerHand, setPlayerHand] = useState<Card[]>(initHand);

  // Mão do oponente (apenas contagem — IA sem deck real)
  const [opponentHandCount, setOpponentHandCount] = useState(5);

  // Campo de combatentes (5 slots por jogador)
  const [playerField,   setPlayerField]   = useState<(Card | null)[]>(Array(5).fill(null));
  const [opponentField, setOpponentField] = useState<(Card | null)[]>(Array(5).fill(null));

  // Área de Bênção (1 por jogador)
  const [playerBlessing,   setPlayerBlessing]   = useState<Card | null>(null);
  const [opponentBlessing, setOpponentBlessing] = useState<Card | null>(null);

  // Área de Reações (3 slots por jogador)
  const [playerReactions,   setPlayerReactions]   = useState<(Card | null)[]>(Array(3).fill(null));
  const [opponentReactions, setOpponentReactions] = useState<(Card | null)[]>(Array(3).fill(null));

  // Zonas de descarte
  const [playerExile,   setPlayerExile]   = useState<Card[]>([]);
  const [playerDiscard, setPlayerDiscard] = useState<Card[]>([]);
  const [opponentExile, setOpponentExile] = useState<Card[]>([]);

  // Controle de turno
  // Regra: Fase de Compra é automática no início do turno
  // Regra: Ordem obrigatória — Organização → Confronto → Fim
  const [turn,       setTurn]       = useState<'player' | 'opponent'>('player');
  const [turnPhase,  setTurnPhase]  = useState<TurnPhase>('organize');
  const [turnCount,  setTurnCount]  = useState(1);
  const [playedCombatantThisTurn, setPlayedCombatantThisTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');

  // UI
  const [pendingCard,     setPendingCard]     = useState<Card | null>(null); // carta da mão selecionada
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);
  const [inspectedCard,   setInspectedCard]   = useState<Card | null>(null);
  const [hoveredCard,     setHoveredCard]     = useState<Card | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<string | null>(null);
  const [timeLeft,        setTimeLeft]        = useState(60);
  const [isViewingExile,  setIsViewingExile]  = useState<null | 'player' | 'opponent'>(null);
  const [history,         setHistory]         = useState<string[]>(['● COMBATE INICIADO', '● BOA SORTE!']);
  const [attackAnim,      setAttackAnim]      = useState<{ id: string; targetId: string; isOpponent: boolean } | null>(null);

  // Modo Sacrifício (Substituição por Poder)
  const [sacrificeMode, setSacrificeMode] = useState<{
    card: Card; needed: number; selected: string[];
  } | null>(null);

  // Modal de escolha de posição ao invocar
  const [positionChoice, setPositionChoice] = useState<{
    card: Card; slotIndex: number; replaced: Card | null; sacrificed: string[];
  } | null>(null);

  // ── Refs para loop assíncrono da IA ─────────────────────────────────────
  const playerFieldRef   = useRef(playerField);
  const opponentFieldRef = useRef(opponentField);
  const playerPBRef      = useRef(playerPB);
  const opponentPBRef    = useRef(opponentPB);
  useEffect(() => { playerFieldRef.current   = playerField;   }, [playerField]);
  useEffect(() => { opponentFieldRef.current = opponentField; }, [opponentField]);
  useEffect(() => { playerPBRef.current      = playerPB;      }, [playerPB]);
  useEffect(() => { opponentPBRef.current    = opponentPB;    }, [opponentPB]);

  // ── Timer de turno (60s) ─────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'playing' || turn !== 'player' || isTransitioning) return;
    setTimeLeft(60);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleEndTurn(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, turnPhase, gameStatus, isTransitioning]);

  // ── Verificação de vitória/derrota ───────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (playerPB   <= 0) setGameStatus('defeat');
    if (opponentPB <= 0) setGameStatus('victory');
  }, [playerPB, opponentPB, gameStatus]);

  // ─── UTILITÁRIOS ──────────────────────────────────────────────────────────

  const addHistory = (msg: string) => setHistory(prev => [msg, ...prev.slice(0, 49)]);

  // ─── FASE DE COMPRA ───────────────────────────────────────────────────────
  // Regra: se deck vazio ao tentar comprar → derrota
  const drawPlayerCard = (deck?: Card[]) => {
    setPlayerDeck(currentDeck => {
      const d = deck ?? currentDeck;
      if (d.length === 0) {
        // Condição de derrota: deck esgotado na compra
        setGameStatus('defeat');
        addHistory('● DECK VAZIO! Não foi possível comprar carta — DERROTA!');
        return d;
      }
      const [next, ...rest] = d;
      const newCard = { ...next, id: `ph-draw-${Date.now()}` };
      setPlayerHand(prev => [...prev, newCard]);
      addHistory('● Fase de Compra: +1 carta');
      return rest;
    });
  };

  // ─── REINICIAR ────────────────────────────────────────────────────────────
  const resetGame = () => {
    const { deck, hand } = dealInitial();
    setPlayerDeck(deck); setPlayerHand(hand);
    setOpponentHandCount(5);
    setPlayerField(Array(5).fill(null)); setOpponentField(Array(5).fill(null));
    setPlayerBlessing(null);  setOpponentBlessing(null);
    setPlayerReactions(Array(3).fill(null)); setOpponentReactions(Array(3).fill(null));
    setPlayerExile([]); setPlayerDiscard([]); setOpponentExile([]);
    setPlayerPB(30); setOpponentPB(30);
    setTurn('player'); setTurnPhase('organize'); setTurnCount(1);
    setPlayedCombatantThisTurn(false); setGameStatus('playing');
    setPendingCard(null); setAttackingCardId(null);
    setSacrificeMode(null); setPositionChoice(null);
    setHistory(['● PARTIDA REINICIADA', '● BOA SORTE!']);
  };

  // ─── AVANÇAR FASE: Organização → Confronto ────────────────────────────────
  const advanceToConfront = () => {
    if (turn !== 'player' || turnPhase !== 'organize') return;
    setTurnPhase('confront');
    setPendingCard(null); setSacrificeMode(null); setPositionChoice(null);
    addHistory('● Fase de Confronto');
  };

  // ─── FIM DO TURNO ─────────────────────────────────────────────────────────
  const handleEndTurn = async () => {
    if (turn !== 'player') return;

    // Regra: Carta de Bênção vai ao Exílio no fim do turno (salvo efeito contrário)
    if (playerBlessing) {
      setPlayerExile(prev => [...prev, playerBlessing]);
      setPlayerBlessing(null);
      addHistory(`● Bênção '${playerBlessing.name}' → Exílio`);
    }

    // Reset estados de turno dos combatentes aliados
    setPlayerField(prev => prev.map(c =>
      c ? { ...c, positionChangedThisTurn: false, attackedThisTurn: false } : null
    ));

    setTurn('opponent');
    setPlayedCombatantThisTurn(false);
    setPendingCard(null); setAttackingCardId(null);
    setSacrificeMode(null); setPositionChoice(null);
    setIsTransitioning('TURNO DO ADVERSÁRIO');
    setTimeout(() => setIsTransitioning(null), 1500);

    await new Promise(r => setTimeout(r, 2000));
    runOpponentTurn();
  };

  // ─── TURNO DA IA (Malakor) ────────────────────────────────────────────────
  const runOpponentTurn = async () => {
    // FASE DE COMPRA: oponente compra 1 carta
    // Regra de derrota do oponente por deck vazio: simplificado — IA tem pool infinito
    setOpponentHandCount(prev => prev + 1);
    addHistory('● Malakor: Fase de Compra (+1)');
    await new Promise(r => setTimeout(r, 500));

    // FASE DE ORGANIZAÇÃO: jogar 1 combatente (respeitando regras de substituição)
    addHistory('● Malakor: Fase de Organização');
    const curField = opponentFieldRef.current;
    const emptySlots  = curField.map((c, i) => c === null ? i : -1).filter(i => i >= 0);
    const neutrosOnField = curField.filter((c): c is Card => c !== null && c.level === 'Neutro');

    if (opponentHandCount > 0 && emptySlots.length > 0) {
      // IA tenta Substituição por Escala se tem Neutro no campo (50% de chance)
      let played = false;
      if (neutrosOnField.length > 0 && Math.random() < 0.5) {
        const bronzeEntry = CATALOG.filter(e => e.level === 'Bronze');
        if (bronzeEntry.length > 0) {
          const entry = bronzeEntry[Math.floor(Math.random() * bronzeEntry.length)];
          const target = neutrosOnField[0];
          const replaceIdx = curField.findIndex(c => c?.id === target.id);
          if (replaceIdx !== -1) {
            const newCard: Card = { ...entry, id: `opp-${Date.now()}`, image: entry.img, position: 'attack', positionChangedThisTurn: false, attackedThisTurn: false };
            setOpponentExile(prev => [...prev, target]);
            setOpponentField(prev => { const n = [...prev]; n[replaceIdx] = newCard; return n; });
            setOpponentHandCount(prev => Math.max(0, prev - 1));
            addHistory(`● Malakor (Escala): invocou ${newCard.name}`);
            played = true;
            await new Promise(r => setTimeout(r, 800));
          }
        }
      }

      if (!played) {
        // Invocação Normal de Neutro
        const neutroEntries = CATALOG.filter(e => e.level === 'Neutro');
        const entry = neutroEntries[Math.floor(Math.random() * neutroEntries.length)];
        const pos: Position = Math.random() < 0.3 ? 'defense-closed' : 'attack';
        const newCard: Card = { ...entry, id: `opp-${Date.now()}`, image: entry.img, position: pos, positionChangedThisTurn: false, attackedThisTurn: false };
        setOpponentField(prev => { const n = [...prev]; n[emptySlots[0]] = newCard; return n; });
        setOpponentHandCount(prev => Math.max(0, prev - 1));
        addHistory(`● Malakor invocou: ${newCard.name} (${positionLabel[pos]})`);
        await new Promise(r => setTimeout(r, 800));
      }
    }

    // FASE DE CONFRONTO: declarar ataques
    // Regra do Primeiro Turno: quem inicia NÃO pode atacar — Malakor ataca do turno 2 em diante
    if (turnCount >= 2) {
      addHistory('● Malakor: Fase de Confronto');
      const attackers = opponentFieldRef.current.filter(
        (c): c is Card => c !== null && c.position === 'attack' && !c.attackedThisTurn
      );
      for (const attacker of attackers) {
        await resolveOpponentAttack(attacker);
        await new Promise(r => setTimeout(r, 600));
        if (playerPBRef.current <= 0) break;
      }
    }

    // Bênção do oponente expira
    if (opponentBlessing) {
      setOpponentExile(prev => [...prev, opponentBlessing!]);
      setOpponentBlessing(null);
    }

    // Reset estados de turno dos combatentes inimigos
    setOpponentField(prev => prev.map(c =>
      c ? { ...c, positionChangedThisTurn: false, attackedThisTurn: false } : null
    ));

    // FIM DO TURNO DO OPONENTE → inicia turno do jogador
    setTurn('player');
    setTurnPhase('organize');  // Regra: turno começa na Fase de Organização (após compra automática)
    setTurnCount(prev => prev + 1);
    setPlayedCombatantThisTurn(false);
    setIsTransitioning('SEU TURNO');
    setTimeout(() => setIsTransitioning(null), 1500);
    addHistory('● SEU TURNO — Fase de Compra automática');
    // Regra: Fase de Compra do jogador (automática ao início do turno)
    drawPlayerCard();
  };

  // ─── RESOLUÇÃO DE COMBATE (IA atacando jogador) ───────────────────────────
  const resolveOpponentAttack = async (attacker: Card) => {
    const playerCards = playerFieldRef.current.filter((c): c is Card => c !== null);

    // Ataque Direto: se não há combatentes no campo do jogador
    if (playerCards.length === 0) {
      setAttackAnim({ id: attacker.id, targetId: 'direct', isOpponent: true });
      await new Promise(r => setTimeout(r, 400));
      const dmg = attacker.atq;
      const newPB = Math.max(0, playerPBRef.current - dmg);
      setPlayerPB(newPB); playerPBRef.current = newPB;
      addHistory(`● ATAQUE DIRETO! ${attacker.name} (${dmg} ATQ) → -${dmg} PB ao jogador`);
      setAttackAnim(null);
      setOpponentField(prev => prev.map(c => c?.id === attacker.id ? { ...c, attackedThisTurn: true } : c));
      return;
    }

    // Escolhe alvo: prefere combatentes em modo Ataque
    const atkTargets = playerCards.filter(c => c.position === 'attack');
    const defender   = atkTargets.length > 0 ? atkTargets[0] : playerCards[0];

    setAttackAnim({ id: attacker.id, targetId: defender.id, isOpponent: true });
    await new Promise(r => setTimeout(r, 400));

    // Revelação em Bloqueio (face-down)
    let currentDef = defender;
    if (defender.position === 'defense-closed') {
      currentDef = { ...defender, position: 'defense-open' };
      setPlayerField(prev => prev.map(c => c?.id === defender.id ? currentDef : c));
      if (defender.cardType === 'Especial' && defender.revealEffect) {
        addHistory(`● REVELAÇÃO! ${defender.name} ativa seu efeito!`);
        applyRevealEffect(defender, 'player');
        await new Promise(r => setTimeout(r, 500));
      } else {
        addHistory(`● Revelado: ${defender.name}`);
      }
    }

    resolveBattleCalc(attacker, currentDef, 'opponent');
    setAttackAnim(null);
    setOpponentField(prev => prev.map(c => c?.id === attacker.id ? { ...c, attackedThisTurn: true } : c));
  };

  // ─── CÁLCULO DE BATALHA (reutilizado por jogador e IA) ───────────────────
  /**
   * Regras oficiais:
   *   ATQ vs ATQ: quem tiver maior ATQ vence. Diferença = dano PB do controlador perdedor.
   *               Empate → ambos destruídos, sem dano de PB.
   *   ATQ vs DEF: bloqueadores NÃO sofrem dano de batalha.
   *               Se DEF > ATQ: diferença = dano nos PB do atacante. Atacante NÃO é destruído.
   *               Se ATQ > DEF: bloqueador destruído, sem dano de PB (exceto Perfuração).
   *               Perfuração de Bloqueio: bloqueador destruído + diferença vai como dano de PB.
   */
  const resolveBattleCalc = (
    attacker: Card,
    defender: Card,
    attackerSide: 'player' | 'opponent'
  ) => {
    const defSide = attackerSide === 'player' ? 'opponent' : 'player';

    const destroyCard = (card: Card, side: 'player' | 'opponent') => {
      if (side === 'player') {
        setPlayerField(prev => prev.map(c => c?.id === card.id ? null : c));
        setPlayerExile(prev => [...prev, card]);
      } else {
        setOpponentField(prev => prev.map(c => c?.id === card.id ? null : c));
        setOpponentExile(prev => [...prev, card]);
      }
    };

    const damagePB = (side: 'player' | 'opponent', amount: number) => {
      if (side === 'player') {
        const n = Math.max(0, playerPBRef.current - amount);
        setPlayerPB(n); playerPBRef.current = n;
      } else {
        const n = Math.max(0, opponentPBRef.current - amount);
        setOpponentPB(n); opponentPBRef.current = n;
      }
    };

    if (defender.position === 'attack') {
      // ATQ vs ATQ
      if (attacker.atq > defender.atq) {
        const diff = attacker.atq - defender.atq;
        damagePB(defSide, diff);
        destroyCard(defender, defSide);
        addHistory(`● ${attacker.name} vence! ${defender.name} destruído. -${diff} PB (${defSide === 'player' ? 'jogador' : 'Malakor'})`);
      } else if (attacker.atq < defender.atq) {
        const diff = defender.atq - attacker.atq;
        damagePB(attackerSide, diff);
        destroyCard(attacker, attackerSide);
        addHistory(`● ${defender.name} contra-ataca! ${attacker.name} destruído. -${diff} PB (${attackerSide === 'player' ? 'jogador' : 'Malakor'})`);
      } else {
        // Empate: ambos destruídos, sem dano de PB
        destroyCard(attacker, attackerSide);
        destroyCard(defender, defSide);
        addHistory(`● ANULAÇÃO! ${attacker.name} e ${defender.name} destruídos. Sem dano de PB.`);
      }
    } else {
      // ATQ vs DEF (Bloqueio — defense-open ou acabou de ser revelado)
      if (attacker.atq > defender.def) {
        if (attacker.hasPierce) {
          // Perfuração de Bloqueio: bloqueador destruído + diferença como dano de PB
          const diff = attacker.atq - defender.def;
          destroyCard(defender, defSide);
          damagePB(defSide, diff);
          addHistory(`● PERFURAÇÃO! ${attacker.name} destrói ${defender.name} e causa -${diff} PB a ${defSide === 'player' ? 'você' : 'Malakor'}`);
        } else {
          // Bloqueador destruído, sem dano de PB ao controlador
          destroyCard(defender, defSide);
          addHistory(`● Defesa de ${defender.name} rompida! (sem dano de PB)`);
        }
      } else if (attacker.atq < defender.def) {
        // DEF > ATQ: diferença = dano nos PB do atacante. Atacante NÃO é destruído.
        const diff = defender.def - attacker.atq;
        damagePB(attackerSide, diff);
        addHistory(`● ${defender.name} resiste! Recoil de ${diff} PB ao ${attackerSide === 'player' ? 'jogador' : 'Malakor'}. Atacante permanece.`);
      } else {
        // ATQ = DEF: forças iguais, nada acontece
        addHistory(`● Forças iguais! Nenhum combatente destruído.`);
      }
    }
  };

  // ─── EFEITOS DE REVELAÇÃO ─────────────────────────────────────────────────
  const applyRevealEffect = (card: Card, controller: 'player' | 'opponent') => {
    switch (card.revealEffect) {
      case 'draw':
        if (controller === 'player') {
          drawPlayerCard();
          addHistory(`● [Efeito] ${card.name}: compra 1 carta`);
        }
        break;
      case 'buff-neutro-atq':
        if (controller === 'player') {
          setPlayerField(prev => prev.map(c => c && c.level === 'Neutro' ? { ...c, atq: c.atq + 3 } : c));
          addHistory(`● [Efeito] ${card.name}: Neutros aliados +3 ATQ`);
        }
        break;
      case 'direct-damage-5':
        if (controller === 'player') {
          const n = Math.max(0, opponentPBRef.current - 5);
          setOpponentPB(n); opponentPBRef.current = n;
          addHistory(`● [Efeito] ${card.name}: 5 de dano direto ao oponente!`);
        } else {
          const n = Math.max(0, playerPBRef.current - 5);
          setPlayerPB(n); playerPBRef.current = n;
          addHistory(`● [Efeito] ${card.name}: 5 de dano direto ao jogador!`);
        }
        break;
      case 'destroy-weak':
        if (controller === 'player') {
          const weak = opponentFieldRef.current.find(c => c && c.atq <= 20);
          if (weak) {
            setOpponentField(prev => prev.map(c => c?.id === weak.id ? null : c));
            setOpponentExile(prev => [...prev, weak]);
            addHistory(`● [Efeito] ${card.name}: ${weak.name} destruído!`);
          }
        } else {
          const weak = playerFieldRef.current.find(c => c && c.atq <= 20);
          if (weak) {
            setPlayerField(prev => prev.map(c => c?.id === weak.id ? null : c));
            setPlayerExile(prev => [...prev, weak]);
            addHistory(`● [Efeito] ${card.name}: ${weak.name} destruído pelo oponente!`);
          }
        }
        break;
    }
  };

  // ─── ATAQUE DO JOGADOR (Fase de Confronto) ────────────────────────────────
  const handlePlayerAttack = async (targetId: string | 'direct') => {
    if (!attackingCardId || turn !== 'player' || turnPhase !== 'confront') return;

    const attacker = playerFieldRef.current.find(c => c?.id === attackingCardId);
    if (!attacker || attacker.position !== 'attack') {
      addHistory('● Este combatente não pode atacar nesta posição'); setAttackingCardId(null); return;
    }
    if (attacker.attackedThisTurn) {
      addHistory('● Este combatente já atacou neste turno'); setAttackingCardId(null); return;
    }
    // Regra do Primeiro Turno: quem inicia NÃO pode atacar no 1º turno
    if (turnCount === 1) {
      addHistory('● Regra: não é possível atacar no primeiro turno'); setAttackingCardId(null); return;
    }

    if (targetId === 'direct') {
      // Ataque Direto: só permitido se não há combatentes no campo inimigo
      if (opponentFieldRef.current.some(c => c !== null)) {
        addHistory('● BLOQUEIO: destrua os combatentes de Malakor antes de atacar diretamente!');
        setAttackingCardId(null); return;
      }
      setAttackAnim({ id: attacker.id, targetId: 'direct', isOpponent: false });
      await new Promise(r => setTimeout(r, 400));
      const dmg = attacker.atq;
      const newPB = Math.max(0, opponentPBRef.current - dmg);
      setOpponentPB(newPB); opponentPBRef.current = newPB;
      addHistory(`● ATAQUE DIRETO! ${attacker.name} (${dmg}) → -${dmg} PB a Malakor!`);
      setAttackAnim(null);
    } else {
      const defenderCurrent = opponentFieldRef.current.find(c => c?.id === targetId);
      if (!defenderCurrent) { setAttackingCardId(null); return; }

      setAttackAnim({ id: attacker.id, targetId: defenderCurrent.id, isOpponent: false });
      await new Promise(r => setTimeout(r, 400));

      // Revelação em Bloqueio (face-down atacado é revelado imediatamente)
      let def = defenderCurrent;
      if (defenderCurrent.position === 'defense-closed') {
        def = { ...defenderCurrent, position: 'defense-open' };
        setOpponentField(prev => prev.map(c => c?.id === defenderCurrent.id ? def : c));
        if (defenderCurrent.cardType === 'Especial' && defenderCurrent.revealEffect) {
          addHistory(`● REVELAÇÃO! ${defenderCurrent.name} ativa efeito!`);
          applyRevealEffect(defenderCurrent, 'opponent');
          await new Promise(r => setTimeout(r, 500));
          // Recarrega estado atualizado após efeito
          def = opponentFieldRef.current.find(c => c?.id === defenderCurrent.id) ?? def;
        } else {
          addHistory(`● Revelado: ${defenderCurrent.name} (${defenderCurrent.def} DEF)`);
        }
      }

      resolveBattleCalc(attacker, def, 'player');
      setAttackAnim(null);
    }

    // Marca atacante como tendo atacado este turno
    setPlayerField(prev => prev.map(c => c?.id === attackingCardId ? { ...c, attackedThisTurn: true } : c));
    setAttackingCardId(null);
  };

  // ─── VERIFICAÇÃO DE INVOCAÇÃO VÁLIDA ──────────────────────────────────────
  /**
   * Regras de Substituição:
   *   Normal: Neutro em slot vazio
   *   Escala: Bronze→Neutro, Prata→Bronze, Ouro→Prata
   *   Poder: 1 Neutro sacrificado→Bronze, 2→Prata, 3→Ouro (slots vazios)
   */
  const checkSummonValidity = (card: Card, slotIndex: number): { valid: boolean; method: 'normal' | 'scale'; replaced: Card | null } => {
    const existing = playerField[slotIndex];
    const cardLvlIdx = LEVEL_ORDER.indexOf(card.level);
    // Normal: Neutro em espaço vazio
    if (card.level === 'Neutro' && existing === null) return { valid: true, method: 'normal', replaced: null };
    // Escala: nível N substitui nível N-1 no mesmo slot
    if (existing !== null && cardLvlIdx > 0) {
      const existingIdx = LEVEL_ORDER.indexOf(existing.level);
      if (cardLvlIdx === existingIdx + 1) return { valid: true, method: 'scale', replaced: existing };
    }
    return { valid: false, method: 'normal', replaced: null };
  };

  // ─── CLIQUE EM SLOT DO CAMPO (Fase de Organização) ────────────────────────
  const handleFieldSlotClick = (slotIndex: number) => {
    if (turn !== 'player' || turnPhase !== 'organize') return;

    // Modo Sacrifício: selecionar Neutros a sacrificar
    if (sacrificeMode) {
      const card = playerField[slotIndex];
      // Se já tem os sacrifícios necessários, clique em slot vazio escolhe onde colocar
      if (sacrificeMode.selected.length >= sacrificeMode.needed) {
        if (card !== null) { addHistory('● Escolha um slot VAZIO para invocar'); return; }
        setPositionChoice({ card: sacrificeMode.card, slotIndex, replaced: null, sacrificed: sacrificeMode.selected });
        setSacrificeMode(null);
        return;
      }
      // Selecionar / desselecionar Neutro
      if (!card || card.level !== 'Neutro') { addHistory('● Selecione apenas Neutros para sacrificar'); return; }
      const alreadySelected = sacrificeMode.selected.includes(card.id);
      setSacrificeMode({
        ...sacrificeMode,
        selected: alreadySelected
          ? sacrificeMode.selected.filter(id => id !== card.id)
          : [...sacrificeMode.selected, card.id],
      });
      return;
    }

    if (!pendingCard) return;
    if (playedCombatantThisTurn) { addHistory('● Regra: máximo 1 combatente por turno na Fase de Organização'); return; }

    if (pendingCard.cardType === 'Normal' || pendingCard.cardType === 'Especial') {
      const check = checkSummonValidity(pendingCard, slotIndex);
      if (check.valid) {
        setPositionChoice({ card: pendingCard, slotIndex, replaced: check.replaced, sacrificed: [] });
        setPendingCard(null);
      } else {
        addHistory(`● Invocação inválida: ${pendingCard.name} (${pendingCard.level}) não pode ser colocado aqui`);
      }
    } else if (pendingCard.cardType === 'Bencao') {
      if (playerBlessing !== null) { addHistory('● Área de Bênção já ocupada!'); return; }
      setPlayerBlessing({ ...pendingCard, id: `pb-${Date.now()}`, position: 'attack', positionChangedThisTurn: false, attackedThisTurn: false });
      setPlayerHand(prev => prev.filter(c => c.id !== pendingCard.id));
      setPlayedCombatantThisTurn(true);
      addHistory(`● Bênção ativada: '${pendingCard.name}'`);
      setPendingCard(null);
    }
  };

  const handleReactionSlotClick = (slotIndex: number) => {
    if (turn !== 'player' || turnPhase !== 'organize' || !pendingCard) return;
    if (pendingCard.cardType !== 'Reacao') return;
    if (playerReactions[slotIndex] !== null) { addHistory('● Slot de Reação já ocupado!'); return; }
    if (playerReactions.filter(Boolean).length >= 3) { addHistory('● Máximo de 3 Reações no campo'); return; }
    const newCard = { ...pendingCard, id: `pr-${Date.now()}`, position: 'attack' as Position, positionChangedThisTurn: false, attackedThisTurn: false };
    setPlayerReactions(prev => { const n = [...prev]; n[slotIndex] = newCard; return n; });
    setPlayerHand(prev => prev.filter(c => c.id !== pendingCard.id));
    addHistory(`● Preparou Reação: '${pendingCard.name}'`);
    setPendingCard(null);
  };

  // ─── CONFIRMAR INVOCAÇÃO (após escolha de posição) ────────────────────────
  const confirmSummon = (position: Position) => {
    if (!positionChoice) return;
    const { card, slotIndex, replaced, sacrificed } = positionChoice;

    const newCard: Card = { ...card, id: `pf-${Date.now()}`, position, positionChangedThisTurn: false, attackedThisTurn: false };
    setPlayerField(prev => { const n = [...prev]; n[slotIndex] = newCard; return n; });

    // Substituição por Escala: carta substituída vai ao Exílio
    if (replaced) {
      setPlayerExile(prev => [...prev, replaced]);
      addHistory(`● ESCALA: '${card.name}' substituiu '${replaced.name}' → Exílio`);
    }

    // Substituição por Poder: Neutros sacrificados vão ao Exílio
    if (sacrificed.length > 0) {
      const toExile: Card[] = [];
      setPlayerField(prev => {
        const n = [...prev];
        for (const id of sacrificed) {
          const idx = n.findIndex(c => c?.id === id);
          if (idx !== -1 && n[idx]) { toExile.push(n[idx]!); n[idx] = null; }
        }
        return n;
      });
      setTimeout(() => setPlayerExile(prev => [...prev, ...toExile]), 50);
      addHistory(`● PODER: '${card.name}' invocado sacrificando ${sacrificed.length} Neutro(s) → Exílio`);
    }

    if (!replaced && sacrificed.length === 0) {
      addHistory(`● Invocou '${card.name}' em ${positionLabel[position]}`);
    }

    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setPlayedCombatantThisTurn(true);
    setPositionChoice(null);
  };

  // ─── MUDAR POSIÇÃO (Fase de Organização, 1x por combatente por turno) ─────
  const togglePosition = (slotIndex: number) => {
    if (turn !== 'player' || turnPhase !== 'organize') return;
    const card = playerField[slotIndex];
    if (!card) return;
    if (card.positionChangedThisTurn) { addHistory(`● ${card.name} já mudou de posição neste turno`); return; }
    // Ciclo: Ataque → Defesa Aberta → Defesa Fechada → Ataque
    const next: Record<Position, Position> = { 'attack': 'defense-open', 'defense-open': 'defense-closed', 'defense-closed': 'attack' };
    const newPos = next[card.position];
    setPlayerField(prev => prev.map((c, i) => i === slotIndex ? { ...c!, position: newPos, positionChangedThisTurn: true } : c));
    addHistory(`● ${card.name} → ${positionLabel[newPos]}`);
  };

  // ─── INICIAR MODO SACRIFÍCIO (Substituição por Poder) ─────────────────────
  const startSacrificeMode = (card: Card) => {
    const needed = LEVEL_ORDER.indexOf(card.level); // Bronze=1, Prata=2, Ouro=3
    if (needed <= 0) return;
    const neutroCount = playerField.filter(c => c && c.level === 'Neutro').length;
    if (neutroCount < needed) {
      addHistory(`● Sacrifício insuficiente: precisa de ${needed} Neutro(s), tem ${neutroCount}`);
      return;
    }
    setPendingCard(null);
    setSacrificeMode({ card, needed, selected: [] });
    addHistory(`● Modo Sacrifício ativado: selecione ${needed} Neutro(s) no campo`);
  };

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingScreen images={arenaImages} onComplete={() => setIsLoading(false)} message="INVOCANDO ARENA..." />;
  }

  // ─── HELPERS DE RENDERIZAÇÃO ──────────────────────────────────────────────
  const isInSacrificeSelect = (cardId: string) =>
    sacrificeMode !== null && sacrificeMode.selected.includes(cardId);

  const isValidSacrificeTarget = (card: Card | null) =>
    sacrificeMode !== null &&
    sacrificeMode.selected.length < sacrificeMode.needed &&
    card?.level === 'Neutro';

  const isValidSummonSlot = (slotIndex: number) => {
    if (!pendingCard || playedCombatantThisTurn) return false;
    if (pendingCard.cardType !== 'Normal' && pendingCard.cardType !== 'Especial') return false;
    // Power summon: slot vazio após selecionar sacrifícios
    if (sacrificeMode && sacrificeMode.selected.length >= sacrificeMode.needed) {
      return playerField[slotIndex] === null;
    }
    return checkSummonValidity(pendingCard, slotIndex).valid;
  };

  const positionRing: Record<Position, string> = {
    'attack':         'ring-red-500/70',
    'defense-open':   'ring-blue-500/70',
    'defense-closed': 'ring-gray-500/50',
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans text-white"
      style={{ cursor: attackingCardId ? 'crosshair' : 'default' }}
    >
      {/* Fundo */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url("/arena.webp")' }}>
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />
      </div>

      {/* Botão fechar */}
      <button onClick={onClose} className="absolute top-4 right-4 z-[60] p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full transition-all group">
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Sobreposição de transição de turno */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 backdrop-blur-2xl px-12 py-6 rounded-full border-2 border-yellow-500/50">
              <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-[0.4em] animate-pulse">{isTransitioning}</h2>
            </div>
          </motion.div>
        )}

        {/* Tela de fim de jogo */}
        {gameStatus !== 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center space-y-8 p-12 rounded-3xl border border-white/10 bg-white/5">
              <motion.h1 initial={{ y: 20 }} animate={{ y: 0 }}
                className={`text-7xl font-black uppercase tracking-tighter ${gameStatus === 'victory' ? 'text-emerald-400' : 'text-red-500'}`}>
                {gameStatus === 'victory' ? 'Vitória!' : 'Derrota'}
              </motion.h1>
              <p className="text-gray-400 max-w-md mx-auto text-sm">
                {gameStatus === 'victory'
                  ? 'Você reduziu os Pontos de Batalha de Malakor a zero!'
                  : 'Seus Pontos de Batalha chegaram a zero.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-4 bg-yellow-500 text-black font-black rounded-xl hover:scale-105 transition-transform uppercase tracking-widest">
                  Jogar Novamente
                </button>
                <button onClick={onClose} className="px-8 py-4 bg-white/10 font-black rounded-xl hover:bg-white/20 transition-all uppercase tracking-widest">
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative z-10 w-full h-full flex flex-col px-4 pt-2 pb-2 transition-opacity ${gameStatus !== 'playing' ? 'opacity-20 blur-sm' : ''}`}>

        {/* ── HUD Oponente (topo esquerdo) ── */}
        <div
          onClick={() => attackingCardId && handlePlayerAttack('direct')}
          className={`fixed top-5 left-10 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border transition-all z-50 ${attackingCardId ? 'ring-2 ring-red-500 border-red-500 cursor-crosshair shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105' : 'border-red-500/20'}`}
        >
          <div className="w-10 h-10 rounded-xl border border-red-500/30 overflow-hidden">
            <img src="/enemy_avatar.webp" className="w-full h-full object-cover grayscale" alt="Malakor" />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black text-red-400 uppercase tracking-wider">Malakor</div>
            <div className="flex items-center gap-2">
              <div className="w-28 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${(opponentPB / 30) * 100}%` }} className="h-full bg-red-600" />
              </div>
              <span className="text-[10px] font-black text-red-300 font-mono">{opponentPB}/30 PB</span>
            </div>
          </div>
        </div>

        {/* ── Mão do oponente (topo direito) ── */}
        <div className="fixed top-5 right-10 flex flex-col items-end gap-1 z-50">
          <span className="text-[7px] font-black text-red-500/30 uppercase tracking-[0.3em]">Mão do Oponente</span>
          <div className="flex -space-x-8">
            {Array.from({ length: Math.min(opponentHandCount, 8) }).map((_, i) => (
              <motion.div key={i} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}
                style={{ rotate: (i - Math.floor(opponentHandCount / 2)) * -3 }}
                className="w-12 h-18 rounded-lg border border-white/10 bg-[url('/fundo.webp')] bg-cover" />
            ))}
          </div>
        </div>

        {/* ── Área principal: campo + sidebar ── */}
        <div className="flex-1 flex gap-6 items-start justify-center pt-16">

          {/* SIDEBAR ESQUERDA: timer, fase, botões */}
          <div className="w-36 flex flex-col items-center gap-4 self-center shrink-0">

            {/* Indicador de fase */}
            <div className="text-center bg-black/60 border border-white/10 rounded-xl px-3 py-2 w-full">
              <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Fase Atual</div>
              <div className={`text-[9px] font-black uppercase tracking-wide ${turn === 'player' ? 'text-yellow-400' : 'text-red-400'}`}>
                {turn === 'player'
                  ? (turnPhase === 'organize' ? '⚙ Organização' : '⚔ Confronto')
                  : '◌ Oponente'}
              </div>
              <div className="text-[7px] text-white/20 font-mono mt-1">Turno {turnCount}</div>
            </div>

            {/* Timer */}
            {turn === 'player' && (
              <div className="flex flex-col items-center gap-1">
                <div className={`text-2xl font-black font-mono ${timeLeft <= 15 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                  {String(timeLeft).padStart(2, '0')}s
                </div>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${(timeLeft / 60) * 100}%` }} className={`h-full ${timeLeft <= 15 ? 'bg-red-500' : 'bg-yellow-400'}`} />
                </div>
              </div>
            )}

            {/* Botão: Avançar Fase (Organização → Confronto) */}
            {turn === 'player' && turnPhase === 'organize' && (
              <button onClick={advanceToConfront}
                className="flex items-center gap-1 px-3 py-3 rounded-lg font-black text-[8px] uppercase tracking-wide bg-blue-600/80 border border-blue-400/40 text-white hover:bg-blue-500 active:scale-95 transition-all w-full justify-center">
                <ChevronRight className="w-3 h-3" />
                Confronto
              </button>
            )}

            {/* Botão: Finalizar Turno */}
            {turn === 'player' && (
              <button onClick={handleEndTurn}
                className={`flex items-center gap-1 px-3 py-3 rounded-lg font-black text-[8px] uppercase tracking-wide transition-all w-full justify-center border
                  ${turnPhase === 'confront'
                    ? 'bg-emerald-600/90 border-emerald-400/40 text-white hover:bg-emerald-500 active:scale-95'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                <RefreshCw className="w-3 h-3" />
                Fim do Turno
              </button>
            )}

            {/* Modo Sacrifício: contador */}
            {sacrificeMode && (
              <div className="text-center bg-red-900/40 border border-red-500/30 rounded-lg px-2 py-2 w-full">
                <div className="text-[8px] font-black text-red-400 uppercase">Sacrifício</div>
                <div className="text-sm font-black text-white font-mono">{sacrificeMode.selected.length}/{sacrificeMode.needed}</div>
                <div className="text-[7px] text-white/40">Neutros selecionados</div>
                <button onClick={() => setSacrificeMode(null)} className="mt-1 text-[7px] text-red-400 hover:text-red-300 underline">Cancelar</button>
              </div>
            )}
          </div>

          {/* CAMPO DE BATALHA */}
          <div className="flex flex-col gap-2 flex-1 max-w-[820px]">

            {/* ── Lado do Oponente ── */}
            {/* Reações + Bênção do oponente */}
            <div className="flex gap-2 justify-center items-center">
              {opponentReactions.map((card, i) => (
                <div key={`opp-react-${i}`} className="w-24 h-36 rounded-xl border-dashed border-2 border-red-500/10 bg-red-500/5 flex items-center justify-center shrink-0">
                  {card
                    ? <div className="w-full h-full rounded-xl bg-cover bg-center opacity-70" style={{ backgroundImage: `url("${card.image}")` }} />
                    : <span className="text-[7px] font-black text-red-500/20 uppercase tracking-widest">Reação</span>}
                </div>
              ))}
              <div className="w-24 h-36 rounded-xl border-dashed border-2 border-red-500/10 bg-red-500/5 flex items-center justify-center shrink-0">
                {opponentBlessing
                  ? <div className="w-full h-full rounded-xl bg-cover bg-center opacity-70" style={{ backgroundImage: `url("${opponentBlessing.image}")` }} />
                  : <span className="text-[7px] font-black text-red-500/20 uppercase tracking-widest">Bênção</span>}
              </div>
              {/* Exílio do oponente */}
              <div onClick={() => opponentExile.length > 0 && setIsViewingExile('opponent')}
                className="w-24 h-36 rounded-xl border-dashed border-2 border-red-500/10 bg-red-500/5 flex flex-col items-center justify-center cursor-pointer hover:border-red-500/30 transition-all shrink-0 overflow-hidden">
                {opponentExile.length > 0
                  ? <div className="w-full h-full bg-cover bg-center grayscale opacity-40" style={{ backgroundImage: `url("${opponentExile.at(-1)?.image}")` }} />
                  : <Skull className="w-6 h-6 text-red-500/10" />}
                <div className="absolute text-[7px] font-black text-white/20 uppercase">Exílio ({opponentExile.length})</div>
              </div>
            </div>

            {/* Combatentes do oponente */}
            <div className="flex gap-2 justify-center items-center">
              {opponentField.map((card, i) => (
                <div key={`opp-field-${i}`}
                  onClick={() => attackingCardId && card && handlePlayerAttack(card.id)}
                  className={`w-24 h-36 rounded-xl border-2 border-dashed flex items-center justify-center relative shrink-0 transition-all
                    ${attackingCardId && card ? 'border-red-500 cursor-crosshair shadow-[0_0_12px_rgba(239,68,68,0.4)] scale-105' : 'border-red-500/15 bg-black/30'}`}
                >
                  <AnimatePresence mode="popLayout">
                    {card && (
                      <motion.div key={card.id}
                        initial={{ opacity: 0, scale: 0.2, y: -150 }}
                        animate={{
                          opacity: 1, scale: 1,
                          y: attackAnim?.id === card.id ? 100 : 0,
                          filter: attackAnim?.targetId === card.id ? 'brightness(2) hue-rotate(-40deg)' : 'brightness(1)',
                        }}
                        exit={{ opacity: 0, scale: 1.3, rotate: 30, filter: 'blur(8px)' }}
                        onMouseEnter={() => setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`w-full h-full relative rounded-xl overflow-hidden ring-2 ${positionRing[card.position]}`}
                        style={{
                          backgroundImage: card.position === 'defense-closed' ? 'url("/fundo.webp")' : `url("${card.image}")`,
                          backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                          transform: card.position === 'defense-open' ? 'rotate(90deg) scale(0.75)' : 'none',
                        }}
                        onClick={(e) => { e.stopPropagation(); if (attackingCardId && card) handlePlayerAttack(card.id); else setInspectedCard(card); }}
                      >
                        {!card.position.startsWith('defense') && (
                          <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                            <span className="text-[9px] font-black text-red-400">{card.atq}</span>
                            <span className="text-[9px] font-black text-blue-300">{card.def}</span>
                          </div>
                        )}
                        {card.position === 'defense-open' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-400/60" />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!card && <span className="text-[7px] font-black text-white/10 uppercase">Combatente</span>}
                </div>
              ))}
            </div>

            {/* Divisória */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent flex items-center justify-center relative my-1">
              <div className="absolute px-4 py-0.5 bg-black/80 border border-white/10 rounded-full text-[6px] font-black text-yellow-400/60 uppercase tracking-[0.4em]">
                Linha de Combate
              </div>
            </div>

            {/* Combatentes do jogador */}
            <div className="flex gap-2 justify-center items-center">
              {playerField.map((card, i) => {
                const isValidTarget = isValidSummonSlot(i) || (sacrificeMode && sacrificeMode.selected.length >= sacrificeMode.needed && !card);
                const isSacrificeTarget = isValidSacrificeTarget(card);
                const isSelected      = isInSacrificeSelect(card?.id ?? '');
                const isAttacking     = attackingCardId === card?.id;
                return (
                  <div key={`player-field-${i}`}
                    onClick={() => {
                      if (turnPhase === 'confront' && card && card.position === 'attack' && !card.attackedThisTurn) {
                        setAttackingCardId(prev => prev === card.id ? null : card.id);
                      } else {
                        handleFieldSlotClick(i);
                      }
                    }}
                    className={`w-24 h-36 rounded-xl border-2 border-dashed flex items-center justify-center relative shrink-0 transition-all cursor-pointer
                      ${isAttacking     ? 'border-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.5)] scale-110 z-20' : ''}
                      ${isValidTarget   ? 'border-emerald-400 bg-emerald-400/10 shadow-[0_0_12px_rgba(52,211,153,0.3)]' : ''}
                      ${isSacrificeTarget ? 'border-red-400 bg-red-400/10 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : ''}
                      ${isSelected      ? 'border-red-500 bg-red-500/20 shadow-[0_0_16px_rgba(239,68,68,0.5)]' : ''}
                      ${!isAttacking && !isValidTarget && !isSacrificeTarget && !isSelected ? 'border-white/10 bg-black/20' : ''}`}
                  >
                    <AnimatePresence mode="popLayout">
                      {card && (
                        <motion.div key={card.id}
                          initial={{ opacity: 0, scale: 0.2, y: 150 }}
                          animate={{
                            opacity: 1, scale: 1,
                            y: attackAnim?.id === card.id ? -100 : 0,
                            filter: attackAnim?.targetId === card.id ? 'brightness(2) hue-rotate(40deg)' : 'brightness(1)',
                          }}
                          exit={{ opacity: 0, scale: 1.3, rotate: -30, filter: 'blur(8px)' }}
                          onMouseEnter={() => setHoveredCard(card)}
                          onMouseLeave={() => setHoveredCard(null)}
                          className={`w-full h-full relative rounded-xl overflow-hidden ring-2 ${positionRing[card.position]}`}
                          style={{
                            backgroundImage: card.position === 'defense-closed' ? 'url("/fundo.webp")' : `url("${card.image}")`,
                            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                            transform: card.position === 'defense-open' ? 'rotate(90deg) scale(0.75)' : 'none',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (turnPhase === 'organize') {
                              // Na fase de organização, clique abre menu de ação
                              if (!pendingCard && !sacrificeMode) {
                                togglePosition(i);
                              } else {
                                handleFieldSlotClick(i);
                              }
                            } else if (turnPhase === 'confront' && card.position === 'attack' && !card.attackedThisTurn) {
                              setAttackingCardId(prev => prev === card.id ? null : card.id);
                            }
                          }}
                        >
                          {card.position !== 'defense-closed' && (
                            <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                              <span className="text-[9px] font-black text-red-400">{card.atq}</span>
                              <span className="text-[9px] font-black text-blue-300">{card.def}</span>
                            </div>
                          )}
                          {card.position === 'defense-open' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Shield className="w-5 h-5 text-blue-400/60" />
                            </div>
                          )}
                          {card.attackedThisTurn && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                              <span className="text-[6px] font-black text-white/50 uppercase">Atacou</span>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-[7px] font-black text-white">✓</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!card && <span className="text-[7px] font-black text-white/10 uppercase">Combatente</span>}
                  </div>
                );
              })}
              {/* Exílio do jogador */}
              <div onClick={() => playerExile.length > 0 && setIsViewingExile('player')}
                className="w-24 h-36 rounded-xl border-dashed border-2 border-white/5 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-all shrink-0 overflow-hidden relative">
                {playerExile.length > 0
                  ? <div className="w-full h-full bg-cover bg-center grayscale opacity-40" style={{ backgroundImage: `url("${playerExile.at(-1)?.image}")` }} />
                  : <History className="w-6 h-6 text-white/5" />}
                <div className="absolute text-[7px] font-black text-white/20 uppercase">Exílio ({playerExile.length})</div>
              </div>
            </div>

            {/* ── Lado do jogador: Reações + Bênção ── */}
            <div className="flex gap-2 justify-center items-center">
              {playerReactions.map((card, i) => (
                <div key={`player-react-${i}`}
                  onClick={() => handleReactionSlotClick(i)}
                  className={`w-24 h-36 rounded-xl border-dashed border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
                    ${pendingCard?.cardType === 'Reacao' && !card ? 'border-emerald-400 bg-emerald-400/10' : 'border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20'}`}>
                  {card
                    ? <div className="w-full h-full rounded-xl bg-cover bg-center opacity-80" style={{ backgroundImage: `url("${card.image}")` }} />
                    : <span className="text-[7px] font-black text-emerald-500/20 uppercase tracking-widest">Reação</span>}
                </div>
              ))}
              {/* Bênção do jogador */}
              <div onClick={() => handleFieldSlotClick(-1)}
                className={`w-24 h-36 rounded-xl border-dashed border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
                  ${pendingCard?.cardType === 'Bencao' && !playerBlessing ? 'border-yellow-400 bg-yellow-400/10' : 'border-yellow-500/10 bg-yellow-500/5 hover:border-yellow-500/20'}`}>
                {playerBlessing
                  ? <div className="w-full h-full rounded-xl bg-cover bg-center opacity-80" style={{ backgroundImage: `url("${playerBlessing.image}")` }} />
                  : <span className="text-[7px] font-black text-yellow-400/30 uppercase">Bênção</span>}
              </div>
              <div className="w-24 h-36 invisible shrink-0" />
            </div>
          </div>

          {/* SIDEBAR DIREITA: deck + log */}
          <div className="w-36 flex flex-col items-center gap-4 self-center shrink-0">
            {/* Deck */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-20 h-28 rounded-xl border-2 border-white/20 bg-cover bg-center shadow-xl overflow-hidden relative"
                style={{ backgroundImage: 'url("/fundo.webp")' }}>
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <span className="text-[8px] font-black text-white/30 uppercase">Deck</span>
              <span className="text-sm font-mono text-white/60 font-black">{playerDeck.length}</span>
            </div>

            {/* Log de batalha */}
            <div className="w-full max-h-48 overflow-y-auto bg-black/40 rounded-xl border border-white/5 p-2 custom-scrollbar">
              {history.slice(0, 15).map((msg, i) => (
                <div key={i} className={`text-[7px] font-mono py-0.5 border-b border-white/5 last:border-0 ${i === 0 ? 'text-yellow-400' : 'text-white/30'}`}>
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HUD Jogador (rodapé) ── */}
        <div className="w-full flex justify-between items-end px-10 mt-auto pointer-events-none">
          {/* Info do jogador */}
          <div className="pointer-events-auto flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/5 mb-2">
            <div className="w-10 h-10 rounded-xl border border-yellow-500/30 overflow-hidden">
              <img src="/hero_avatar.webp" className="w-full h-full object-cover" alt="Jogador" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white uppercase">Aeliana Solari</div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <motion.div animate={{ width: `${(playerPB / 30) * 100}%` }} className="h-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-black text-emerald-400 font-mono">{playerPB}/30 PB</span>
              </div>
            </div>
          </div>

          {/* Mão do jogador (centro-baixo) */}
          <div className="pointer-events-auto flex flex-col items-center gap-1 fixed bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Sua Mão</span>
            <div className="flex justify-center -space-x-3">
              <AnimatePresence>
                {playerHand.map((card, i) => {
                  const isSelected = pendingCard?.id === card.id;
                  return (
                    <motion.div key={card.id}
                      initial={{ opacity: 0, scale: 0.5, y: 100 }}
                      animate={{ opacity: 1, scale: 1, y: isSelected ? -28 : 0, zIndex: isSelected ? 50 : i, rotate: isSelected ? 0 : (i - Math.floor(playerHand.length / 2)) * 2.5 }}
                      exit={{ opacity: 0, scale: 0.5, y: -100 }}
                      onMouseEnter={() => setHoveredCard(card)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onContextMenu={(e) => { e.preventDefault(); setInspectedCard(card); }}
                      onClick={() => {
                        if (turn !== 'player' || turnPhase !== 'organize') return;
                        if (pendingCard?.id === card.id) { setPendingCard(null); setSacrificeMode(null); }
                        else { setPendingCard(card); setSacrificeMode(null); }
                      }}
                      className="relative w-20 h-28 cursor-pointer"
                    >
                      {isSelected && <div className="absolute -inset-2 bg-yellow-400/20 blur-lg rounded-full animate-pulse z-0" />}
                      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all"
                        style={{ borderColor: isSelected ? '#facc15' : undefined,
                          backgroundImage: card.image ? `url("${card.image}")` : 'url("/fundo.webp")',
                          backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#111' }}>
                        <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                          <span className="text-[8px] font-black text-red-400">{card.atq}</span>
                          <span className="text-[8px] font-black text-blue-300">{card.def}</span>
                        </div>
                        <div className={`absolute top-1 left-1 px-1 rounded text-[6px] font-black uppercase ${levelColor[card.level]}`}>
                          {card.level}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Painel de opções da carta selecionada (Power Sub) ── */}
      <AnimatePresence>
        {pendingCard && (pendingCard.cardType === 'Normal' || pendingCard.cardType === 'Especial') && pendingCard.level !== 'Neutro' && !sacrificeMode && !positionChoice && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[90] flex gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
            <span className="text-[9px] font-black text-white/40 uppercase self-center">Invocar por:</span>
            <button onClick={() => { /* Escala: highlight está no campo */ }}
              className="px-4 py-2 text-[9px] font-black uppercase bg-blue-700/60 hover:bg-blue-600 border border-blue-400/30 rounded-lg text-white transition-all">
              Escala (clique no campo)
            </button>
            <button onClick={() => startSacrificeMode(pendingCard)}
              className="px-4 py-2 text-[9px] font-black uppercase bg-red-800/60 hover:bg-red-700 border border-red-400/30 rounded-lg text-white transition-all">
              Sacrifício ({LEVEL_ORDER.indexOf(pendingCard.level)}× Neutro)
            </button>
            <button onClick={() => setPendingCard(null)}
              className="px-3 py-2 text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/40 transition-all">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal de escolha de posição ── */}
      <AnimatePresence>
        {positionChoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPositionChoice(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-black/90 border border-yellow-400/20 rounded-3xl p-8 max-w-lg w-full mx-4 cursor-default shadow-[0_0_60px_rgba(255,215,0,0.1)]">
              <h3 className="text-lg font-black text-yellow-400 uppercase tracking-[0.2em] text-center mb-1">Posição de Invocação</h3>
              <p className="text-[9px] text-white/30 text-center uppercase tracking-widest mb-6">Escolha a posição para "{positionChoice.card.name}"</p>
              <div className="flex gap-4 justify-center">
                {/* Ataque */}
                <button onClick={() => confirmSummon('attack')}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-white/10 hover:border-red-500 hover:bg-red-500/10 transition-all w-32">
                  <Sword className="w-8 h-8 text-white/30 group-hover:text-red-400 transition-colors" />
                  <div>
                    <div className="text-[10px] font-black text-white/60 group-hover:text-white uppercase">Ataque</div>
                    <div className="text-[7px] text-white/20 group-hover:text-white/40">Face-up vertical</div>
                  </div>
                </button>
                {/* Defesa Aberta */}
                <button onClick={() => confirmSummon('defense-open')}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-white/10 hover:border-blue-400 hover:bg-blue-400/10 transition-all w-32">
                  <Shield className="w-8 h-8 text-white/30 group-hover:text-blue-400 transition-colors" />
                  <div>
                    <div className="text-[10px] font-black text-white/60 group-hover:text-white uppercase">Def. Aberta</div>
                    <div className="text-[7px] text-white/20 group-hover:text-white/40">Face-up horizontal</div>
                  </div>
                </button>
                {/* Defesa Fechada */}
                <button onClick={() => confirmSummon('defense-closed')}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-white/10 hover:border-gray-400 hover:bg-gray-400/10 transition-all w-32">
                  <Eye className="w-8 h-8 text-white/30 group-hover:text-gray-300 transition-colors" />
                  <div>
                    <div className="text-[10px] font-black text-white/60 group-hover:text-white uppercase">Def. Fechada</div>
                    <div className="text-[7px] text-white/20 group-hover:text-white/40">Face-down oculto</div>
                  </div>
                </button>
              </div>
              <button onClick={() => setPositionChoice(null)} className="mt-6 w-full py-2 text-[8px] font-black uppercase text-white/20 hover:text-white/50 transition-colors tracking-widest">
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal de inspeção de carta ── */}
      <AnimatePresence>
        {inspectedCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInspectedCard(null)}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl cursor-pointer p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="flex gap-8 max-w-3xl w-full bg-black/40 rounded-2xl border border-white/5 p-4 cursor-default">
              <div className="w-56 shrink-0">
                <img src={inspectedCard.image || '/fundo.webp'} className="w-full h-auto object-contain rounded-xl" alt={inspectedCard.name} />
              </div>
              <div className="flex-1 flex flex-col gap-4 py-2">
                <div className="border-l-4 border-red-500 pl-4">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${levelColor[inspectedCard.level]}`}>{inspectedCard.level}</span>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mt-1">{inspectedCard.name}</h2>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-black text-white/40 uppercase">
                  <span>Elemento: <span className="text-white/70">{inspectedCard.element}</span></span>
                  <span>Raça: <span className="text-white/70">{inspectedCard.raca}</span></span>
                  <span>Classe: <span className="text-white/70">{inspectedCard.classe}</span></span>
                  <span>Tipo: <span className="text-white/70">{inspectedCard.cardType}</span></span>
                </div>
                <div className="flex-1 p-4 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-gray-300 text-xs leading-relaxed italic">"{inspectedCard.desc}"</p>
                  {inspectedCard.hasPierce && (
                    <p className="text-yellow-400 text-[9px] font-black mt-2 uppercase">★ Perfuração de Bloqueio</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-center">
                    <div className="text-[8px] font-black text-red-400 uppercase">ATQ</div>
                    <div className="text-4xl font-black text-white">{inspectedCard.atq}</div>
                  </div>
                  <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl text-center">
                    <div className="text-[8px] font-black text-blue-400 uppercase">DEF</div>
                    <div className="text-4xl font-black text-white">{inspectedCard.def}</div>
                  </div>
                </div>
                <button onClick={() => setInspectedCard(null)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-black uppercase tracking-widest text-xs text-white/50 hover:text-white transition-all rounded-xl">
                  Fechar [ESC]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Painel de Exílio ── */}
      <AnimatePresence>
        {isViewingExile && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            className="fixed top-1/2 -translate-y-1/2 right-4 z-[110] w-64 max-h-[80vh] flex flex-col bg-black/70 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                {isViewingExile === 'player' ? <History className="w-4 h-4 text-white/60" /> : <Skull className="w-4 h-4 text-red-400" />}
                <h2 className="text-[10px] font-black text-white uppercase tracking-widest">
                  {isViewingExile === 'player' ? 'Seu Exílio' : 'Exílio de Malakor'}
                </h2>
              </div>
              <button onClick={() => setIsViewingExile(null)} className="p-1 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2">
              {(isViewingExile === 'player' ? playerExile : opponentExile).map((card, i) => (
                <div key={i} onMouseEnter={() => setHoveredCard(card)} onMouseLeave={() => setHoveredCard(null)}
                  className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 cursor-pointer">
                  <img src={card.image} className="w-full h-full object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" alt={card.name} />
                </div>
              ))}
              {(isViewingExile === 'player' ? playerExile : opponentExile).length === 0 && (
                <div className="col-span-2 py-10 text-center opacity-20">
                  <Ghost className="w-8 h-8 mx-auto" /><p className="text-[9px] font-black uppercase mt-2">Vazio</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preview de carta ao hover (lado esquerdo) ── */}
      <div className="fixed top-1/2 left-6 -translate-y-1/2 z-40 w-64 pointer-events-none">
        <AnimatePresence>
          {hoveredCard && (
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-black/85 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
              <div className="aspect-[2/3]">
                <img src={hoveredCard.image || '/fundo.webp'} className="w-full h-full object-contain" alt={hoveredCard.name} />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${levelColor[hoveredCard.level]}`}>{hoveredCard.level}</span>
                  <span className="text-white/30 text-[7px] font-black uppercase">{hoveredCard.element} · {hoveredCard.raca}</span>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">{hoveredCard.name}</h3>
                <div className="flex gap-4">
                  <span className="text-[10px] font-black text-red-400">ATQ: {hoveredCard.atq}</span>
                  <span className="text-[10px] font-black text-blue-300">DEF: {hoveredCard.def}</span>
                </div>
                {hoveredCard.desc && (
                  <p className="text-[9px] text-white/40 leading-relaxed italic border-t border-white/5 pt-2">{hoveredCard.desc}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
