'use client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.refresh(); // Middleware will handle redirect
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-[#E7D7B8]/40 hover:text-red-400 transition-colors"
    >
      Sign Out
    </button>
  );
}
