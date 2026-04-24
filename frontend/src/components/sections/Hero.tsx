"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Ken Burns Effect */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat origin-center"
        style={{ backgroundImage: 'url("/images/hero.png")' }}
        initial={{ scale: 1.0 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Readability Overlays - Premium Polish */}
      <div className="absolute inset-0 z-0 bg-black/40" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_80%,#000000_100%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col justify-center items-center text-center px-6 pt-16">
        
        {/* Mask Reveal: Eyebrow */}
        <div className="overflow-hidden mb-10 md:mb-12">
          <motion.p
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            className="text-gold tracking-[0.2em] uppercase text-xs md:text-sm font-bold font-sans"
          >
            THE 24-HOUR COOKIE
          </motion.p>
        </div>
        
        {/* Mask Reveal: Title */}
        <div className="overflow-hidden pb-4 mb-12 md:mb-16">
          <motion.h1
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="font-serif text-7xl md:text-8xl lg:text-[11rem] text-cream font-normal tracking-tight"
          >
            Sundays
          </motion.h1>
        </div>

        {/* Mask Reveal: Subtitle */}
        <div className="overflow-hidden mb-16 md:mb-20">
          <motion.p
            initial={{ y: "120%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
            className="text-cream/95 font-serif italic text-2xl md:text-3xl lg:text-4xl max-w-xl tracking-wide"
          >
            Calories don't count on Sundays.
          </motion.p>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button 
              className="bg-[#C7A44C] text-[#163126] font-bold px-12 md:px-14 py-5 text-xs md:text-sm tracking-[0.25em] shadow-2xl hover:bg-[#D8B45C] whitespace-nowrap border border-[#D8B45C]/20"
              onClick={() => document.getElementById('drop')?.scrollIntoView({ behavior: 'smooth' })}
            >
              VIEW THIS WEEK'S DROP
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Affordance */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="text-[#C7A44C] text-[9px] tracking-[0.3em] uppercase opacity-70">Scroll</span>
        <div className="h-16 w-px bg-white/10 overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#C7A44C] to-transparent"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
