import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'hero';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    // Changed from violet/fuchsia to Sky/Blue to be distinct from the Orange brand
    primary: "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:shadow-sky-500/30 py-3 px-6",
    secondary: "bg-white text-gray-800 border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 py-3 px-6 shadow-sm",
    outline: "bg-transparent border-2 border-white/30 text-white hover:bg-white/10 py-2 px-4",
    hero: `
      bg-gradient-to-b from-orange-400 to-red-600 text-white 
      text-xl md:text-2xl py-5 px-8 uppercase tracking-wider
      shadow-[0_8px_0_rgb(185,28,28)] hover:shadow-[0_5px_0_rgb(185,28,28)] hover:translate-y-[3px]
      active:shadow-none active:translate-y-[8px]
      border-t border-orange-300
    `
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};