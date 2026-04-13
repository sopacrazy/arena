import React from 'react';
import { motion } from 'motion/react';

export function SkeletonDashboard() {
  return (
    <div className="fixed inset-0 z-50 bg-[#060608] text-white flex overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0c] flex flex-col pt-8 pb-4">
        <div className="px-6 mb-10 h-10 w-40 bg-white/5 rounded-lg animate-pulse" />
        <div className="flex-1 px-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col bg-[#060608]">
        {/* Header Skeleton */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10">
          <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />
            <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />
            <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </header>

        {/* Banner Skeleton */}
        <div className="p-10 space-y-10">
          <div className="w-full aspect-[21/9] bg-white/5 rounded-[2.5rem] animate-pulse" />
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 gap-8">
            <div className="h-80 bg-white/5 rounded-[2rem] animate-pulse" />
            <div className="h-80 bg-white/5 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function SkeletonArena() {
  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center">
       {/* Background Dimmed */}
       <div className="absolute inset-0 bg-black/80" />
       
       {/* Field Skeleton Layout */}
       <div className="relative w-full max-w-6xl h-full flex flex-col justify-between py-12">
          {/* Top Enemy Side */}
          <div className="flex flex-col items-center gap-4">
             <div className="w-48 h-10 bg-white/5 rounded-full animate-pulse" />
             <div className="flex gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-14 h-20 bg-white/5 rounded-lg animate-pulse" />
                ))}
             </div>
          </div>

          {/* Central Combat Area */}
          <div className="flex-1 flex flex-col justify-center items-center gap-12 py-12">
             <div className="grid grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-24 h-36 bg-white/5 rounded-xl animate-pulse" />
                ))}
             </div>
             <div className="grid grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-24 h-36 bg-white/5 rounded-xl animate-pulse" />
                ))}
             </div>
          </div>

          {/* Bottom Player Side */}
          <div className="flex flex-col-reverse items-center gap-4">
             <div className="w-48 h-10 bg-white/5 rounded-full animate-pulse" />
             <div className="flex gap-4 scale-125 translate-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-16 h-24 bg-white/5 rounded-xl animate-pulse" />
                ))}
             </div>
          </div>
       </div>

       {/* Center Loading Indicator */}
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full"
          />
          <div className="mt-4 text-gold/40 text-[10px] font-black uppercase tracking-[0.5em]">Sincronizando...</div>
       </div>
    </div>
  );
}
