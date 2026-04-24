import React from 'react';
import { getAdminAnalytics } from '@/lib/admin-data';
import { cn } from '@/lib/utils';

export default async function AdminOverviewPage() {
  const analytics = await getAdminAnalytics();
  const { activeDropMetrics, actionItems, recentOrders } = analytics;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto pb-24 font-sans text-[#163126]">
      {/* Action Center (Connected to Order Registry) */}
      {(actionItems.unpaidCount > 0 || actionItems.readyForFulfillment > 0 || actionItems.inProduction > 0) && (
        <div className="bg-[#163126] text-[#F6F0E7] p-1 rounded-2xl border border-[#C7A44C]/30 shadow-2xl overflow-hidden">
          <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-gradient-to-r from-transparent via-[#C7A44C]/5 to-transparent">
            <div className="flex items-center gap-3 pr-6 border-r border-[#F6F0E7]/10">
              <div className="w-2 h-2 rounded-full bg-[#C7A44C] animate-ping" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C7A44C]">Action Center</span>
            </div>
            
            <ActionBadge 
              label="Unpaid Orders" 
              count={actionItems.unpaidCount} 
              href={`/admin/orders?dropId=${activeDropMetrics.id}&filter=unpaid`}
            />
            <ActionBadge 
              label="Ready for Fulfillment" 
              count={actionItems.readyForFulfillment} 
              href={`/admin/orders?dropId=${activeDropMetrics.id}&filter=ready-fulfillment`}
            />
            <ActionBadge 
              label="In Production" 
              count={actionItems.inProduction} 
              href={`/admin/orders?dropId=${activeDropMetrics.id}&filter=in-production`}
            />
          </div>
        </div>
      )}

      {/* Operations Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#E2D9C8]">
        <div>
          <h2 className="font-serif text-4xl text-[#163126] tracking-tight">Operations Overview</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#7A8970] mt-2 italic">
            Drop {activeDropMetrics.dropNumber} &middot; {activeDropMetrics.status.toUpperCase()} &middot; Real-time Operations
          </p>
        </div>
      </div>

      {/* Active Drop Truth */}
      <div className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#7A8970]">Active Drop Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FounderMetric 
            label="Revenue" 
            value={`₹${activeDropMetrics.revenue.toLocaleString()}`} 
            sub="Current drop revenue"
          />
          <FounderMetric 
            label="Slots Filled" 
            value={activeDropMetrics.orders.toString()} 
            sub={`${activeDropMetrics.orders} of ${activeDropMetrics.slotLimit} reserved`}
          />
          <FounderMetric 
            label="Items Sold" 
            value={`${activeDropMetrics.cookieCount} Cookies / ${activeDropMetrics.packCount} Packs`} 
            sub="Drop selection breakdown"
          />
          <FounderMetric 
            label="Payments Verified" 
            value={`${Math.round(activeDropMetrics.paymentCompletion)}%`} 
            sub="Verified transactions"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Capacity & Top Performer */}
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] border border-[#E2D9C8] shadow-sm">
            <h4 className="text-[10px] uppercase font-black text-[#7A8970] mb-8 tracking-[0.2em]">Drop Capacity</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-5xl font-serif text-[#163126]">{activeDropMetrics.orders}</span>
                <span className="text-[10px] text-[#7A8970] font-black tracking-widest pb-1 uppercase">
                   of {activeDropMetrics.slotLimit} total
                </span>
              </div>
              <div className="h-2 w-full bg-[#F5F0E8] rounded-full overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="h-full bg-[#163126] transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${activeDropMetrics.fillRate}%` }}
                />
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#7A8970]">
                {activeDropMetrics.performanceNote}
              </p>
            </div>
          </div>

          <div className="bg-[#163126] p-8 rounded-[2rem] text-[#F6F0E7] shadow-xl border border-[#C7A44C]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7A44C]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            <h4 className="text-[10px] uppercase font-black text-[#C7A44C] mb-6 tracking-[0.2em]">Top Product This Drop</h4>
            {activeDropMetrics.bestSeller ? (
              <div className="space-y-3">
                 <p className="text-2xl font-serif italic text-[#C7A44C] tracking-tight">{activeDropMetrics.bestSeller.name}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#F6F0E7]/60">
                   {activeDropMetrics.bestSeller.quantity} realized sales
                 </p>
              </div>
            ) : (
              <p className="text-[10px] font-black text-[#F6F0E7]/40 uppercase tracking-widest leading-relaxed">
                Volume too low for performance ranking.
              </p>
            )}
          </div>
        </div>

        {/* Recent Operations */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-[#E2D9C8] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="px-10 py-7 border-b border-[#E2D9C8] flex justify-between items-center bg-[#FAF7F2]/30">
            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-[#7A8970]">Recent Operations</h4>
            <a href={`/admin/orders?dropId=${activeDropMetrics.id}`} className="text-[10px] uppercase font-black tracking-widest text-[#C7A44C] hover:underline decoration-2 underline-offset-4">
               Open Registry &rarr;
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.2em] text-[#7A8970]/50 border-b border-[#E2D9C8]/40 bg-[#F9F6F1]/50">
                  <th className="px-10 py-5 font-black">Ref #</th>
                  <th className="px-5 py-5 font-black">Customer</th>
                  <th className="px-10 py-5 text-right font-black whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9C8]/20">
                {recentOrders.map((order) => (
                  <tr key={order.orderNumber} className="group hover:bg-[#F9F6F1] transition-colors">
                    <td className="px-10 py-6 font-mono text-[10px] text-[#C7A44C] font-black">{order.orderNumber}</td>
                    <td className="px-5 py-6">
                       <span className="font-serif text-lg text-[#163126] block leading-tight">{order.customer.firstName}</span>
                       <span className="text-[9px] font-black uppercase text-[#7A8970] mt-1 block tracking-wider">{order.meta.fulfillmentStatus}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <span className={cn(
                         "text-[9px] uppercase font-black px-2.5 py-1 rounded inline-block border",
                         order.meta.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                       )}>
                         {order.meta.paymentStatus}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBadge({ label, count, href }: { label: string; count: number; href: string }) {
  if (count === 0) return null;
  return (
    <a href={href} className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all group border border-white/5 hover:border-[#C7A44C]/30 shadow-sm">
      <span className="text-[10px] font-black text-[#F6F0E7]/70 tracking-wider whitespace-nowrap">{label}:</span>
      <span className="text-xl font-black text-[#C7A44C] group-hover:scale-110 transition-transform leading-none">{count}</span>
    </a>
  );
}

function FounderMetric({ label, value, delta, sub }: { label: string; value: string; delta?: number | null; sub: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-[#E2D9C8] shadow-sm relative overflow-hidden group hover:border-[#C7A44C]/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] uppercase font-black text-[#7A8970] tracking-widest">{label}</p>
      </div>
      <p className="text-3xl font-serif text-[#163126] mb-2 tracking-tight group-hover:text-[#C7A44C] transition-colors whitespace-nowrap">{value}</p>
      <p className="text-[10px] font-bold text-[#7A8970]/60 uppercase tracking-widest leading-none">{sub}</p>
    </div>
  );
}
