
import React, { useState, useEffect } from 'react';
import { Mascot } from './Mascot';

const MESSAGES = [
  "Scavenging for the best bites...",
  "Putting on my dinner tuxedo...",
  "Sniffing out hidden gems...",
  "Checking the local dens...",
  "Consulting the food oracle...",
  "Polishing the silverware...",
  "Rummaging through the menu...",
];

export const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-8">
        <Mascot expression="thinking" className="w-32 h-32 md:w-40 md:h-40" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 animate-pulse min-h-[64px]">
        {MESSAGES[messageIndex]}
      </h2>
      <p className="text-gray-500 mt-2">Foxie is finding a spot for you...</p>
    </div>
  );
};
