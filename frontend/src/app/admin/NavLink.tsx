'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-3 rounded-xl transition-all duration-300 font-sans text-xs uppercase tracking-widest font-bold",
        isActive 
          ? "bg-[#C7A44C] text-[#0D1A10] shadow-lg shadow-[#C7A44C]/10" 
          : "text-[#E7D7B8]/60 hover:text-[#F6F0E7] hover:bg-[#E7D7B8]/5"
      )}
    >
      {children}
    </Link>
  );
}
