import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yaa Bunayya - Sistem Manajemen Aset & Pemeliharaan",
  description: "Sistem Manajemen Aset dan Pemeliharaan Sekolah Islam Terpadu Yaa Bunayya Islamic School",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#FFF8F0] text-zinc-900 antialiased font-sans">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lexend:wght@500;700&display=swap" rel="stylesheet" />
        {children}
      </body>
    </html>
  );
}
