'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/overview');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl tracking-widest text-[#163126] mb-3">SUNDAYS</h1>
          <p className="text-xs uppercase tracking-[0.4em] text-[#C7A44C] font-bold">Internal Operations</p>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-[2rem] border border-[#E2D9C8] shadow-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7A8970] mb-8 text-center italic">
            Private Access &middot; Authorized Personnel Only
          </p>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-[10px] uppercase tracking-widest font-bold text-[#163126]/60 pl-1"
              >
                Access Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F0E8]/50 border-b-2 border-[#E2D9C8] font-sans text-sm p-4 text-[#163126] focus:border-[#C7A44C] transition-all duration-300 outline-none rounded-t-xl"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold tracking-wide animate-pulse text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D1A10] text-[#F6F0E7] py-5 rounded-full font-sans text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#163126] transition-all duration-500 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10">{loading ? 'Verifying...' : 'Authenticate'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] uppercase tracking-[0.3em] text-[#163126]/40 font-bold">
             &copy; 2026 Sundays Hyderabad
           </p>
        </div>
      </div>
    </div>
  );
}
