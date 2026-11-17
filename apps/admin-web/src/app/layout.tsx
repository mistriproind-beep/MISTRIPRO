import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';

export const metadata: Metadata = {
  title: 'MistriPro™ Operations – SaaS Super Admin Portal',
  description: 'Mission Control for Worker Aadhaar KYC, Live Bookings, Payments, Rates & Platform Operations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400,300&display=swap"
        />
      </head>
      <body className="bg-[#F8F9FA] text-slate-900 antialiased selection:bg-orange-500 selection:text-white font-sans min-h-screen">
        <AuthProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
