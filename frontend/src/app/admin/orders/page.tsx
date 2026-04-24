import React from 'react';
import { getMergedOrders, getDrops } from '@/lib/admin-data';
import { OrdersTable } from './OrdersTable';

export default async function AdminOrdersPage() {
  const orders = await getMergedOrders();
  const drops = await getDrops();

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl text-[#163126] tracking-tight">Order Registry</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#7A8970] mt-3">
             {orders.length} Total Orders &middot; Operational Database
          </p>
        </div>
      </div>

      <OrdersTable initialOrders={orders} drops={drops} />
    </div>
  );
}
