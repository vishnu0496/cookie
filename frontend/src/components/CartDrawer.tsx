"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface OrderItem {
  packName: string;
  selections: Record<string, number>;
  price: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: OrderItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
}

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity }: CartDrawerProps) {
  const [stage, setStage] = useState<'cart' | 'checkout'>('cart');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: ""
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryGoal = 899;
  const toteGoal = 1099;
  
  const deliveryFee = subtotal >= deliveryGoal || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;
  const hasFreeTote = total >= toteGoal;

  const deliveryProgress = Math.min((subtotal / deliveryGoal) * 100, 100);
  const toteProgress = Math.min((subtotal / toteGoal) * 100, 100);

  const handleWhatsAppOrder = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in your name, email, phone, and address.");
      return;
    }

    let message = `*✨ NEW ORDER - SUNDAYS COOKIES ✨*%0A%0A`;
    message += `*👤 CUSTOMER DETAILS*%0A`;
    message += `Name: ${formData.name}%0A`;
    message += `Email: ${formData.email}%0A`;
    message += `Phone: ${formData.phone}%0A`;
    message += `Address: ${formData.address}%0A`;
    if (formData.note) message += `Note: _${formData.note}_%0A`;
    
    message += `%0A*📦 BOX BREAKDOWN*%0A`;

    cart.forEach((item, index) => {
      message += `%0A*BOX #${index + 1} (${item.packName})*%0A`;
      Object.entries(item.selections).forEach(([cookie, count]) => {
        if (count > 0) message += `• ${cookie}: ${count}%0A`;
      });
      if (item.packName === "5+1 Free Pack") message += `• _Chocolate Chip: 1 (FREE BONUS)_%0A`;
    });

    message += `%0A*──────────────────*%0A`;
    message += `*Subtotal:* ₹${subtotal}%0A`;
    message += `*Delivery:* ${deliveryFee === 0 ? "*FREE*" : `₹${deliveryFee}`}%0A`;
    if (hasFreeTote) message += `*Gift:* *FREE TOTE BAG 🎁*%0A`;
    message += `%0A*TOTAL AMOUNT: ₹${total}*%0A`;
    message += `*──────────────────*%0A%0A`;
    message += `_Please confirm availability for delivery!_`;

    window.open(`https://wa.me/919177155540?text=${message}`, "_blank");
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCompleteOrder = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all delivery details.");
      return;
    }

    const deliveryCharge = subtotal >= 899 ? 0 : 50;
    
    setIsProcessing(true);
    try {
      const apiUrl = `${window.location.origin}/api/order`;
      console.log(">>> [Cart] Sending order to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            firstName: formData.name ? formData.name.split(' ')[0] : 'Customer',
            email: formData.email,
            whatsapp: formData.phone,
            addressHouse: formData.address,
            addressLocality: "Hyderabad",
            addressCity: "Hyderabad",
            addressState: "Telangana",
            addressPincode: "500001",
          },
          items: cart.map(item => ({
            name: item.packName,
            quantity: 1,
            price: item.price,
            selections: item.selections
          })),
          subtotal,
          delivery: deliveryCharge,
          total: subtotal + deliveryCharge
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setOrderSuccess(true);
        handleWhatsAppOrder();
      } else {
        alert(result.error || "Order failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Order error:", error);
      alert(`System Error: ${error.message || "Could not connect to server"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/80 z-[100]" onClick={onClose} />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }}
              className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#050D0A] z-[101] flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-8 border border-gold/20">
                <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-4xl font-serif text-white mb-4">Order Reserved</h2>
              <p className="text-tan/60 text-lg mb-10 font-serif italic">Check your email for your receipt. We are preparing your box of joy!</p>
              <button onClick={onClose} className="premium-button w-full py-6">Back to Sundays</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[100]"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#050D0A] border-l border-gold/10 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-gold/10 flex justify-between items-center">
              <div>
                <p className="text-[11px] tracking-[0.3em] font-bold text-gold-muted uppercase mb-1">
                  {stage === 'cart' ? 'Your Selection' : 'Place Your Order'}
                </p>
                <h2 className="text-3xl font-serif text-white">
                  {stage === 'cart' ? 'Order Summary' : 'Almost There'}
                </h2>
              </div>
              <button onClick={onClose} className="text-gold-muted hover:text-white transition-colors">
                <span className="text-[11px] tracking-widest uppercase font-bold">Close</span>
              </button>
            </div>

            {/* Stages Container */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-8 space-y-10">
                {stage === 'cart' ? (
                  <div className="space-y-10">
                    {/* Rewards Tracker */}
                    <div className="space-y-5 pb-8 border-b border-gold/5">
                      <div className="flex justify-between text-[11px] tracking-widest uppercase font-bold">
                        <span className={subtotal >= deliveryGoal ? "text-green-500" : "text-gold-muted"}>
                          {subtotal >= deliveryGoal ? "Free Delivery Unlocked" : `₹${deliveryGoal - subtotal} more for Free Delivery`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${subtotal >= deliveryGoal ? "bg-green-500" : "bg-gold"}`} style={{ width: `${deliveryProgress}%` }} />
                      </div>
                      
                      <div className="flex justify-between text-[11px] tracking-widest uppercase font-bold">
                        <span className={subtotal >= toteGoal ? "text-green-500" : "text-gold-muted"}>
                          {subtotal >= toteGoal ? "Free Tote Bag Unlocked" : `₹${toteGoal - subtotal} more for Free Tote`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${subtotal >= toteGoal ? "bg-green-500" : "bg-tan"}`} style={{ width: `${toteProgress}%` }} />
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-6">
                      {cart.length === 0 ? (
                        <p className="text-white/20 font-serif italic text-center py-20 text-xl">Your selection is empty.</p>
                      ) : (
                        cart.map((item, index) => (
                          <div key={index} className="bg-white/[0.03] border border-gold/5 rounded-2xl p-6 space-y-4 relative overflow-hidden group">
                            <span className="absolute -right-2 -top-4 text-7xl font-serif text-white/[0.02] italic select-none">
                              {index + 1}
                            </span>

                            <div className="flex justify-between items-center">
                              <span className="text-tan text-[12px] tracking-[0.3em] font-bold uppercase">Box #{index + 1}</span>
                              <button onClick={() => onUpdateQuantity(index, -1)} className="text-white/40 hover:text-red-400 transition-colors text-[11px] uppercase tracking-widest font-bold">Remove</button>
                            </div>

                            <div className="flex justify-between items-baseline">
                              <h3 className="text-2xl font-serif text-white">{item.packName}</h3>
                              <span className="text-white font-serif text-xl">₹{item.price}</span>
                            </div>

                            <div className="space-y-3 pt-3 border-l-2 border-gold/10 pl-6">
                              {Object.entries(item.selections).filter(([_, count]) => count > 0).map(([name, count]) => (
                                <div key={name} className="flex justify-between text-sm">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ 
                                        backgroundColor: name === "Chocolate Chip" ? "#C7A44C" : 
                                                        name === "Nutella Stuffed" ? "#4B3621" : "#FDFD96" 
                                      }} 
                                    />
                                    <span className="text-white/60 italic font-serif text-lg">{name}</span>
                                  </div>
                                  <span className="text-tan font-bold">x{count}</span>
                                </div>
                              ))}
                              {item.packName === "5+1 Free Pack" && (
                                <div className="flex justify-between items-center text-sm border-t border-gold/5 pt-2 mt-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                    <span className="text-gold italic font-serif">Chocolate Chip (Bonus)</span>
                                  </div>
                                  <span className="text-gold font-bold">x1</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <button onClick={() => setStage('cart')} className="text-gold-muted hover:text-white transition-colors text-[11px] tracking-widest uppercase font-bold flex items-center gap-2 mb-8">
                      ← Back to Selection
                    </button>
                    
                    <div className="space-y-10">
                      <div>
                        <label className="block text-gold-muted text-[11px] tracking-[0.2em] uppercase font-bold mb-4">Your Name</label>
                        <input type="text" placeholder="Full name" className="input-premium h-14 text-base" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-gold-muted text-[11px] tracking-[0.2em] uppercase font-bold mb-4">Email Address</label>
                        <input type="email" placeholder="hello@example.com" className="input-premium h-14 text-base" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-gold-muted text-[11px] tracking-[0.2em] uppercase font-bold mb-4">WhatsApp Number</label>
                        <input type="tel" placeholder="+91 98765 43210" className="input-premium h-14 text-base" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-gold-muted text-[11px] tracking-[0.2em] uppercase font-bold mb-4">Delivery Address</label>
                        <textarea placeholder="Full address, Hyderabad" className="input-premium min-h-[140px] py-4 text-base" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-gold-muted text-[11px] tracking-[0.2em] uppercase font-bold mb-4">Note (Optional)</label>
                        <input type="text" placeholder="Any special requests?" className="input-premium h-14 text-base" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gold/10 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-8">
                <span className="text-white/40 uppercase tracking-widest text-[11px] font-bold">
                  {stage === 'cart' ? 'Total Selection' : 'Grand Total'}
                </span>
                <span className="text-tan text-3xl font-serif font-bold">₹{total}</span>
              </div>
              
              {stage === 'cart' ? (
                <button 
                  onClick={() => setStage('checkout')}
                  disabled={cart.length === 0}
                  className="premium-button w-full py-6 disabled:opacity-20"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <button 
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className="premium-button w-full py-6 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Send Order'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
