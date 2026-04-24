"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose your batch",
    description: "Select from this week’s signature cookies."
  },
  {
    number: "02",
    title: "Reserve your order",
    description: "Submit your details and secure your place in the drop."
  },
  {
    number: "03",
    title: "Watch your inbox",
    description: "We’ll send your order summary and the next update as checkout goes live."
  },
  {
    number: "04",
    title: "Baked fresh, released weekly",
    description: "Every batch is made in limited quantities to protect quality, freshness, and consistency."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-[#F6F0E7] text-[#163126] relative overflow-hidden">
      {/* Subtle texture or grain overlay can be added here if needed */}
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Header section */}
        <div className="max-w-3xl mb-20 md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-[#C7A44C] tracking-[0.3em] uppercase text-xs font-bold mb-6"
          >
            THE DROP PROCESS
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-normal mb-10 tracking-tight leading-[1.1]"
          >
            How the Drop Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="font-serif text-xl md:text-2xl text-[#163126]/70 leading-relaxed italic"
          >
            Sundays releases a limited batch each week. Orders remain open only until the weekly drop is filled.
          </motion.p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {steps.map((step, idx) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className="flex flex-col group"
            >
              <div className="mb-8">
                <span className="font-serif text-6xl md:text-7xl text-[#C7A44C]/20 group-hover:text-[#C7A44C]/40 transition-colors duration-500 block leading-none">
                  {step.number}
                </span>
                <div className="h-px w-12 bg-[#C7A44C] mt-6" />
              </div>
              
              <h3 className="font-serif text-2xl md:text-3xl mb-4 text-[#163126]">
                {step.title}
              </h3>
              
              <p className="font-sans text-base text-[#163126]/60 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing statement */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-24 pt-12 border-t border-[#163126]/10"
        >
          <p className="font-sans text-xs tracking-[0.3em] font-bold uppercase text-[#C7A44C]">
            Only 50 orders are accepted each week.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
