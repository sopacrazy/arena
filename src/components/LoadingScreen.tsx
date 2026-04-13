import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  images: string[];
  onComplete: () => void;
  message?: string;
}

export default function LoadingScreen({ images, onComplete, message = "CARREGANDO REINO..." }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const total = images.length;

    if (total === 0) {
      setProgress(100);
      setTimeout(() => {
        setIsDone(true);
        onComplete();
      }, 500);
      return;
    }

    const loaders = images.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          setProgress(Math.floor((loadedCount / total) * 100));
          resolve(true);
        };
        img.onerror = () => {
          loadedCount++; // Count even on error to avoid blocking
          setProgress(Math.floor((loadedCount / total) * 100));
          resolve(false);
        };
      });
    });

    Promise.all(loaders).then(() => {
      setTimeout(() => {
        setIsDone(true);
        setTimeout(onComplete, 800); // Wait for exit animation
      }, 500);
    });
  }, [images, onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] bg-[#060608] flex flex-col overflow-hidden pointer-events-none"
        >
          {/* Skeleton Structure: Dashboard Style fallback */}
          <div className="flex h-full w-full">
            {/* Sidebar Skeleton */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0c] flex flex-col pt-8 pb-4">
              <div className="px-6 mb-10 h-10 w-40 bg-white/5 rounded-lg animate-pulse" />
              <div className="flex-1 px-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </aside>

            {/* Content Area Skeleton */}
            <main className="flex-1 flex flex-col">
              <header className="h-20 border-b border-white/5 flex items-center justify-between px-10">
                <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-8 w-16 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-8 w-16 bg-white/5 rounded-full animate-pulse" />
                </div>
              </header>

              <div className="p-10 space-y-10">
                <div className="w-full aspect-[21/9] bg-white/5 rounded-3xl animate-pulse" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
                  <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
                </div>
              </div>
            </main>
          </div>

          {/* Overlaid Progress Bar (Minimalist) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
             <div className="text-[9px] font-black text-gold/40 uppercase tracking-[0.4em] mb-1">{message}</div>
             <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gold/60 shadow-[0_0_10px_rgba(255,183,0,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
