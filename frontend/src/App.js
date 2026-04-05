import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, ChevronDown, Star, Egg, X, ArrowLeft, Copy, Check, Upload, Smartphone, MapPin, Phone, User, Clock3, AtSign, Mail, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const rawApiUrl = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const shouldUseLocalApi = isLocalhost && (!rawApiUrl || rawApiUrl.includes('emergentagent.com'));
const defaultApiUrl = isLocalhost ? 'http://127.0.0.1:8000/api' : '/api';
const API_URL = shouldUseLocalApi ? 'http://127.0.0.1:8000/api' : (rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) : defaultApiUrl);

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.slice(0, 120).trim();
    throw new Error(snippet || `Request failed with status ${response.status}`);
  }
}

function normalizeUtrId(value) {
  return String(value || '').trim().replace(/\s+/g, '').toUpperCase();
}

function isValidUtrId(value) {
  return /^[A-Z0-9]{12,22}$/.test(normalizeUtrId(value));
}

function summarizeDescription(text, maxWords = 16) {
  const words = String(text || '').trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}...`;
}

const SITE_CONFIG = {
  brandName: 'Sundays',
  instagramUrl: process.env.REACT_APP_INSTAGRAM_URL || 'https://www.instagram.com/sundays.hyd/',
  supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'sundayshyd@gmail.com',
  supportEmailHref: `mailto:${process.env.REACT_APP_SUPPORT_EMAIL || 'sundayshyd@gmail.com'}`,
  supportPhone: process.env.REACT_APP_SUPPORT_PHONE || '+91 8985007293',
  supportPhoneHref: `tel:${(process.env.REACT_APP_SUPPORT_PHONE || '+91 8985007293').replace(/[^\d+]/g, '')}`,
  upiId: process.env.REACT_APP_UPI_ID || 'sundays@upi',
  upiName: process.env.REACT_APP_UPI_NAME || 'Sundays',
  serviceArea: process.env.REACT_APP_SERVICE_AREA || 'Freshly baked cookies delivered across Hyderabad.',
  hideUpiId: (process.env.REACT_APP_HIDE_UPI_ID || 'false').toLowerCase() === 'true',
  trialQrImage: process.env.REACT_APP_TRIAL_QR_IMAGE || '',
};

const CHECKOUT_FORM_STORAGE_KEY = 'sunday_checkout_form';
const OWNER_DASHBOARD_KEY_STORAGE = 'sundays_owner_key';
const DEFAULT_CHECKOUT_FORM = {
  full_name: '',
  phone: '',
  email: '',
  marketing_opt_in: false,
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  special_instructions: '',
};

const buildUpiLink = ({ upiId, upiName, total, orderId }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: upiName,
    am: String(total || 0),
    cu: 'INR',
    tn: `Order ${orderId || 'SundayCookies'}`,
  });

  return `upi://pay?${params.toString()}`;
};

function loadCheckoutDraft() {
  if (typeof window === 'undefined') return DEFAULT_CHECKOUT_FORM;

  try {
    const saved = window.sessionStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    return saved ? { ...DEFAULT_CHECKOUT_FORM, ...JSON.parse(saved) } : DEFAULT_CHECKOUT_FORM;
  } catch {
    return DEFAULT_CHECKOUT_FORM;
  }
}

function clearCheckoutDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
  window.localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
}

function loadOwnerDashboardKey() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(OWNER_DASHBOARD_KEY_STORAGE) || '';
}

function saveOwnerDashboardKey(value) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(OWNER_DASHBOARD_KEY_STORAGE, value);
}

function clearOwnerDashboardKey() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(OWNER_DASHBOARD_KEY_STORAGE);
}

// ===================== COLORS =====================
const C = {
  bg: '#0A140E',
  bgCard: 'rgb(28, 58, 42)',
  gold: 'rgb(201, 168, 76)',
  goldHex: '#C9A84C',
  text: '#FDFBF7',
  textMuted: 'rgba(253, 251, 247, 0.6)',
  textDim: 'rgba(253, 251, 247, 0.45)',
  textSubtle: 'rgba(253, 251, 247, 0.5)',
  muted: '#A9B8AF',
  border: 'rgba(201, 168, 76, 0.18)',
  borderLight: 'rgba(253, 251, 247, 0.06)',
  borderLightBg: 'rgba(253, 251, 247, 0.05)',
};

// ===================== PRODUCT DATA =====================
const PRODUCTS = [
  {
    id: 'lazy-legend',
    name: 'The Lazy Legend',
    subtitle: 'Classic Chocolate Chip',
    price: 109,
    category: 'signature',
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900&q=85',
    description: 'Brown butter, two types of sugar, and Valrhona chocolate chips. The one that started it all.',
    weight: '65g before baking',
    ingredients: 'Brown Butter, White Sugar, Brown Sugar, Vanilla Extract, Eggs, All-Purpose Flour, Baking Soda, Salt, Chocolate Chips',
    allergens: ['Milk', 'Gluten', 'Eggs'],
    texture: 'Crispy outside, gooey center',
    heating: 'Microwave 10–15 seconds for that fresh-from-the-oven taste',
  },
  {
    id: 'dark-side',
    name: 'The Dark Side',
    subtitle: 'Cookies & Cream',
    price: 119,
    category: 'signature',
    tag: 'New',
    image: 'https://images.pexels.com/photos/13143739/pexels-photo-13143739.jpeg?auto=compress&cs=tinysrgb&w=900',
    description: 'Crushed Oreos folded into a dark chocolate base. Rich, crunchy, unapologetically indulgent.',
    weight: '65g before baking',
    ingredients: 'Brown Butter, White Sugar, Brown Sugar, Vanilla Extract, Eggs, All-Purpose Flour, Baking Soda, Salt, Chocolate, Cocoa Powder, Oreo Cookies',
    allergens: ['Milk', 'Gluten', 'Eggs'],
    texture: 'Crispy outside, gooey center',
    heating: 'Microwave 10–15 seconds for that fresh-from-the-oven taste',
  },
  {
    id: 'nutella-lava',
    name: 'Molten Lava',
    subtitle: 'Nutella Filled',
    price: 129,
    category: 'most_loved',
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1741542164717-5f5f13cbfcd2?w=900&q=85',
    description: 'A pure Nutella core hidden inside a deep chocolate cookie. Break it open.',
    weight: '65g before baking',
    ingredients: 'Brown Butter, White Sugar, Brown Sugar, Vanilla Extract, Eggs, All-Purpose Flour, Baking Soda, Salt, Chocolate, Nutella, Roasted Hazelnuts',
    allergens: ['Milk', 'Gluten', 'Eggs', 'Tree Nuts'],
    texture: 'Crispy outside, gooey center',
    heating: 'Microwave 10–15 seconds for that fresh-from-the-oven taste',
  },
  {
    id: 'golden-affair',
    name: 'The Golden Affair',
    subtitle: 'Lotus Biscoff',
    price: 129,
    category: 'most_loved',
    tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1643116312392-353ab025768b?w=900&q=85',
    description: 'Biscoff spread swirled into the dough, whole Biscoff pieces pressed on top. Caramel, spice, and warmth in every bite.',
    weight: '65g before baking',
    ingredients: 'Brown Butter, White Sugar, Brown Sugar, Vanilla Extract, Eggs, All-Purpose Flour, Baking Soda, Salt, Lotus Biscoff Spread, Lotus Biscoff Crumbles',
    allergens: ['Milk', 'Gluten', 'Eggs', 'Soy'],
    texture: 'Crispy outside, gooey center',
    heating: 'Microwave 10–15 seconds for that fresh-from-the-oven taste',
  },
  {
    id: 'midnight-meltdown',
    name: 'The Midnight Meltdown',
    subtitle: "S'mores",
    price: 129,
    category: 'most_loved',
    tag: 'Limited',
    image: 'https://images.unsplash.com/photo-1690976991784-517d7763e0fa?w=900&q=85',
    description: 'Toasted marshmallow, milk chocolate, and a graham cracker crumble. Campfire dreams in cookie form.',
    weight: '65g before baking',
    ingredients: 'Brown Butter, White Sugar, Brown Sugar, Vanilla Extract, Eggs, All-Purpose Flour, Baking Soda, Salt, Graham Crackers, Marshmallows, Milk Chocolate Chips',
    allergens: ['Milk', 'Gluten', 'Eggs'],
    texture: 'Crispy outside, gooey center',
    heating: 'Microwave 10–15 seconds for that fresh-from-the-oven taste',
  },
  {
    id: 'little-rebels',
    name: 'Little Rebels',
    subtitle: 'Chocolate Chip Bites',
    price: 199,
    category: 'little_rebels',
    tag: null,
    image: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=900',
    description: 'All the soul, half the size. Perfect for when you want just a little something — and then four more.',
    weight: '12g each before baking',
    ingredients: 'Brown Butter, White Sugar, Brown Sugar, Vanilla Extract, Eggs, All-Purpose Flour, Baking Soda, Salt, Mini Chocolate Chips',
    allergens: ['Milk', 'Gluten', 'Eggs'],
    texture: 'Crispy bite-sized pieces',
    heating: 'Best enjoyed at room temperature or lightly warmed',
    isPackItem: true,
  },
];

