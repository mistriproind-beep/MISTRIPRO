import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';

export const metadata: Metadata = {
  title: 'MISTRI PRO – SaaS Admin Operations Portal',
  description: 'Complete Control Center for Worker KYC, User Management, Bookings & Financial Settlements',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        <AuthProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
