import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sword, Shield, Eye, Wifi, WifiOff, History, Skull, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type CardLevel = 'Neutro' | 'Bronze' | 'Prata' | 'Ouro';
type CardType  = 'Normal' | 'Especial' | 'Bencao' | 'Reacao';
type Position  = 'attack' | 'defense-open' | 'defense-closed';
type TurnPhase = 'organize' | 'confront';

interface Card {
  id: string; name: string; level: CardLevel; cardType: CardType;
  element: 'Agua' | 'Terra' | 'Luz' | 'Trevas' | 'Vento' | 'Fogo';
  raca: string; classe: string; atq: number; def: number; desc: string; image?: string;
  hasPierce?: boolean; revealEffect?: string;
  position: Position; positionChangedThisTurn: boolean;
  attackedThisTurn: boolean; summonedThisTurn: boolean;
}

interface PVPArenaProps {
  roomId: string;
  isHost: boolean;
  userId: string;
  username: string;
  opponentName: string;
  onClose: () => void;
}

// ─── CATÁLOGO (igual Arena.tsx) ───────────────────────────────────────────────
const CATALOG = [
  { name: 'Recruta 06',     level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Terra' as const, raca: 'Humano', classe: 'Guerreiro',  atq: 8,  def: 10, desc: '', img: '/RECK 1/NIVEL NEUTRO/06 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Patrulheiro 11', level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Vento' as const, raca: 'Humano', classe: 'Arqueiro',   atq: 10, def: 7,  desc: '', img: '/RECK 1/NIVEL NEUTRO/11 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Sentinela 43',   level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Terra' as const, raca: 'Humano', classe: 'Guardião',   atq: 7,  def: 12, desc: '', img: '/RECK 1/NIVEL NEUTRO/43 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Aldeão 49',      level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Terra' as const, raca: 'Humano', classe: 'Civil',      atq: 5,  def: 8,  desc: '', img: '/RECK 1/NIVEL NEUTRO/49 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Militante 50',   level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Fogo'  as const, raca: 'Humano', classe: 'Lutador',    atq: 12, def: 6,  desc: '', img: '/RECK 1/NIVEL NEUTRO/50 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Guarda 51',      level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Luz'   as const, raca: 'Humano', classe: 'Guardião',   atq: 9,  def: 11, desc: '', img: '/RECK 1/NIVEL NEUTRO/51 - Copia - Copia - Copia - Copia - Copia - Copia.webp' },
  { name: 'Vigilante 53',   level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Vento' as const, raca: 'Humano', classe: 'Batedor',    atq: 11, def: 8,  desc: '', img: '/RECK 1/NIVEL NEUTRO/53 - Copia - Copia - Copia.webp' },
  { name: 'Soldado 60',     level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Fogo'  as const, raca: 'Humano', classe: 'Guerreiro',  atq: 13, def: 9,  desc: '', img: '/RECK 1/NIVEL NEUTRO/60.webp' },
  { name: 'Mercenário 67',  level: 'Neutro' as CardLevel, cardType: 'Normal'  as CardType, element: 'Trevas'as const, raca: 'Humano', classe: 'Mercenário', atq: 14, def: 7,  desc: '', img: '/RECK 1/NIVEL NEUTRO/67 - Copia - Copia.webp' },
  { name: 'Andarilho',      level: 'Neutro' as CardLevel, cardType: 'Especial'as CardType, element: 'Vento' as const, raca: 'Humano', classe: 'Viajante',   atq: 9,  def: 9,  desc: 'Revelar: compre 1 carta.', img: '/RECK 1/NIVEL NEUTRO/Design sem nome (10).webp', revealEffect: 'draw' },
  { name: 'Caelan, Lâmina do Juramento', level: 'Bronze' as CardLevel, cardType: 'Especial' as CardType, element: 'Luz'   as const, raca: 'Humano', classe: 'Paladino',   atq: 18, def: 14, desc: '', img: '/RECK 1/PRATA/Caelan, Lâmina do Juramento.webp', revealEffect: 'buff-neutro-atq' },
  { name: 'Fargan, Lâmina do Caminho',   level: 'Bronze' as CardLevel, cardType: 'Normal'   as CardType, element: 'Trevas'as const, raca: 'Humano', classe: 'Caçador',    atq: 20, def: 12, desc: '', img: '/RECK 1/PRATA/Fargan, Lâmina do Caminho Estreito (1).webp' },
  { name: 'Raskel, Sangue da Campanha',  level: 'Prata'  as CardLevel, cardType: 'Especial' as CardType, element: 'Fogo'  as const, raca: 'Humano', classe: 'Comandante', atq: 26, def: 20, desc: '', img: '/RECK 1/PRATA/_Raskel, Sangue da Campanha.webp', revealEffect: 'direct-damage-5' },
  { name: 'Aldren, Veterano da Fronteira',level:'Ouro'   as CardLevel, cardType: 'Normal'   as CardType, element: 'Terra' as const, raca: 'Humano', classe: 'General',    atq: 38, def: 30, desc: '', img: '/RECK 1/OURO/Aldren, Veterano da Fronteira Quebrada (5).webp', hasPierce: true },
  { name: 'Iskand, Sobrevivente',         level:'Ouro'   as CardLevel, cardType: 'Especial' as CardType, element: 'Trevas'as const, raca: 'Humano', classe: 'Campeão',    atq: 40, def: 28, desc: '', img: '/RECK 1/OURO/Iskand, Sobrevivente do Campo Vermelho.webp', revealEffect: 'destroy-weak' },
];

const LEVEL_COPIES: Record<CardLevel, number> = { Neutro: 3, Bronze: 3, Prata: 2, Ouro: 1 };
const LEVEL_ORDER: CardLevel[] = ['Neutro', 'Bronze', 'Prata', 'Ouro'];
const positionLabel: Record<Position, string> = { attack: 'Ataque', 'defense-open': 'Defesa Aberta', 'defense-closed': 'Defesa Fechada' };
const positionRing: Record<Position, string> = { attack: 'ring-red-500/70', 'defense-open': 'ring-blue-500/70', 'defense-closed': 'ring-gray-500/50' };

const DECK_POOL: Card[] = CATALOG.flatMap((e, ci) =>
  Array.from({ length: LEVEL_COPIES[e.level] }, (_, copy) => ({
    id: `pvp-base-${ci}-${copy}`, name: e.name, level: e.level, cardType: e.cardType,
    element: e.element, raca: e.raca, classe: e.classe, atq: e.atq, def: e.def, desc: e.desc,
    image: e.img, hasPierce: e.hasPierce, revealEffect: e.revealEffect,
    position: 'attack' as Position, positionChangedThisTurn: false, attackedThisTurn: false, summonedThisTurn: false,
  }))
);

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── HOOK ESCALA ──────────────────────────────────────────────────────────────
function useArenaScale(dw = 1280, dh = 768) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const upd = () => setScale(Math.max(0.5, Math.min(Math.min(window.innerWidth / dw, window.innerHeight / dh), 1.5)));
    upd(); window.addEventListener('resize', upd); return () => window.removeEventListener('resize', upd);
  }, [dw, dh]);
  return scale;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function PVPArena({ roomId, isHost, userId, username, opponentName, onClose }: PVPArenaProps) {
  const arenaScale = useArenaScale();

  // ── Conexão ─────────────────────────────────────────────────────────────────
  const [opponentConnected, setOpponentConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Estado do meu lado ───────────────────────────────────────────────────────
  const [myDeck,  setMyDeck]  = useState<Card[]>([]);
  const [myHand,  setMyHand]  = useState<Card[]>([]);
  const [myField, setMyField] = useState<(Card | null)[]>(Array(5).fill(null));
  const [myBlessing, setMyBlessing] = useState<Card | null>(null);
  const [myPB,    setMyPB]    = useState(30);
  const [myExile, setMyExile] = useState<Card[]>([]);

  // ── Estado do oponente (recebido via broadcast) ──────────────────────────────
  const [opponentField,    setOpponentField]    = useState<(Card | null)[]>(Array(5).fill(null));
  const [opponentBlessing, setOpponentBlessing] = useState<Card | null>(null);
  const [opponentHandCount,setOpponentHandCount]= useState(5);
  const [opponentPB,       setOpponentPB]       = useState(30);
  const [opponentExile,    setOpponentExile]    = useState<Card[]>([]);

  // ── Controle de turno ────────────────────────────────────────────────────────
  const [isMyTurn, setIsMyTurn]         = useState(false);
  const [turnPhase, setTurnPhase]       = useState<TurnPhase>('organize');
  const [turnCount, setTurnCount]       = useState(1);
  const [playedThisTurn, setPlayedThisTurn] = useState(false);
  const [gameOver, setGameOver]         = useState<{ winner: string; isMe: boolean } | null>(null);
  const [timeLeft, setTimeLeft]         = useState(30);
  const [isTransitioning, setIsTransitioning] = useState<string | null>(null);

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [pendingCard,     setPendingCard]     = useState<Card | null>(null);
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);
  const [positionMenu,    setPositionMenu]    = useState<number | null>(null);
  const [positionChoice,  setPositionChoice]  = useState<{ card: Card; slotIndex: number; replaced: Card | null; sacrificed: string[] } | null>(null);
  const [sacrificeMode,   setSacrificeMode]   = useState<{ card: Card; needed: number; selected: string[] } | null>(null);
  const [history,         setHistory]         = useState<string[]>(['● PVP — MODO TESTE', '● Conectando...']);
  const [attackAnim,      setAttackAnim]      = useState<{ id: string; targetId: string } | null>(null);

  // ── Refs para closures assíncronas ───────────────────────────────────────────
  const myFieldRef       = useRef(myField);
  const myPBRef          = useRef(myPB);
  const myDeckRef        = useRef(myDeck);
  const myHandRef        = useRef(myHand);
  const opponentFieldRef = useRef(opponentField);
  const opponentPBRef    = useRef(opponentPB);
  const isMyTurnRef      = useRef(isMyTurn);
  const myBlessingRef    = useRef(myBlessing);
  const gameStartedRef   = useRef(false); // impede dealCards ser chamado mais de uma vez

  useEffect(() => { myFieldRef.current       = myField;       }, [myField]);
  useEffect(() => { myPBRef.current          = myPB;          }, [myPB]);
  useEffect(() => { myDeckRef.current        = myDeck;        }, [myDeck]);
  useEffect(() => { myHandRef.current        = myHand;        }, [myHand]);
  useEffect(() => { opponentFieldRef.current = opponentField; }, [opponentField]);
  useEffect(() => { opponentPBRef.current    = opponentPB;    }, [opponentPB]);
  useEffect(() => { isMyTurnRef.current      = isMyTurn;      }, [isMyTurn]);
  useEffect(() => { myBlessingRef.current    = myBlessing;    }, [myBlessing]);

  const addHistory = (msg: string) => setHistory(prev => [msg, ...prev.slice(0, 49)]);

  // ── Distribuir cartas ────────────────────────────────────────────────────────
  const dealCards = () => {
    const pfx = isHost ? 'h' : 'g';
    const shuffled = shuffle([...DECK_POOL]);
    const hand = shuffled.slice(0, 5).map((c, i) => ({ ...c, id: `${pfx}h-${i}-${Date.now()}` }));
    const deck = shuffled.slice(5).map((c, i) => ({ ...c, id: `${pfx}d-${i}-${Date.now()}` }));
    myDeckRef.current = deck;
    myHandRef.current = hand;
    setMyDeck(deck);
    setMyHand(hand);
  };

  // ── Comprar carta ────────────────────────────────────────────────────────────
  const drawCard = () => {
    const deck = myDeckRef.current;
    if (deck.length === 0) {
      endGame(false, 'Deck esgotado');
      return;
    }
    const [next, ...rest] = deck;
    const drawn = { ...next, id: `draw-${Date.now()}-${Math.random()}` };
    myDeckRef.current = rest;
    setMyDeck(rest);
    setMyHand(prev => { const h = [...prev, drawn]; myHandRef.current = h; return h; });
    addHistory('● Comprou 1 carta');
    channelRef.current?.send({
      type: 'broadcast', event: 'draw:done',
      payload: { handCount: myHandRef.current.length },
    });
  };

  // ── Fim de jogo ──────────────────────────────────────────────────────────────
  const endGame = (iWin: boolean, reason: string) => {
    setGameOver({ winner: iWin ? username : opponentName, isMe: iWin });
    channelRef.current?.send({
      type: 'broadcast', event: 'game:over',
      payload: { winnerIsHost: isHost === iWin, reason },
    });
  };

  // ── Broadcast campo ──────────────────────────────────────────────────────────
  const broadcastField = (field?: (Card | null)[], blessing?: Card | null) => {
    channelRef.current?.send({
      type: 'broadcast', event: 'field:update',
      payload: {
        senderIsHost: isHost,
        field: field ?? myFieldRef.current,
        blessing: blessing !== undefined ? blessing : myBlessingRef.current,
        handCount: myHandRef.current.length,
      },
    });
  };

  // ── Canal Supabase ───────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel(`pvp:${roomId}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOpponentConnected(count >= 2);

        if (count >= 2 && !gameStartedRef.current) {
          gameStartedRef.current = true;
          dealCards();
          if (isHost) {
            setIsMyTurn(true); isMyTurnRef.current = true;
            setTurnPhase('organize');
            addHistory(`● Seu turno — Fase de Organização`);
            setIsTransitioning('SEU TURNO');
            setTimeout(() => setIsTransitioning(null), 1500);
          } else {
            addHistory(`● Turno de ${opponentName}`);
            setIsTransitioning(`TURNO DE ${opponentName.toUpperCase()}`);
            setTimeout(() => setIsTransitioning(null), 1500);
          }
        }
      })
      .on('broadcast', { event: 'field:update' }, ({ payload }) => {
        if (payload.senderIsHost === isHost) return; // próprio
        setOpponentField(payload.field);
        opponentFieldRef.current = payload.field;
        setOpponentBlessing(payload.blessing ?? null);
        setOpponentHandCount(payload.handCount);
      })
      .on('broadcast', { event: 'draw:done' }, ({ payload }) => {
        setOpponentHandCount(payload.handCount);
      })
      .on('broadcast', { event: 'battle:result' }, ({ payload }) => {
        // Perspectiva absoluta: hostField/guestField
        const myNewField = isHost ? payload.hostField : payload.guestField;
        const opNewField = isHost ? payload.guestField : payload.hostField;
        const myNewPB    = isHost ? payload.hostPB    : payload.guestPB;
        const opNewPB    = isHost ? payload.guestPB   : payload.hostPB;
        setMyField(myNewField);       myFieldRef.current       = myNewField;
        setOpponentField(opNewField); opponentFieldRef.current = opNewField;
        setMyPB(myNewPB);             myPBRef.current          = myNewPB;
        setOpponentPB(opNewPB);       opponentPBRef.current    = opNewPB;
        addHistory(`● ${payload.log}`);
        if (myNewPB <= 0)  setGameOver({ winner: opponentName, isMe: false });
        if (opNewPB <= 0)  setGameOver({ winner: username,     isMe: true  });
      })
      .on('broadcast', { event: 'turn:end' }, ({ payload }) => {
        // Oponente terminou o turno — atualiza estado e começa meu turno
        const opNewField    = isHost ? payload.guestField    : payload.hostField;
        const opNewBlessing = isHost ? payload.guestBlessing : payload.hostBlessing;
        const opNewPB       = isHost ? payload.guestPB       : payload.hostPB;
        const opExiledCards: Card[] = isHost ? (payload.guestExile ?? []) : (payload.hostExile ?? []);

        setOpponentField(opNewField ?? opponentFieldRef.current);
        opponentFieldRef.current = opNewField ?? opponentFieldRef.current;
        setOpponentBlessing(opNewBlessing ?? null);
        setOpponentPB(opNewPB);       opponentPBRef.current = opNewPB;
        if (opExiledCards.length) setOpponentExile(prev => [...prev, ...opExiledCards]);

        // Comprar e iniciar meu turno
        drawCard();
        setIsMyTurn(true);             isMyTurnRef.current = true;
        setTurnPhase('organize');
        setPlayedThisTurn(false);
        setPendingCard(null); setAttackingCardId(null); setSacrificeMode(null); setPositionChoice(null);
        setTurnCount(prev => prev + 1);
        setIsTransitioning('SEU TURNO');
        setTimeout(() => setIsTransitioning(null), 1500);
        addHistory('● SEU TURNO — Fase de Compra automática');
      })
      .on('broadcast', { event: 'game:over' }, ({ payload }) => {
        const winner = (payload.winnerIsHost === isHost) ? username : opponentName;
        setGameOver({ winner, isMe: payload.winnerIsHost === isHost });
      });

    channel.subscribe(async (s) => {
      if (s === 'SUBSCRIBED') await channel.track({ username });
    });

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isHost, userId, username]);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMyTurn || !opponentConnected || gameOver || isTransitioning) return;
    setTimeLeft(30);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleEndTurn(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, turnPhase, opponentConnected, gameOver, isTransitioning]);

  // ── Cálculo de batalha ───────────────────────────────────────────────────────
  const resolveBattle = (attacker: Card, defender: Card): { log: string; myField: (Card | null)[]; opField: (Card | null)[]; myPB: number; opPB: number } => {
    let mf = [...myFieldRef.current];
    let of = [...opponentFieldRef.current];
    let mPB = myPBRef.current;
    let oPB = opponentPBRef.current;
    let log = '';

    const destroyMine    = (id: string) => { mf = mf.map(c => c?.id === id ? null : c); setMyExile(prev => [...prev, attacker]); };
    const destroyOpponent= (id: string) => { of = of.map(c => c?.id === id ? null : c); setOpponentExile(prev => [...prev, defender]); };

    if (defender.position === 'attack') {
      if (attacker.atq > defender.atq) {
        const d = attacker.atq - defender.atq; oPB = Math.max(0, oPB - d); destroyOpponent(defender.id);
        log = `${attacker.name} vence! -${d} PB a ${opponentName}`;
      } else if (attacker.atq < defender.atq) {
        const d = defender.atq - attacker.atq; mPB = Math.max(0, mPB - d); destroyMine(attacker.id);
        log = `${defender.name} contra-ataca! -${d} PB a ${username}`;
      } else {
        destroyMine(attacker.id); destroyOpponent(defender.id);
        log = `ANULAÇÃO! Ambos destruídos.`;
      }
    } else {
      if (attacker.atq > defender.def) {
        if (attacker.hasPierce) {
          const d = attacker.atq - defender.def; destroyOpponent(defender.id); oPB = Math.max(0, oPB - d);
          log = `PERFURAÇÃO! ${attacker.name} destrói ${defender.name} e causa -${d} PB`;
        } else {
          destroyOpponent(defender.id);
          log = `${defender.name} destruído! (sem dano de PB)`;
        }
      } else if (attacker.atq < defender.def) {
        const d = defender.def - attacker.atq; mPB = Math.max(0, mPB - d);
        log = `${defender.name} resiste! Recuo de ${d} PB a ${username}`;
      } else {
        log = `Forças iguais! Nenhum destruído.`;
      }
    }
    return { log, myField: mf, opField: of, myPB: mPB, opPB: oPB };
  };

  // ── Aplicar efeito de revelação (meu lado) ───────────────────────────────────
  const applyRevealEffect = (card: Card) => {
    switch (card.revealEffect) {
      case 'draw': drawCard(); addHistory(`● [Revelar] ${card.name}: comprou 1 carta`); break;
      case 'buff-neutro-atq':
        setMyField(prev => prev.map(c => c && c.level === 'Neutro' ? { ...c, atq: c.atq + 3 } : c));
        addHistory(`● [Revelar] ${card.name}: Neutros aliados +3 ATQ`); break;
      case 'direct-damage-5': {
        const n = Math.max(0, opponentPBRef.current - 5);
        setOpponentPB(n); opponentPBRef.current = n;
        addHistory(`● [Revelar] ${card.name}: 5 de dano direto ao oponente!`); break;
      }
      case 'destroy-weak': {
        const weak = opponentFieldRef.current.find(c => c && c.atq <= 20);
        if (weak) {
          setOpponentField(prev => prev.map(c => c?.id === weak.id ? null : c));
          setOpponentExile(prev => [...prev, weak]);
          addHistory(`● [Revelar] ${card.name}: ${weak.name} destruído!`);
        } break;
      }
    }
  };

  // ── Ataque ───────────────────────────────────────────────────────────────────
  const handleAttack = async (targetId: string | 'direct') => {
    if (!attackingCardId || !isMyTurn || turnPhase !== 'confront') return;
    const attacker = myFieldRef.current.find(c => c?.id === attackingCardId);
    if (!attacker || attacker.position !== 'attack' || attacker.attackedThisTurn || attacker.summonedThisTurn) {
      setAttackingCardId(null); return;
    }
    if (turnCount === 1 && isHost) {
      addHistory('● Regra: não pode atacar no 1º turno'); setAttackingCardId(null); return;
    }

    if (targetId === 'direct') {
      if (opponentFieldRef.current.some(c => c !== null)) {
        addHistory('● Destrua os combatentes antes de atacar diretamente!'); setAttackingCardId(null); return;
      }
      setAttackAnim({ id: attacker.id, targetId: 'direct' });
      await new Promise(r => setTimeout(r, 400));
      const dmg = attacker.atq;
      const newOpPB = Math.max(0, opponentPBRef.current - dmg);
      setOpponentPB(newOpPB); opponentPBRef.current = newOpPB;
      addHistory(`● ATAQUE DIRETO! ${attacker.name} (${dmg}) → -${dmg} PB a ${opponentName}`);

      const updField = myFieldRef.current.map(c => c?.id === attackingCardId ? { ...c, attackedThisTurn: true } : c);
      setMyField(updField); myFieldRef.current = updField;

      // Broadcast ataque direto como battle:result
      channelRef.current?.send({
        type: 'broadcast', event: 'battle:result',
        payload: {
          hostField:  isHost ? updField : opponentFieldRef.current,
          guestField: isHost ? opponentFieldRef.current : updField,
          hostPB:     isHost ? myPBRef.current : newOpPB,
          guestPB:    isHost ? newOpPB : myPBRef.current,
          log: `ATAQUE DIRETO! ${attacker.name} causou -${dmg} PB a ${opponentName}`,
        },
      });

      setAttackAnim(null);
      if (newOpPB <= 0) setGameOver({ winner: username, isMe: true });
    } else {
      let defender = opponentFieldRef.current.find(c => c?.id === targetId);
      if (!defender) { setAttackingCardId(null); return; }

      setAttackAnim({ id: attacker.id, targetId: defender.id });
      await new Promise(r => setTimeout(r, 400));

      // Revelação face-down
      if (defender.position === 'defense-closed') {
        defender = { ...defender, position: 'defense-open' };
        const updOp = opponentFieldRef.current.map(c => c?.id === targetId ? defender! : c);
        setOpponentField(updOp); opponentFieldRef.current = updOp;
        if (defender.cardType === 'Especial' && defender.revealEffect) {
          addHistory(`● REVELAÇÃO! ${defender.name} ativa efeito (oponente)!`);
          // Oponente aplica o efeito dele no lado dele — nós apenas atualizamos o campo
        } else {
          addHistory(`● Revelado: ${defender.name}`);
        }
      }

      const result = resolveBattle(attacker, defender);
      setMyField(result.myField);       myFieldRef.current       = result.myField;
      setOpponentField(result.opField); opponentFieldRef.current = result.opField;
      setMyPB(result.myPB);             myPBRef.current          = result.myPB;
      setOpponentPB(result.opPB);       opponentPBRef.current    = result.opPB;
      addHistory(`● ${result.log}`);

      // Marca atacante
      const finalMf = result.myField.map(c => c?.id === attackingCardId ? { ...c, attackedThisTurn: true } : c);
      setMyField(finalMf); myFieldRef.current = finalMf;

      channelRef.current?.send({
        type: 'broadcast', event: 'battle:result',
        payload: {
          hostField:  isHost ? finalMf        : result.opField,
          guestField: isHost ? result.opField : finalMf,
          hostPB:     isHost ? result.myPB    : result.opPB,
          guestPB:    isHost ? result.opPB    : result.myPB,
          log: result.log,
        },
      });

      setAttackAnim(null);
      if (result.myPB  <= 0) setGameOver({ winner: opponentName, isMe: false });
      if (result.opPB  <= 0) setGameOver({ winner: username,     isMe: true  });
    }
    setAttackingCardId(null);
  };

  // ── Fim do turno ─────────────────────────────────────────────────────────────
  const handleEndTurn = () => {
    if (!isMyTurnRef.current) return;
    isMyTurnRef.current = false;

    // Bênção expira
    let exiledThisTurn: Card[] = [];
    if (myBlessingRef.current) {
      exiledThisTurn = [myBlessingRef.current];
      setMyExile(prev => [...prev, myBlessingRef.current!]);
      setMyBlessing(null); myBlessingRef.current = null;
    }

    // Reset flags dos meus combatentes
    const resetField = myFieldRef.current.map(c =>
      c ? { ...c, positionChangedThisTurn: false, attackedThisTurn: false, summonedThisTurn: false } : null
    );
    setMyField(resetField); myFieldRef.current = resetField;

    setIsMyTurn(false);
    setPendingCard(null); setAttackingCardId(null); setSacrificeMode(null); setPositionChoice(null);

    channelRef.current?.send({
      type: 'broadcast', event: 'turn:end',
      payload: {
        hostField:    isHost ? resetField                    : opponentFieldRef.current,
        guestField:   isHost ? opponentFieldRef.current      : resetField,
        hostBlessing: isHost ? null                          : null,
        guestBlessing:isHost ? null                          : null,
        hostPB:       isHost ? myPBRef.current               : opponentPBRef.current,
        guestPB:      isHost ? opponentPBRef.current         : myPBRef.current,
        hostExile:    isHost ? exiledThisTurn                : [],
        guestExile:   isHost ? []                            : exiledThisTurn,
      },
    });

    setIsTransitioning(`TURNO DE ${opponentName.toUpperCase()}`);
    setTimeout(() => setIsTransitioning(null), 1500);
    addHistory(`● Turno de ${opponentName}`);
  };

  // ── Avançar para Confronto ───────────────────────────────────────────────────
  const advanceToConfront = () => {
    if (!isMyTurn || turnPhase !== 'organize') return;
    setTurnPhase('confront');
    setPendingCard(null); setSacrificeMode(null); setPositionChoice(null);
    addHistory('● Fase de Confronto');
  };

  // ── Verificar invocação válida ───────────────────────────────────────────────
  const checkSummonValidity = (card: Card, slotIndex: number) => {
    const existing = myField[slotIndex];
    const lvlIdx = LEVEL_ORDER.indexOf(card.level);
    if (card.level === 'Neutro' && existing === null) return { valid: true, replaced: null };
    if (existing !== null && lvlIdx > 0 && LEVEL_ORDER.indexOf(existing.level) === lvlIdx - 1)
      return { valid: true, replaced: existing };
    return { valid: false, replaced: null };
  };

  // ── Clique no slot do meu campo ──────────────────────────────────────────────
  const handleFieldSlotClick = (slotIndex: number) => {
    if (!isMyTurn || turnPhase !== 'organize') return;

    if (sacrificeMode) {
      const card = myField[slotIndex];
      if (sacrificeMode.selected.length >= sacrificeMode.needed) {
        if (card !== null) { addHistory('● Escolha um slot VAZIO'); return; }
        setPositionChoice({ card: sacrificeMode.card, slotIndex, replaced: null, sacrificed: sacrificeMode.selected });
        setSacrificeMode(null); return;
      }
      if (!card || card.level !== 'Neutro') { addHistory('● Selecione apenas Neutros'); return; }
      const sel = sacrificeMode.selected.includes(card.id)
        ? sacrificeMode.selected.filter(id => id !== card.id)
        : [...sacrificeMode.selected, card.id];
      setSacrificeMode({ ...sacrificeMode, selected: sel }); return;
    }

    if (!pendingCard || playedThisTurn) {
      if (playedThisTurn) addHistory('● Já invocou um combatente neste turno');
      return;
    }

    if (pendingCard.cardType === 'Normal' || pendingCard.cardType === 'Especial') {
      const check = checkSummonValidity(pendingCard, slotIndex);
      if (check.valid) {
        setPositionChoice({ card: pendingCard, slotIndex, replaced: check.replaced, sacrificed: [] });
        setPendingCard(null);
      } else {
        addHistory(`● Invocação inválida aqui`);
      }
    }
  };

  // ── Confirmar invocação ──────────────────────────────────────────────────────
  const confirmSummon = (position: Position) => {
    if (!positionChoice) return;
    const { card, slotIndex, replaced, sacrificed } = positionChoice;
    const newCard: Card = { ...card, id: `my-${Date.now()}`, position, positionChangedThisTurn: false, attackedThisTurn: false, summonedThisTurn: true };

    let updField = [...myFieldRef.current];
    updField[slotIndex] = newCard;

    if (replaced) {
      setMyExile(prev => [...prev, replaced]);
      addHistory(`● ESCALA: '${card.name}' substituiu '${replaced.name}'`);
    }
    if (sacrificed.length > 0) {
      const toExile: Card[] = [];
      sacrificed.forEach(id => {
        const idx = updField.findIndex(c => c?.id === id);
        if (idx !== -1 && updField[idx]) { toExile.push(updField[idx]!); updField[idx] = null; }
      });
      setMyExile(prev => [...prev, ...toExile]);
      addHistory(`● PODER: '${card.name}' invocado (${sacrificed.length} sacrifício(s))`);
    }
    if (!replaced && !sacrificed.length) addHistory(`● Invocou '${card.name}' em ${positionLabel[position]}`);

    setMyField(updField); myFieldRef.current = updField;
    setMyHand(prev => { const h = prev.filter(c => c.id !== card.id); myHandRef.current = h; return h; });
    setPlayedThisTurn(true);
    setPositionChoice(null);
    broadcastField(updField);
  };

  // ── Mudar posição ────────────────────────────────────────────────────────────
  const setCardPosition = (slotIndex: number, newPos: Position) => {
    if (!isMyTurn || turnPhase !== 'organize') return;
    const card = myField[slotIndex];
    if (!card || card.positionChangedThisTurn) { setPositionMenu(null); return; }
    const updField = myFieldRef.current.map((c, i) =>
      i === slotIndex ? { ...c!, position: newPos, positionChangedThisTurn: true } : c
    );
    setMyField(updField); myFieldRef.current = updField;
    addHistory(`● ${card.name} → ${positionLabel[newPos]}`);
    setPositionMenu(null);
    broadcastField(updField);
  };

  // ── Modo sacrifício ──────────────────────────────────────────────────────────
  const startSacrificeMode = (card: Card) => {
    const needed = LEVEL_ORDER.indexOf(card.level);
    if (needed <= 0) return;
    const neutroCount = myField.filter(c => c && c.level === 'Neutro').length;
    if (neutroCount < needed) { addHistory(`● Precisa de ${needed} Neutro(s), tem ${neutroCount}`); return; }
    setPendingCard(null);
    setSacrificeMode({ card, needed, selected: [] });
    addHistory(`● Modo Sacrifício: selecione ${needed} Neutro(s)`);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const isValidSummonSlot = (slotIndex: number) => {
    if (!pendingCard || playedThisTurn) return false;
    if (pendingCard.cardType !== 'Normal' && pendingCard.cardType !== 'Especial') return false;
    if (sacrificeMode && sacrificeMode.selected.length >= sacrificeMode.needed) return myField[slotIndex] === null;
    return checkSummonValidity(pendingCard, slotIndex).valid;
  };

  const CardSlot = ({ card, isOpponent = false, onClick, isAttackTarget = false, isAttacking = false, isSacTarget = false, isSacSelected = false }: {
    card: Card | null; isOpponent?: boolean; onClick?: () => void;
    isAttackTarget?: boolean; isAttacking?: boolean; isSacTarget?: boolean; isSacSelected?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`w-24 h-36 rounded-xl border-2 border-dashed flex items-center justify-center relative shrink-0 transition-all cursor-pointer
        ${isAttacking   ? 'border-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.5)] scale-110 z-20' : ''}
        ${isAttackTarget? 'border-red-400 bg-red-400/10 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse' : ''}
        ${isSacTarget   ? 'border-red-400 bg-red-400/10' : ''}
        ${isSacSelected ? 'border-red-500 bg-red-500/20' : ''}
        ${!isAttacking && !isAttackTarget && !isSacTarget && !isSacSelected ? 'border-white/10 bg-black/20' : ''}`}
    >
      <AnimatePresence mode="popLayout">
        {card && (
          <motion.div key={card.id}
            initial={{ opacity: 0, scale: 0.2, y: isOpponent ? -60 : 60 }}
            animate={{
              opacity: 1, scale: 1,
              rotate: isOpponent
                ? (card.position === 'defense-open' ? -90 : card.position === 'defense-closed' ? 0 : 180)
                : (card.position === 'defense-open' ? 90 : 0),
              y: attackAnim?.id === card.id ? (isOpponent ? 50 : -50) : 0,
              filter: attackAnim?.targetId === card.id ? 'brightness(2) hue-rotate(40deg)' : 'brightness(1)',
            }}
            exit={{ opacity: 0, scale: 1.3, filter: 'blur(8px)' }}
            transition={{ rotate: { type: 'spring', stiffness: 260, damping: 22 } }}
            className={`w-full h-full relative rounded-xl overflow-hidden ring-2 ${positionRing[card.position]}`}
            style={{
              backgroundImage: (isOpponent && card.position === 'defense-closed')
                ? 'url("/fundo.webp")'
                : (!isOpponent && card.position === 'defense-closed')
                  ? 'url("/fundo.webp")'
                  : `url("${card.image}")`,
              backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            }}
          >
            {card.position === 'attack' && (
              <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                <span className="text-[9px] font-black text-red-400">{card.atq}</span>
                <span className="text-[9px] font-black text-blue-300">{card.def}</span>
              </div>
            )}
            {card.attackedThisTurn && !isOpponent && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                <span className="text-[6px] font-black text-white/50 uppercase">Atacou</span>
              </div>
            )}
            {isSacSelected && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[7px] font-black text-white">✓</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!card && !isOpponent && isValidSummonSlot(myField.indexOf(card as null)) && (
        <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl bg-emerald-400/10" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center font-sans text-white">
      {/* Fechar */}
      <button onClick={onClose} className="absolute top-4 right-4 z-[300] p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full transition-all group">
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Status de conexão */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
        opponentConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      }`}>
        {opponentConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 animate-pulse" />}
        {opponentConnected ? 'Conectado' : 'Aguardando oponente...'}
      </div>

      {/* Área escalada */}
      <div style={{ width: 1280, height: 768, transform: `scale(${arenaScale})`, transformOrigin: 'center center', position: 'relative', flexShrink: 0 }}>

        {/* Fundo */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url("/arena.webp")' }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]" />
        </div>

        {/* Transição de turno */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <div className="bg-black/80 backdrop-blur-2xl px-12 py-6 rounded-full border-2 border-yellow-500/50">
                <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-[0.4em] animate-pulse">{isTransitioning}</h2>
              </div>
            </motion.div>
          )}

          {/* Fim de jogo */}
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
              <div className="text-center space-y-8 p-12 rounded-3xl border border-white/10 bg-white/5">
                <h1 className={`text-7xl font-black uppercase tracking-tighter ${gameOver.isMe ? 'text-emerald-400' : 'text-red-500'}`}>
                  {gameOver.isMe ? 'Vitória!' : 'Derrota'}
                </h1>
                <p className="text-gray-400 text-sm">{gameOver.winner} venceu!</p>
                <button onClick={onClose} className="px-8 py-4 bg-white/10 font-black rounded-xl hover:bg-white/20 transition-all uppercase tracking-widest">
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`relative z-10 w-full h-full flex flex-col px-4 pt-2 pb-2 ${gameOver ? 'opacity-20 blur-sm' : ''}`}>

          {/* HUD Oponente */}
          <div
            onClick={() => attackingCardId && handleAttack('direct')}
            className={`absolute top-5 left-10 flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border transition-all z-50 ${attackingCardId ? 'ring-2 ring-red-500 border-red-500 cursor-crosshair shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105' : 'border-red-500/20'}`}
          >
            <div className="w-10 h-10 rounded-xl border border-red-500/30 overflow-hidden">
              <img src="/enemy_avatar.webp" className="w-full h-full object-cover grayscale" alt={opponentName} />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-red-400 uppercase tracking-wider">{opponentName}</div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <motion.div animate={{ width: `${(opponentPB / 30) * 100}%` }} className="h-full bg-red-600" />
                </div>
                <span className="text-[10px] font-black text-red-300 font-mono">{opponentPB}/30 PB</span>
              </div>
            </div>
          </div>

          {/* Mão do oponente (contagem) */}
          <div className="absolute top-5 right-48 flex flex-col items-center gap-1 z-40">
            <div className="flex gap-1">
              {Array.from({ length: opponentHandCount }).map((_, i) => (
                <div key={i} className="w-8 h-12 rounded-lg border border-red-500/20 bg-black/40"
                  style={{ backgroundImage: 'url("/fundo.webp")', backgroundSize: 'cover' }} />
              ))}
            </div>
            <span className="text-[7px] font-black text-red-500/30 uppercase tracking-[0.3em]">Mão do Oponente</span>
          </div>

          {/* Centro: fase + timer + botões */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
            <div className="text-center bg-black/60 border border-white/10 rounded-xl px-3 py-2 w-40">
              <div className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">
                {isMyTurn ? 'Seu Turno' : `Turno de ${opponentName}`}
              </div>
              <div className={`text-[11px] font-black uppercase tracking-widest ${isMyTurn ? 'text-yellow-400' : 'text-red-400/60'}`}>
                {isMyTurn ? (turnPhase === 'organize' ? '⚙ Organização' : '⚔ Confronto') : '⏳ Aguardando'}
              </div>
              <div className="text-[7px] text-white/20 mt-0.5">Turno {turnCount}</div>
            </div>

            {isMyTurn && (
              <>
                <div className={`text-2xl font-black font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                  {String(timeLeft).padStart(2, '0')}s
                </div>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${(timeLeft / 30) * 100}%` }}
                    className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-yellow-400'}`} />
                </div>
                <button onClick={advanceToConfront} disabled={turnPhase !== 'organize'}
                  className="px-4 py-2 text-[9px] font-black uppercase bg-blue-700/60 hover:bg-blue-600 border border-blue-400/30 rounded-lg text-white transition-all disabled:opacity-30">
                  <ChevronRight className="w-3 h-3 inline mr-1" />Confronto
                </button>
                <button onClick={handleEndTurn}
                  className="px-4 py-2 text-[9px] font-black uppercase bg-red-800/60 hover:bg-red-700 border border-red-400/30 rounded-lg text-white transition-all">
                  Fim do Turno
                </button>
              </>
            )}
          </div>

          {/* Campo do Oponente */}
          <div className="flex gap-2 justify-center items-center mt-16">
            {opponentField.map((card, i) => (
              <div key={`op-${i}`} onClick={() => attackingCardId && card && handleAttack(card.id)}>
                <CardSlot card={card} isOpponent isAttackTarget={!!attackingCardId && !!card} />
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent flex items-center justify-center relative my-2">
            <div className="absolute px-4 py-0.5 bg-black/80 border border-white/10 rounded-full text-[6px] font-black text-yellow-400/60 uppercase tracking-[0.4em]">
              Linha de Combate
            </div>
          </div>

          {/* Meu Campo */}
          <div className="flex gap-2 justify-center items-center">
            {myField.map((card, i) => (
              <div key={`my-${i}`}>
                <div
                  onClick={() => {
                    if (turnPhase === 'confront' && card && card.position === 'attack' && !card.attackedThisTurn && !card.summonedThisTurn) {
                      setAttackingCardId(prev => prev === card.id ? null : card.id);
                    } else if (turnPhase === 'organize' && card && !pendingCard && !sacrificeMode) {
                      setPositionMenu(prev => prev === i ? null : i);
                    } else {
                      handleFieldSlotClick(i);
                    }
                  }}
                  className={`w-24 h-36 rounded-xl border-2 border-dashed flex items-center justify-center relative shrink-0 transition-all cursor-pointer
                    ${attackingCardId === card?.id ? 'border-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.5)] scale-110 z-20' : ''}
                    ${isValidSummonSlot(i) ? 'border-emerald-400 bg-emerald-400/10' : ''}
                    ${sacrificeMode?.selected.includes(card?.id ?? '') ? 'border-red-500 bg-red-500/20' : ''}
                    ${sacrificeMode && sacrificeMode.selected.length < sacrificeMode.needed && card?.level === 'Neutro' && !sacrificeMode.selected.includes(card?.id ?? '') ? 'border-red-400 bg-red-400/10' : ''}
                    ${!attackingCardId && !isValidSummonSlot(i) && !sacrificeMode ? 'border-white/10 bg-black/20' : ''}`}
                >
                  <AnimatePresence mode="popLayout">
                    {card && (
                      <motion.div key={card.id}
                        initial={{ opacity: 0, scale: 0.2, y: 150 }}
                        animate={{
                          opacity: 1, scale: 1,
                          rotate: card.position === 'defense-open' ? 90 : 0,
                          y: attackAnim?.id === card.id ? -100 : 0,
                          filter: attackAnim?.targetId === card.id ? 'brightness(2) hue-rotate(40deg)' : 'brightness(1)',
                        }}
                        exit={{ opacity: 0, scale: 1.3, filter: 'blur(8px)' }}
                        transition={{ rotate: { type: 'spring', stiffness: 260, damping: 22 } }}
                        className={`w-full h-full relative rounded-xl overflow-hidden ring-2 ${positionRing[card.position]}`}
                        style={{
                          backgroundImage: card.position === 'defense-closed' ? 'url("/fundo.webp")' : `url("${card.image}")`,
                          backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {card.position === 'attack' && (
                          <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                            <span className="text-[9px] font-black text-red-400">{card.atq}</span>
                            <span className="text-[9px] font-black text-blue-300">{card.def}</span>
                          </div>
                        )}
                        {(card.attackedThisTurn || card.summonedThisTurn) && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                            <span className="text-[6px] font-black text-white/50 uppercase">
                              {card.attackedThisTurn ? 'Atacou' : 'Invocado'}
                            </span>
                          </div>
                        )}
                        {sacrificeMode?.selected.includes(card.id) && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-[7px] font-black text-white">✓</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Menu de posição */}
                  <AnimatePresence>
                    {positionMenu === i && card && isMyTurn && turnPhase === 'organize' && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="absolute -top-[88px] left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-1 bg-black/90 border border-white/15 rounded-xl p-2 shadow-xl w-28">
                        <div className="text-[6px] font-black text-white/30 uppercase tracking-widest text-center mb-0.5">Posição</div>
                        {(['attack', 'defense-open', 'defense-closed'] as Position[]).map(pos => (
                          <button key={pos} onClick={() => setCardPosition(i, pos)}
                            className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all ${card.position === pos ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>
                            {pos === 'attack' ? '⚔ Ataque' : pos === 'defense-open' ? '🛡 Def. Aberta' : '🌑 Def. Fechada'}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* HUD + log + deck */}
          <div className="w-full flex justify-between items-end px-10 mt-auto pointer-events-none">
            {/* Info jogador */}
            <div className="pointer-events-auto flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/5 mb-2">
              <div className="w-10 h-10 rounded-xl border border-yellow-500/30 overflow-hidden">
                <img src="/hero_avatar.webp" className="w-full h-full object-cover" alt={username} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-white uppercase">{username}</div>
                <div className="flex items-center gap-2">
                  <div className="w-28 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <motion.div animate={{ width: `${(myPB / 30) * 100}%` }} className="h-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 font-mono">{myPB}/30 PB</span>
                </div>
              </div>
            </div>

            {/* Log */}
            <div className="pointer-events-auto w-52 max-h-40 overflow-y-auto bg-black/50 rounded-xl border border-white/10 p-2 mb-2 custom-scrollbar">
              {history.slice(0, 20).map((msg, i) => (
                <div key={i} className={`text-[9px] font-mono py-0.5 border-b border-white/5 last:border-0 ${i === 0 ? 'text-yellow-400' : 'text-white/40'}`}>
                  {msg}
                </div>
              ))}
            </div>

            {/* Deck */}
            <div className="pointer-events-auto flex flex-col items-center gap-1 mb-2">
              <div className="w-14 h-20 rounded-xl border-2 border-white/20 bg-cover bg-center" style={{ backgroundImage: 'url("/fundo.webp")' }} />
              <span className="text-[8px] font-black text-white/30 uppercase">Deck</span>
              <span className="text-sm font-mono text-white/60 font-black">{myDeck.length}</span>
            </div>
          </div>

          {/* Minha Mão */}
          <div className="flex gap-2 justify-center items-end pb-1 overflow-x-auto">
            {myHand.map((card) => (
              <motion.div key={card.id} whileHover={{ y: -12, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => {
                  if (!isMyTurn || turnPhase !== 'organize') return;
                  if (pendingCard?.id === card.id) { setPendingCard(null); return; }
                  if (card.level !== 'Neutro') {
                    const lvlIdx = LEVEL_ORDER.indexOf(card.level);
                    const canScale = myField.some(c => c && LEVEL_ORDER.indexOf(c.level) === lvlIdx - 1);
                    const canSacrifice = myField.filter(c => c?.level === 'Neutro').length >= lvlIdx;
                    if (!canScale && canSacrifice) { startSacrificeMode(card); return; }
                    if (!canScale && !canSacrifice) { addHistory(`● Sem condição para invocar ${card.name}`); return; }
                  }
                  setPendingCard(card);
                  setSacrificeMode(null);
                }}
                className={`relative w-20 h-28 rounded-xl border-2 shrink-0 cursor-pointer overflow-hidden transition-all
                  ${pendingCard?.id === card.id ? 'border-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.5)]' : 'border-white/20 hover:border-white/50'}
                  ${(!isMyTurn || turnPhase !== 'organize') ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={{ backgroundImage: `url("${card.image}")`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#0a0a0a' }}
              >
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[7px] font-black bg-black/70 text-white/60">{card.level}</div>
                <div className="absolute bottom-1 inset-x-1 flex justify-between px-1">
                  <span className="text-[8px] font-black text-red-400">{card.atq}</span>
                  <span className="text-[8px] font-black text-blue-300">{card.def}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal de escolha de posição */}
        <AnimatePresence>
          {positionChoice && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0e0e10] border border-white/10 rounded-3xl p-8 text-center space-y-6 max-w-sm w-full mx-4">
                <p className="text-[9px] text-white/30 uppercase tracking-widest">Escolha a posição para "{positionChoice.card.name}"</p>
                <div className="grid grid-cols-3 gap-3">
                  {([['attack', '⚔', 'Ataque'], ['defense-open', '🛡', 'Def. Aberta'], ['defense-closed', '🌑', 'Def. Fechada']] as const).map(([pos, icon, label]) => (
                    <button key={pos} onClick={() => confirmSummon(pos)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group">
                      <span className="text-2xl">{icon}</span>
                      <span className="text-[9px] font-black text-white/60 group-hover:text-white uppercase">{label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { setPositionChoice(null); setPendingCard(null); }}
                  className="text-[9px] text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">Cancelar</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
