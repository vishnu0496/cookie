import React from 'react';
import { getAdminAnalytics, getMergedOrders } from '@/lib/admin-data';

export default async function AdminDropsPage() {
  const analytics = await getAdminAnalytics();
  const orders = await getMergedOrders();
  const { drops } = analytics;

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto pb-24 font-sans text-[#163126]">
      <div className="flex justify-between items-end border-b border-[#E2D9C8] pb-4">
        <div>
          <h2 className="font-serif text-4xl tracking-tight">Drop Registry</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#7A8970] mt-3 italic">
            Historical Records &middot; Performance Audit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {drops.map((drop) => {
          const dropOrders = orders.filter(o => o.orderNumber.startsWith(drop.id));
          const repeatRate = (dropOrders.filter(o => o.isRepeat).length / Math.max(1, dropOrders.length)) * 100;
          const fillRate = (drop.stats.orders / drop.slotLimit) * 100;
          const paymentCount = dropOrders.filter(o => o.meta.paymentStatus === 'Paid').length;
          const deliveryCount = dropOrders.filter(o => o.meta.fulfillmentStatus === 'Delivered').length;

          // Drill-down for top cookie per drop
          const productPerf: Record<string, number> = {};
          dropOrders.forEach(o => o.items.forEach(i => {
            productPerf[i.name] = (productPerf[i.name] || 0) + i.quantity;
          }));
          const topProduct = Object.entries(productPerf).sort((a,b) => b[1] - a[1])[0];

          return (
            <div key={drop.id} className="bg-white rounded-[2.5rem] border border-[#E2D9C8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 group hover:border-[#C7A44C]/30">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#E2D9C8]/40">
                {/* ID & Identity */}
                <div className="p-8 md:w-1/4 bg-[#FAF7F2]/50">
                   <div className="flex items-center gap-3 mb-4">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm",
                        drop.status === 'live' 
                          ? 'bg-[#163126] text-[#C7A44C] border-[#C7A44C]/30 animate-pulse' 
                          : 'bg-white text-[#7A8970]/50 border-[#E2D9C8]'
                      )}>
                        {drop.status}
                      </span>
                   </div>
                   <h3 className="text-3xl font-serif text-[#163126] mb-1">Drop {drop.dropNumber}</h3>
                   <p className="text-sm font-medium text-[#7A8970]/60 italic tracking-tight">{drop.title}</p>
                   
                   <div className="mt-8 space-y-4 pt-6 border-t border-[#E2D9C8]/60">
                      <p className="text-[10px] font-black text-[#163126] uppercase tracking-widest leading-none">
                        {drop.stats.orders} of {drop.slotLimit} slots filled
                      </p>
                      
                      <a 
                        href={`/admin/orders?dropId=${drop.id}&filter=all`} 
                        className="text-[10px] font-black uppercase text-[#C7A44C] tracking-[0.1em] hover:translate-x-1 transition-transform inline-flex items-center gap-2 group/link"
                      >
                        Open Registry <span className="group-hover/link:translate-x-1 transition-transform">&rarr;</span>
                      </a>
                   </div>
                </div>

                {/* Performance & Operational Matrix */}
                <div className="p-10 flex-grow bg-white flex flex-col gap-12">
                   {/* Top Row: Headline Business Metrics */}
                   <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.8fr_1.2fr] gap-x-10 gap-y-12">
                      <BatchMetric label="Total Revenue" value={`₹${Math.round(drop.stats.revenue).toLocaleString()}`} />
                      <BatchMetric 
                        label="Items Sold" 
                        value={<span>{drop.stats.cookieCount} Cookies / {drop.stats.packCount} Packs</span>} 
                      />
                      <BatchMetric label="Average Order" value={`₹${Math.round(drop.stats.acv).toLocaleString()}`} />
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-black text-[#7A8970] uppercase tracking-widest leading-none">Best Seller</span>
                         <span className="text-lg font-serif italic text-[#163126] leading-tight tracking-tight">
                           {topProduct ? topProduct[0] : '—'}
                         </span>
                      </div>
                   </div>

                   {/* Bottom Row: Operational Progress */}
                   <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.8fr_1.2fr] gap-x-10 gap-y-8 pt-10 border-t border-[#E2D9C8]/40">
                      <DropCompletion label="Slots Filled" val={fillRate} />
                      <DropCompletion label="Customer Loyalty" val={repeatRate} color="#C7A44C" />
                      <DropCompletion label="Payments Verified" val={(paymentCount / Math.max(1, dropOrders.length)) * 100} />
                      <DropCompletion label="Delivery Completion" val={(deliveryCount / Math.max(1, dropOrders.length)) * 100} color="#7A8970" />
                   </div>
                </div>

                {/* Drop Summary */}
                <div className="p-10 md:w-1/4 bg-[#FAF7F2]/30 flex flex-col justify-between">
                   <div className="space-y-6 flex-grow flex flex-col justify-center">
                      <div className="bg-white/60 p-6 rounded-2xl border border-[#E2D9C8]/40 shadow-sm">
                         <h5 className="text-[9px] font-black text-[#7A8970]/50 uppercase tracking-widest mb-3 leading-none italic">Order Notes</h5>
                         <p className="text-xs text-[#163126] font-medium leading-relaxed italic">
                            {fillRate < 100 && (drop.notes?.toLowerCase().includes('sold out') || drop.notes?.toLowerCase().includes('ahead of target'))
                              ? `${drop.stats.orders} of ${drop.slotLimit} slots filled (${Math.round(fillRate)}% capacity). Drop closed before full capacity.`
                              : (drop.notes || "Operational summary awaiting final review.")
                            }
                         </p>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-[#E2D9C8]/40">
                      <span className="text-[8px] font-black text-[#7A8970]/40 uppercase tracking-[0.4em] block">ID: {drop.id}</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

function BatchMetric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 group/metric">
       <span className="text-[9px] font-black text-[#7A8970] uppercase tracking-widest leading-none opacity-80">{label}</span>
       <span className="text-[10px] sm:text-2xl lg:text-3xl font-serif text-[#163126] tracking-tight group-hover/metric:text-[#C7A44C] transition-colors">{value}</span>
       {sub && <span className="text-[8px] font-black text-[#7A8970]/40 uppercase tracking-tight">{sub}</span>}
    </div>
  );
}

function DropCompletion({ label, val, color = "#163126" }: { label: string; val: number; color?: string }) {
  return (
    <div className="space-y-2.5">
       <div className="flex justify-between items-end">
          <span className="text-[9px] font-black uppercase text-[#7A8970] tracking-[0.1em] opacity-80">{label}</span>
          <span className="text-[10px] font-black text-[#163126] font-mono">{Math.round(val)}%</span>
       </div>
       <div className="h-1.5 w-full bg-[#E2D9C8]/30 rounded-full overflow-hidden p-0.5">
         <div className="h-full transition-all duration-1000 rounded-full" style={{ width: `${val}%`, backgroundColor: color }} />
       </div>
    </div>
  );
}
