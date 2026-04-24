"use client";

import { motion } from "framer-motion";

export function InstagramTeaser() {
  return (
    <section className="py-24 px-6 bg-cream text-forest text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="max-w-2xl flex flex-col items-center"
      >
        <p className="text-gold tracking-[0.2em] uppercase text-sm font-sans mb-4">Follow the Journey</p>
        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-8">Join us on Instagram</h2>
        <p className="font-serif text-forest/70 text-lg mb-10">
          For drops, kitchen tests, and early access announcements each week.
        </p>

        <a 
          href="https://instagram.com/sundays.hyd" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 font-sans tracking-widest text-sm uppercase text-forest hover:text-gold transition-colors relative group"
        >
          @SUNDAYS.HYD
          <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-forest/20 group-hover:bg-gold transition-colors" />
        </a>
      </motion.div>
    </section>
  );
}
