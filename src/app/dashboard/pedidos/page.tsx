import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PedidosPage() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col pb-24">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 pt-8">
        <h1 className="font-serif text-2xl font-semibold text-[#3d2c29]">
          Pedidos
        </h1>
        <p className="max-w-md text-center text-[#6b5e5a]">
          Tela de pedidos em construção. Use o menu inferior para voltar ao
          cardápio.
        </p>
        <Button
          asChild
          className="rounded-xl bg-[#c93b44] px-6 py-3 font-medium text-white hover:bg-[#b3343c]"
        >
          <Link href="/dashboard">Voltar ao cardápio</Link>
        </Button>
      </div>
      <DashboardBottomNav active="pedidos" />
    </div>
  );
}
