import React from 'react';
import { getMergedOrders } from '@/lib/admin-data';

export default async function AdminCustomersPage() {
  const orders = await getMergedOrders();

  const customerMap: Record<string, {
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpend: number;
    firstOrder: string;
    lastOrder: string;
    locality: string;
    items: Record<string, number>;
  }> = {};

  orders.forEach(o => {
    const email = o.customer.email.toLowerCase();
    if (!customerMap[email]) {
      customerMap[email] = {
        name: o.customer.firstName,
        email: o.customer.email,
        phone: o.customer.whatsapp,
        totalOrders: 0,
        totalSpend: 0,
        firstOrder: o.timestamp,
        lastOrder: o.timestamp,
        locality: o.customer.addressLocality,
        items: {}
      };
    }

    const c = customerMap[email];
    c.totalOrders += 1;
    c.totalSpend += o.total;
    if (new Date(o.timestamp) < new Date(c.firstOrder)) c.firstOrder = o.timestamp;
    if (new Date(o.timestamp) > new Date(c.lastOrder)) c.lastOrder = o.timestamp;
    
    o.items.forEach(item => {
      c.items[item.name] = (c.items[item.name] || 0) + item.quantity;
    });
  });

  const customers = Object.values(customerMap).sort((a, b) => b.totalSpend - a.totalSpend);
  const avgLtv = customers.reduce((sum, c) => sum + c.totalSpend, 0) / Math.max(1, customers.length);

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto pb-24 font-sans text-[#163126]">
      <div className="flex justify-between items-end border-b border-[#E2D9C8] pb-4">
        <div>
          <h2 className="font-serif text-4xl tracking-tight text-[#163126]">Customer Insights</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#7A8970] mt-3">
             Analysis of {customers.length} unique customers
          </p>
        </div>
        <div className="flex gap-4">
           <CustomerMetric label="Avg. Customer LTV" value={`₹${Math.round(avgLtv).toLocaleString()}`} />
           <CustomerMetric label="Retention Rate" value={`${Math.round((customers.filter(c => c.totalOrders > 1).length / customers.length) * 100)}%`} />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#E2D9C8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F1] border-b border-[#E2D9C8] text-[10px] uppercase tracking-[0.3em] text-[#7A8970] font-black">
                <th className="px-10 py-6 text-[9px]">Customer</th>
                <th className="px-5 py-6 whitespace-nowrap text-[9px]">Type</th>
                <th className="px-5 py-6 text-[9px]">Orders</th>
                <th className="px-5 py-6 text-[9px]">Value</th>
                <th className="px-10 py-6 text-right text-[9px]">Primary Product</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C8]/30">
              {customers.map(c => {
                const favorite = Object.entries(c.items).sort((a,b) => b[1] - a[1])[0]?.[0] || '—';
                const isVIP = c.totalSpend > avgLtv * 1.5;
                const isReturning = c.totalOrders > 1;

                return (
                  <tr key={c.email} className="group hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="font-serif text-2xl text-[#163126] tracking-tight group-hover:text-[#C7A44C] transition-colors">{c.name}</span>
                        <span className="text-[10px] font-black uppercase text-[#7A8970] tracking-widest">{c.locality} &middot; {c.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-8">
                      <div className="flex flex-wrap gap-2">
                        {isReturning ? (
                          <span className="bg-[#163126] text-[#C7A44C] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">Returning</span>
                        ) : (
                          <span className="bg-[#F5F0E8] text-[#163126] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-[#E2D9C8]">New</span>
                        )}
                        {isVIP && (
                          <span className="bg-[#C7A44C]/10 text-[#C7A44C] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-[#C7A44C]/30">VIP</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#163126]">{c.totalOrders}</span>
                          <span className="text-[9px] font-black uppercase text-[#7A8970] tracking-widest pt-1">Total</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#7A8970]/60 uppercase tracking-widest">
                          Last: {new Date(c.lastOrder).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-8">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-[#163126]">₹{c.totalSpend.toLocaleString()}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                           <div className="w-16 h-1 bg-[#F5F0E8] rounded-full overflow-hidden">
                              <div className="h-full bg-[#163126]" style={{ width: `${Math.min(100, (c.totalSpend / avgLtv) * 50)}%` }} />
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="inline-block bg-[#FAF7F2] px-4 py-2 rounded-xl border border-[#E2D9C8]/40">
                         <p className="text-xs text-[#163126] font-serif italic truncate max-w-[140px]">{favorite}</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-6 py-4 rounded-2xl border border-[#E2D9C8] shadow-sm text-right min-w-[160px]">
       <p className="text-[9px] uppercase font-black text-[#7A8970] tracking-[0.2em] mb-1">{label}</p>
       <p className="text-xl font-bold text-[#163126] tracking-tight">{value}</p>
    </div>
  );
}
