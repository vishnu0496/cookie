import { motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";

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

const QTY_OPTIONS = [1, 2, 4, 6];

export default function CartPanel({ open, onClose, cart, onRemove, onUpdateQty, cartTotal, onCheckout }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 border-l flex flex-col"
        style={{ background: C.bg, borderColor: C.border }}
      >
        <SheetHeader className="p-6 pb-0">
          <SheetTitle
            className="flex items-center justify-between"
            style={{ color: C.text, fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag size={18} style={{ color: C.gold }} />
              Your Cart
            </span>
            <button
              onClick={onClose}
              data-testid="cart-close-btn"
              className="p-1 transition-opacity hover:opacity-70"
              style={{ color: C.muted }}
            >
              <X size={18} />
            </button>
          </SheetTitle>
          <SheetDescription className="sr-only">Your shopping cart</SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <ShoppingBag size={40} style={{ color: "rgba(201,168,76,0.2)" }} />
              <p
                className="mt-4 text-sm font-light"
                style={{ color: "rgba(253,251,247,0.35)", fontFamily: "Manrope, sans-serif" }}
              >
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cookieId}
                  data-testid={`cart-item-${item.cookieId}`}
                  className="p-4"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-[#FDFBF7] truncate"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}
                      >
                        {item.isAssorted ? item.flavor : item.flavor}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.cookieId)}
                      data-testid={`cart-remove-${item.cookieId}`}
                      className="p-1 transition-opacity hover:opacity-70 shrink-0"
                      style={{ color: C.muted }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    {!item.isAssorted && !item.isMini ? (
                      <div className="flex items-center gap-1.5">
                        {QTY_OPTIONS.map((q) => (
                          <button
                            key={q}
                            onClick={() => onUpdateQty(item.cookieId, q)}
                            className="w-8 h-8 flex items-center justify-center text-xs font-semibold transition-all"
                            style={{
                              fontFamily: "Manrope, sans-serif",
                              background: item.quantity === q ? C.gold : "transparent",
                              color: item.quantity === q ? C.bg : C.muted,
                              border: `1px solid ${item.quantity === q ? C.gold : C.border}`,
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}
                      >
                        {item.isAssorted ? "Box of 6" : "1 pack"}
                      </span>
                    )}

                    <span
                      className="text-sm font-bold"
                      style={{ color: C.gold, fontFamily: "Manrope, sans-serif" }}
                    >
                      {"\u20B9"}{item.subtotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <span
                className="text-sm uppercase tracking-[0.15em]"
                style={{ color: C.muted, fontFamily: "Manrope, sans-serif" }}
              >
                Total
              </span>
              <span
                className="sundays-heading text-2xl"
                style={{ color: C.gold }}
              >
                {"\u20B9"}{cartTotal}
              </span>
            </div>

            <motion.button
              onClick={onCheckout}
              data-testid="checkout-btn"
              className="flex items-center justify-center gap-2.5 w-full py-4 text-sm font-bold tracking-[0.12em] uppercase text-[#0A140E]"
              style={{ background: C.gold, fontFamily: "Manrope, sans-serif" }}
              whileHover={{ background: C.goldHover }}
              whileTap={{ scale: 0.97 }}
            >
              Place Order
            </motion.button>

            <p
              className="mt-3 text-center text-[11px]"
              style={{ color: "rgba(253,251,247,0.3)", fontFamily: "Manrope, sans-serif" }}
            >
              Confirmation via WhatsApp. Delivery only.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
