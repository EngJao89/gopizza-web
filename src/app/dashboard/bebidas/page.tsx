"use client";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { getToken, getUserName, setUserName } from "@/lib/auth";
import { normalizeMeResponse } from "@/lib/current-user";
import { logoutFromApp } from "@/lib/logout";
import { normalizeProductsResponse, type ProductCard } from "@/lib/products";
import { toast } from "@/lib/toast";
import { ChevronRight, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function BebidasPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Garçom");
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [items, setItems] = useState<ProductCard[]>([]);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const fromStorage = getUserName();
    if (fromStorage) {
      setDisplayName(fromStorage);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>("api/auth/me");
        const user = normalizeMeResponse(data);
        if (!cancelled && user) {
          setDisplayName(user.name);
          setUserPhotoUrl(user.photoUrl);
          setUserName(user.name);
        }
      } catch {
        // Mantem nome do login / localStorage.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>("api/products");
        const list = normalizeProductsResponse(data);
        if (!cancelled) {
          setItems(list);
          setLoadStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setLoadStatus("error");
          setItems([]);
          toast.error("Nao foi possivel carregar as bebidas.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFromApp();
      toast.success("Voce saiu do sistema.");
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.titulo.toLowerCase().includes(q) ||
        item.marca.toLowerCase().includes(q) ||
        item.descricao.toLowerCase().includes(q),
    );
  }, [query, items]);

  let countLabel = "…";
  if (loadStatus !== "loading") {
    countLabel = `${filtered.length} ${filtered.length === 1 ? "bebida" : "bebidas"}`;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">
      <DashboardHeader
        displayName={displayName}
        userPhotoUrl={userPhotoUrl}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />

      <div className="relative z-20 -mt-10 w-full px-4 md:-mt-12 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex gap-2 rounded-xl bg-white p-1.5 shadow-md">
            <div className="relative min-w-0 flex-1">
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar bebida..."
                className="h-auto w-full rounded-lg border-none bg-white py-3 pl-4 pr-10 text-[#3d2c29] shadow-none outline-none ring-0 focus:ring-2 focus:ring-[#c93b44]/30 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#c93b44]/30"
              />
              {query ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9a8f8c] hover:bg-[#f0eeed] hover:text-[#3d2c29]"
                  aria-label="Limpar busca"
                >
                  ×
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-lg bg-[#2d8a54] text-white shadow-sm hover:bg-[#257347]"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto mt-6 w-full max-w-5xl flex-1 px-4 md:px-8">
        <div className="rounded-t-xl bg-white px-4 pb-6 pt-2 shadow-sm md:px-6">
          <div className="flex items-baseline justify-between border-b border-[#e8e4e2] pb-3 pt-2">
            <h2 className="font-serif text-2xl font-semibold text-[#3d2c29]">
              Bebidas
            </h2>
            <span className="text-sm text-[#8a7d79]">{countLabel}</span>
          </div>

          {loadStatus === "loading" && (
            <div className="flex justify-center py-16">
              <Loader2
                className="h-10 w-10 animate-spin text-[#c93b44]"
                aria-label="Carregando bebidas"
              />
            </div>
          )}

          {loadStatus === "error" && (
            <p className="py-8 text-center text-[#8a7d79]">
              Erro ao carregar as bebidas. Tente novamente mais tarde.
            </p>
          )}

          {loadStatus === "ready" && (
            <>
              <ul className="divide-y divide-[#ecebea]">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/bebidas/${item.id}`}
                      className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-[#faf9f9]"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#ecebea] bg-[#f5f3f2]">
                        <Image
                          src={item.imagem}
                          alt={item.titulo}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg font-semibold text-[#3d2c29]">
                          {item.titulo}
                        </p>
                        <p className="text-sm text-[#8a7d79]">{item.marca}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[#6b5e5a]">
                          {item.descricao || item.conteudo}
                        </p>
                      </div>
                      {item.valor === null ? null : (
                        <p className="shrink-0 text-sm font-semibold text-[#2d8a54]">
                          {formatBrl(item.valor)}
                        </p>
                      )}
                      <ChevronRight
                        className="h-[18px] w-[18px] shrink-0 text-[#b8b0ad]"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {filtered.length === 0 ? (
                <p className="py-8 text-center text-[#8a7d79]">
                  Nenhuma bebida encontrada.
                </p>
              ) : null}
            </>
          )}
        </div>
      </main>

      <DashboardBottomNav active="bebida" />
    </div>
  );
}
