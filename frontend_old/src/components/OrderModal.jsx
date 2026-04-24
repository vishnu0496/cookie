import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, MapPin, FileText, ArrowRight, ArrowLeft, Copy, Check, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const C = {
  bg: "#0A140E",
  surface: "#1C3A2A",
  elevated: "#254836",
  gold: "#C9A84C",
  goldHover: "#DCC275",
  goldDim: "rgba(201,168,76,0.15)",
  text: "#FDFBF7",
  muted: "#A9B8AF",
  border: "rgba(201,168,76,0.18)",
};

export default function OrderModal({ open, onClose, cart, cartTotal, onSubmit, upiConfig }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const upiId = upiConfig?.upi_id || "";
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Sundays&am=${cartTotal}&cu=INR&tn=${encodeURIComponent("Sundays Cookie Order")}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}&bgcolor=0A140E&color=C9A84C`;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({ ...form, paymentRef });
    setSubmitting(false);
    setStep(1);
    setForm({ name: "", phone: "", address: "", notes: "" });
    setPaymentRef("");
    setErrors({});
  };

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 border"
        style={{ background: C.bg, borderColor: C.border }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle style={{ color: C.text, fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: "1.5rem" }}>
            {step === 1 ? "Place Your Order" : "Pay via UPI"}
          </DialogTitle>
          <DialogDescription className="text-sm font-light" style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>
            {step === 1 ? "Enter your delivery details" : `Pay \u20B9${cartTotal} to confirm your order`}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 pt-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full"
              style={{ background: step >= 1 ? C.gold : "transparent", color: step >= 1 ? C.bg : C.muted, border: `1px solid ${step >= 1 ? C.gold : C.border}`, fontFamily: "Manrope, sans-serif" }}>
              {step > 1 ? <Check size={14} /> : "1"}
            </div>
            <span className="text-xs uppercase tracking-wider" style={{ color: step >= 1 ? C.gold : C.muted, fontFamily: "Manrope, sans-serif" }}>Details</span>
          </div>
          <div className="flex-1 h-px" style={{ background: step >= 2 ? C.gold : C.border }} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full"
              style={{ background: step >= 2 ? C.gold : "transparent", color: step >= 2 ? C.bg : C.muted, border: `1px solid ${step >= 2 ? C.gold : C.border}`, fontFamily: "Manrope, sans-serif" }}>
              2
            </div>
            <span className="text-xs uppercase tracking-wider" style={{ color: step >= 2 ? C.gold : C.muted, fontFamily: "Manrope, sans-serif" }}>Payment</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" className="p-6 pt-4 space-y-5"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>
                  <User size={12} /> Name
                </label>
                <input type="text" data-testid="order-name" value={form.name}
                  onChange={(e) => update("name", e.target.value)} placeholder="Your name"
                  className="w-full px-4 py-3 text-sm outline-none transition-colors"
                  style={{ fontFamily: "Manrope, sans-serif", background: C.surface, color: C.text, border: `1px solid ${errors.name ? "#e55" : C.border}` }} />
                {errors.name && <p className="mt-1 text-xs" style={{ color: "#e55", fontFamily: "Manrope, sans-serif" }}>{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>
                  <Phone size={12} /> Phone Number
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 text-sm shrink-0"
                    style={{ fontFamily: "Manrope, sans-serif", background: C.elevated, color: C.muted, border: `1px solid ${errors.phone ? "#e55" : C.border}`, borderRight: "none" }}>
                    +91
                  </span>
                  <input type="tel" data-testid="order-phone" value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9177155540"
                    className="w-full px-4 py-3 text-sm outline-none"
                    style={{ fontFamily: "Manrope, sans-serif", background: C.surface, color: C.text, border: `1px solid ${errors.phone ? "#e55" : C.border}` }} />
                </div>
                {errors.phone && <p className="mt-1 text-xs" style={{ color: "#e55", fontFamily: "Manrope, sans-serif" }}>{errors.phone}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>
                  <MapPin size={12} /> Delivery Address
                </label>
                <textarea data-testid="order-address" value={form.address}
                  onChange={(e) => update("address", e.target.value)} placeholder="Full delivery address" rows={3}
                  className="w-full px-4 py-3 text-sm outline-none resize-none"
                  style={{ fontFamily: "Manrope, sans-serif", background: C.surface, color: C.text, border: `1px solid ${errors.address ? "#e55" : C.border}` }} />
                {errors.address && <p className="mt-1 text-xs" style={{ color: "#e55", fontFamily: "Manrope, sans-serif" }}>{errors.address}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>
                  <FileText size={12} /> Notes <span className="text-[10px] lowercase tracking-normal opacity-50">(optional)</span>
                </label>
                <input type="text" data-testid="order-notes" value={form.notes}
                  onChange={(e) => update("notes", e.target.value)} placeholder="Any special requests?"
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{ fontFamily: "Manrope, sans-serif", background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
              </div>

              {/* Order Summary */}
              <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-xs uppercase tracking-[0.15em] mb-3" style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>Order Summary</p>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.cookieId} className="flex items-center justify-between text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
                      <span style={{ color: "rgba(253,251,247,0.7)" }}>
                        {item.name}
                        {!item.isAssorted && !item.isMini && <span className="opacity-50"> x{item.quantity}</span>}
                        {item.isAssorted && <span className="opacity-50"> (Box of 6)</span>}
                        {item.isMini && <span className="opacity-50"> (Pack)</span>}
                      </span>
                      <span style={{ color: C.gold }}>{"\u20B9"}{item.subtotal}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 text-base font-bold" style={{ borderTop: `1px solid ${C.border}` }}>
                  <span style={{ color: C.text, fontFamily: "Manrope, sans-serif" }}>Total</span>
                  <span className="sundays-heading text-xl" style={{ color: C.gold }}>{"\u20B9"}{cartTotal}</span>
                </div>
              </div>

              {/* Next button */}
              <motion.button onClick={handleNext} data-testid="proceed-to-pay-btn"
                className="flex items-center justify-center gap-2.5 w-full py-4 text-sm font-bold tracking-[0.12em] uppercase text-[#0A140E]"
                style={{ background: C.gold, fontFamily: "Manrope, sans-serif" }}
                whileHover={{ background: C.goldHover }} whileTap={{ scale: 0.97 }}>
                Proceed to Pay <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" className="p-6 pt-4 space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>

              {/* Amount to pay */}
              <div className="text-center py-4">
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>Amount to pay</p>
                <div className="sundays-heading text-4xl" style={{ color: C.gold }}>{"\u20B9"}{cartTotal}</div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center py-4 px-6 mx-auto max-w-xs"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-xs uppercase tracking-[0.15em] mb-4" style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>Scan to pay</p>
                <div className="p-3 mb-4" style={{ background: "#FDFBF7" }}>
                  <img src={qrUrl} alt="UPI QR Code" width={180} height={180} data-testid="upi-qr-code"
                    style={{ imageRendering: "pixelated" }} />
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 px-3 py-2 text-sm truncate"
                    style={{ background: C.elevated, color: C.text, fontFamily: "Manrope, sans-serif", border: `1px solid ${C.border}` }}>
                    {upiId}
                  </div>
                  <button onClick={copyUpi} data-testid="copy-upi-btn"
                    className="px-3 py-2 flex items-center gap-1.5 text-xs font-semibold shrink-0 transition-colors"
                    style={{ background: copied ? C.gold : C.elevated, color: copied ? C.bg : C.gold, border: `1px solid ${C.border}`, fontFamily: "Manrope, sans-serif" }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* UPI App button (mobile deep link) */}
              <a href={upiLink} data-testid="upi-pay-link"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 text-sm font-bold tracking-[0.12em] uppercase transition-colors"
                style={{ background: C.elevated, color: C.gold, fontFamily: "Manrope, sans-serif", border: `1px solid ${C.border}` }}>
                <Smartphone size={16} /> Open UPI App to Pay
              </a>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: C.border }} />
                <span className="text-xs uppercase tracking-wider" style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>After payment</span>
                <div className="flex-1 h-px" style={{ background: C.border }} />
              </div>

              {/* Transaction reference */}
              <div>
                <label className="text-xs uppercase tracking-[0.15em] mb-2 block"
                  style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}>
                  UPI Transaction ID <span className="text-[10px] lowercase tracking-normal opacity-50">(optional)</span>
                </label>
                <input type="text" data-testid="payment-ref" value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g. 421906xxxxxx"
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{ fontFamily: "Manrope, sans-serif", background: C.surface, color: C.text, border: `1px solid ${C.border}` }} />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} data-testid="back-to-details"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold shrink-0"
                  style={{ color: C.muted, fontFamily: "Manrope, sans-serif", border: `1px solid ${C.border}` }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <motion.button onClick={handleSubmit} disabled={submitting} data-testid="confirm-order-btn"
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 text-sm font-bold tracking-[0.12em] uppercase text-[#0A140E] disabled:opacity-50"
                  style={{ background: C.gold, fontFamily: "Manrope, sans-serif" }}
                  whileHover={!submitting ? { background: C.goldHover } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}>
                  {submitting ? "Placing Order..." : "I've Paid — Confirm Order"}
                </motion.button>
              </div>

              <p className="text-center text-[11px]" style={{ color: "rgba(253,251,247,0.3)", fontFamily: "Manrope, sans-serif" }}>
                We'll verify payment and confirm via WhatsApp
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
