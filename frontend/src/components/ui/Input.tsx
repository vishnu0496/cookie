import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, labelClassName, label, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className={cn("text-sm tracking-widest uppercase font-sans text-forest/80", labelClassName)}>
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full bg-transparent border-b border-forest/20 py-3 text-forest placeholder:text-forest/40 focus:outline-none focus:border-forest transition-colors rounded-none outline-none font-serif text-lg",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
