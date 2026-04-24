'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MergedOrder, PaymentStatus, FulfillmentStatus, DropEntry } from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

export function OrdersTable({ initialOrders, drops }: { initialOrders: MergedOrder[], drops: DropEntry[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [selectedDropId, setSelectedDropId] = useState<string>(searchParams.get('dropId') || 'all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sync state with URL params
  useEffect(() => {
    setActiveFilter(searchParams.get('filter') || 'all');
    setSelectedDropId(searchParams.get('dropId') || 'all');
  }, [searchParams]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === 'all') params.delete(key);
      else params.set(key, val);
    });
    router.replace(`/admin/orders?${params.toString()}`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Drop Filter
      const matchDrop = selectedDropId === 'all' || o.orderNumber.startsWith(selectedDropId);
      if (!matchDrop) return false;

      // 2. Search Filter
      const matchSearch = 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.addressLocality.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      
      // 3. Status Filters
      if (activeFilter === 'unpaid') {
        return ['Unpaid', 'Pending Review'].includes(o.meta.paymentStatus);
      } else if (activeFilter === 'ready-fulfillment') {
        return o.meta.paymentStatus === 'Paid' && o.meta.fulfillmentStatus === 'Reserved';
      } else if (activeFilter === 'in-production') {
        return ['Queued', 'Baking', 'Packed'].includes(o.meta.fulfillmentStatus);
      } else if (activeFilter === 'delivered') {
        return o.meta.fulfillmentStatus === 'Delivered';
      }
      
      return true;
    });
  }, [orders, search, activeFilter, selectedDropId]);

  const updateStatus = async (orderNumber: string, type: 'payment' | 'fulfillment', value: string) => {
    setUpdatingId(orderNumber);
    try {
      const field = type === 'payment' ? 'paymentStatus' : 'fulfillmentStatus';
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => 
          o.orderNumber === orderNumber 
            ? { ...o, meta: { ...o.meta, [field]: value } } 
            : o
        ));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const paymentColors: Record<PaymentStatus, string> = {
    'Unpaid': 'text-red-500 bg-red-50 border-red-100',
    'Pending Review': 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse',
    'Paid': 'text-emerald-700 bg-emerald-50 border-emerald-100',
    'Failed': 'text-red-700 bg-red-100 border-red-200',
    'Refunded': 'text-slate-500 bg-slate-50 border-slate-100'
  };

  const fulfillmentColors: Record<FulfillmentStatus, string> = {
    'Reserved': 'text-slate-500 bg-slate-50 border-slate-100',
    'Queued': 'text-indigo-600 bg-indigo-50 border-indigo-100',
    'Baking': 'text-orange-600 bg-orange-50 border-orange-100 font-bold',
    'Packed': 'text-blue-600 bg-blue-50 border-blue-100',
    'Delivered': 'text-emerald-600 bg-emerald-50/50 border-emerald-100 opacity-60',
    'Cancelled': 'text-red-700 bg-red-50 border-red-200'
  };

  return (
    <div className="space-y-6">
      {/* Search & Batch Filters */}
      <div className="flex flex-wrap items-center gap-6 bg-white p-6 rounded-[1.5rem] border border-[#E2D9C8] shadow-sm">
        {/* Search */}
        <div className="flex-grow max-w-sm relative">
          <input
            type="text"
            placeholder="Search reference, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F0E8]/40 border border-[#E2D9C8] rounded-xl px-5 py-2.5 text-xs font-bold outline-none focus:border-[#C7A44C] transition-all pl-11"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-[#163126]">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>

        {/* Drop Selector */}
        <div className="flex items-center gap-3 border-l border-[#E2D9C8] pl-6 ml-2">
           <span className="text-[10px] uppercase font-black text-[#7A8970] tracking-widest hidden sm:block">Drop:</span>
           <select 
             value={selectedDropId}
             onChange={(e) => updateParams({ dropId: e.target.value })}
             className="bg-[#F5F0E8] border border-[#E2D9C8] rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#C7A44C] cursor-pointer"
           >
             <option value="all">All Drops</option>
             {drops.map(d => (
               <option key={d.id} value={d.id}>Drop {d.dropNumber}</option>
             ))}
           </select>
        </div>

        {/* Filter Buckets */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 flex-grow">
          <OpFilter label="All" id="all" active={activeFilter} onClick={(id) => updateParams({ filter: id })} />
          <OpFilter label="Unpaid Orders" id="unpaid" active={activeFilter} onClick={(id) => updateParams({ filter: id })} />
          <OpFilter label="Ready for Fulfillment" id="ready-fulfillment" active={activeFilter} onClick={(id) => updateParams({ filter: id })} />
          <OpFilter label="In Production" id="in-production" active={activeFilter} onClick={(id) => updateParams({ filter: id })} />
          <OpFilter label="Delivered" id="delivered" active={activeFilter} onClick={(id) => updateParams({ filter: id })} />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] border border-[#E2D9C8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F6F1] border-b border-[#E2D9C8] text-[9px] uppercase tracking-[0.25em] text-[#7A8970] font-black">
                <th className="px-8 py-5">Order / Client</th>
                <th className="px-5 py-5">Product Selection</th>
                <th className="px-5 py-5 text-right font-black whitespace-nowrap">Payment Status</th>
                <th className="px-5 py-5 text-right font-black whitespace-nowrap">Fulfillment Status</th>
                <th className="px-8 py-5 text-right font-black">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C8]/40 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-24 text-center">
                     <p className="text-[#7A8970] font-serif italic text-lg opacity-30 italic">No orders match the current filter.</p>
                   </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <React.Fragment key={order.orderNumber}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === order.orderNumber ? null : order.orderNumber)}
                      className={cn(
                        "group transition-all duration-150 cursor-pointer",
                        expandedId === order.orderNumber ? "bg-[#F9F6F1]" : "hover:bg-[#F9F6F1]/50",
                        updatingId === order.orderNumber && "opacity-40 pointer-events-none"
                      )}
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-[10px] text-[#C7A44C] font-black">{order.orderNumber}</span>
                          <span className="font-serif text-lg text-[#163126] leading-none">{order.customer.firstName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-6">
                        <div className="flex flex-col gap-1">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-xs font-bold text-[#163126] flex items-center">
                              <span className="text-[#C7A44C] mr-1.5 opacity-60 font-mono text-[10px]">{item.quantity}×</span>
                              {item.name}
                              {item.name === 'Little Rebels' && <span className="ml-2 text-[8px] font-black text-[#7A8970] uppercase tracking-tighter opacity-70">(Pack)</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.meta.paymentStatus}
                          onChange={(e) => updateStatus(order.orderNumber, 'payment', e.target.value)}
                          className={cn(
                            "text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border outline-none shadow-sm cursor-pointer min-w-[120px] transition-all",
                            paymentColors[order.meta.paymentStatus]
                          )}
                        >
                          {['Unpaid', 'Pending Review', 'Paid', 'Failed', 'Refunded'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.meta.fulfillmentStatus}
                          onChange={(e) => updateStatus(order.orderNumber, 'fulfillment', e.target.value)}
                          className={cn(
                            "text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border outline-none shadow-sm cursor-pointer min-w-[120px] transition-all",
                            fulfillmentColors[order.meta.fulfillmentStatus]
                          )}
                        >
                          {['Reserved', 'Queued', 'Baking', 'Packed', 'Delivered', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-[#163126] text-base">
                        ₹{order.total}
                      </td>
                    </tr>

                    {expandedId === order.orderNumber && (
                      <tr className="bg-[#FAF7F2]">
                        <td colSpan={5} className="px-8 py-10 border-t border-[#E2D9C8]/60 shadow-inner">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            {/* Primary Contact Info */}
                            <div className="space-y-6 col-span-1">
                               <h5 className="text-[10px] uppercase font-black text-[#C7A44C] tracking-widest">Customer Details</h5>
                               <DetailRow label="Phone" value={order.customer.whatsapp} highlight />
                               <DetailRow label="Email" value={order.customer.email} highlight />
                               <div className="pt-2">
                                  <p className="text-[9px] uppercase font-black text-[#7A8970] mb-2 tracking-widest">Shipping Address</p>
                                  <p className="text-sm font-bold text-[#163126] leading-relaxed">
                                    {order.customer.addressHouse}<br/>
                                    {order.customer.addressLocality}<br/>
                                    {order.customer.addressPincode}
                                  </p>
                               </div>
                            </div>
                            
                            {/* Status & Verification */}
                            <div className="space-y-6 col-span-1 border-l border-[#E2D9C8]/40 pl-8">
                               <h5 className="text-[10px] uppercase font-black text-[#C7A44C] tracking-widest">Payment Details</h5>
                               <DetailRow label="Current Status" value={order.meta.paymentStatus} />
                               <div className="pt-2">
                                  {order.meta.paymentProofUrl ? (
                                    <div className="space-y-3">
                                       <p className="text-[9px] uppercase font-black text-[#7A8970] tracking-widest">Payment Proof</p>
                                       <a 
                                         href={order.meta.paymentProofUrl} 
                                         target="_blank" 
                                         className="text-[10px] font-black uppercase text-[#C7A44C] bg-[#163126] px-4 py-2.5 rounded-xl inline-block hover:scale-105 transition-all shadow-lg text-center"
                                       >
                                         View Proof Asset &rarr;
                                       </a>
                                    </div>
                                  ) : (
                                    <div className="p-5 rounded-2xl border border-dashed border-[#E2D9C8] text-center bg-white/50">
                                       <p className="text-[9px] uppercase font-black text-[#7A8970]/40 tracking-widest leading-loose">No payment proof<br/>was attached</p>
                                    </div>
                                  )}
                               </div>
                            </div>

                            {/* Operational Notes */}
                            <div className="space-y-6 col-span-2 border-l border-[#E2D9C8]/40 pl-8">
                               <h5 className="text-[10px] uppercase font-black text-[#C7A44C] tracking-widest">Order Notes</h5>
                               <textarea
                                  placeholder="Log manual adjustments or specific production notes here..."
                                  value={order.meta.notes}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setOrders(prev => prev.map(o => o.orderNumber === order.orderNumber ? { ...o, meta: { ...o.meta, notes: val } } : o));
                                  }}
                                  onBlur={(e) => {
                                    fetch(`/api/admin/orders/${order.orderNumber}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ notes: e.target.value }),
                                    });
                                  }}
                                  className="w-full bg-white border border-[#E2D9C8] rounded-2xl p-6 text-sm font-medium outline-none focus:border-[#C7A44C] min-h-[160px] shadow-sm text-[#163126] leading-relaxed"
                               />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OpFilter({ label, id, active, onClick }: { label: string; id: string; active: string; onClick: (v: string) => void }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "px-4 py-2.5 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all whitespace-nowrap",
        isActive 
          ? "bg-[#163126] text-[#C7A44C] shadow-md scale-105" 
          : "bg-transparent text-[#7A8970] hover:bg-[#F5F0E8]"
      )}
    >
      {isActive && <span className="mr-2 inline-block w-1 h-1 rounded-full bg-[#C7A44C]" />}
      {label}
    </button>
  );
}

function DetailRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
       <span className="text-[9px] uppercase font-black text-[#7A8970]/50 tracking-widest leading-none">{label}</span>
       <span className={cn(
         "text-sm font-bold text-[#163126] truncate",
         highlight && "text-[#C7A44C]"
       )}>{value}</span>
    </div>
  );
}
