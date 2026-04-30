"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { createOrder, saveOrder } from "@/lib/orders";
import { normalizeProductDetail, type ProductDetail } from "@/lib/products";
import { toast } from "@/lib/toast";
import { ChevronLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default function BebidaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    id ? "loading" : "error",
  );
  const [tableNumber, setTableNumber] = useState("1");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>(`api/products/${id}`);
        const parsed = normalizeProductDetail(data, id);
        if (!cancelled) {
          if (parsed) {
            setDetail(parsed);
            setStatus("ready");
          } else {
            setStatus("error");
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          toast.error("Nao foi possivel carregar a bebida.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const description = useMemo(() => {
    if (!detail) return "";
    return detail.descricao || detail.conteudo;
  }, [detail]);

  const total = useMemo(() => {
    if (!detail || detail.valor === null) return 0;
    const q = Math.max(1, Number.parseInt(quantity, 10) || 1);
    return detail.valor * q;
  }, [detail, quantity]);

  const handleConfirm = async () => {
    if (!detail || detail.valor === null) {
      toast.error("Nao foi possivel identificar o valor da bebida.");
      return;
    }
    setSubmitting(true);
    try {
      const q = Math.max(1, Number.parseInt(quantity, 10) || 1);
      const mesa = Math.max(1, Number.parseInt(tableNumber, 10) || 1);
      await createOrder({
        notes: `Mesa ${mesa} | Item de bebida`,
        items: [
          {
            productId: detail.id,
            productName: detail.titulo,
            quantity: q,
            unitPrice: detail.valor,
            imageUrl: detail.imagem,
          },
        ],
      });

      saveOrder({
        id: `${detail.id}-${Date.now()}`,
        itemId: detail.id,
        itemName: detail.titulo,
        itemImage: detail.imagem,
        itemType: "bebida",
        quantity: q,
        tableNumber: mesa,
        extras: [],
        total: detail.valor * q,
        createdAt: new Date().toISOString(),
      });

      toast.success("Pedido confirmado.");
      router.push("/dashboard/pedidos");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        (error instanceof Error ? error.message : null) ??
        "Nao foi possivel confirmar o pedido.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ecebea]">
        <Loader2 className="h-10 w-10 animate-spin text-[#c93b44]" aria-label="Carregando" />
      </div>
    );
  }

  if (status === "error" || !detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#ecebea] px-4">
        <p className="text-center text-[#6b5e5a]">Bebida nao encontrada.</p>
        <Button
          asChild
          className="rounded-xl bg-[#c93b44] px-6 py-3 font-medium text-white hover:bg-[#b3343c]"
        >
          <Link href="/dashboard/bebidas">Voltar para bebidas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#ecebea] pb-8">
      <header className="relative bg-[#c93b44] px-4 pb-28 pt-4 md:px-8 md:pb-32">
        <div className="mx-auto flex max-w-lg items-start">
          <NavigationMenu viewport={false} className="max-w-none">
            <NavigationMenuList className="justify-start">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/dashboard/bebidas"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-white/20 text-white hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Voltar para bebidas"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 translate-y-1/2 justify-center">
          <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-white shadow-lg md:h-52 md:w-52">
            <Image
              src={detail.imagem}
              alt={detail.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 176px, 208px"
              priority
              unoptimized
            />
          </div>
        </div>
      </header>

      <main className="mx-auto mt-24 w-full max-w-lg flex-1 px-4 pt-2 md:mt-28">
        <div className="rounded-b-2xl bg-white px-4 pb-8 pt-2 shadow-sm md:px-6">
          <h1 className="font-serif text-3xl font-semibold text-[#3d2c29] md:text-4xl">
            {detail.titulo}
          </h1>

          {detail.marca ? (
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#8a7d79]">
              {detail.marca}
            </p>
          ) : null}

          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-[#6b5e5a]">{description}</p>
          ) : null}

          {detail.valor === null ? null : (
            <div className="mt-5 inline-flex items-center rounded-lg bg-[#f0faf3] px-3 py-2 text-sm font-semibold text-[#2d8a54]">
              Valor: {formatBrl(detail.valor)}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="mesa"
                className="mb-1 block text-xs font-medium text-[#8a7d79]"
              >
                Número da mesa
              </Label>
              <Input
                id="mesa"
                type="number"
                min={1}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="h-auto w-full rounded-lg border border-[#e8e4e2] bg-white px-3 py-2.5 text-[#3d2c29] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
            <div>
              <Label
                htmlFor="qtd"
                className="mb-1 block text-xs font-medium text-[#8a7d79]"
              >
                Quantidade
              </Label>
              <Input
                id="qtd"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-auto w-full rounded-lg border border-[#e8e4e2] bg-white px-3 py-2.5 text-[#3d2c29] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>

          <p className="mt-6 text-right font-serif text-lg font-semibold text-[#3d2c29]">
            Total: {formatBrl(total)}
          </p>

          <Button
            type="button"
            disabled={submitting || detail.valor === null}
            onClick={handleConfirm}
            className="mt-6 h-auto min-h-14 w-full rounded-xl bg-[#2d8a54] py-4 text-base font-semibold text-white hover:bg-[#257347] disabled:opacity-60"
          >
            {submitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>

          {detail.conteudo ? (
            <div className="mt-6 rounded-xl border border-[#ecebea] bg-[#faf9f9] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#8a7d79]">
                Conteudo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#3d2c29]">
                {detail.conteudo}
              </p>
            </div>
          ) : null}

          {(detail.createdAt || detail.updatedAt) && (
            <div className="mt-6 border-t border-[#ecebea] pt-4 text-xs text-[#8a7d79]">
              <p className="font-medium text-[#6b5e5a]">Registro</p>
              {detail.createdAt ? (
                <p className="mt-1">Criado em: {formatDateTime(detail.createdAt)}</p>
              ) : null}
              {detail.updatedAt ? (
                <p className="mt-1">Atualizado em: {formatDateTime(detail.updatedAt)}</p>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
