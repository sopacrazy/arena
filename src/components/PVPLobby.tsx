import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Swords, Users, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PVPLobbyProps {
  userId: string;
  username: string;
  onMatch: (roomId: string, isHost: boolean, opponentName: string) => void;
  onClose: () => void;
}

export default function PVPLobby({ userId, username, onMatch, onClose }: PVPLobbyProps) {
  const [playersOnline, setPlayersOnline] = useState(0);
  const [status, setStatus] = useState<'searching' | 'matched'>('searching');

  useEffect(() => {
    const channel = supabase.channel('pvp-lobby', {
      config: {
        presence: { key: userId },
        broadcast: { self: false },
      },
    });

    let matched = false;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ username: string; joinedAt: number }>();
        const entries = Object.entries(state);
        setPlayersOnline(entries.length);

        if (entries.length >= 2 && !matched) {
          const sorted = entries
            .map(([id, arr]) => ({ id, username: (arr[0] as any).username as string, joinedAt: (arr[0] as any).joinedAt as number }))
            .sort((a, b) => a.joinedAt - b.joinedAt);

          const host = sorted[0];
          const guest = sorted[1];

          // Somente o host cria a sala e avisa o guest
          if (host.id === userId) {
            matched = true; // bloqueia re-entrada antes de qualquer await
            setStatus('matched');
            const roomId = `pvp_${Date.now()}`;
            const opponentName = guest.username;

            // Broadcast para o guest, depois navega diretamente (self: false não entrega ao remetente)
            channel.send({
              type: 'broadcast',
              event: 'match:found',
              payload: { roomId, hostId: host.id, hostName: host.username, guestId: guest.id, guestName: guest.username },
            });
            // Aguarda um tick para o Supabase enviar o broadcast antes de desmontar o canal
            setTimeout(() => onMatch(roomId, true, opponentName), 500);
          }
        }
      })
      .on('broadcast', { event: 'match:found' }, ({ payload }) => {
        if (matched) return;
        if (payload.hostId !== userId && payload.guestId !== userId) return;
        matched = true;
        setStatus('matched');
        // guest recebe o broadcast e navega
        const opponentName: string = payload.hostName;
        setTimeout(() => onMatch(payload.roomId, false, opponentName), 500);
      });

    channel.subscribe(async (s) => {
      if (s === 'SUBSCRIBED') {
        await channel.track({ username, joinedAt: Date.now() });
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [userId, username, onMatch]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-10 text-white">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>

      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <Swords className="w-20 h-20 text-[#c9a84c]" />
      </motion.div>

      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-white">Modo PVP</h1>
        <p className="text-[#c9a84c]/60 text-xs uppercase tracking-[0.4em]">Teste Alfa</p>
      </div>

      <div className="w-72 bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4 text-center">
        {status === 'searching' ? (
          <>
            <div className="flex items-center justify-center gap-3 text-white/50">
              <Loader2 className="w-5 h-5 animate-spin text-[#c9a84c]" />
              <span className="text-sm uppercase tracking-widest">Procurando oponente...</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/20">
              <Users className="w-4 h-4" />
              <span className="text-xs font-mono">{playersOnline} no saguão</span>
            </div>
            <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#c9a84c]/50"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              />
            </div>
            <p className="text-white/20 text-[10px] uppercase tracking-widest">
              Peça a outro jogador para acessar o Modo PVP
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm uppercase tracking-widest">Oponente encontrado!</span>
          </div>
        )}
      </div>
    </div>
  );
}
