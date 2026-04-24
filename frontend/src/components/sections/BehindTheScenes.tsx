"use client";

import { motion } from "framer-motion";

export function BehindTheScenes() {
  return (
    <section className="py-24 px-6 bg-butter text-forest">
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
            className="w-full lg:w-1/2"
          >
            <motion.div 
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(199, 164, 76, 0.25)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative h-[60vh] lg:h-[80vh] w-full rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer group border border-transparent hover:border-[#C7A44C]/20"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("/images/craft_new.png")' }}
              />
              {/* Subtle gold overlay tint that appears softly on hover */}
              <div className="absolute inset-0 bg-[#C7A44C]/0 group-hover:bg-[#C7A44C]/10 transition-colors duration-700 pointer-events-none mix-blend-overlay" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <p className="text-cocoa tracking-[0.2em] uppercase text-sm font-sans mb-6">
              The Craft
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium mb-8 leading-tight text-chocolate">
              A cookie you won&rsquo;t forget.
            </h2>
            <p className="font-serif text-lg text-chocolate/80 max-w-md mb-6 leading-relaxed">
              Rich, warm, and balanced in a way that isn&rsquo;t accidental. The kind of thing you think about the next morning &mdash; not because it was designed to be addictive, but because we simply refused to settle for less.
            </p>
            <p className="font-serif text-lg text-chocolate/80 max-w-md leading-relaxed">
              Fifty a week. Not because we can&rsquo;t make more. Because we won&rsquo;t.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
