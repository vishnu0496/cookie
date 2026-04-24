import React from 'react';
import Link from 'next/link';
import { NavLink } from './NavLink';
import { LogoutButton } from './LogoutButton';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname === '/admin/login';
  
  console.log('AdminLayout DEBUG:', { pathname, isLoginPage });

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#163126]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F0E8] font-sans text-[#163126]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1A10] text-[#E7D7B8] flex flex-col fixed inset-y-0 shadow-2xl z-50">
        <div className="p-8 border-b border-[#E7D7B8]/10">
          <Link href="/admin/overview" className="block">
            <h1 className="font-serif text-2xl tracking-widest text-[#F6F0E7]">SUNDAYS</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C7A44C] mt-1 font-bold">Admin Ops</p>
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          <NavLink href="/admin/overview">Overview</NavLink>
          <NavLink href="/admin/orders">Orders</NavLink>
          <NavLink href="/admin/customers">Customers</NavLink>
          <NavLink href="/admin/drops">Drops</NavLink>
          <NavLink href="/admin/analytics">Analytics</NavLink>
        </nav>

        <div className="p-6 border-t border-[#E7D7B8]/10">
          <LogoutButton />
          <div className="mt-6 flex items-center gap-3 px-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-[#C7A44C] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
