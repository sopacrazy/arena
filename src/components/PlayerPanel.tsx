import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Gamepad2, 
  ShoppingBag, 
  ShieldCheck, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Coins, 
  Gem, 
  MessageSquare, 
  ChevronRight,
  User,
  Star,
  Skull,
  Zap,
  Sword,
  TrendingUp,
  Clock,
  Play
} from 'lucide-react';

interface PlayerPanelProps {
  onStartGame: () => void;
  onLogout: () => void;
}

export default function PlayerPanel({ onStartGame, onLogout }: PlayerPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const sidebarLinks = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'games', label: 'Modos de Jogo', icon: Gamepad2 },
    { id: 'inventory', label: 'Inventário', icon: ShoppingBag },
    { id: 'marketplace', label: 'Mercado', icon: ShieldCheck },
    { id: 'community', label: 'Comunidade', icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#060608] text-white flex overflow-hidden font-display shrink-0">
      {/* Sidebar Left */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0c] flex flex-col pt-8 pb-4">
        <div className="px-6 mb-10">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto grayscale brightness-200" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === link.id 
                  ? 'bg-gold/10 text-gold border border-gold/20' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon className={`w-5 h-5 ${activeTab === link.id ? 'text-gold' : 'group-hover:text-white shadow-gold/20 transition-all'}`} />
              <span className="text-sm font-black uppercase tracking-widest">{link.label}</span>
              {activeTab === link.id && <div className="ml-auto w-1 h-1 rounded-full bg-gold shadow-[0_0_8px_#ffb700]" />}
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-[10px] font-black">
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all uppercase tracking-widest text-[10px] font-black"
          >
            <LogOut className="w-4 h-4" />
            Sair do Jogo
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#060608] via-[#0a0a0c] to-[#060608]">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/20 backdrop-blur-md relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gold transition-colors" />
               <input 
                 type="text" 
                 placeholder="BUSCAR NO REINO..." 
                 className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/30 transition-all w-64"
               />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Currencies */}
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 group hover:border-gold/30 transition-all cursor-pointer">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-[11px] font-black font-mono">2,500.23</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 group hover:border-cyan-400/30 transition-all cursor-pointer">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-black font-mono">150.00</span>
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4">
              <div className="text-right">
                <div className="text-[10px] font-black text-white uppercase tracking-wider">Adriano_X</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Combatente Nv. 42</div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/50 to-gold/10 p-[1px]">
                  <div className="w-full h-full rounded-[10px] overflow-hidden bg-black">
                    <img src="/hero_avatar.png" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0a0c] shadow-[0_0_8px_#10b981]" />
              </div>
              <Bell className="w-5 h-5 text-gray-500 hover:text-white transition-colors cursor-pointer ml-2" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar overflow-x-hidden">
          {/* Main Hero Banner */}
          <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 aspect-[21/9] shrink-0">
             <img src="/arena.png" className="w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-all duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
             
             <div className="absolute inset-0 flex flex-col justify-center px-16 max-w-2xl gap-4">
                <div className="flex items-center gap-2">
                   <div className="px-2 py-0.5 bg-gold/20 border border-gold/40 rounded text-[9px] font-black text-gold uppercase tracking-[0.2em]">Sazonal</div>
                   <div className="w-12 h-px bg-gold/40" />
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Temporada das Sombras</span>
                </div>
                <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none italic">ARENA DE <br/><span className="text-gold drop-shadow-[0_0_30px_rgba(255,183,0,0.3)]">BATALHA</span></h1>
                <p className="text-gray-400 text-sm max-w-sm font-medium leading-relaxed italic border-l-2 border-gold/20 pl-4 py-1">
                  Enfrente oponentes lendários, colete cartas raras e domine o tabuleiro nesta nova temporada competitiva.
                </p>
                <div className="flex gap-4 mt-4">
                   <button 
                     onClick={onStartGame}
                     className="px-10 py-4 bg-gold text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-15px_rgba(255,183,0,0.4)] flex items-center gap-3"
                   >
                     <Play className="w-4 h-4 fill-black" />
                     Entrar Agora
                   </button>
                   <button className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all">
                     Detalhes
                   </button>
                </div>
             </div>

             <div className="absolute bottom-8 right-12 flex flex-col items-end gap-1 opacity-40">
                <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold" />)}
                </div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">12,422 Jogadores Online</span>
             </div>
          </div>

          {/* Originals / Modes Section */}
          <div className="space-y-6 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic">
                <Sword className="w-6 h-6 text-gold" />
                Modos Originais
              </h2>
              <div className="flex items-center gap-2">
                 <button className="p-2 bg-white/5 border border-white/5 rounded-xl text-gray-500 hover:text-white"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                 <button className="p-2 bg-white/5 border border-white/5 rounded-xl text-white hover:bg-white/10"><ChevronRight className="w-5 h-5" /></button>
                 <button className="ml-4 px-6 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600/20 transition-all">Ver Todos</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Game Card 1 */}
              <div 
                onClick={onStartGame}
                className="group relative h-80 rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0c] cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <img src="/battle_preview.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" alt="Duelo Ranqueado" />
                
                <div className="absolute inset-x-8 bottom-8 z-20 space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">2,129 ONLINE</span>
                   </div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Duelo Ranqueado</h3>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest max-w-[200px]">Desafie outros jogadores em tempo real e suba no ranking global.</p>
                   
                   <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <button className="px-6 py-2.5 bg-gold text-black text-[10px] font-black uppercase tracking-widest rounded-xl">Jogar</button>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Total Premiado</span>
                        <span className="text-xs font-mono font-black text-gold">$ 2,117.23</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Game Card 2 */}
              <div className="group relative h-80 rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0c] cursor-not-allowed opacity-60">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <img src="/boss_raid.png" className="w-full h-full object-cover opacity-40 filter blur-sm group-hover:blur-0 transition-all duration-700" alt="Chefe de Raide" />
                
                <div className="absolute inset-x-8 bottom-8 z-20 space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">EM BREVE</span>
                   </div>
                   <h3 className="text-3xl font-black text-white/40 uppercase tracking-tighter italic">Caminho da Sombras</h3>
                   <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Modo campanha focado em história e recompensas exclusivas.</p>
                   
                   <div className="flex items-center gap-4 mt-4">
                      <div className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/20 text-[10px] font-black uppercase tracking-widest rounded-xl">Bloqueado</div>
                      <span className="text-[10px] font-mono font-black text-white/10 italic">Nível 50 Exigido</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly / Monthly Grid - Styled as Compact Game Modes */}
          <div className="grid grid-cols-4 gap-6 shrink-0 pb-10">
             {[
               { icon: TrendingUp, label: 'Bônus Semanal', sub: 'Reivindicar', color: 'bg-blue-600/10', accent: 'text-blue-400', border: 'border-blue-500/20' },
               { icon: Star, label: 'Passe de Batalha', sub: 'Passe: 45%', color: 'bg-amber-600/10', accent: 'text-gold', border: 'border-gold/20' },
               { icon: Zap, label: 'Modo Blitz', sub: 'Diário', color: 'bg-purple-600/10', accent: 'text-purple-400', border: 'border-purple-500/20' },
               { icon: ShieldCheck, label: 'Guildas', sub: '12 Online', color: 'bg-emerald-600/10', accent: 'text-emerald-400', border: 'border-emerald-500/20' }
             ].map((item, i) => (
               <div 
                 key={i} 
                 className={`relative overflow-hidden group h-32 rounded-3xl border ${item.border} ${item.color} transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer shadow-2xl`}
               >
                  {/* Background Image (Same style as modes) */}
                  <div className="absolute inset-0 z-0">
                     <img src="/reward_card.png" className="w-full h-full object-cover opacity-20 grayscale group-hover:opacity-40 group-hover:scale-110 transition-all duration-700" alt={item.label} />
                     <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent`} />
                  </div>
                  
                  <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <div className={`p-2 rounded-xl bg-black/60 border border-white/5 transition-transform group-hover:rotate-12 duration-300`}>
                           <item.icon className={`w-5 h-5 ${item.accent}`} />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-gold/40 transition-colors animate-pulse" />
                     </div>
                     
                     <div className="space-y-0.5">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</h4>
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden">
                              <div className={`h-full bg-current ${item.accent}`} style={{ width: '40%' }} />
                           </div>
                           <span className="text-[7px] font-bold text-white/40 uppercase whitespace-nowrap">{item.sub}</span>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* VERTICAL DIVIDER - Styled as Obsidian/Magic Column */}
      <div className="w-[1px] relative bg-gradient-to-b from-transparent via-white/10 to-transparent shrink-0">
         <div className="absolute inset-0 bg-gold/10 blur-[1px] opacity-30 shadow-[0_0_15px_rgba(255,215,0,0.2)]" />
         <div className="absolute top-1/4 bottom-1/4 left-1/2 -translate-x-1/2 w-4 h-full bg-gradient-to-b from-transparent via-gold/5 to-transparent blur-2xl z-0" />
      </div>

      {/* Sidebar Right (Chat & Activity) */}
      <aside className="w-96 bg-[#0a0a0c] flex flex-col shrink-0">
         <div className="p-8 border-b border-white/5 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic">
                  <MessageSquare className="w-5 h-5 text-gold" />
                  Chat Global
               </h3>
               <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase">69 Online</span>
               </div>
            </div>
         </div>

         {/* Chat Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {[
              { user: 'Wingwon', msg: 'Alguém para o boss lvl 40?', avatar: '/witch.png', rank: 'Mestre' },
              { user: 'StarLord', msg: 'A nova carta de Ouro é insana!', avatar: '/Warlord.png', rank: 'Elite' },
              { user: 'AnchovyKing', msg: 'Quantos de gold custa o pack?', avatar: '/Guerreiro_Orc.png', rank: 'Novato' },
              { user: 'You', msg: 'Fala pessoal! Bora uma partida hoje?', avatar: '/hero_avatar.png', rank: 'Combatente', isMe: true },
              { user: 'Lucian', msg: 'Alguém trocando cartas de fogo?', avatar: '/Rato_Esquelético.png', rank: 'Lenda' },
              { user: 'Valkyrie', msg: 'Acabei de dropar o Dragão Eterno!!!', avatar: '/witch.png', rank: 'Mestre' },
              { user: 'DarkSlayer', msg: 'Vende-se conta lvl 80. DM.', avatar: '/enemy_avatar.png', rank: 'Elite' },
            ].map((chat, i) => (
              <div key={i} className={`flex gap-3 group ${chat.isMe ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition-opacity`}>
                 <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-gold/30 transition-all">
                       <img src={chat.avatar || '/hero_avatar.png'} className="w-full h-full object-cover" />
                    </div>
                    {chat.rank === 'Lenda' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#0a0a0c] flex items-center justify-center"><Skull className="w-2 h-2 text-white" /></div>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className={`text-[10px] font-black uppercase tracking-wider ${chat.isMe ? 'text-gold' : 'text-white'}`}>{chat.user}</span>
                       <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">{chat.rank}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">{chat.msg}</p>
                 </div>
              </div>
            ))}
         </div>

         {/* Chat Input */}
         <div className="p-6 bg-black/40 border-t border-white/5 shrink-0">
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Sussurre para o Reino..." 
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium placeholder:text-gray-600 focus:outline-none focus:border-gold/20 transition-all pr-12"
               />
               <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gold/10 rounded-lg text-gold/60 hover:text-gold transition-all">
                  <Play className="w-4 h-4" />
               </button>
            </div>
         </div>
      </aside>
    </div>
  );
}
