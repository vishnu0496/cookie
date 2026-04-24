"use client";

export function ReviewModeBanner() {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE !== "true") return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#0A1410]/90 backdrop-blur-md border border-[#C7A44C]/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C7A44C] animate-pulse flex-shrink-0" />
        <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#C7A44C]/80 font-bold whitespace-nowrap">
          Preview Mode · No real orders are processed
        </span>
      </div>
    </div>
  );
}
