"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("yb_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const role = user.role === "kepala_sekolah" ? "kepsek" : user.role;
        router.replace(`/${role}/dashboard`);
      } catch {}
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal login");
        return;
      }
      localStorage.setItem("yb_user", JSON.stringify(data.user));
      localStorage.setItem("yb_token", data.token); // <-- tambahkan baris ini
      const role = data.user.role === "kepala_sekolah" ? "kepsek" : data.user.role;
      router.replace(`/${role}/dashboard`);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[28px] border border-zinc-100 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-zinc-100 p-2 mb-4">
              <img src="/logo.svg" alt="logo" className="w-full h-full object-contain"/>
            </div>
            <h1 className="text-2xl font-bold brand-font text-[#FF2D00]">YAA BUNAYYA</h1>
            <p className="text-xs text-zinc-500 mt-1">Sistem Manajemen Aset & Pemeliharaan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email</label>
              <input
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="nama@yaabunayya.sch.id"
                required
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:bg-white focus:border-[#FF2D00] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:bg-white focus:border-[#FF2D00] transition"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-[#FF2D00] focus:ring-[#FF2D00]"/>
                <span className="text-xs text-zinc-600">Ingat saya</span>
              </label>
              <button type="button" className="text-xs text-[#FF2D00] font-semibold hover:underline">
                Lupa Kata Sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#FF2D00] text-white font-semibold hover:bg-[#E62600] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400">
            © 2026 Yayasan Tarbiyah Sunnah Yaa Bunayya Palembang
          </div>
        </div>
      </div>
    </div>
  );
}