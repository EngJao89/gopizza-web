"use client";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import Image from "next/image";
import { useMemo, useState } from "react";

const MENU_ITEMS = [
  {
    id: "1",
    name: "Margherita",
    description: "Mussarela, manjericão fresco, parmesão e tomate.",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "4 Queijos",
    description: "Mussarela, provolone, parmesão e gorgonzola.",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Portuguesa",
    description: "Calabresa, ovo e pimentão cobertos com mussarela.",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Lombinho",
    description: "Mussarela, lombo, requeijão e catupiry.",
    image:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=200&h=200&fit=crop",
  },
] as const;

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#b8b0ad]"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function DashboardPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MENU_ITEMS;
    return MENU_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col pb-24">
      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between bg-[#c93b44] px-4 pb-14 pt-4 md:px-8 md:pb-16">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5d547] text-2xl shadow-sm"
            aria-hidden
          >
            😊
          </span>
          <h1 className="font-serif text-xl font-semibold tracking-tight text-white md:text-2xl">
            Olá, Garçom
          </h1>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-white transition hover:bg-white/10"
          aria-label="Sair"
        >
          <LogoutIcon />
        </button>
      </header>

      {/* Search — sobreposta ao header e ao corpo */}
      <div className="relative z-20 -mt-10 px-4 md:-mt-12 md:px-8">
        <div className="flex gap-2 rounded-xl bg-white p-1.5 shadow-md">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pizza..."
              className="w-full rounded-lg bg-white py-3 pl-4 pr-10 text-[#3d2c29] placeholder:text-[#9a8f8c] outline-none ring-0 focus:ring-2 focus:ring-[#c93b44]/30"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#9a8f8c] hover:bg-[#f0eeed] hover:text-[#3d2c29]"
                aria-label="Limpar busca"
              >
                ×
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#2d8a54] text-white shadow-sm transition hover:bg-[#257347]"
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="mt-6 flex-1 px-4 md:px-8">
        <div className="rounded-t-xl bg-white px-4 pb-6 pt-2 shadow-sm md:px-6">
          <div className="flex items-baseline justify-between border-b border-[#e8e4e2] pb-3 pt-2">
            <h2 className="font-serif text-2xl font-semibold text-[#3d2c29]">
              Cardápio
            </h2>
            <span className="text-sm text-[#8a7d79]">
              {filtered.length} {filtered.length === 1 ? "pizza" : "pizzas"}
            </span>
          </div>

          <ul className="divide-y divide-[#ecebea]">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-[#faf9f9]"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#ecebea] bg-[#f5f3f2]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg font-semibold text-[#3d2c29]">
                      {item.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[#6b5e5a]">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRightIcon />
                </button>
              </li>
            ))}
          </ul>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[#8a7d79]">
              Nenhuma pizza encontrada.
            </p>
          ) : null}
        </div>
      </main>

      <DashboardBottomNav active="cardapio" />
    </div>
  );
}
