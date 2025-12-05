
import React, { useState, useEffect } from 'react';
import { generateMascotImage } from '../services/geminiService';

interface MascotProps {
  className?: string;
  expression?: 'happy' | 'thinking' | 'sad' | 'surprised';
}

/**
 * Helper to remove white background from the generated image using a Canvas.
 * It detects near-white pixels and makes them transparent.
 */
const removeWhiteBackground = (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Iterate through pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Threshold for "white". Since it's a generated image, it might not be perfect 255.
        // We use a high threshold to avoid eating into the fox's white fur if it's shaded.
        // Pure background white usually is > 240 in all channels.
        if (r > 245 && g > 245 && b > 245) {
          data[i + 3] = 0; // Set Alpha to 0 (Transparent)
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      resolve(imageSrc);
    };
    img.src = imageSrc;
  });
};

export const Mascot: React.FC<MascotProps> = ({ className = "w-32 h-32", expression = 'happy' }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // 1. Check if we already have the generated mascot in storage (Updated key to v5)
    const stored = localStorage.getItem('food_roulette_mascot_v5');
    if (stored) {
      setImageUrl(stored);
      return;
    }

    // 2. If not, generate it
    const fetchMascot = async () => {
      setLoading(true);
      const generatedUrl = await generateMascotImage();
      
      if (generatedUrl) {
        // Process the image to remove the background before saving
        try {
          const transparentUrl = await removeWhiteBackground(generatedUrl);
          setImageUrl(transparentUrl);
          localStorage.setItem('food_roulette_mascot_v5', transparentUrl);
        } catch (e) {
          console.warn("Failed to process background transparency", e);
          // Fallback to original if processing fails
          setImageUrl(generatedUrl);
          localStorage.setItem('food_roulette_mascot_v5', generatedUrl);
        }
      } else {
        // Fallback if generation failed or cancelled
        setUseFallback(true);
      }
      setLoading(false);
    };

    fetchMascot();
  }, []);

  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt="Foxie the Mascot" 
        // Removed mix-blend-multiply as we now have real transparency
        className={`${className} object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 filter brightness-105 saturate-110`}
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }}
      />
    );
  }

  if (useFallback || loading) {
     return (
        <div className={`${className} relative flex flex-col items-center justify-center ${loading ? 'animate-pulse' : ''}`}>
           {/* Fallback Vector Fox */}
           <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 <linearGradient id="foxFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fb923c"/><stop offset="1" stopColor="#c2410c"/></linearGradient>
                 <linearGradient id="hatGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff"/><stop offset="1" stopColor="#e5e7eb"/></linearGradient>
              </defs>
              <g transform="translate(100, 100) scale(0.9)">
                 {/* Body */}
                 <path d="M-40 60 C-50 80 -40 100 0 100 C40 100 50 80 40 60 L30 100 L-30 100 Z" fill="#fff" stroke="#d1d5db" strokeWidth="2"/>
                 {/* Head */}
                 <path d="M-50 -10 Q-60 30 -20 50 Q0 60 20 50 Q60 30 50 -10 Q40 -50 0 -50 Q-40 -50 -50 -10" fill="url(#foxFur)"/>
                 {/* Cheeks */}
                 <path d="M-20 20 Q-40 30 -20 50 L20 50 Q40 30 20 20" fill="#fff9eb"/>
                 {/* Ears */}
                 <path d="M-40 -40 L-60 -80 L-20 -50" fill="url(#foxFur)"/>
                 <path d="M40 -40 L60 -80 L20 -50" fill="url(#foxFur)"/>
                 {/* Chef Hat */}
                 <path d="M-30 -50 L30 -50 L35 -80 C40 -100 -40 -100 -35 -80 Z" fill="url(#hatGrad)" stroke="#d1d5db"/>
                 {/* Eyes */}
                 <circle cx="-15" cy="0" r="8" fill="#1f2937"/>
                 <circle cx="-12" cy="-3" r="3" fill="white"/>
                 <circle cx="15" cy="0" r="8" fill="#1f2937"/>
                 <circle cx="18" cy="-3" r="3" fill="white"/>
                 {/* Nose */}
                 <ellipse cx="0" cy="25" rx="5" ry="3" fill="#1f2937"/>
              </g>
           </svg>

           {loading && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg border border-orange-100 text-[10px] font-bold text-orange-600 whitespace-nowrap z-20">
                Cooking up mascot...
            </div>
           )}
        </div>
     );
  }
  
  return null;
};
