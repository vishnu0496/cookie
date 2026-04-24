import React from 'react';
import { getMergedOrders, getDrops } from '@/lib/admin-data';

export default async function AdminAnalyticsPage() {
  const orders = await getMergedOrders();
  const drops = await getDrops();

  // 1. Revenue by Drop
  const dropData = drops.map(d => {
    const dOrders = orders.filter(o => o.orderNumber.startsWith(d.id));
    const revenue = dOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: d.id,
      label: `Drop ${d.dropNumber}`,
      revenue,
      orders: dOrders.length,
      fillRate: (dOrders.length / d.slotLimit) * 100
    };
  }).sort((a,b) => a.label.localeCompare(b.label));

  const maxRevenue = Math.max(...dropData.map(d => d.revenue), 1, 1000);
  const axisSteps = [4, 3, 2, 1, 0].map(s => Math.round((maxRevenue / 4) * s));

  // 2. Revenue per Product
  const productStats: Record<string, { revenue: number, units: number, share: number, isPack: boolean }> = {};
  let totalRevenue = 0;

  orders.forEach(o => {
    o.items.forEach(i => {
      if (!productStats[i.name]) {
        productStats[i.name] = { 
          revenue: 0, 
          units: 0, 
          share: 0, 
          isPack: i.name === 'Little Rebels' 
        };
      }
      const rev = i.price * i.quantity;
      productStats[i.name].revenue += rev;
      productStats[i.name].units += i.quantity;
      totalRevenue += rev;
    });
  });

  const productData = Object.entries(productStats).map(([name, stats]) => ({
    name,
    ...stats,
    share: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
  })).sort((a,b) => b.revenue - a.revenue);

  // 3. Orders by Area
  const areas: Record<string, number> = {};
  orders.forEach(o => {
    if (o.customer.addressLocality) {
      areas[o.customer.addressLocality] = (areas[o.customer.addressLocality] || 0) + 1;
    }
  });

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto pb-24 font-sans text-[#163126]">
      <div className="flex justify-between items-end border-b border-[#E2D9C8] pb-4 bg-white/50 sticky top-0 z-20 backdrop-blur-md">
        <div>
          <h2 className="font-serif text-4xl tracking-tight text-[#163126]">Revenue Analytics</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#7A8970] mt-3 italic">
            Factual revenue breakdown and performance history.
          </p>
        </div>
        <div className="bg-[#163126] text-[#F6F0E7] px-8 py-5 rounded-[1.5rem] flex items-center gap-10 shadow-2xl border border-[#C7A44C]/30">
           <SummarMetric label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
           <SummarMetric label="Total Orders" value={orders.length.toString()} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue by Drop */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-[#E2D9C8] shadow-sm relative group overflow-hidden">
          <div className="flex justify-between items-center mb-16">
            <div className="flex flex-col gap-1">
               <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#7A8970]">Revenue by Drop</h3>
            </div>
          </div>
          
          <div className="relative h-80 flex">
            {/* Axis Label */}
            <div className="absolute -left-12 top-1/2 -rotate-90 origin-center text-[9px] font-black text-[#7A8970] uppercase tracking-widest opacity-40">
               Revenue (₹)
            </div>

            {/* Precision Grid */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 ml-4">
              {axisSteps.map((val, i) => (
                <div key={i} className="flex items-center gap-4 w-full">
                  <span className="text-[9px] font-mono font-black text-[#7A8970]/30 w-12 text-right">
                    {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                  </span>
                  <div className="flex-grow h-px bg-[#F5F0E8]" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="relative flex-grow ml-20 flex items-end justify-around gap-2 h-full pt-4">
              {dropData.map(d => (
                <a 
                  key={d.label} 
                  href={`/admin/orders?dropId=${d.id}&filter=all`}
                  className="flex flex-col items-center flex-1 max-w-[70px] group/bar h-full justify-end relative no-underline outline-none"
                >
                   <div 
                    className="w-full bg-[#163126] rounded-t-xl transition-all duration-500 ease-out relative z-10 group-hover/bar:bg-[#C7A44C] group-hover/bar:scale-x-110 shadow-lg" 
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-[#0D1A10] text-[#C7A44C] text-[10px] px-3 py-2 rounded-xl border border-[#C7A44C]/30 shadow-2xl z-20 whitespace-nowrap pointer-events-none scale-90 group-hover/bar:scale-100 uppercase font-black tracking-widest">
                      ₹{d.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-black text-[#163126] uppercase tracking-[0.1em]">{d.label}</span>
                    <span className="text-[8px] font-black text-[#7A8970]/50 uppercase tracking-tighter">{Math.round(d.fillRate)}% Filled</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-[#E2D9C8] shadow-sm flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#7A8970] mb-12">Product Performance</h3>
          <div className="space-y-10 flex-grow">
            {productData.map(p => (
              <div key={p.name} className="group cursor-default">
                <div className="flex justify-between items-end mb-4">
                   <div className="flex flex-col">
                      <span className="font-serif text-2xl tracking-tight text-[#163126] leading-none group-hover:text-[#C7A44C] transition-colors">{p.name}</span>
                      <span className="text-[9px] font-black uppercase text-[#7A8970]/60 tracking-[0.25em] mt-2 italic">
                        {p.revenue.toLocaleString()} (₹) &middot; {p.share.toFixed(1)}% Share
                      </span>
                   </div>
                   <div className="text-right">
                      <span className="text-xl font-black text-[#163126]">{p.units}</span>
                      <p className="text-[9px] font-black text-[#C7A44C] uppercase tracking-widest mt-1">{p.isPack ? 'Packs' : 'Units'}</p>
                   </div>
                </div>
                <div className="h-1.5 w-full bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E2D9C8]/10 p-0.5">
                  <div 
                    className="h-full bg-[#163126] transition-all duration-1000 group-hover:bg-[#C7A44C] rounded-full" 
                    style={{ width: `${p.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Area */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-[#E2D9C8] lg:col-span-2 shadow-sm">
           <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#7A8970] mb-12">Orders by Area</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
              {Object.entries(areas).sort((a,b) => b[1] - a[1]).slice(0, 12).map(([area, count]) => (
                <div key={area} className="space-y-2 group hover:translate-x-1 transition-transform">
                   <p className="text-[9px] font-black text-[#163126] uppercase tracking-[0.1em] truncate opacity-70 group-hover:opacity-100">{area}</p>
                   <p className="text-4xl font-serif text-[#C7A44C] leading-none">{count}</p>
                   <p className="text-[8px] font-black text-[#7A8970]/40 uppercase tracking-widest">Total Orders</p>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}

function SummarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[#F6F0E7]/10 pr-10 last:border-0 last:pr-0">
       <p className="text-[9px] uppercase font-black text-[#C7A44C]/60 tracking-[0.3em] mb-1.5">{label}</p>
       <p className="text-3xl font-serif tracking-tight leading-none">{value}</p>
    </div>
  );
}
