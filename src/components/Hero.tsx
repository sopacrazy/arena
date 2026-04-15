import { motion } from 'motion/react';
import { Tv } from 'lucide-react';
import ForgeSparkCanvas from './ForgeSparkCanvas';

export default function Hero({ onPlay }: { onPlay: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/background.webp" 
          alt="RPG Background" 
          className="w-full h-full object-cover object-top transition-all duration-700"
          draggable="false"
        />
        {/* Darker overlays for much better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ✦ Faíscas de forja */}
      <ForgeSparkCanvas />
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center pt-20">
        
        {/* Center Logo Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 flex flex-col items-center"
        >
          <img 
            src="/logo.webp" 
            alt="Arcane Crusade" 
            className="w-full max-w-[400px] h-auto object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          />
          
          <p className="mt-8 text-lg sm:text-xl text-white font-medium max-w-3xl mx-auto leading-relaxed italic drop-shadow-md">
            Forje alianças, conquiste inimigos e escreva sua própria lenda épica.
          </p>
        </motion.div>

        {/* Action Buttons - Moved VERY high up to avoid the timeline line completely */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-6 mb-48 lg:mb-56"
        >
          <button 
            onClick={onPlay}
            className="group relative px-12 py-4 bg-gradient-to-b from-yellow-700 to-yellow-900 rounded-lg overflow-hidden border border-yellow-500/50 shadow-[0_10px_30px_-10px_rgba(180,130,0,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-transparent transition-all" />
            <span className="relative flex items-center gap-2 text-white font-bold text-lg uppercase tracking-widest">
              Jogar Agora
            </span>
          </button>

          <button className="group relative px-10 py-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/20 hover:border-white/40 transition-all hover:bg-white/10 active:scale-95 flex items-center gap-3 text-white font-bold text-lg uppercase tracking-widest cursor-pointer">
            <Tv size={20} className="text-white/70 group-hover:text-white transition-colors" />
            Ver Trailer
          </button>
        </motion.div>
      </div>

      {/* Bottom Events Bar - Portuguese */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Lines */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            
            {/* Event Cards */}
            {[
              { date: "18 de NOVEMBRO, 2026", name: "Baile de Máscaras ao Luar" },
              { date: "3 de DEZEMBRO, 2026", name: "Ascensão dos Titãs Elementais" },
              { date: "22 de DEZEMBRO, 2026", name: "Festival das Maravilhas de Inverno" }
            ].map((event, idx) => (
              <div key={idx} className="flex flex-col items-center group relative pt-8">
                {/* Dot indicator */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold shadow-[0_0_10px_var(--color-gold)]" />
                
                <span className="bg-dark-bg/60 backdrop-blur-sm border border-gold/30 px-4 py-0.5 rounded-full text-[10px] text-gold font-bold tracking-tighter mb-4 opacity-70 group-hover:opacity-100 transition-opacity uppercase">
                  Evento
                </span>
                
                <h3 className="text-white font-bold text-xs sm:text-sm tracking-widest mb-1 text-center">
                  {event.date}
                </h3>
                <p className="text-white/60 text-[10px] sm:text-xs text-center font-light uppercase tracking-[0.2em]">
                  {event.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

