
import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '../types';
import { Card } from './Card';

interface SlotMachineProps {
  spinning: boolean;
  restaurants: Restaurant[];
  onComplete: () => void;
  isFavorite: (r: Restaurant) => boolean;
  onToggleFavorite: (r: Restaurant) => void;
}

const ICONS = ["🍔", "🍕", "🌮", "🥗", "🍜", "🍣", "🥪", "🍗", "🥩", "🍩"];

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#0ea5e9'][Math.floor(Math.random() * 5)],
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}
  </div>
);

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  spinning, 
  restaurants, 
  onComplete,
  isFavorite,
  onToggleFavorite
}) => {
  const [reelStatus, setReelStatus] = useState<('spinning' | 'stopped')[]>(['spinning', 'spinning', 'spinning']);
  const [showConfetti, setShowConfetti] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!spinning && restaurants.length > 0) {
      const stopReels = async () => {
        // Reduced delays significantly for faster feel
        await new Promise(r => setTimeout(r, 200));
        if (!mountedRef.current) return;
        setReelStatus(['stopped', 'spinning', 'spinning']); 
        
        await new Promise(r => setTimeout(r, 400)); 
        if (!mountedRef.current) return;
        setReelStatus(['stopped', 'stopped', 'spinning']);
        
        await new Promise(r => setTimeout(r, 400)); 
        if (!mountedRef.current) return;
        setReelStatus(['stopped', 'stopped', 'stopped']);
        
        setShowConfetti(true);
        setTimeout(() => {
           if (mountedRef.current) onComplete();
        }, 800); 
      };

      stopReels();
    }
    
    if (spinning) {
      setReelStatus(['spinning', 'spinning', 'spinning']);
      setShowConfetti(false);
    }
  }, [spinning, restaurants, onComplete]);

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {showConfetti && <div className="animate-confetti"><Confetti /></div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[0, 1, 2].map((index) => (
          <div key={index} className="relative h-[360px] md:h-[420px]">
            <div className="absolute inset-0 bg-slate-200 rounded-3xl shadow-inner overflow-hidden border-4 border-slate-300">
              
              {/* Background Spin Animation - Sped up via CSS class update */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                 <div className={`text-6xl space-y-12 py-4 ${reelStatus[index] === 'spinning' ? 'animate-scroll' : ''}`}>
                   {[...ICONS, ...ICONS, ...ICONS].map((icon, i) => (
                     <div key={i} className="filter blur-[2px]">{icon}</div>
                   ))}
                 </div>
              </div>

              {/* REVEAL LOGIC */}
              {reelStatus[index] === 'stopped' ? (
                 restaurants[index] ? (
                    // 1. Success Case: Restaurant found
                    <div className="absolute inset-0 z-10 animate-pop-reveal p-2 md:p-0">
                      <Card 
                        restaurant={restaurants[index]} 
                        index={index}
                        isFavorite={isFavorite(restaurants[index])}
                        onToggleFavorite={() => onToggleFavorite(restaurants[index])}
                        className="h-full border-none shadow-none" 
                      />
                    </div>
                 ) : (
                    // 2. Empty Case: Fewer matches than slots
                    <div className="absolute inset-0 z-10 animate-pop-reveal flex flex-col items-center justify-center p-6 text-center bg-slate-100/80 backdrop-blur-sm">
                        <div className="text-6xl mb-4 opacity-50">🍽️</div>
                        <p className="text-slate-600 font-bold text-lg mb-1">No Match</p>
                        <p className="text-slate-400 text-sm">Nothing else found nearby.</p>
                    </div>
                 )
              ) : null}

              {/* Spinning Gradient Overlay */}
              {reelStatus[index] === 'spinning' && (
                 <div className="absolute inset-0 bg-gradient-to-b from-slate-300 via-transparent to-slate-300 z-20"></div>
              )}
            </div>
            
            <div className="absolute -inset-2 -z-10 rounded-[2rem] border-2 border-dashed border-slate-200 opacity-50"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
