"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PackSection } from "@/components/PackSection";
import { CraftSection } from "@/components/CraftSection";
import { StorySection } from "@/components/StorySection";
import { StepsSection } from "@/components/StepsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { WhatsAppButton, Footer } from "@/components/FooterComponents";

import { motion, AnimatePresence } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";

interface OrderItem {
  packName: string;
  selections: Record<string, number>;
  price: number;
}

export default function Home() {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    
    // Dispatch initial and updated cart count
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { count: cart.length } 
    }));

    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, [cart]);

  const handleAddToCart = (pack: any, selections: Record<string, number>) => {
    const newItem: OrderItem = {
      packName: pack.name,
      selections: { ...selections },
      price: pack.price
    };
    setCart(prev => [...prev, newItem]);
    // Removed auto-open for a better shopping experience
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    if (delta < 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
    }
  };


  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <PackSection onAddToCart={handleAddToCart} />
      <CraftSection />
      <StorySection />
      <StepsSection />
      <TestimonialsSection />
      
      {/* Floating View Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-28 right-6 md:bottom-24 md:right-8 z-[90] bg-tan text-forest px-8 py-5 rounded-full font-bold tracking-[0.2em] uppercase text-[11px] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
          >
            View Cart
            <span className="bg-forest/10 w-5 h-5 flex items-center justify-center rounded-full text-[9px]">
              {cart.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <WhatsAppButton />
      <Footer />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </main>
  );
}
