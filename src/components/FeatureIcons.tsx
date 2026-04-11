import { motion } from 'motion/react';
import { Sword, Shield, Zap, Flame, Droplets, Wind } from 'lucide-react';

const features = [
  { icon: Sword, name: 'Attack', color: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]' },
  { icon: Shield, name: 'Defense', color: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]' },
  { icon: Zap, name: 'Magic', color: 'text-purple-400', border: 'border-purple-500/50', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]' },
  { icon: Flame, name: 'Fire', color: 'text-orange-400', border: 'border-orange-500/50', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]' },
  { icon: Droplets, name: 'Water', color: 'text-cyan-400', border: 'border-cyan-500/50', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]' },
  { icon: Wind, name: 'Air', color: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' },
];

export default function FeatureIcons() {
  return (
    <section id="features" className="py-24 bg-dark-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Master the Elements</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Choose your class and combine elemental powers to create devastating combos.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className={`w-24 h-24 rounded-full border-2 ${feature.border} bg-dark-card flex items-center justify-center ${feature.glow} transition-all duration-300`}>
                  <Icon size={40} className={feature.color} />
                </div>
                <span className="font-display font-semibold tracking-wide text-gray-300">{feature.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
