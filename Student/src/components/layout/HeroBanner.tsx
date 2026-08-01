import React from 'react';

interface HeroBannerProps {
  image: string;
  title: string;
  subtitle?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ image, title, subtitle }) => {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-[200px] sm:h-[260px] md:h-[300px] overflow-hidden mb-6 no-print -mt-4 sm:-mt-6 lg:-mt-8">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover brightness-[0.45] contrast-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent flex flex-col justify-end">
        <div className="max-w-7xl w-full mx-auto p-6 sm:p-8">
          <span className="text-[10px] text-primary-light font-black tracking-widest uppercase block mb-1">OM SAI PG</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 font-semibold tracking-wide uppercase">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
