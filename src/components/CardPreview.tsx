import { motion } from 'motion/react';

const cards = [
  {
    id: 1,
    name: 'Cyber Ninja',
    type: 'Agility',
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=600&h=400',
    border: 'border-cyan-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
    stats: { atk: 8, def: 3, spd: 10 }
  },
  {
    id: 2,
    name: 'Mecha Golem',
    type: 'Tank',
    image: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=600&h=400',
    border: 'border-orange-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    stats: { atk: 6, def: 10, spd: 2 }
  },
  {
    id: 3,
    name: 'Neon Mage',
    type: 'Caster',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600&h=400',
    border: 'border-purple-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    stats: { atk: 9, def: 4, spd: 7 }
  }
];

export default function CardPreview() {
  return (
    <section id="cards" className="py-24 bg-dark-card relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Modern Roster</h2>
            <p className="text-gray-400 max-w-xl">Discover beautifully illustrated cards featuring a modern anime and sci-fi aesthetic. No more generic medieval knights.</p>
          </div>
          <button className="text-gold hover:text-gold-hover font-semibold flex items-center gap-2 transition-colors cursor-pointer">
            View All Cards &rarr;
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`group relative bg-dark-bg rounded-2xl border ${card.border} overflow-hidden transition-all duration-500 ${card.glow} cursor-pointer`}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={card.image} 
                  alt={card.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
                
                {/* Type Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold tracking-wider uppercase">
                  {card.type}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-6 relative">
                <h3 className="font-display text-2xl font-bold mb-4">{card.name}</h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-1">ATK</span>
                    <span className="font-display font-bold text-red-400">{card.stats.atk}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-1">DEF</span>
                    <span className="font-display font-bold text-blue-400">{card.stats.def}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-1">SPD</span>
                    <span className="font-display font-bold text-emerald-400">{card.stats.spd}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
