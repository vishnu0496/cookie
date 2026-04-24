"use client";

import { motion } from "framer-motion";

const reasons = [
  {
    num: "01",
    title: "24-Hour Dough",
    desc: "Cold-resting the dough for a full day lets the flavours develop slowly — creating depth that same-day baking simply can't achieve.",
  },
  {
    num: "02",
    title: "Browned Butter",
    desc: "We brown every batch of butter to a deep, nutty amber before it touches sugar. One extra step that transforms the entire cookie.",
  },
  {
    num: "03",
    title: "Premium Cocoa",
    desc: "High-grade dark chocolate, sourced for its rich bittersweet notes. It melts into the dough rather than sitting on top of it.",
  },
  {
    num: "04",
    title: "Limited Batches",
    desc: "Fifty orders. Every week. Mass production compromises texture. We keep it small so every cookie is exactly what it should be.",
  },
];

export function WhyWait() {
  return (
    <section className="py-24 px-6 bg-cream text-forest">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <p className="text-gold tracking-[0.2em] uppercase text-sm font-sans mb-4">Nothing Good Comes Easy</p>
          <h2 className="font-serif text-4xl md:text-5xl font-medium">Why it&rsquo;s worth the wait.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="flex flex-col border-t border-forest/10 pt-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="font-sans text-xs tracking-widest text-gold">{reason.num}</span>
                <h3 className="font-serif text-2xl">{reason.title}</h3>
              </div>
              <p className="font-serif text-forest/70 leading-relaxed max-w-sm ml-10">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
