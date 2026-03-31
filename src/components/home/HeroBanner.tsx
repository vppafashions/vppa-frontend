import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownIcon } from 'lucide-react';
export function HeroBanner() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
          alt="VPPA Luxury Fashion"
          className="w-full h-full object-cover object-center opacity-80" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-between text-white px-4 py-8 md:py-12">
        {/* Top */}
        <div className="w-full flex flex-col items-center mt-20 md:mt-12 animate-fade-in-up">
          <div className="w-px h-12 bg-primary/50 mb-6"></div>
          <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-light text-primary">
            Issue 01 — Spring/Summer 2026
          </p>
        </div>

        {/* Center */}
        <div
          className="flex flex-col items-center text-center animate-fade-in-up"
          style={{
            animationDelay: '200ms'
          }}>
          
          <h1 className="font-magazine text-7xl md:text-[12rem] leading-none font-light tracking-tight mb-6 md:mb-8">
            VPPA
          </h1>
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase font-light max-w-2xl mx-auto text-white/80">
            The Definitive Guide to Modern Masculinity
          </p>
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col items-center animate-fade-in-up"
          style={{
            animationDelay: '400ms'
          }}>
          
          <p className="text-xs tracking-[0.2em] uppercase font-light mb-4 text-white/60">
            Discover the Story
          </p>
          <ArrowDownIcon
            className="w-5 h-5 text-primary animate-bounce"
            strokeWidth={1} />
          
        </div>
      </div>
    </div>);

}