PRODUCTS.forEach(product => {
  if (product.id === 'dark-side') {
    product.subtitle = 'Cookies & Cream';
    product.description = 'A cookies-and-cream cookie loaded with Oreo crunch and a deep cocoa finish. Rich, creamy, unapologetically indulgent.';
  }

  if (product.id === 'little-rebels') {
    product.name = 'Little Rebels';
    product.subtitle = 'Chocolate Chip Bites';
    product.description = 'A pack of 10 chocolate chip mini bites. All the soul, half the size, and impossible to stop at one.';
  }
});

const ASSORTED_BOX_PRICE = 599;

// ===================== CART CONTEXT =====================
const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sunday_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    localStorage.setItem('sunday_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { id: product.id, name: product.name, subtitle: product.subtitle, price: product.price, quantity, image: product.image }];
    });
    toast.success(`${product.name} added to cart`, { duration: 2000 });
  };

  const addAssortedBox = (selections) => {
    const boxId = 'assorted-box-' + Date.now();
    const names = Object.entries(selections).filter(([,v]) => v > 0).map(([k,v]) => `${k} x${v}`).join(', ');
    setCart(prev => [...prev, {
      id: boxId,
      name: 'Assorted Box of 6',
      subtitle: names,
      price: ASSORTED_BOX_PRICE,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1772651392135-b891a5e4f8a3?w=700&q=85',
      isAssortedBox: true,
      selections,
    }]);
    toast.success('Assorted Box added to cart!', { duration: 2000 });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, addAssortedBox, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() { return useContext(CartContext); }

// ===================== ANIMATED SECTION =====================
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===================== NAVBAR / FLOATING CART =====================
function FloatingCart() {
  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cartCount === 0) return null;

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      onClick={() => navigate('/checkout')}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 md:px-5 py-3 text-[12px] font-bold tracking-[0.12em] uppercase rounded-full"
      style={{
        background: 'rgba(201, 168, 76, 0.96)',
        color: C.bg,
        fontFamily: 'Manrope, sans-serif',
        boxShadow: '0 16px 40px rgba(5, 10, 7, 0.35)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(10, 20, 14, 0.12)' }}>
        <ShoppingBag size={14} />
      </div>
      <span>View Cart</span>
      <span className="opacity-75">({cartCount})</span>
      <span className="ml-2">₹{cartTotal}</span>
    </motion.button>
  );
}

