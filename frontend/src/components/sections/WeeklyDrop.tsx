"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type Cookie = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

const MENU: Cookie[] = [
  { id: 'lazy-legend', name: 'The Lazy Legend', description: 'Classic Choco Chip. Crisp edges, soft center, generous chocolate pools.', price: 180, image: '/images/lazy-legend.png' },
  { id: 'golden-affair', name: 'The Golden Affair', description: 'Lotus Biscoff. Caramelized Biscoff richness with a slow-melting finish.', price: 220, image: '/images/golden-affair.png' },
  { id: 'salted-noir', name: 'Salted Noir', description: 'Dark Chocolate + Flaky Sea Salt. Deep dark chocolate lifted with flakes of sea salt.', price: 220, image: '/images/salted-noir.png' },
  { id: 'little-rebels', name: 'Little Rebels', description: 'Mini Cookies. Small-batch mini cookies made for quick cravings and easy sharing.', price: 250, image: '/images/little-rebels.png' },
];

const DELIVERY_CHARGE = 50;

type SubmitState = {
  status: "idle" | "success" | "sold_out" | "error";
  message?: string;
};

export function WeeklyDrop() {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [customer, setCustomer] = useState({
    firstName: "",
    email: "",
    whatsapp: "",
    addressHouse: "",
    addressLocality: "",
    addressCity: "",
    addressState: "",
    addressPincode: "",
    addressLandmark: ""
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCustomer(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = MENU.find(c => c.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const grandTotal = cartTotal > 0 ? cartTotal + DELIVERY_CHARGE : 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const isJunk = (val: string) => val.trim().length < 2;
    
    if (isJunk(customer.firstName)) newErrors.firstName = "Your name is too short.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) newErrors.email = "Please enter a valid email address.";

    const whatsappClean = customer.whatsapp.replace(/\D/g, "");
    if (whatsappClean.length < 10 || whatsappClean.length > 13) newErrors.whatsapp = "Enter a valid 10-digit number.";

    if (isJunk(customer.addressHouse)) newErrors.addressHouse = "House/Flat number is required.";
    if (isJunk(customer.addressLocality)) newErrors.addressLocality = "Locality is required.";
    if (isJunk(customer.addressCity)) newErrors.addressCity = "Enter your City.";
    if (isJunk(customer.addressState)) newErrors.addressState = "Enter your State.";

    const pincodeClean = customer.addressPincode.replace(/\D/g, "");
    if (pincodeClean.length !== 6) newErrors.addressPincode = "Must be a 6-digit Pincode.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartTotal === 0) {
      alert("Please add at least one cookie to your cart.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    const orderItems = Object.entries(cart).map(([id, quantity]) => {
      const cookie = MENU.find(c => c.id === id);
      return {
        id,
        name: cookie?.name || id,
        price: cookie?.price || 0,
        quantity
      };
    });

    try {
      const payload = {
        customer,
        items: orderItems,
        subtotal: cartTotal,
        delivery: DELIVERY_CHARGE,
        total: grandTotal
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitState({
          status: "success",
          message: "Order Request Received"
        });
      } else if (res.status === 400 && data.status === "sold_out") {
        setSubmitState({
          status: "sold_out",
          message: data.error || "This week's drop is completely sold out."
        });
      } else {
        setSubmitState({
          status: "error",
          message: data.error || "Submission failed. Please try again."
        });
      }
    } catch (err) {
      console.error(err);
      setSubmitState({
        status: "error",
        message: "Network error. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = submitState.status === "success" || submitState.status === "sold_out";

  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSubmitted) {
      document.getElementById('drop')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    }
  }, [isSubmitted]);

  const [isInitialSoldOut, setIsInitialSoldOut] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/order");
        const data = await res.json();
        if (data.success && data.isSoldOut) {
          setIsInitialSoldOut(true);
          setSubmitState({ status: "sold_out", message: "This week’s drop is now sold out." });
        }
      } catch (err) {
        console.error("Failed to fetch initial status", err);
      }
    };
    checkStatus();
  }, []);

  const FloatingInput = ({
    id, label, required = true, error, type = "text",
    value, onChange, disabled, maxLength,
  }: {
    id: string; label: string; required?: boolean; error?: string;
    type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean; maxLength?: number;
  }) => (
    <div className="relative flex flex-col group/field">
      {/* Gold glow on focus */}
      <div className="absolute inset-0 -mx-4 -my-3 rounded-xl bg-[#C7A44C]/0 group-focus-within/field:bg-[#C7A44C]/5 transition-all duration-500 pointer-events-none" />
      <div className="relative pt-7">
        <input
          id={id}
          type={type}
          placeholder=" "
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={`peer bg-transparent border-b-2 text-[#F6F0E7] placeholder-transparent focus:outline-none text-xl font-serif py-3 px-0 transition-all duration-300 w-full ${
            error ? "border-red-400" : "border-[#E7D7B8]/30 focus:border-[#C7A44C]"
          }`}
        />
        <label
          htmlFor={id}
          className={`absolute left-0 font-sans font-bold uppercase tracking-widest pointer-events-none transition-all duration-300
            peer-placeholder-shown:top-10 peer-placeholder-shown:text-sm peer-placeholder-shown:opacity-40
            peer-focus:top-0 peer-focus:text-[10px] peer-focus:opacity-100
            top-0 text-[10px]
            ${!value ? '' : 'top-0 text-[10px] opacity-100'}
            ${error ? "text-red-400" : "peer-focus:text-[#C7A44C] text-[#F6F0E7]/80"}`}
        >
          {label}{required && <span className="text-[#C7A44C] ml-1">*</span>}
        </label>
      </div>
      {error && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] uppercase font-bold tracking-widest mt-2">
          {error}
        </motion.span>
      )}
    </div>
  );

  return (
    <section id="drop" className={`${isSubmitted ? 'pt-16 pb-24' : 'py-24 md:py-32'} bg-[#0A1410] text-[#F6F0E7] relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C7A44C]/30 to-transparent" />
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        <div className={`text-center ${isSubmitted ? 'mb-8' : 'mb-20'}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            className="text-[#C7A44C] tracking-[0.3em] uppercase text-xs font-bold mb-4"
          >
            Limited Weekly Batch
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-normal mb-8 tracking-tight"
          >
            This Week&rsquo;s Drop
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ delay: 0.2 }}
            className="font-serif text-xl text-[#E7D7B8]/80 max-w-2xl mx-auto italic leading-relaxed"
          >
            Hand-rolled, baked slowly, and delivered fresh to your door. Only 50 orders available this week.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ delay: 0.3 }}
            className={`mt-10 inline-block px-8 py-2 border rounded-full ${isInitialSoldOut ? "border-red-500/30 bg-red-500/5 text-red-400" : "border-[#C7A44C]/30 bg-[#C7A44C]/5 text-[#F6F0E7]"}`}
          >
            <p className="font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase">
              Current Drop Status: <span className={isInitialSoldOut ? "text-red-500" : "text-[#C7A44C]"}>{isInitialSoldOut ? "SOLD OUT" : "Live"}</span>
            </p>
          </motion.div>
        </div>

        {!isSubmitted ? (
          <>
            {/* ── Trust · Info Strip ─────────────────────────────────────── */}
            <div className="flex flex-wrap justify-center items-center gap-y-6 border-t border-b border-[#E7D7B8]/10 py-7 mb-20">
              <div className="text-center px-6 md:px-10">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-[#C7A44C] mb-1">50 slots per drop</p>
                <p className="font-serif text-xs italic text-[#E7D7B8]/50">strictly limited weekly</p>
              </div>
              <div className="hidden md:block w-px h-7 bg-[#E7D7B8]/15" />
              <div className="text-center px-6 md:px-10">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-[#C7A44C] mb-1">Hyderabad delivery</p>
                <p className="font-serif text-xs italic text-[#E7D7B8]/50">local area only</p>
              </div>
              <div className="hidden md:block w-px h-7 bg-[#E7D7B8]/15" />
              <div className="text-center px-6 md:px-10">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-[#C7A44C] mb-1">Reserve now, pay later</p>
                <p className="font-serif text-xs italic text-[#E7D7B8]/50">payment on confirmation</p>
              </div>
              <div className="hidden md:block w-px h-7 bg-[#E7D7B8]/15" />
              <div className="text-center px-6 md:px-10">
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-[#C7A44C] mb-1">Email confirmation</p>
                <p className="font-serif text-xs italic text-[#E7D7B8]/50">your summary, within the minute</p>
              </div>
            </div>
            {/* ─────────────────────────────────────────────────────────── */}

            <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            
            <div className="flex flex-col gap-12">
              <div className="flex items-center gap-6">
                <span className="flex-none font-sans text-xs font-bold tracking-[0.3em] uppercase text-[#C7A44C]">Step 01</span>
                <h3 className="flex-none font-serif text-2xl md:text-3xl text-[#F6F0E7]">Select Your Batch</h3>
                <div className="flex-grow h-px bg-gradient-to-r from-[#E7D7B8]/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {MENU.map((cookie, idx) => (
                  <motion.div 
                    key={cookie.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-[#12221A] rounded-[2.5rem] border border-[#E7D7B8]/10 hover:border-[#C7A44C]/40 transition-all duration-500 shadow-2xl flex flex-col h-full pointer-events-auto"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2.5rem] z-0">
                      <img 
                        src={cookie.image} 
                        alt={cookie.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12221A] via-transparent to-transparent opacity-60" />
                      <div className="absolute top-6 right-6">
                        <span className="bg-[#0A1410]/80 backdrop-blur-md text-[#C7A44C] font-sans text-sm font-bold px-5 py-2 rounded-full border border-[#C7A44C]/20">
                          ₹{cookie.price}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-serif text-3xl text-[#F6F0E7] group-hover:text-[#C7A44C] transition-colors duration-300">
                          {cookie.name}
                        </h4>
                      </div>
                      <p className="text-base font-serif text-[#E7D7B8]/60 leading-relaxed mb-10 flex-grow">
                        {cookie.description}
                      </p>

                      <div className="flex items-center justify-between bg-[#0A1410] rounded-2xl border border-[#E7D7B8]/10 p-2 shadow-inner">
                        <p className="pl-4 font-sans text-[10px] tracking-[0.2em] uppercase text-[#E7D7B8]/40 font-bold">Quantity</p>
                        <div className="flex items-center gap-6">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(cookie.id, -1)} 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-[#E7D7B8]/40 hover:text-[#C7A44C] hover:bg-[#C7A44C]/10 transition-all text-2xl"
                          >
                            &minus;
                          </button>
                          <span className="w-6 text-center font-sans text-xl font-bold text-[#F6F0E7]">{cart[cookie.id] || 0}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(cookie.id, 1)} 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-[#E7D7B8]/40 hover:text-[#C7A44C] hover:bg-[#C7A44C]/10 transition-all text-2xl"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              <div className="lg:col-span-7 flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  <span className="flex-none font-sans text-xs font-bold tracking-[0.3em] uppercase text-[#C7A44C]">Step 02</span>
                  <h3 className="flex-none font-serif text-2xl md:text-3xl text-[#F6F0E7]">Delivery Details</h3>
                  <div className="flex-grow h-px bg-gradient-to-r from-[#E7D7B8]/20 to-transparent" />
                </div>
                             <div className="bg-[#12221A] p-8 md:p-10 rounded-[2.5rem] border border-[#E7D7B8]/10 shadow-2xl space-y-8 transition-all duration-500 hover:shadow-[0_20px_80px_rgba(199,164,76,0.15)] hover:border-[#C7A44C]/20">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FloatingInput
                      id="firstName"
                      label="Full Name"
                      value={customer.firstName}
                      onChange={handleCustomerChange}
                      error={errors.firstName}
                      disabled={loading}
                    />
                    <FloatingInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      error={errors.email}
                      disabled={loading}
                    />
                  </div>

                  <FloatingInput
                    id="whatsapp"
                    label="WhatsApp / Contact"
                    type="tel"
                    value={customer.whatsapp}
                    onChange={handleCustomerChange}
                    error={errors.whatsapp}
                    disabled={loading}
                  />

                  <div className="space-y-8 pt-4 border-t border-[#E7D7B8]/10">
                    <p className="font-sans text-[10px] tracking-[0.3em] font-bold uppercase text-[#E7D7B8]/50">Shipping Destination</p>

                    <FloatingInput
                      id="addressHouse"
                      label="House / Flat / Building"
                      value={customer.addressHouse}
                      onChange={handleCustomerChange}
                      error={errors.addressHouse}
                      disabled={loading}
                    />

                    <FloatingInput
                      id="addressLocality"
                      label="Area / Locality"
                      value={customer.addressLocality}
                      onChange={handleCustomerChange}
                      error={errors.addressLocality}
                      disabled={loading}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <FloatingInput
                        id="addressCity"
                        label="City"
                        value={customer.addressCity}
                        onChange={handleCustomerChange}
                        error={errors.addressCity}
                        disabled={loading}
                      />
                      <FloatingInput
                        id="addressState"
                        label="State"
                        value={customer.addressState}
                        onChange={handleCustomerChange}
                        error={errors.addressState}
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <FloatingInput
                        id="addressPincode"
                        label="Pincode"
                        value={customer.addressPincode}
                        onChange={handleCustomerChange}
                        error={errors.addressPincode}
                        disabled={loading}
                        maxLength={6}
                      />
                      <FloatingInput
                        id="addressLandmark"
                        label="Landmark (Optional)"
                        required={false}
                        value={customer.addressLandmark}
                        onChange={handleCustomerChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  <span className="flex-none font-sans text-xs font-bold tracking-[0.3em] uppercase text-[#C7A44C]">Step 03</span>
                  <h3 className="flex-none font-serif text-2xl md:text-3xl text-[#F6F0E7]">Review Order</h3>
                  <div className="flex-grow h-px bg-gradient-to-r from-[#E7D7B8]/20 to-transparent" />
                </div>

                <div className="bg-[#060C09] rounded-[2.5rem] border-2 border-[#C7A44C]/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden sticky top-8 transition-all duration-500 hover:shadow-[0_20px_80px_rgba(199,164,76,0.15)] pointer-events-auto">
                  <div className="p-10 flex flex-col gap-8">
                    <h4 className="font-sans text-[10px] tracking-[0.3em] font-bold uppercase text-[#C7A44C] text-center border-b border-dashed border-[#E7D7B8]/15 pb-6">Your Order</h4>

                    {/* Mini Cookie Thumbnails */}
                    {Object.keys(cart).length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {Object.entries(cart).map(([id, qty]) => {
                          const cookie = MENU.find(c => c.id === id);
                          if (!cookie) return null;
                          return (
                            <div key={id} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C7A44C]/40 shadow-lg flex-shrink-0">
                                <img src={cookie.image} alt={cookie.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-sm text-[#F6F0E7] truncate">{cookie.name}</p>
                                <p className="font-sans text-[10px] text-[#E7D7B8]/50 uppercase tracking-widest">Qty {qty} · ₹{cookie.price * qty}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="font-serif italic text-sm text-[#E7D7B8]/30 text-center py-2">No items selected yet.</p>
                    )}

                    <div className="space-y-6 border-t border-dashed border-[#E7D7B8]/15 pt-6">
                      <div className="flex justify-between text-xl font-serif text-[#F6F0E7]/70">
                        <span>Items Subtotal</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-xl font-serif text-[#F6F0E7]/70 border-b border-dashed border-[#E7D7B8]/15 pb-6">
                        <span>Courier &amp; Delivery</span>
                        <span>₹{cartTotal > 0 ? DELIVERY_CHARGE : 0}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-serif text-2xl text-[#F6F0E7]">Grand Total</span>
                        <span className="font-serif text-4xl text-[#C7A44C] font-semibold drop-shadow-lg">₹{grandTotal}</span>
                      </div>
                    </div>

                    <div className="pt-8 space-y-6">
                      {/* Shimmer Button */}
                      <div className="relative overflow-hidden rounded-2xl">
                        <Button
                          type="submit"
                          variant="secondary"
                          className="w-full bg-[#C7A44C] text-[#0A1410] hover:bg-[#D8B45C] active:scale-[0.98] shadow-[0_10px_30px_rgba(199,164,76,0.4)] font-bold text-lg py-8 tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-50 disabled:shadow-none rounded-2xl"
                          disabled={loading || cartTotal === 0}
                        >
                          {loading ? "PROCESSING..." : "RESERVE THIS DROP"}
                        </Button>
                        {!loading && cartTotal > 0 && (
                          <motion.div
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                            initial={{ left: "-33%" }}
                            animate={{ left: "133%" }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
                          />
                        )}
                      </div>

                      <div className="text-center space-y-2">
                        <p className="font-sans text-[10px] text-[#E7D7B8]/40 tracking-widest uppercase">
                          Secure Reservation System
                        </p>
                        <p className="font-serif italic text-sm text-[#E7D7B8]/60 leading-relaxed px-4">
                          Note: This drop is capped at 50 slots. Once reserved, you will receive payment instructions via email.
                        </p>
                      </div>
                    </div>

                    {submitState.status === "error" && !Object.keys(errors).length && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm text-center font-sans font-bold bg-red-400/10 py-3 rounded-lg border border-red-400/20"
                      >
                        {submitState.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </form>
          </>
        ) : (
          <motion.div 
            ref={successRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-start pt-10 md:pt-14 min-h-screen text-center"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-10 ${submitState.status === "sold_out" ? "bg-red-500/10 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]" : "bg-[#C7A44C]/10 text-[#C7A44C] shadow-[0_0_40px_rgba(199,164,76,0.3)]"}`}>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {submitState.status === "sold_out" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                )}
              </svg>
            </div>
            
            <h3 className="font-serif text-5xl md:text-7xl text-[#F6F0E7] mb-8 tracking-tight">
              {submitState.message}
            </h3>
            
            <div className="font-serif text-[#E7D7B8]/80 max-w-2xl mx-auto text-xl md:text-2xl flex flex-col gap-8">
              {submitState.status === "sold_out" ? (
                <p>We are currently at capacity for this week&rsquo;s batch. Every slot is reserved.</p>
              ) : (
                <p>We&rsquo;ve successfully received your order request and sent a summary to your email.</p>
              )}
              
              <div className="text-base md:text-lg border-t border-[#E7D7B8]/10 pt-10 font-sans tracking-[0.05em] leading-relaxed opacity-80">
                {submitState.status === "sold_out" 
                  ? "Follow us on Instagram to be notified if slots open up or for the next drop." 
                  : "Your order will be fully confirmed once checkout goes live. Follow us on Instagram to stay alerted for Drop 02."}
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="text-[#C7A44C] border-[#C7A44C]/30 hover:bg-[#C7A44C]/10 px-10 py-6"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  Return To Top
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {!isSubmitted && (
          <div className="mt-24 flex justify-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex flex-col items-center gap-4 text-[#E7D7B8]/40 hover:text-[#C7A44C] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full border border-[#E7D7B8]/20 flex items-center justify-center group-hover:border-[#C7A44C]/40 group-hover:bg-[#C7A44C]/5">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold">Return To Top</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
