
import React, { useId } from 'react';

interface MascotProps {
  className?: string;
  expression?: 'happy' | 'thinking' | 'sad' | 'surprised';
  imageSrc?: string | null;
}

export const Mascot: React.FC<MascotProps> = ({ className = "w-32 h-32", expression = 'happy', imageSrc }) => {
  // Styles inspired by "The Futur" / Chris Do: Bold, Geometric, Minimalist, High Contrast.
  
  if (imageSrc) {
    return (
       <div className={`${className} relative flex items-center justify-center transition-transform duration-300 hover:scale-105 select-none`}>
           <img 
              src={imageSrc} 
              alt="Custom Chef Fox Mascot" 
              className="w-full h-full object-contain drop-shadow-2xl animate-fade-in rounded-2xl" 
           />
       </div>
    )
  }

  return (
    <div className={`${className} relative flex items-center justify-center transition-transform duration-300 hover:scale-105 select-none`}>
       {/* 
          "The Designer Fox" 
          Style: Flat, Vector, Geometric.
          Traits: Thick Black Glasses (Chris Do), Chef Hat, Confident.
       */}
       <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15"/>
            </filter>
          </defs>

          {/* --- MAIN HEAD GROUP --- */}
          <g transform="translate(200, 220)">
            
            {/* Ears (Geometric Triangles) */}
            <path d="M -90 -80 L -120 -160 L -40 -110 Z" fill="#EA580C" stroke="#fff" strokeWidth="4" strokeLinejoin="round"/> {/* Left Ear */}
            <path d="M 90 -80 L 120 -160 L 40 -110 Z" fill="#EA580C" stroke="#fff" strokeWidth="4" strokeLinejoin="round"/>   {/* Right Ear */}
            
            {/* Inner Ear Detail (Simpler) */}
            <path d="M -95 -90 L -110 -140 L -60 -110 Z" fill="#FDBA74" />
            <path d="M 95 -90 L 110 -140 L 60 -110 Z" fill="#FDBA74" />

            {/* Cheeks / Fluff (Geometric Circles) */}
            <circle cx="-90" cy="20" r="50" fill="#fff" />
            <circle cx="90" cy="20" r="50" fill="#fff" />

            {/* Main Face Shape (Squircle/Shield) */}
            <path 
              d="M -100 -80 C -100 -140, 100 -140, 100 -80 L 100 0 C 100 80, 50 130, 0 140 C -50 130, -100 80, -100 0 Z" 
              fill="#F97316" 
              stroke="#fff" strokeWidth="4"
            />
            
            {/* White Muzzle (Heart/Diamond Shape) */}
            <path 
              d="M -100 0 C -100 -30, -50 -50, 0 -30 C 50 -50, 100 -30, 100 0 L 100 10 C 100 70, 50 120, 0 130 C -50 120, -100 70, -100 10 Z" 
              fill="#FFFFFF"
            />

            {/* Nose (Rounded Rectangle - Minimal) */}
            <rect x="-20" y="55" width="40" height="25" rx="12" fill="#111827" />
            <ellipse cx="-8" cy="62" rx="4" ry="3" fill="#374151" /> {/* Highlight */}

            {/* Mouth (Confident Smirk) */}
            <path d="M -20 95 Q 0 105 20 95" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
            
            {/* --- THE CHRIS DO GLASSES --- */}
            {/* Thick Black Rims */}
            <g transform="translate(0, 10)">
               {/* Left Lens Frame */}
               <rect x="-85" y="-35" width="75" height="60" rx="10" fill="none" stroke="#111827" strokeWidth="8" />
               {/* Right Lens Frame */}
               <rect x="10" y="-35" width="75" height="60" rx="10" fill="none" stroke="#111827" strokeWidth="8" />
               {/* Bridge */}
               <line x1="-10" y1="-15" x2="10" y2="-15" stroke="#111827" strokeWidth="8" />
               
               {/* Eyes (Simple Dots behind glasses) */}
               <circle cx="-47" cy="-5" r="6" fill="#111827" />
               <circle cx="47" cy="-5" r="6" fill="#111827" />

               {/* Reflections on Glass */}
               <path d="M -75 -25 L -60 -25" stroke="#fff" strokeWidth="3" opacity="0.5" />
               <path d="M 20 -25 L 35 -25" stroke="#fff" strokeWidth="3" opacity="0.5" />
            </g>

          </g>

          {/* --- CHEF HAT (Toque) --- */}
          {/* Sits on top, clean lines */}
          <g transform="translate(200, 70)">
             {/* Main Puff */}
             <path 
               d="M -70 50 C -90 0, -50 -60, 0 -60 C 50 -60, 90 0, 70 50 Z" 
               fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="3"
             />
             {/* Hat Band */}
             <rect x="-60" y="50" width="120" height="30" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" />
          </g>
          
       </svg>
    </div>
  );
};
