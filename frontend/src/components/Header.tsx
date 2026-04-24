import React from "react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Ticker Bar */}
      <div className="bg-[#030A08] text-gold h-10 flex items-center overflow-hidden border-b border-gold/5 select-none">
        <div className="flex w-max animate-ticker-seamless">
          <div className="flex items-center whitespace-nowrap px-4 text-[11px] tracking-[0.2em] uppercase font-medium">
            <span className="mx-12">CALORIES DON’T COUNT ON SUNDAYS</span>
            <span className="text-gold/30">✦</span>
            <span className="mx-12">FREE DELIVERY ABOVE ₹899</span>
            <span className="text-gold/30">✦</span>
            <span className="mx-12">HYDERABAD ONLY</span>
            <span className="text-gold/30">✦</span>
            <span className="mx-12">FREE TOTE BAG ABOVE ₹1099</span>
            <span className="text-gold/30">✦</span>
          </div>
          <div className="flex items-center whitespace-nowrap px-4 text-[11px] tracking-[0.2em] uppercase font-medium">
            <span className="mx-12">CALORIES DON’T COUNT ON SUNDAYS</span>
            <span className="text-gold/30">✦</span>
            <span className="mx-12">FREE DELIVERY ABOVE ₹899</span>
            <span className="text-gold/30">✦</span>
            <span className="mx-12">HYDERABAD ONLY</span>
            <span className="text-gold/30">✦</span>
            <span className="mx-12">FREE TOTE BAG ABOVE ₹1099</span>
            <span className="text-gold/30">✦</span>
          </div>
        </div>
      </div>

      <nav className="h-16 flex items-center border-b border-gold/5 bg-deep-forest sticky top-10 z-[100]">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="flex items-center text-xl md:text-2xl font-serif font-bold tracking-[0.2em] uppercase"
          >
            {/* SUN */}
            <div className="flex text-white">
              {["S", "U", "N"].map((letter, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* DAYS */}
            <div className="flex text-gold">
              {["D", "A", "Y", "S"].map((letter, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <div className="hidden md:flex gap-10 items-center text-[12px] tracking-widest font-bold text-cream uppercase">
            <a href="#menu" className="hover:text-gold transition-colors">Menu</a>
            <a href="#craft" className="hover:text-gold transition-colors">The Craft</a>
            <a href="#story" className="hover:text-gold transition-colors">Our Story</a>
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-cart'));
              }}
              className="relative hover:text-gold transition-colors flex items-center gap-2"
            >
              Cart
              <span className="w-1.5 h-1.5 bg-tan rounded-full shadow-[0_0_8px_rgba(194,163,93,0.8)]"></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
