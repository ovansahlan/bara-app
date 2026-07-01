import './globals.css';
// 1. Import font Plus Jakarta Sans dari modul bawaan Next.js
import { Plus_Jakarta_Sans } from 'next/font/google';

// 2. Konfigurasi Font
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta', // Variabel ini agar bisa dibaca oleh Tailwind
});

export const metadata = {
  title: 'Kedai Kopi Bara - Workspace',
  description: 'Sistem Manajemen Logistik dan Kasir Kedai Kopi Bara',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* 3. Masukkan class font ke dalam tag <body> */}
      <body className={`${jakarta.className} ${jakarta.variable} bg-zinc-50 text-zinc-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}