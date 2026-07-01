import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import React from 'react'; // Diperlukan untuk mengambil tipe data ReactNode

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta', 
});

export const metadata = {
  title: 'Kedai Kopi Bara - Workspace',
  description: 'Sistem Manajemen Logistik dan Kasir Kedai Kopi Bara',
};

// FIX: Menambahkan anotasi tipe data untuk objek props dan children ({ children }: { children: React.ReactNode })
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${jakarta.className} ${jakarta.variable} bg-zinc-50 text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}