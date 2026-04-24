import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-full px-8 py-4 font-sans text-sm tracking-widest uppercase transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed group";

    const variants = {
      primary: "bg-forest text-cream hover:bg-moss cursor-pointer",
      secondary: "bg-gold text-forest hover:bg-[#b09142] cursor-pointer",
      outline: "border border-forest/20 text-forest hover:border-forest/50 hover:bg-forest/5 cursor-pointer",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

