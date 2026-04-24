"use client";

import { motion } from "framer-motion";

export function Philosophy() {
  return (
    <section className="py-32 px-6 bg-cream text-forest flex items-center justify-center">
      <div className="container mx-auto max-w-4xl text-center">
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-gold tracking-[0.2em] uppercase text-sm font-sans mb-12"
        >
          Our Philosophy
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight font-medium"
        >
          We believe in patience, obsessive craft, and absolutely no shortcuts. Each batch is a labor of love, designed to elevate the cookie from a simple treat to a premium indulgence.
        </motion.h2>

      </div>
    </section>
  );
}
