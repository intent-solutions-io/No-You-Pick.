
import React from 'react';

interface MascotProps {
  className?: string;
  expression?: 'happy' | 'thinking' | 'sad' | 'surprised';
}

export const Mascot: React.FC<MascotProps> = ({ className = "w-32 h-32", expression = 'happy' }) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-transform duration-300 hover:scale-105 select-none`}>
       {/* 
          HappyCow-Inspired Fox Mascot
          Style: Cute, Rounded, Friendly, Vibrant, Vector-like
       */}
       <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
             {/* Vibrant Orange Gradient */}
             <linearGradient id="furGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9F43" /> {/* Warm Orange */}
                <stop offset="100%" stopColor="#EE5A24" /> {/* Deep Orange */}
             </linearGradient>

             {/* Soft White Gradient for Face */}
             <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F1F2F6" />
             </linearGradient>
             
             {/* Inner Ear (Yellow/Pinkish tone) */}
             <linearGradient id="innerEar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFC312" /> 
                <stop offset="100%" stopColor="#F79F1F" />
             </linearGradient>
          </defs>

          {/* --- BODY --- */}
          {/* Small rounded body */}
          <path 
            d="M 65 155 Q 50 185 70 195 L 130 195 Q 150 185 135 155" 
            fill="url(#furGrad)" 
          />
          {/* White Belly Patch */}
          <ellipse cx="100" cy="175" rx="20" ry="14" fill="white" opacity="0.9" />

          {/* --- TAIL (Peeking out) --- */}
          <path d="M 130 170 Q 150 160 155 180" stroke="url(#furGrad)" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <circle cx="155" cy="180" r="6" fill="white"/>

          {/* --- HEAD --- */}
          {/* Main Head Shape - Round & Wide (Chibi Style) */}
          <path 
            d="M 35 90 Q 35 35 100 35 Q 165 35 165 90 Q 170 125 150 145 Q 130 165 100 165 Q 70 165 50 145 Q 30 125 35 90" 
            fill="url(#furGrad)" 
          />

          {/* Top Hair Tuft (Signature HappyCow element) */}
          <path 
             d="M 95 35 Q 90 15 100 10 Q 110 15 105 35" 
             fill="url(#furGrad)" 
          />

          {/* Ears - Rounded, not too pointy */}
          <g>
            {/* Left Ear */}
            <path d="M 45 60 Q 20 30 55 25 Q 65 40 60 60" fill="url(#furGrad)" />
            <path d="M 48 55 Q 35 40 52 35" fill="url(#innerEar)" opacity="0.9" />
            
            {/* Right Ear */}
            <path d="M 155 60 Q 180 30 145 25 Q 135 40 140 60" fill="url(#furGrad)" />
            <path d="M 152 55 Q 165 40 148 35" fill="url(#innerEar)" opacity="0.9" />
          </g>

          {/* Face Mask / Muzzle - The "Cow" Curve adapted for Fox */}
          <path 
             d="
               M 100 80
               Q 135 80 150 100
               Q 155 120 145 135
               Q 125 158 100 158
               Q 75 158 55 135
               Q 45 120 50 100
               Q 65 80 100 80 Z
             " 
             fill="url(#whiteGrad)" 
          />

          {/* --- FACE FEATURES --- */}
          
          {/* Eyes - Tall Ovals, Wide Set, Friendly */}
          <g transform="translate(0, 12)">
             <ellipse cx="75" cy="105" rx="8" ry="12" fill="#2D3436" />
             <circle cx="72" cy="100" r="3.5" fill="white" />
             
             <ellipse cx="125" cy="105" rx="8" ry="12" fill="#2D3436" />
             <circle cx="122" cy="100" r="3.5" fill="white" />
          </g>

          {/* Nose - Rounded Triangle */}
          <path 
            d="M 92 125 Q 100 122 108 125 Q 100 135 92 125" 
            fill="#2D3436" 
          />
          <ellipse cx="100" cy="126" rx="3" ry="1.5" fill="white" opacity="0.3" />

          {/* Cheeks - Rosy Circles */}
          <circle cx="55" cy="120" r="7" fill="#FF7675" opacity="0.5" />
          <circle cx="145" cy="120" r="7" fill="#FF7675" opacity="0.5" />

          {/* Mouth - Dynamic Expressions */}
          <g transform="translate(0, 8)">
            {expression === 'happy' && (
              <path d="M 88 132 Q 100 142 112 132" stroke="#2D3436" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {expression === 'thinking' && (
               <line x1="92" y1="135" x2="108" y2="135" stroke="#2D3436" strokeWidth="3" strokeLinecap="round" />
            )}
            {expression === 'surprised' && (
               <circle cx="100" cy="135" r="4" fill="#2D3436" />
            )}
             {expression === 'sad' && (
              <path d="M 88 138 Q 100 128 112 138" stroke="#2D3436" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </g>

          {/* Arms - Simple Nubs waving/holding belly */}
           <path d="M 68 165 Q 55 175 80 180" stroke="url(#furGrad)" strokeWidth="9" strokeLinecap="round" fill="none" />
           <path d="M 132 165 Q 145 175 120 180" stroke="url(#furGrad)" strokeWidth="9" strokeLinecap="round" fill="none" />

       </svg>
    </div>
  );
};
