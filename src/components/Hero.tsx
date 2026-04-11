import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Epic Card Duel <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                Awaits You!
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              Build your ultimate deck, master unique elements, and challenge players worldwide in the most dynamic modern trading card game.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-dark-bg font-bold text-lg py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 cursor-pointer">
                Play Now <ChevronRight size={20} />
              </button>
              <button className="w-full sm:w-auto bg-transparent border-2 border-white/20 hover:border-white/50 text-white font-bold text-lg py-4 px-8 rounded-full transition-all hover:bg-white/5 cursor-pointer">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Cards Fan Effect */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] flex justify-center items-center perspective-1000 mt-12 lg:mt-0">
            {/* Left Card */}
            <motion.div
              initial={{ opacity: 0, y: 100, rotate: -20 }}
              animate={{ opacity: 1, y: 0, rotate: -15 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -20, rotate: -10, scale: 1.05, zIndex: 30 }}
              className="absolute left-1/2 -translate-x-[110%] sm:-translate-x-[120%] w-40 sm:w-64 aspect-[2.5/3.5] rounded-2xl border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-dark-card overflow-hidden cursor-pointer"
            >
              <img src="https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=400&h=560" alt="Magic Card" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 font-display font-bold text-blue-300 text-sm sm:text-base">Frost Nova</div>
            </motion.div>

            {/* Center Card */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: -20, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ y: -40, scale: 1.1, zIndex: 40 }}
              className="absolute left-1/2 -translate-x-1/2 w-48 sm:w-72 aspect-[2.5/3.5] rounded-2xl border-2 border-gold shadow-[0_0_40px_rgba(255,215,0,0.4)] bg-dark-card overflow-hidden z-20 cursor-pointer"
            >
              <img src="https://images.unsplash.com/photo-1542779283-429940ce8336?auto=format&fit=crop&q=80&w=400&h=560" alt="Legendary Card" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 font-display font-bold text-gold text-lg sm:text-xl">Solar Flare</div>
            </motion.div>

            {/* Right Card */}
            <motion.div
              initial={{ opacity: 0, y: 100, rotate: 20 }}
              animate={{ opacity: 1, y: 0, rotate: 15 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ y: -20, rotate: 10, scale: 1.05, zIndex: 30 }}
              className="absolute left-1/2 translate-x-[10%] sm:translate-x-[20%] w-40 sm:w-64 aspect-[2.5/3.5] rounded-2xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-dark-card overflow-hidden cursor-pointer"
            >
              <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400&h=560" alt="Attack Card" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 font-display font-bold text-red-300 text-sm sm:text-base">Crimson Strike</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
