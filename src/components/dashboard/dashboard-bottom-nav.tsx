import Link from "next/link";

type Props = Readonly<{
  active: "cardapio" | "pedidos";
}>;

export function DashboardBottomNav({ active }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e8e4e2] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-5xl items-center justify-around py-3 text-sm font-medium md:py-4">
        <Link
          href="/dashboard"
          className={
            active === "cardapio"
              ? "text-[#3d2c29] underline decoration-[#c93b44] decoration-2 underline-offset-4"
              : "text-[#8a7d79] transition hover:text-[#3d2c29]"
          }
        >
          Cardápio
        </Link>
        <Link
          href="/dashboard/pedidos"
          className={`relative flex items-center gap-2 transition hover:text-[#3d2c29] ${
            active === "pedidos"
              ? "text-[#3d2c29] underline decoration-[#c93b44] decoration-2 underline-offset-4"
              : "text-[#8a7d79]"
          }`}
        >
          <span>Pedidos</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2d8a54] px-1.5 text-xs font-semibold text-white">
            1
          </span>
        </Link>
      </div>
    </nav>
  );
}
