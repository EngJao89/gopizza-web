import { DashboardAuthGuard } from "@/components/dashboard/dashboard-auth-guard";
import { DashboardLayoutShell } from "@/components/dashboard/dashboard-layout-shell";
import { Playfair_Display } from "next/font/google";
import type { Metadata } from "next";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Cardápio | Go Pizza",
  description: "Cardápio e pedidos — Go Pizza",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${playfair.variable} min-h-screen bg-[#ecebea] text-[#3d2c29] [--font-serif:var(--font-playfair)]`}
    >
      <DashboardAuthGuard>
        <DashboardLayoutShell>{children}</DashboardLayoutShell>
      </DashboardAuthGuard>
    </div>
  );
}
