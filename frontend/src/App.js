import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MessageCircle, ChevronDown, ArrowRight } from "lucide-react";
import "./App.css";

// ── Constants ──────────────────────────────────────────────────────────────────
const WHATSAPP = "919177155540";
const wa = (cookieName) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Hi! I'd like to order "${cookieName}" from Sundays 🍪`
  )}`;

const C = {
  bg: "#0A140E",
  surface: "#1C3A2A",
  elevated: "#254836",
  gold: "#C9A84C",
  goldHover: "#DCC275",
  text: "#FDFBF7",
  muted: "#A9B8AF",
  border: "rgba(201,168,76,0.2)",
};

// ── Data ───────────────────────────────────────────────────────────────────────
const processSteps = [
  {
    step: "01",
    title: "Browning",
    subtitle: "Where depth begins",
    body: "We slowly brown European-style butter until it turns deep amber and fills the kitchen with the scent of toasted hazelnuts. This single step builds layers of flavour you simply cannot shortcut.",
    time: "~15 min",
    image:
      "https://images.unsplash.com/photo-1758874960608-f0d7f38d9846?w=900&q=85",
  },
  {
    step: "02",
    title: "Mixing",
    subtitle: "Art in every fold",
    body: "Cold eggs, two types of sugar, still-warm browned butter. The fold is everything — overwork it and you lose the magic. We've made this mistake so you never have to.",
    time: "~20 min",
    image:
      "https://images.unsplash.com/photo-1772915516557-2d57f94b0bd0?w=900&q=85",
  },
  {
    step: "03",
    title: "24 hr Chilling",
    subtitle: "The wait is the recipe",
    body: "The dough rests in cold for a full 24 hours. Flavours meld. Moisture redistributes. The texture you'd never achieve in a rush. Patience isn't an ingredient — it's the technique.",
    time: "24 hours",
    image:
      "https://images.unsplash.com/photo-1687549181635-e795cefee8b5?w=900&q=85",
  },
  {
    step: "04",
    title: "Baking",
    subtitle: "Golden hour",
    body: "Pulled two minutes before they look done. They finish cooking on the hot pan — giving you that signature soft centre with a barely-there crisp edge. Timing is everything.",
    time: "~11 min",
    image:
      "https://images.unsplash.com/photo-1737674879060-7be2f5198aab?w=900&q=85",
  },
];

const cookieCategories = [
  {
    category: "The OG",
    tag: "Always Available",
    cookies: [
      {
        id: "lazy-legend",
        name: "The Lazy Legend",
        flavor: "Classic Choco Chip",
        description:
          "Brown butter, two types of sugar, and Valrhona chocolate chips. The one that started it all. The cookie by which all others are judged.",
        image:
          "https://images.pexels.com/photos/8587292/pexels-photo-8587292.jpeg?auto=compress&cs=tinysrgb&w=900",
      },
    ],
  },
  {
    category: "The Minis",
    tag: "Always Available",
    cookies: [
      {
        id: "little-rebels",
        name: "Little Rebels",
        flavor: "Mini Choco Bites",
        description:
          "All the soul, half the size. Perfect for when you want just a little something — and then four more.",
        image:
          "https://images.pexels.com/photos/13815330/pexels-photo-13815330.jpeg?auto=compress&cs=tinysrgb&w=900",
      },
    ],
  },
  {
    category: "Rotation 1",
    tag: "Limited Run",
    cookies: [
      {
        id: "dark-side",
        name: "The Dark Side",
        flavor: "Oreo Cookies & Cream",
        description:
          "Crushed Oreos folded into a dark chocolate base. Rich, crunchy, unapologetically indulgent. Once you go dark, you don't go back.",
        image:
          "https://images.pexels.com/photos/7394822/pexels-photo-7394822.jpeg?auto=compress&cs=tinysrgb&w=900",
      },
      {
        id: "after-hours",
        name: "The After Hours",
        flavor: "Double Dark & Sea Salt",
        description:
          "Double chocolate dough, 72% dark chips, finished with a pinch of fleur de sel. The best kind of midnight snack.",
        image:
          "https://images.unsplash.com/photo-1627388483909-3c712c62d834?w=900&q=85",
      },
    ],
  },
  {
    category: "Rotation 2",
    tag: "Limited Run",
    cookies: [
      {
        id: "golden-affair",
        name: "The Golden Affair",
        flavor: "Lotus Biscoff",
        description:
          "Biscoff spread swirled into the dough, whole Biscoff pieces pressed on top. Caramel, spice, and warmth in every bite.",
        image:
          "https://images.pexels.com/photos/34124950/pexels-photo-34124950.jpeg?auto=compress&cs=tinysrgb&w=900",
      },
      {
        id: "midnight-meltdown",
        name: "The Midnight Meltdown",
        flavor: "S'mores",
        description:
          "Toasted marshmallow, milk chocolate, and a graham cracker crumble. Campfire dreams in cookie form.",
        image:
          "https://images.unsplash.com/photo-1605090931399-163ac71a4218?w=900&q=85",
      },
    ],
  },
  {
    category: "Rich & Reckless",
    tag: "Premium Drop",
    cookies: [
      {
        id: "nutella-lava",
        name: "Nutella Lava",
        flavor: "Hazelnut Chocolate",
        description:
          "A pure Nutella core hidden inside a deep chocolate cookie. Break it open. Watch it pour. Try not to eat three.",
        image:
          "https://images.unsplash.com/photo-1606756579814-d03eec44286c?w=900&q=85",
      },
    ],
  },
];

// ── Navbar ─────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      data-testid="navbar"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-20"
      style={{
        background: scrolled ? "rgba(10,20,14,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "background 0.4s, border 0.4s",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <span className="sundays-logo text-2xl tracking-[0.35em] text-[#FDFBF7]">
        SUNDAYS
      </span>

      <motion.a
        href={wa("a cookie")}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="navbar-order-btn"
        className="flex items-center gap-2 text-[#0A140E] font-semibold text-sm tracking-wider px-6 py-3"
        style={{ background: C.gold, fontFamily: "Manrope, sans-serif" }}
        whileHover={{ background: C.goldHover }}
        whileTap={{ scale: 0.97 }}
      >
        <MessageCircle size={14} />
        Order Now
      </motion.a>
    </motion.nav>
  );
};

// ── Hero ───────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.75], ["0%", "-8%"]);

  return (
    <section
      ref={ref}
      data-testid="hero-section"
      className="relative h-screen overflow-hidden"
    >
      {/* Video */}
      <motion.div className="absolute inset-0" style={{ y: videoY }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1620499634096-3dfa6ecdc5c7?w=1920&q=85"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-baking-chocolate-chip-cookies-39424-large.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-chocolate-chip-cookies-in-a-pile-39420-large.mp4"
            type="video/mp4"
          />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,20,14,0.45) 0%, rgba(10,20,14,0.35) 50%, rgba(10,20,14,0.95) 100%)",
          }}
        />
      </motion.div>

      {/* Text */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.span
          className="block text-xs sm:text-sm uppercase tracking-[0.4em] mb-8 font-medium"
          style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9 }}
        >
          The 24-Hour Cookie
        </motion.span>

        <motion.h1
          className="sundays-display text-[#FDFBF7]"
          style={{ fontSize: "clamp(5rem, 14vw, 11rem)", lineHeight: 0.88 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Sundays
        </motion.h1>

        <motion.p
          className="mt-8 text-base sm:text-lg max-w-xs font-light tracking-wide"
          style={{
            color: "rgba(253,251,247,0.65)",
            fontFamily: "Manrope, sans-serif",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9 }}
        >
          Made slowly. Tasted once. Never forgotten.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
        >
          <span
            className="text-xs uppercase tracking-[0.25em]"
            style={{ color: "rgba(201,168,76,0.6)", fontFamily: "Manrope, sans-serif" }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={22} color="rgba(201,168,76,0.6)" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ── Intro ──────────────────────────────────────────────────────────────────────
const IntroSection = () => (
  <section
    data-testid="intro-section"
    className="py-36 md:py-52 px-6 md:px-16 lg:px-32"
    style={{ background: C.bg }}
  >
    <div className="max-w-5xl mx-auto">
      <motion.span
        className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-8 font-medium"
        style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        Our philosophy
      </motion.span>

      <motion.h2
        className="sundays-heading text-[#FDFBF7] leading-[1.05]"
        style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.8rem)" }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        We don&apos;t bake faster.
        <br />
        <span style={{ color: C.gold }}>We bake better.</span>
      </motion.h2>

      <motion.p
        className="mt-10 text-base sm:text-lg font-light max-w-2xl leading-relaxed"
        style={{ color: "rgba(253,251,247,0.6)", fontFamily: "Manrope, sans-serif" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        Every Sundays cookie begins 24 hours before you taste it. The secret
        isn't in the recipe — it's in the patience. Browned butter. Chilled
        dough. Time. These things can't be rushed, and we'd never try.
      </motion.p>

      {/* Stats */}
      <div
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-10 pt-12 border-t"
        style={{ borderColor: C.border }}
      >
        {[
          { num: "24h", label: "Chill Time" },
          { num: "7", label: "Signatures" },
          { num: "0", label: "Shortcuts" },
          { num: "∞", label: "Satisfaction" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.7 }}
          >
            <div
              className="sundays-heading"
              style={{ fontSize: "3.2rem", color: C.gold, lineHeight: 1 }}
            >
              {s.num}
            </div>
            <div
              className="mt-2 text-xs uppercase tracking-[0.2em]"
              style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ── Process Step ───────────────────────────────────────────────────────────────
const ProcessStep = ({ step, index }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 40%"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [70, 0]);
  const imgOpacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      data-testid={`process-step-${step.step}`}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
    >
      {/* Image */}
      <motion.div
        className={`relative overflow-hidden ${!isEven ? "lg:order-2" : ""}`}
        style={{ y: imgY, opacity: imgOpacity }}
      >
        <img
          src={step.image}
          alt={step.title}
          className="w-full object-cover"
          style={{ height: "480px", filter: "brightness(0.82)" }}
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 45%, rgba(10,20,14,0.5) 100%)",
          }}
        />
        <div
          className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.22em] px-4 py-2"
          style={{
            background: "rgba(201,168,76,0.12)",
            border: `1px solid ${C.border}`,
            color: C.gold,
            fontFamily: "Manrope, sans-serif",
          }}
        >
          {step.time}
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        className={!isEven ? "lg:order-1" : ""}
        initial={{ opacity: 0, x: isEven ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="text-xs uppercase tracking-[0.35em]"
          style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
        >
          Step {step.step}
        </span>
        <h3
          className="sundays-heading mt-4 text-[#FDFBF7] leading-none"
          style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)" }}
        >
          {step.title}
        </h3>
        <p
          className="mt-3 text-sm font-semibold tracking-wide uppercase"
          style={{ color: C.gold, fontFamily: "Manrope, sans-serif", letterSpacing: "0.1em" }}
        >
          {step.subtitle}
        </p>
        <p
          className="mt-7 text-base sm:text-lg font-light leading-relaxed"
          style={{ color: "rgba(253,251,247,0.6)", fontFamily: "Manrope, sans-serif" }}
        >
          {step.body}
        </p>
      </motion.div>
    </motion.div>
  );
};

// ── Process Section ────────────────────────────────────────────────────────────
const ProcessSection = () => (
  <section
    data-testid="process-section"
    className="py-36 md:py-52"
    style={{ background: C.surface }}
  >
    <div className="px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
      <div className="mb-24">
        <motion.span
          className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-6 font-medium"
          style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          The Process
        </motion.span>
        <motion.h2
          className="sundays-heading text-[#FDFBF7]"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.8rem)" }}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Slow by design.
        </motion.h2>
      </div>

      <div className="space-y-36 md:space-y-48">
        {processSteps.map((step, i) => (
          <ProcessStep key={step.step} step={step} index={i} />
        ))}
      </div>
    </div>
  </section>
);

// ── Cookie Card ────────────────────────────────────────────────────────────────
const CookieCard = ({ cookie, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      data-testid={`cookie-card-${cookie.id}`}
      className="relative overflow-hidden"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "280px" }}>
        <motion.img
          src={cookie.image}
          alt={cookie.name}
          className="w-full h-full object-cover"
          animate={{
            scale: hovered ? 1.07 : 1,
            filter: hovered ? "brightness(1.18)" : "brightness(0.8)",
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,20,14,0.92) 0%, rgba(10,20,14,0.1) 55%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="p-7">
        <p
          className="text-xs uppercase tracking-[0.25em] mb-2"
          style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
        >
          {cookie.flavor}
        </p>
        <h4
          className="sundays-heading text-2xl text-[#FDFBF7] mb-4 leading-tight"
        >
          {cookie.name}
        </h4>
        <p
          className="text-sm font-light leading-relaxed mb-7"
          style={{ color: "rgba(253,251,247,0.55)", fontFamily: "Manrope, sans-serif" }}
        >
          {cookie.description}
        </p>

        <motion.a
          href={wa(cookie.name)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`order-whatsapp-${cookie.id}`}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 text-sm font-bold tracking-[0.12em] uppercase text-[#0A140E]"
          style={{ background: C.gold, fontFamily: "Manrope, sans-serif" }}
          whileHover={{ background: C.goldHover }}
          whileTap={{ scale: 0.97 }}
        >
          <MessageCircle size={14} />
          Order on WhatsApp
        </motion.a>
      </div>
    </motion.div>
  );
};

// ── Shop Section ───────────────────────────────────────────────────────────────
const ShopSection = () => (
  <section
    data-testid="shop-section"
    className="py-36 md:py-52"
    style={{ background: C.bg }}
  >
    <div className="px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
      <div className="mb-20">
        <motion.span
          className="block text-xs sm:text-sm uppercase tracking-[0.35em] mb-6 font-medium"
          style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          The Shop
        </motion.span>
        <motion.h2
          className="sundays-heading text-[#FDFBF7]"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.8rem)" }}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Choose your vice.
        </motion.h2>
      </div>

      {cookieCategories.map((cat, ci) => (
        <motion.div
          key={cat.category}
          data-testid={`category-${cat.category.toLowerCase().replace(/ /g, "-")}`}
          className="mb-20 md:mb-28"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: ci * 0.07 }}
        >
          {/* Category header */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <h3
              className="text-sm font-semibold tracking-[0.22em] uppercase"
              style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}
            >
              {cat.category}
            </h3>
            <span
              className="text-xs uppercase tracking-[0.18em] px-3 py-1.5"
              style={{
                color: C.gold,
                border: `1px solid ${C.border}`,
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {cat.tag}
            </span>
            <div className="flex-1 h-px min-w-[20px]" style={{ background: C.border }} />
          </div>

          {/* Cards */}
          <div
            className={`grid gap-6 ${
              cat.cookies.length === 1
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {cat.cookies.map((cookie, i) => (
              <CookieCard key={cookie.id} cookie={cookie} index={i} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

// ── Footer ─────────────────────────────────────────────────────────────────────
const FooterSection = () => (
  <footer
    data-testid="footer"
    className="py-36 md:py-52 px-6 md:px-16 lg:px-32"
    style={{ background: "#060E08", borderTop: `1px solid ${C.border}` }}
  >
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-24">
        {/* Brand */}
        <div className="flex-1">
          <motion.div
            className="sundays-display text-[#FDFBF7] leading-none"
            style={{ fontSize: "clamp(5rem, 12vw, 10rem)", lineHeight: 0.88 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Sun
            <br />
            <span style={{ color: C.gold }}>days.</span>
          </motion.div>
          <motion.p
            className="mt-8 text-base font-light max-w-sm leading-relaxed"
            style={{ color: "rgba(253,251,247,0.35)", fontFamily: "Manrope, sans-serif" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.9 }}
          >
            Made with patience. Ordered on WhatsApp.
            <br />
            Delivered fresh. Always worth the wait.
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.9 }}
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-7"
            style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}
          >
            Place an order
          </p>
          <motion.a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              "Hi! I'd like to place an order from Sundays 🍪"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-order-btn"
            className="flex items-center gap-3 px-8 py-4 text-base font-bold text-[#0A140E] tracking-wide"
            style={{ background: C.gold, fontFamily: "Manrope, sans-serif" }}
            whileHover={{ background: C.goldHover }}
            whileTap={{ scale: 0.96 }}
          >
            <MessageCircle size={18} />
            WhatsApp Us
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div
        className="mt-24 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        style={{
          borderTop: `1px solid ${C.border}`,
          color: "rgba(253,251,247,0.22)",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        <span>© 2025 Sundays. All rights reserved.</span>
        <span>The 24-Hour Cookie.</span>
      </div>
    </div>
  </footer>
);

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: C.bg }}>
      <Navbar />
      <HeroSection />
      <IntroSection />
      <ProcessSection />
      <ShopSection />
      <FooterSection />
    </div>
  );
}