// ===================== COOKIE CARD =====================
function CookieCard({ product, onViewDetails }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hovered, setHovered] = useState(false);

  const qtyOptions = product.isPackItem ? null : [1, 2, 4, 6];
  const cartItem = cart.find(item => item.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;
  const shortDescription = summarizeDescription(product.description, product.isPackItem ? 15 : 17);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden group h-full flex flex-col"
      style={{ background: C.bgCard, border: `1px solid ${C.border}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden cursor-pointer" style={{ height: 224 }} onClick={() => onViewDetails(product)}>
        <motion.img
          alt={product.name}
          className="w-full h-full object-cover"
          src={product.image}
          style={{ filter: 'brightness(1)' }}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10, 20, 14, 0.92) 0%, rgba(10, 20, 14, 0.1) 55%, transparent 100%)' }} />

        {/* Price Tag */}
        <div className="absolute top-4 right-4 px-3 py-1.5" style={{ background: 'rgba(10, 20, 14, 0.85)', border: `1px solid ${C.border}` }}>
          <span className="sundays-heading text-xl" style={{ color: C.gold }}>₹{product.price}</span>
          <span className="text-[10px] uppercase tracking-wider ml-1" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
            {product.isPackItem ? '/pack' : '/cookie'}
          </span>
        </div>

        {/* Badge Tag */}
        {product.tag && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5" style={{
            background: product.tag === 'Bestseller' ? C.gold : product.tag === 'New' ? '#22c55e' : product.tag === 'Trending' ? '#a855f7' : product.tag === 'Limited' ? '#ef4444' : C.gold,
            color: product.tag === 'Bestseller' ? C.bg : '#fff',
          }}>
            {product.tag === 'Bestseller' && <Star size={11} fill={C.bg} />}
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>{product.tag}</span>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs uppercase tracking-[0.2em] px-4 py-2 backdrop-blur-sm"
            style={{ background: 'rgba(10, 20, 14, 0.7)', color: C.gold, fontFamily: 'Manrope, sans-serif', border: `1px solid ${C.border}` }}>
            View Details
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <p className="text-xs uppercase tracking-[0.25em] mb-1.5" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>
          {product.subtitle}
        </p>
        <h4 className="sundays-heading text-[2rem] text-[#FDFBF7] mb-3 leading-[1.05]">{product.name}</h4>
        <p className="text-[15px] font-light leading-7 mb-4 min-h-[84px]" style={{ color: C.textSubtle, fontFamily: 'Manrope, sans-serif' }}>
          {shortDescription}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider px-2 py-1" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif', background: C.borderLightBg, border: `1px solid ${C.borderLight}` }}>
            {product.weight}
          </span>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider px-2 py-1" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif', background: C.borderLightBg, border: `1px solid ${C.borderLight}` }}>
            <Egg size={10} /> Contains Eggs
          </span>
          {product.category === 'little_rebels' && (
            <span className="text-[11px] uppercase tracking-wider px-2 py-1" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif', background: 'rgba(201, 168, 76, 0.08)', border: `1px solid ${C.border}` }}>
              Perfect for snacking
            </span>
          )}
        </div>

        <div className="mb-4 min-h-[72px]">
          {qtyOptions ? (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Quantity</p>
                {cartItem ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>
                      In cart: {quantityInCart}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                      className="w-7 h-7 flex items-center justify-center transition-colors hover:opacity-80"
                      style={{ border: `1px solid ${C.border}`, color: C.text }}
                      aria-label={`Reduce ${product.name}`}
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-7 h-7 flex items-center justify-center transition-colors hover:opacity-80"
                      style={{ border: `1px solid ${C.border}`, color: C.text }}
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {qtyOptions.map(q => (
                  <button
                    key={q}
                    onClick={() => setSelectedQty(q)}
                    className="py-2.5 text-sm font-semibold tracking-wide transition-all duration-200"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      background: selectedQty === q ? C.gold : 'transparent',
                      color: selectedQty === q ? C.bg : C.muted,
                      border: selectedQty === q ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-end">
              <p className="text-[11px] uppercase tracking-[0.15em] mb-2.5" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Pack details</p>
              <div className="px-3 py-2.5 text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif', border: `1px solid ${C.borderLight}` }}>
                10 mini bites in every pack.
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => addToCart(product, selectedQty)}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 text-sm font-bold tracking-[0.12em] uppercase text-[#0A140E] transition-all hover:brightness-110"
            style={{ background: C.gold, fontFamily: 'Manrope, sans-serif' }}
          >
            <ShoppingBag size={14} />
            {cartItem ? 'Add More' : (product.isPackItem ? 'Add Pack to Cart' : 'Add to Cart')}
          </button>
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="w-full py-3 text-[11px] font-semibold tracking-[0.18em] uppercase transition-all hover:opacity-80"
            style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif', border: `1px solid ${C.borderLight}` }}
          >
            View Full Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ===================== PRODUCT DETAIL MODAL =====================
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ background: C.bgCard, border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <img src={product.image} alt={product.name} className="w-full h-56 object-cover" style={{ filter: 'brightness(0.85)' }} />
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(10,20,14,0.7)', border: `1px solid ${C.border}` }}>
            <X size={18} color={C.text} />
          </button>
        </div>

        <div className="p-8">
          {product.tag && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 mb-3"
              style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>
              {product.tag}
            </span>
          )}
          <p className="text-xs uppercase tracking-[0.25em] mb-1" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>{product.subtitle}</p>
          <h3 className="sundays-heading text-3xl text-[#FDFBF7] mb-2">{product.name}</h3>
          <div className="sundays-heading text-2xl mb-4" style={{ color: C.gold }}>₹{product.price}</div>
          <p className="text-sm font-light leading-relaxed mb-8" style={{ color: C.textSubtle, fontFamily: 'Manrope, sans-serif' }}>{product.description}</p>

          <div className="space-y-4">
            <DetailSection icon="🧾" title="Ingredients" content={product.ingredients} />
            <div className="p-4" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>⚠️ Allergen Info</h4>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((a, i) => (
                  <span key={i} className="text-[11px] uppercase tracking-wider px-3 py-1" style={{ color: '#fca5a5', fontFamily: 'Manrope, sans-serif', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>{a}</span>
                ))}
              </div>
            </div>
            <DetailSection icon="🍪" title="Texture" content={product.texture} />
            <DetailSection icon="🔥" title="Heating Instructions" content={product.heating} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailSection({ icon, title, content }) {
  return (
    <div className="p-4" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>{icon} {title}</h4>
      <p className="text-sm font-light leading-relaxed" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>{content}</p>
    </div>
  );
}

// ===================== ASSORTED BOX SECTION =====================
function AssortedBoxSection() {
  const { addAssortedBox } = useCart();
  const [selections, setSelections] = useState({});
  const total = Object.values(selections).reduce((s, v) => s + v, 0);

  const updateSelection = (name, delta) => {
    setSelections(prev => {
      const current = prev[name] || 0;
      const newVal = Math.max(0, current + delta);
      const newTotal = total - current + newVal;
      if (newTotal > 6) return prev;
      return { ...prev, [name]: newVal };
    });
  };

  const handleAddBox = () => {
    if (total !== 6) return;
    addAssortedBox(selections);
    setSelections({});
  };

  return (
    <section id="assorted-section" className="py-36 md:py-44" style={{ background: C.bgCard }}>
      <div className="px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <AnimatedSection>
              <span className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-6 font-medium" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Build Your Box</span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h2 className="sundays-heading text-[#FDFBF7] leading-tight" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)' }}>
                Assorted Box <span style={{ color: C.gold }}>of 6</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="mt-8">
                <div className="sundays-heading text-5xl md:text-6xl" style={{ color: C.gold }}>₹{ASSORTED_BOX_PRICE}</div>
                <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5" style={{ background: 'rgba(201,168,76,0.12)', color: C.gold, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' }}>Most Popular</span>
                <p className="mt-4 text-base font-light leading-relaxed" style={{ color: C.textDim, fontFamily: 'Manrope, sans-serif' }}>
                  Choose any 6 cookies from our menu, including all signature flavours. Mix and match your favourites into one perfect box.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="mt-10">
                <img alt="Assorted cookies box" className="w-full object-cover" loading="lazy"
                  src="https://images.unsplash.com/photo-1772651392135-b891a5e4f8a3?w=700&q=85"
                  style={{ height: 280, filter: 'brightness(0.75)' }} />
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm uppercase tracking-[0.18em] font-semibold" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>Pick your flavours</p>
                <span className="text-sm font-bold px-3 py-1" style={{ fontFamily: 'Manrope, sans-serif', color: total === 6 ? '#22c55e' : C.gold, background: 'transparent', border: `1px solid ${C.border}` }}>
                  {total} / 6
                </span>
              </div>
              <div className="space-y-3">
                {PRODUCTS.filter(p => p.category !== 'little_rebels').map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-3" style={{ background: C.borderLightBg, border: `1px solid ${C.borderLight}`, transition: '0.2s' }}>
                    <img alt={product.name} className="w-14 h-14 object-cover shrink-0" src={product.image} style={{ filter: 'brightness(0.85)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#FDFBF7] truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>{product.name}</p>
                      <p className="text-xs" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>{product.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateSelection(product.name, -1)}
                        disabled={(selections[product.name] || 0) === 0}
                        className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-20"
                        style={{ border: `1px solid ${C.border}`, color: C.text }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
                        {selections[product.name] || 0}
                      </span>
                      <button
                        onClick={() => updateSelection(product.name, 1)}
                        disabled={total >= 6}
                        className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-20"
                        style={{ border: `1px solid ${C.border}`, color: C.text }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddBox}
                disabled={total !== 6}
                className="mt-8 flex items-center justify-center gap-2.5 w-full py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  background: total === 6 ? C.gold : 'rgba(201, 168, 76, 0.15)',
                  color: total === 6 ? C.bg : 'rgba(201, 168, 76, 0.4)',
                  cursor: total === 6 ? 'pointer' : 'not-allowed',
                }}
              >
                <ShoppingBag size={14} /> Add Box to Cart — ₹{ASSORTED_BOX_PRICE}
              </button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ===================== NAVBAR =====================
function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ background: scrolled ? 'rgba(10, 20, 14, 0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-32 flex items-center justify-between h-20">
        <span className="text-base md:text-lg font-semibold tracking-[0.28em] uppercase" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>SUNDAYS</span>
        <div className="flex items-center gap-6 md:gap-8">
          <button onClick={() => scrollToSection('process-section')} className="hidden sm:block text-sm font-semibold tracking-[0.16em] uppercase transition-colors hover:opacity-70" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Process</button>
          <button onClick={() => scrollToSection('shop-section')} className="hidden sm:block text-sm font-semibold tracking-[0.16em] uppercase transition-colors hover:opacity-70" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Menu</button>
          <a href="https://www.instagram.com/sundays.hyd/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" style={{ color: C.muted }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
          </a>
          <button onClick={() => navigate('/checkout')} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold tracking-[0.1em] uppercase transition-all hover:brightness-110" style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>
            <ShoppingBag size={14} /> Cart {cartCount > 0 && <span className="ml-0.5">({cartCount})</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ===================== SCROLL TO TOP BUTTON =====================
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 left-8 z-40 w-12 h-12 flex items-center justify-center transition-all hover:brightness-110"
      style={{ background: 'rgba(10, 20, 14, 0.85)', border: `1px solid ${C.border}`, backdropFilter: 'blur(8px)' }}
      title="Back to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.goldHex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </motion.button>
  );
}

// ===================== HOME PAGE =====================
function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { cartCount } = useCart();

  const signatureCookies = PRODUCTS.filter(p => p.category === 'signature');
  const mostLoved = PRODUCTS.filter(p => p.category === 'most_loved');
  const littleRebels = PRODUCTS.filter(p => p.category === 'little_rebels');

  return (
    <div style={{ background: C.bg }}>
      <Toaster position="top-center" toastOptions={{ style: { background: C.bgCard, color: C.text, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' } }} />

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1620499634096-3dfa6ecdc5c7?w=1920&q=85">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-baking-chocolate-chip-cookies-39424-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(rgba(10,20,14,0.45) 0%, rgba(10,20,14,0.35) 50%, rgba(10,20,14,0.95) 100%)' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="block text-xs sm:text-sm uppercase tracking-[0.4em] mb-8 font-medium"
            style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}
          >
            The 24-Hour Cookie
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
            className="sundays-display text-[#FDFBF7]"
            style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', lineHeight: 0.88 }}
          >
            Sundays
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 text-base sm:text-lg max-w-xs font-light tracking-wide"
            style={{ color: 'rgba(253,251,247,0.65)', fontFamily: 'Manrope, sans-serif' }}
          >
            Made slowly. Tasted once. Never forgotten.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {[ 
              '24-hour rested dough',
              'Baked in small batches',
            ].map((pill) => (
              <span key={pill} className="px-4 py-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: C.text, border: `1px solid ${C.border}`, background: 'rgba(10,20,14,0.35)', fontFamily: 'Manrope, sans-serif' }}>
                {pill}
              </span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-[0.25em]" style={{ color: 'rgba(201,168,76,0.6)', fontFamily: 'Manrope, sans-serif' }}>Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown size={22} color="rgba(201,168,76,0.6)" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-36 md:py-52 px-6 md:px-16 lg:px-32" style={{ background: C.bg }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <span className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-8 font-medium" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Our philosophy</span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="sundays-heading text-[#FDFBF7] leading-[1.05]" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)' }}>
              We don't bake faster.<br /><span style={{ color: C.gold }}>We bake better.</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="mt-10 text-base sm:text-lg font-light max-w-2xl leading-relaxed" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
              Every Sundays cookie begins 24 hours before you taste it. The secret isn't in the recipe — it's in the patience. Browned butter. Chilled dough. Time. These things can't be rushed, and we'd never try.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-10 pt-12 border-t" style={{ borderColor: C.border }}>
              {[{ val: '24h', label: 'Chill Time' }, { val: '7', label: 'Signatures' }, { val: '0', label: 'Shortcuts' }, { val: 'Fresh', label: 'Daily Batch' }].map((s, i) => (
                <div key={i}>
                  <div className="sundays-heading" style={{ fontSize: '3.2rem', color: C.gold, lineHeight: 1 }}>{s.val}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em]" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process-section" className="py-36 md:py-52" style={{ background: C.bgCard }}>
        <div className="px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <div className="mb-24">
            <AnimatedSection>
              <span className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-6 font-medium" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>The Process</span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h2 className="sundays-heading text-[#FDFBF7]" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)' }}>Slow by design.</h2>
            </AnimatedSection>
          </div>
          <div className="space-y-36 md:space-y-48">
            {[
              { step: '01', title: 'Browning', tagline: 'Where depth begins', desc: 'We slowly brown European-style butter until it turns deep amber and fills the kitchen with the scent of toasted hazelnuts.', time: '~15 min', img: 'https://images.unsplash.com/photo-1758874960608-f0d7f38d9846?w=900&q=85' },
              { step: '02', title: 'Mixing', tagline: 'Art in every fold', desc: "Cold eggs, two types of sugar, still-warm browned butter. The fold is everything — overwork it and you lose the magic.", time: '~20 min', img: 'https://images.unsplash.com/photo-1772915516557-2d57f94b0bd0?w=900&q=85', reverse: true },
              { step: '03', title: '24 hr Chilling', tagline: 'The wait is the recipe', desc: 'The dough rests in cold for a full 24 hours. Flavours meld. Moisture redistributes. Patience is the technique.', time: '24 hours', img: 'https://images.unsplash.com/photo-1687549181635-e795cefee8b5?w=900&q=85' },
              { step: '04', title: 'Baking', tagline: 'Golden hour', desc: "Pulled two minutes before they look done. They finish cooking on the hot pan — soft centre, barely-there crisp edge.", time: '~11 min', img: 'https://images.unsplash.com/photo-1737674879060-7be2f5198aab?w=900&q=85', reverse: true },
            ].map((p, i) => (
              <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center`}>
                <AnimatedSection className={p.reverse ? 'lg:order-2' : ''}>
                  <div className="relative overflow-hidden">
                    <img alt={p.title} className="w-full object-cover" loading="lazy" src={p.img} style={{ height: 480, filter: 'brightness(0.82)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 45%, rgba(10,20,14,0.5) 100%)' }} />
                    <div className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.22em] px-4 py-2" style={{ background: 'rgba(201,168,76,0.12)', border: `1px solid ${C.border}`, color: C.gold, fontFamily: 'Manrope, sans-serif' }}>{p.time}</div>
                  </div>
                </AnimatedSection>
                <AnimatedSection className={p.reverse ? 'lg:order-1' : ''} delay={0.15}>
                  <span className="text-xs uppercase tracking-[0.35em]" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Step {p.step}</span>
                  <h3 className="sundays-heading mt-4 text-[#FDFBF7] leading-none" style={{ fontSize: 'clamp(2.8rem, 5vw, 4rem)' }}>{p.title}</h3>
                  <p className="mt-3 text-sm font-semibold tracking-wide uppercase" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif', letterSpacing: '0.1em' }}>{p.tagline}</p>
                  <p className="mt-7 text-base sm:text-lg font-light leading-relaxed" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>{p.desc}</p>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP - OUR SIGNATURE COOKIES */}
      <section id="shop-section" className="py-36 md:py-52" style={{ background: C.bg }}>
        <div className="px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <div className="mb-20">
            <AnimatedSection>
              <span className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-6 font-medium" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>The Menu</span>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <h2 className="sundays-heading text-[#FDFBF7]" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)' }}>Choose your vice.</h2>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <p className="mt-4 text-base font-light max-w-xl" style={{ color: C.textDim, fontFamily: 'Manrope, sans-serif' }}>Limited fresh batch baked daily. All cookies contain eggs.</p>
            </AnimatedSection>
          </div>

          {/* Our Signature Cookies */}
          <AnimatedSection>
            <div className="mb-20 md:mb-28">
              <div className="flex items-center gap-4 mb-8 flex-wrap">
                <h3 className="text-sm font-semibold tracking-[0.22em] uppercase" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Our Signature Cookies</h3>
                <span className="text-xs uppercase tracking-[0.18em] px-3 py-1.5" style={{ color: C.gold, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' }}>Fresh Daily</span>
                <div className="flex-1 h-px min-w-[20px]" style={{ background: C.border }} />
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {signatureCookies.map(p => <CookieCard key={p.id} product={p} onViewDetails={setSelectedProduct} />)}
                {littleRebels.map(p => <CookieCard key={p.id} product={p} onViewDetails={setSelectedProduct} />)}
              </div>
            </div>
          </AnimatedSection>

          {/* Most Loved / Exclusive */}
          <AnimatedSection>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-8 flex-wrap">
                <h3 className="text-sm font-semibold tracking-[0.22em] uppercase" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Most Loved</h3>
                <span className="text-xs uppercase tracking-[0.18em] px-3 py-1.5" style={{ color: C.gold, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' }}>Exclusive</span>
                <div className="flex-1 h-px min-w-[20px]" style={{ background: C.border }} />
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {mostLoved.map(p => <CookieCard key={p.id} product={p} onViewDetails={setSelectedProduct} />)}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ASSORTED BOX */}
      <AssortedBoxSection />

      {false && (
      <section className="py-24 md:py-32 px-6 md:px-16 lg:px-32" style={{ background: C.bg }}>
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8" style={{ border: `1px solid ${C.border}`, color: C.gold, fontFamily: 'Manrope, sans-serif' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold">First-time offer</span>
            </div>
            <h3 className="sundays-heading text-[#FDFBF7] leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Tag us. Get <span style={{ color: C.gold }}>10% off</span> your next order.
            </h3>
            <p className="mt-5 text-base font-light max-w-lg mx-auto leading-relaxed" style={{ color: C.textSubtle, fontFamily: 'Manrope, sans-serif' }}>
              First-time customer? Share an honest review on Instagram and tag
              <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mx-1 font-medium hover:underline" style={{ color: C.gold }}>@sundays.hyd</a>
              — we'll send you a 10% discount code for your next order.
            </p>
          </div>
        </AnimatedSection>
      </section>
      )}

      <SiteFooter />

      {/* Floating Cart */}
      <AnimatePresence>
        {cartCount > 0 && <FloatingCart />}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        <ScrollToTopButton />
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="px-6 md:px-16 lg:px-32 pt-12 pb-24" style={{ background: C.bg }}>
      <AnimatedSection>
        <div className="max-w-7xl mx-auto overflow-hidden" style={{ border: `1px solid ${C.border}`, background: 'linear-gradient(180deg, rgba(253,251,247,0.03) 0%, rgba(253,251,247,0.01) 100%)' }}>
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8 md:p-10 lg:p-12" style={{ borderRight: `1px solid ${C.borderLight}` }}>
              <p className="text-xs uppercase tracking-[0.22em] mb-4" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>About Sundays</p>
              <h3 className="sundays-heading text-[#FDFBF7] leading-tight mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
                Fresh batches. Honest opinions. No fake hype needed.
              </h3>
              <p className="max-w-2xl text-base md:text-lg leading-relaxed" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                {SITE_CONFIG.brandName} is built to be tasted honestly. If a box made your day, post it and tag
                <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="mx-1 font-medium hover:underline" style={{ color: C.gold }}>@sundays.hyd</a>
                . If something could be better, say that too. We want the real review, not the polite one. Good batch, bad batch, surprise favorite, disappointing pick — tag us and tell us what actually happened.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                {[
                  { title: 'Fresh batches', body: 'Mixed in small quantities and baked for the day, not stockpiled for the week.' },
                  { title: 'Honest reviews', body: 'Good review, bad review, surprise review — if you tag us, we will read it.' },
                  { title: 'Local delivery', body: SITE_CONFIG.serviceArea },
                ].map((item) => (
                  <div key={item.title} className="p-4" style={{ background: C.borderLightBg, border: `1px solid ${C.borderLight}` }}>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>{item.title}</p>
                    <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-12">
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Contact</p>
                  <div className="space-y-4 text-sm" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                    <a href={SITE_CONFIG.supportEmailHref} className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                      <Mail size={16} color={C.gold} className="mt-0.5 shrink-0" />
                      <span>{SITE_CONFIG.supportEmail}</span>
                    </a>
                    <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                      <AtSign size={16} color={C.gold} className="mt-0.5 shrink-0" />
                      <span>@sundays.hyd</span>
                    </a>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} color={C.gold} className="mt-0.5 shrink-0" />
                      <span>{SITE_CONFIG.serviceArea}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 size={16} color={C.gold} className="mt-0.5 shrink-0" />
                      <span>Order anytime online. Fresh batches are reviewed and cleared before dispatch.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Why people come back</p>
                  <ul className="space-y-3 text-sm" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                    {[
                      'Distinct signature flavors instead of a generic bakery spread.',
                      'A founder-led brand that actually pays attention to what people say after they order.',
                      'A checkout flow built to stay quick, clear, and Hyderabad-friendly.',
                    ].map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <Star size={14} color={C.gold} className="mt-1 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </footer>
  );
}

function CheckoutStageHeader({ currentStep, onStepClick }) {
  const steps = [
    { number: 1, title: 'Contact', note: 'Who this order is for' },
    { number: 2, title: 'Address', note: 'Where it should go' },
    { number: 3, title: 'Payment', note: 'Review and confirm' },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3 mb-8">
      {steps.map((step) => {
        const isActive = currentStep === step.number;
        const isComplete = currentStep > step.number;

        return (
          <button
            key={step.title}
            type="button"
            onClick={() => onStepClick?.(step.number)}
            disabled={!onStepClick || step.number === currentStep}
            className="p-4 transition-all text-left disabled:cursor-default"
            style={{
              background: isActive ? 'rgba(201,168,76,0.1)' : 'rgba(253,251,247,0.02)',
              border: `1px solid ${isActive ? 'rgba(201,168,76,0.45)' : C.borderLight}`,
              opacity: isComplete || isActive ? 1 : 0.72,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-full"
                style={{
                  background: isComplete || isActive ? C.gold : 'transparent',
                  border: isComplete || isActive ? `1px solid ${C.gold}` : `1px solid ${C.borderLight}`,
                  color: isComplete || isActive ? C.bg : C.muted,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {step.number}
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: isActive ? C.text : C.muted, fontFamily: 'Manrope, sans-serif' }}>
                {step.title}
              </p>
            </div>
            <p className="text-xs leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
              {step.note}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ===================== CHECKOUT PAGE =====================
function CheckoutPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const deliveryFee = 49;
  const total = cartTotal + deliveryFee;

  const [form, setForm] = useState(() => loadCheckoutDraft());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(() => {
    const draft = loadCheckoutDraft();
    return location.state?.checkoutStep || (draft.address_line1 || draft.city || draft.state || draft.pincode ? 2 : 1);
  });

  useEffect(() => {
    try {
      window.localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      window.sessionStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(form));
    } catch {
      // Ignore storage failures and keep the form usable.
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = (step = checkoutStep) => {
    const errs = {};
    if (step >= 1) {
      if (!form.full_name.trim()) errs.full_name = 'Required';
      if (!form.phone.trim() || form.phone.length !== 10) errs.phone = 'Enter valid 10-digit number';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email';
    }
    if (step >= 2) {
      if (!form.address_line1.trim()) errs.address_line1 = 'Required';
      if (!form.city.trim()) errs.city = 'Required';
      if (!form.state.trim()) errs.state = 'Required';
      if (!form.pincode.trim() || form.pincode.length !== 6) errs.pincode = 'Enter valid 6-digit pincode';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToAddressStep = () => {
    if (!validate(1)) return;
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(2) || cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ product_id: i.id, product_name: i.name, quantity: i.quantity, price: i.price })), ...form, subtotal: cartTotal, delivery_fee: deliveryFee, total })
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.detail || data.message || 'Unable to create order right now.');
      navigate(`/payment/${data.order_id}`, { state: { subtotal: cartTotal, deliveryFee, total, customerName: form.full_name } });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    }
    setSubmitting(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="text-center">
          <ShoppingBag size={48} color={C.gold} className="mx-auto mb-6 opacity-50" />
          <h2 className="sundays-heading text-2xl text-[#FDFBF7] mb-3">Your cart is empty</h2>
          <p className="text-sm font-light mb-8" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>Add some cookies to get started</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 text-sm font-bold tracking-[0.12em] uppercase" style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>Browse Menu</button>
        </div>
      </div>
    );
  }

  const inputStyle = (err) => ({
    width: '100%', background: 'rgba(253,251,247,0.04)', border: `1px solid ${err ? '#ef4444' : C.borderLight}`,
    padding: '14px 16px', color: C.text, fontFamily: 'Manrope, sans-serif', fontSize: '14px', transition: '0.2s',
  });

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Toaster position="top-center" toastOptions={{ style: { background: C.bgCard, color: C.text, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' } }} />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
          <ArrowLeft size={16} /> Back to Menu
        </button>

        <h1 className="sundays-heading text-4xl text-[#FDFBF7] mb-10">Checkout</h1>
        <CheckoutStageHeader currentStep={checkoutStep} onStepClick={(stepNumber) => setCheckoutStep(stepNumber < 3 ? stepNumber : checkoutStep)} />

        <form onSubmit={handleSubmit} className="space-y-8">
          {checkoutStep === 1 ? (
            <>
              <div className="p-6" style={{ background: 'rgba(253,251,247,0.02)', border: `1px solid ${C.borderLight}` }}>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>
                  <User size={14} /> Contact Details
                </h2>
                <p className="text-sm leading-6 mb-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                  Start with the customer contact. Order receipt, payment review, and packing updates will go to this email.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Full Name *</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Enter your full name" style={inputStyle(errors.full_name)} />
                    {errors.full_name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
                      <Phone size={10} className="inline mr-1" /> Phone *
                    </label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your 10-digit mobile number" maxLength={10} type="tel" style={inputStyle(errors.phone)} />
                    {errors.phone && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
                      <Mail size={10} className="inline mr-1" /> Email *
                    </label>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" type="email" autoComplete="email" style={inputStyle(errors.email)} />
                    {errors.email && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
                  </div>
                  <label className="flex items-start gap-3 p-4 cursor-pointer" style={{ background: C.borderLightBg, border: `1px solid ${C.borderLight}` }}>
                    <input
                      type="checkbox"
                      name="marketing_opt_in"
                      checked={form.marketing_opt_in}
                      onChange={handleChange}
                      className="mt-1"
                      style={{ accentColor: C.goldHex }}
                    />
                    <span className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      Send me first-drop updates and occasional offers. We will still send one welcome note now, and order emails will continue either way.
                    </span>
                  </label>
                </div>
              </div>

              <button type="button" onClick={goToAddressStep} className="w-full py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all"
                style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>
                Continue to Address
              </button>
            </>
          ) : (
            <>
              <div className="p-6" style={{ background: 'rgba(253,251,247,0.02)', border: `1px solid ${C.borderLight}` }}>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>
                      <MapPin size={14} /> Delivery Address
                    </h2>
                    <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      Add the delivery location, then continue to the payment stage.
                    </p>
                  </div>
                  <button type="button" onClick={() => setCheckoutStep(1)} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]" style={{ border: `1px solid ${C.borderLight}`, color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
                    Edit Contact
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Address Line 1 *</label>
                    <input name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="House/Flat no., Building name, Street" style={inputStyle(errors.address_line1)} />
                    {errors.address_line1 && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.address_line1}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Address Line 2</label>
                    <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Area, Colony (optional)" style={inputStyle(false)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>City *</label>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="City" style={inputStyle(errors.city)} />
                      {errors.city && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>State *</label>
                      <input name="state" value={form.state} onChange={handleChange} placeholder="State" style={inputStyle(errors.state)} />
                      {errors.state && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.state}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Pincode *</label>
                      <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} style={inputStyle(errors.pincode)} />
                      {errors.pincode && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.pincode}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Landmark</label>
                      <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Nearby landmark" style={inputStyle(false)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6" style={{ background: 'rgba(253,251,247,0.02)', border: `1px solid ${C.borderLight}` }}>
                <label className="block text-[11px] uppercase tracking-[0.15em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Special Instructions (optional)</label>
                <textarea name="special_instructions" value={form.special_instructions} onChange={handleChange} placeholder="Any special requests for your order..." rows={3}
                  style={{ ...inputStyle(false), resize: 'none' }} />
              </div>

              <button type="submit" disabled={submitting} className="w-full py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all"
                style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </>
          )}
        </form>

        {/* Order Summary */}
        <div className="mt-10 p-6" style={{ background: 'rgba(253,251,247,0.02)', border: `1px solid ${C.borderLight}` }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>Order Summary</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover shrink-0" style={{ filter: 'brightness(0.85)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.name}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center" style={{ border: `1px solid ${C.border}`, color: C.text }}><Minus size={12} /></button>
                  <span className="w-5 text-center text-sm font-bold" style={{ color: C.muted }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center" style={{ border: `1px solid ${C.border}`, color: C.text }}><Plus size={12} /></button>
                </div>
                <span className="text-sm font-semibold w-16 text-right" style={{ color: C.text }}>₹{item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="opacity-40 hover:opacity-100 transition-opacity" aria-label={`Remove ${item.name}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 space-y-2" style={{ borderTop: `1px solid ${C.borderLight}` }}>
            <div className="flex justify-between text-sm" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}><span>Subtotal</span><span>₹{cartTotal}</span></div>
            <div className="flex justify-between text-sm" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}><span>Delivery</span><span>₹{deliveryFee}</span></div>
            <div className="flex justify-between text-lg font-bold pt-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif', borderTop: `1px solid ${C.borderLight}` }}>
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== PAYMENT PAGE =====================
function PaymentPage() {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = window.location.pathname.split('/payment/')[1];
  const { subtotal: initialSubtotal = 0, deliveryFee: initialDeliveryFee = 49, total: initialTotal = 0, customerName = '' } = location.state || {};

  const initialMethod = SITE_CONFIG.trialQrImage ? 'screenshot' : 'utr';
  const [method, setMethod] = useState(initialMethod);
  const [utrId, setUtrId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(!initialTotal && !!orderId);
  const [paymentView, setPaymentView] = useState(SITE_CONFIG.trialQrImage ? 'qr' : 'apps');
  const [orderDetails, setOrderDetails] = useState(
    initialTotal
      ? { subtotal: initialSubtotal, delivery_fee: initialDeliveryFee, total: initialTotal, full_name: customerName }
      : null
  );
  const upiId = SITE_CONFIG.upiId;
  const upiName = SITE_CONFIG.upiName;
  const trialQrImage = SITE_CONFIG.trialQrImage;

  useEffect(() => {
    if (trialQrImage) setMethod('screenshot');
  }, [trialQrImage]);

  useEffect(() => {
    setPaymentView(trialQrImage ? 'qr' : 'apps');
  }, [trialQrImage]);

  useEffect(() => {
    if (!orderId || initialTotal) return;

    let active = true;
    const loadOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`);
        const data = await parseJsonResponse(res);
        if (!res.ok) throw new Error(data.detail || 'Unable to load order details.');
        if (active) setOrderDetails(data);
      } catch (err) {
        console.error(err);
        if (active) toast.error(err.message || 'Could not load payment details.');
      } finally {
        if (active) setLoadingOrder(false);
      }
    };

    loadOrder();
    return () => { active = false; };
  }, [initialTotal, orderId]);

  const subtotal = orderDetails?.subtotal ?? initialSubtotal;
  const deliveryFee = orderDetails?.delivery_fee ?? initialDeliveryFee;
  const total = orderDetails?.total ?? initialTotal;
  const upiLink = buildUpiLink({ upiId, upiName, total, orderId });
  const hasLiveUpiIntent = Boolean(upiId && upiId !== 'sundays@upi');

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success('UPI ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Could not copy UPI ID on this device.');
    }
  };

  const handleUpiAppClick = (e) => {
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (!isTouchDevice) {
      e.preventDefault();
      toast.message('Open this page on your phone or scan the QR with any UPI app.');
    }
  };

  const handleConfirm = async () => {
    const cleanedUtrId = normalizeUtrId(utrId);

    if (method === 'utr' && !cleanedUtrId) return;
    if (method === 'screenshot' && !screenshot) return;

    if (method === 'utr' && !isValidUtrId(cleanedUtrId)) {
      toast.error('Enter a valid UTR with at least 12 letters or numbers.');
      return;
    }

    setSubmitting(true);
    try {
      if (method === 'screenshot' && screenshot) {
        const fd = new FormData();
        fd.append('file', screenshot);
        const uploadRes = await fetch(`${API_URL}/orders/${orderId}/upload-screenshot`, { method: 'POST', body: fd });
        if (!uploadRes.ok) {
          const uploadData = await parseJsonResponse(uploadRes).catch(() => ({}));
          throw new Error(uploadData.detail || uploadData.message || 'Screenshot upload failed.');
        }
      }
      const confirmRes = await fetch(`${API_URL}/orders/${orderId}/confirm-payment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, utr_id: method === 'utr' ? cleanedUtrId : null, screenshot_uploaded: method === 'screenshot' })
      });
      const confirmData = await parseJsonResponse(confirmRes).catch(() => ({}));
      if (!confirmRes.ok) throw new Error(confirmData.detail || confirmData.message || 'Payment confirmation failed.');
      setConfirmed(true);
      clearCheckoutDraft();
      clearCart();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Payment confirmation failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Check size={36} color="#22c55e" />
          </div>
          <h2 className="sundays-heading text-3xl text-[#FDFBF7] mb-3">Proof Submitted for Review</h2>
          <p className="text-sm mb-1" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Order ID</p>
          <p className="sundays-heading text-xl mb-6" style={{ color: C.gold }}>{orderId}</p>
          <div className="p-4 mb-8" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
            <p className="text-sm font-light" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
              Payment proof received. Your order is still pending manual verification and is not confirmed yet.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="px-8 py-3 text-sm font-bold tracking-[0.12em] uppercase" style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>Back to Menu</button>
        </motion.div>
      </div>
    );
  }

  const qrUrl = trialQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=0A140E`;
  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Toaster position="top-center" toastOptions={{ style: { background: C.bgCard, color: C.text, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' } }} />
      <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <CheckoutStageHeader currentStep={3} onStepClick={(stepNumber) => {
          if (stepNumber < 3) {
            navigate('/checkout', { state: { checkoutStep: stepNumber } });
          }
        }} />
        <h1 className="sundays-heading text-4xl text-[#FDFBF7] mb-1">Payment</h1>
        <p className="text-sm font-light mb-8" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>Choose how you want to pay, complete the transfer, and then send your proof so the order can be cleared for baking.</p>
        <div className="grid gap-3 md:grid-cols-3 mb-6">
          {[
            { key: 'apps', label: 'UPI Apps', note: hasLiveUpiIntent ? 'Open PhonePe, Google Pay, or Paytm directly' : 'Will activate once the live business UPI is connected', disabled: !hasLiveUpiIntent },
            { key: 'qr', label: 'Scan QR', note: trialQrImage ? 'Use the attached trial QR for internal testing' : 'Scan with any UPI app on your phone', disabled: false },
            { key: 'proof', label: 'Submit Proof', note: 'Upload a screenshot or enter the real UTR after paying', disabled: false },
          ].map((option, index) => {
            const isActive = paymentView === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => !option.disabled && setPaymentView(option.key)}
                className="p-4 text-left transition-all disabled:opacity-45 disabled:cursor-not-allowed"
                disabled={option.disabled}
                style={{
                  background: isActive ? 'rgba(201,168,76,0.1)' : 'rgba(253,251,247,0.02)',
                  border: `1px solid ${isActive ? 'rgba(201,168,76,0.45)' : C.borderLight}`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-full"
                    style={{
                      background: isActive ? C.gold : 'transparent',
                      border: `1px solid ${isActive ? C.gold : C.borderLight}`,
                      color: isActive ? C.bg : C.muted,
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: isActive ? C.text : C.muted, fontFamily: 'Manrope, sans-serif' }}>
                    {option.label}
                  </span>
                </div>
                <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                  {option.note}
                </p>
              </button>
            );
          })}
        </div>
        {trialQrImage ? (
          <div className="px-4 py-3 mb-6 flex items-center justify-between gap-4" style={{ background: 'rgba(201,168,76,0.08)', border: `1px solid rgba(201,168,76,0.35)` }}>
            <div>
            <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Internal trial mode</p>
            <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
              This payment QR is attached only for test runs before launch.
            </p>
            </div>
            <span className="text-xs uppercase tracking-[0.18em] px-3 py-2 shrink-0" style={{ color: C.gold, border: `1px solid rgba(201,168,76,0.25)`, fontFamily: 'Manrope, sans-serif' }}>
              Screenshot after payment
            </span>
          </div>
        ) : null}
        {loadingOrder ? (
          <p className="text-xs mb-6" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
            Loading latest payment details...
          </p>
        ) : null}

        {/* Amount */}
        <div className="p-6 text-center mb-6" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
          <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Amount to Pay</p>
          <div className="sundays-heading text-5xl" style={{ color: C.gold }}>₹{total}</div>
          <div className="flex justify-center gap-6 mt-3 text-sm" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
            <span>Subtotal: ₹{subtotal}</span><span>Delivery: ₹{deliveryFee}</span>
          </div>
        </div>

        {/* QR Code */}
        {paymentView === 'qr' ? (
        <div className="p-6 text-center mb-6" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
          <h2 className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>
            <Smartphone size={14} color={C.gold} /> Scan to Pay
          </h2>
          <div className="inline-block bg-white p-3 mb-3"><img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" /></div>
          <p className="text-xs mb-3" style={{ color: C.muted }}>{trialQrImage ? 'Trial payment QR' : 'UPI QR Code'}</p>
          {SITE_CONFIG.hideUpiId ? (
            <div className="text-sm font-semibold" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>
              Receiver: {upiName}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm" style={{ color: C.muted }}>UPI ID:</span>
              <span className="text-sm font-semibold" style={{ color: C.gold }}>{upiId}</span>
              <button onClick={copyUpi} className="p-1 transition-colors" style={{ color: copied ? '#22c55e' : C.muted }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
          {trialQrImage ? null : (
            <p className="text-xs mt-4" style={{ color: C.textSubtle, fontFamily: 'Manrope, sans-serif' }}>
              Make sure your UPI app shows the receiver as {upiName} before you finish the payment.
            </p>
          )}
        </div>
        ) : null}

        {/* Pay with App */}
        {paymentView === 'apps' && hasLiveUpiIntent ? (
        <div className="p-6 mb-6" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
          <h2 className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>
            <Smartphone size={14} color={C.gold} /> Pay with App
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'PhonePe', color: '#5f259f', icon: '₱', href: `phonepe://pay?pa=${upiId}&am=${total}&cu=INR` },
              { name: 'Google Pay', color: '#4285f4', icon: 'G', href: `gpay://upi/pay?pa=${upiId}&am=${total}&cu=INR` },
              { name: 'Paytm', color: '#00baf2', icon: '₽', href: `paytmmp://pay?pa=${upiId}&am=${total}&cu=INR` },
            ].map(app => (
              <a key={app.name} href={upiLink} onClick={handleUpiAppClick} className="flex flex-col items-center gap-2 p-4 transition-all hover:opacity-80"
                style={{ background: C.borderLightBg, border: `1px solid ${C.borderLight}` }}>
                <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-xs uppercase" style={{ background: app.color }}>
                  {app.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                </div>
                <span className="text-xs font-medium" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>{app.name}</span>
              </a>
            ))}
          </div>
          <p className="text-xs text-center mt-4" style={{ color: C.textSubtle, fontFamily: 'Manrope, sans-serif' }}>
            On mobile these buttons open your UPI flow. On desktop, scan the QR with your phone.
          </p>
        </div>
        ) : paymentView === 'apps' ? (
        <div className="p-6 mb-6" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
          <h2 className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>
            <Smartphone size={14} color={C.gold} /> Pay with App
          </h2>
          <p className="text-sm text-center leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
            Direct PhonePe, Google Pay, and Paytm buttons will activate once the live business UPI ID is connected. During this trial, use the QR section and then send the screenshot.
          </p>
        </div>
        ) : null}

        {/* Confirm Payment */}
        <div className="p-6" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>Confirm Payment</h2>
          <p className="text-sm font-light mb-5" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
            {trialQrImage
              ? 'After paying in this trial flow, upload a screenshot so the payment can be reviewed manually.'
              : 'After payment, submit the UTR / transaction ID or upload a screenshot for manual verification.'}
          </p>

          {trialQrImage ? null : (
            <div className="flex gap-2 mb-5 p-1" style={{ background: 'rgba(253,251,247,0.04)' }}>
              <button onClick={() => setMethod('utr')} className="flex-1 py-2.5 text-sm font-semibold tracking-wide transition-all"
                style={{ fontFamily: 'Manrope, sans-serif', background: method === 'utr' ? C.gold : 'transparent', color: method === 'utr' ? C.bg : C.muted }}>
                Enter UTR ID
              </button>
              <button onClick={() => setMethod('screenshot')} className="flex-1 py-2.5 text-sm font-semibold tracking-wide transition-all"
                style={{ fontFamily: 'Manrope, sans-serif', background: method === 'screenshot' ? C.gold : 'transparent', color: method === 'screenshot' ? C.bg : C.muted }}>
                Upload Screenshot
              </button>
            </div>
          )}

          {method === 'utr' ? (
            <>
              <input value={utrId} onChange={e => setUtrId(normalizeUtrId(e.target.value))} placeholder="Enter UTR / Transaction ID"
                style={{ width: '100%', background: 'rgba(253,251,247,0.04)', border: `1px solid ${C.borderLight}`, padding: '14px 16px', color: C.text, fontFamily: 'Manrope, sans-serif', fontSize: '14px', marginBottom: '8px' }} />
              <p className="text-xs mb-5" style={{ color: C.textSubtle, fontFamily: 'Manrope, sans-serif' }}>
                Use the actual bank or UPI reference only. Short random numbers will not be accepted.
              </p>
            </>
          ) : (
            <label className="block cursor-pointer mb-5">
              <div className="p-6 text-center" style={{ border: `2px dashed ${screenshot ? 'rgba(34,197,94,0.3)' : C.borderLight}`, transition: '0.2s' }}>
                {screenshot ? (
                  <><Check size={24} color="#22c55e" className="mx-auto mb-2" /><p className="text-sm" style={{ color: C.muted }}>{screenshot.name}</p></>
                ) : (
                  <><Upload size={24} color={C.muted} className="mx-auto mb-2" /><p className="text-sm" style={{ color: C.muted }}>Tap to upload payment screenshot</p></>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => setScreenshot(e.target.files[0])} />
            </label>
          )}

          <button onClick={handleConfirm} disabled={submitting || (method === 'utr' && !isValidUtrId(utrId)) || (method === 'screenshot' && !screenshot)}
            className="w-full py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>
            {submitting ? 'Submitting...' : 'Submit Payment Proof'}
          </button>

          <p className="text-center text-xs mt-4" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
            Payment is reviewed manually. The order should only be treated as confirmed after verification.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===================== OWNER DASHBOARD =====================
function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [draftKey, setDraftKey] = useState(() => loadOwnerDashboardKey());
  const [ownerKey, setOwnerKey] = useState(() => loadOwnerDashboardKey());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  const fetchOrders = async (key) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { 'x-admin-key': key },
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.detail || 'Could not load owner dashboard.');
      setOrders(data.orders || []);
      setAuthChecked(true);
      return true;
    } catch (err) {
      console.error(err);
      setOrders([]);
      setAuthChecked(true);
      setError(err.message || 'Could not load owner dashboard.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ownerKey) {
      setAuthChecked(true);
      return;
    }

    fetchOrders(ownerKey).then((ok) => {
      if (!ok) {
        clearOwnerDashboardKey();
        setOwnerKey('');
      }
    });
  }, [ownerKey]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!draftKey.trim()) {
      setError('Enter your owner access key.');
      return;
    }

    const trimmedKey = draftKey.trim();
    const ok = await fetchOrders(trimmedKey);
    if (ok) {
      saveOwnerDashboardKey(trimmedKey);
      setOwnerKey(trimmedKey);
      toast.success('Owner dashboard unlocked');
    } else {
      clearOwnerDashboardKey();
    }
  };

  const handleLogout = () => {
    clearOwnerDashboardKey();
    setOwnerKey('');
    setDraftKey('');
    setOrders([]);
    setError('');
    setAuthChecked(true);
  };

  const handleOrderAction = async (orderId, action) => {
    if (!ownerKey) return;
    setUpdatingOrderId(orderId);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ownerKey,
        },
        body: JSON.stringify({ action }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.detail || 'Could not update order status.');
      setOrders(prev => prev.map(order => order.id === orderId ? data.order : order));
      toast.success('Order updated');
    } catch (err) {
      console.error(err);
      if ((err.message || '').includes('Owner access required')) {
        handleLogout();
      }
      setError(err.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const statusTone = (value) => {
    if (value === 'verified' || value === 'confirmed' || value === 'delivered') {
      return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.22)', color: '#86efac' };
    }
    if (value === 'rejected' || value === 'payment_issue') {
      return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.22)', color: '#fca5a5' };
    }
    if (value === 'packed') {
      return { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.22)', color: '#93c5fd' };
    }
    return { bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.22)', color: C.gold };
  };

  if (!ownerKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="w-full max-w-md p-8" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
            <ArrowLeft size={16} /> Back to site
          </button>
          <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Owner access</p>
          <h1 className="sundays-heading text-3xl text-[#FDFBF7] mb-3">Sundays Dashboard</h1>
          <p className="text-sm mb-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
            This page is private. Orders load only after the backend verifies your owner key.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="Enter owner access key"
              style={{ width: '100%', background: 'rgba(253,251,247,0.04)', border: `1px solid ${C.borderLight}`, padding: '14px 16px', color: C.text, fontFamily: 'Manrope, sans-serif', fontSize: '14px', marginBottom: '16px' }}
            />
            {error ? <p className="text-sm mb-4" style={{ color: '#fca5a5', fontFamily: 'Manrope, sans-serif' }}>{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full py-4 text-sm font-bold tracking-[0.12em] uppercase transition-all disabled:opacity-50" style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>
              {loading ? 'Checking...' : 'Unlock dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Toaster position="top-center" toastOptions={{ style: { background: C.bgCard, color: C.text, border: `1px solid ${C.border}`, fontFamily: 'Manrope, sans-serif' } }} />
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Private owner dashboard</p>
            <h1 className="sundays-heading text-4xl text-[#FDFBF7]">Orders & Payment Review</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchOrders(ownerKey)} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em]" style={{ border: `1px solid ${C.border}`, color: C.text, fontFamily: 'Manrope, sans-serif' }}>
              Refresh
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em]" style={{ border: `1px solid ${C.border}`, color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
              Lock
            </button>
          </div>
        </div>

        {error ? <p className="text-sm mb-4" style={{ color: '#fca5a5', fontFamily: 'Manrope, sans-serif' }}>{error}</p> : null}
        {loading && !authChecked ? <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Loading owner dashboard...</p> : null}

        <div className="grid gap-5">
          {orders.length === 0 ? (
            <div className="p-8 text-center" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
              <p className="text-sm" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>No orders yet.</p>
            </div>
          ) : orders.map((order) => {
            const paymentTone = statusTone(order.payment_status);
            const orderTone = statusTone(order.order_status);
            return (
              <div key={order.id} className="p-6" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Order #{order.id}</p>
                    <h2 className="sundays-heading text-2xl text-[#FDFBF7] mb-2">{order.full_name}</h2>
                    <p className="text-sm" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      {order.phone} · ₹{order.total} · {new Date(order.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs uppercase tracking-[0.12em]" style={{ background: paymentTone.bg, border: `1px solid ${paymentTone.border}`, color: paymentTone.color, fontFamily: 'Manrope, sans-serif' }}>
                      Payment: {order.payment_status || 'pending'}
                    </span>
                    <span className="px-3 py-1 text-xs uppercase tracking-[0.12em]" style={{ background: orderTone.bg, border: `1px solid ${orderTone.border}`, color: orderTone.color, fontFamily: 'Manrope, sans-serif' }}>
                      Order: {order.order_status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-5">
                  <div className="p-4" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
                    <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Customer</p>
                    <p className="text-sm leading-6 mb-3" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      {order.full_name}<br />
                      {order.phone}<br />
                      {order.email || 'No email captured'}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Delivery</p>
                    <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      {order.address_line1}<br />
                      {order.address_line2 ? <>{order.address_line2}<br /></> : null}
                      {order.city}, {order.state} - {order.pincode}
                    </p>
                  </div>
                  <div className="p-4" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
                    <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Payment proof</p>
                    <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      UTR: {order.utr_id || 'Not submitted'}<br />
                      Screenshot: {order.screenshot_url ? 'Uploaded' : 'Not uploaded'}
                    </p>
                  </div>
                  <div className="p-4" style={{ background: 'rgba(253,251,247,0.03)', border: `1px solid ${C.borderLight}` }}>
                    <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Notes</p>
                    <p className="text-sm leading-6" style={{ color: C.textMuted, fontFamily: 'Manrope, sans-serif' }}>
                      {order.special_instructions || 'No special instructions'}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.16em] mb-3" style={{ color: C.gold, fontFamily: 'Manrope, sans-serif' }}>Items</p>
                  <div className="space-y-2">
                    {(order.items || []).map((item, index) => (
                      <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-3 p-3" style={{ background: 'rgba(253,251,247,0.02)', border: `1px solid ${C.borderLight}` }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>{item.product_name}</p>
                          <p className="text-xs" style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}>Qty {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: 'Manrope, sans-serif' }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleOrderAction(order.id, 'verify_payment')} disabled={updatingOrderId === order.id} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-50" style={{ background: C.gold, color: C.bg, fontFamily: 'Manrope, sans-serif' }}>
                    Verify payment
                  </button>
                  <button onClick={() => handleOrderAction(order.id, 'reject_payment')} disabled={updatingOrderId === order.id} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-50" style={{ border: `1px solid rgba(239,68,68,0.25)`, color: '#fca5a5', fontFamily: 'Manrope, sans-serif' }}>
                    Reject proof
                  </button>
                  <button onClick={() => handleOrderAction(order.id, 'mark_packed')} disabled={updatingOrderId === order.id} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-50" style={{ border: `1px solid ${C.border}`, color: C.text, fontFamily: 'Manrope, sans-serif' }}>
                    Mark packed
                  </button>
                  <button onClick={() => handleOrderAction(order.id, 'mark_delivered')} disabled={updatingOrderId === order.id} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-50" style={{ border: `1px solid ${C.border}`, color: C.text, fontFamily: 'Manrope, sans-serif' }}>
                    Mark delivered
                  </button>
                  <button onClick={() => handleOrderAction(order.id, 'mark_review')} disabled={updatingOrderId === order.id} className="px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-50" style={{ border: `1px solid ${C.border}`, color: C.muted, fontFamily: 'Manrope, sans-serif' }}>
                    Back to review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===================== APP =====================
function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/owner" element={<OwnerDashboardPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
