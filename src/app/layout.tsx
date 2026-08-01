import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Lexend } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Yaa Bunayya - Sistem Manajemen Aset & Pemeliharaan",
  description: "Sistem Manajemen Aset dan Pemeliharaan Sekolah Islam Terpadu Yaa Bunayya Islamic School",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} ${lexend.variable} bg-[#FFF8F0] text-zinc-900 antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
