import Link from "next/link";

type Props = Readonly<{
  active:
    | "cardapio"
    | "bebida"
    | "cadastro-pizza"
    | "cadastro-produtos"
    | "none";
}>;

export function DashboardBottomNav({
  active,
}: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e8e4e2] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-5xl items-center justify-around gap-1 py-3 text-xs font-medium sm:text-sm md:py-4">
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
          href="/dashboard/bebidas"
          className={
            active === "bebida"
              ? "text-[#3d2c29] underline decoration-[#c93b44] decoration-2 underline-offset-4"
              : "text-[#8a7d79] transition hover:text-[#3d2c29]"
          }
        >
          Bebida
        </Link>
        <Link
          href="/dashboard/pizza/new"
          className={
            active === "cadastro-pizza"
              ? "text-[#3d2c29] underline decoration-[#c93b44] decoration-2 underline-offset-4"
              : "text-[#8a7d79] transition hover:text-[#3d2c29]"
          }
        >
          Pizza
        </Link>
        <Link
          href="/dashboard/products/new"
          className={
            active === "cadastro-produtos"
              ? "text-[#3d2c29] underline decoration-[#c93b44] decoration-2 underline-offset-4"
              : "text-[#8a7d79] transition hover:text-[#3d2c29]"
          }
        >
          Produtos
        </Link>
      </div>
    </nav>
  );
}
