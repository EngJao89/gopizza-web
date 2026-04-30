"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { createOrder, saveOrder } from "@/lib/orders";
import {
  normalizePizzaFlavorDetail,
  type PizzaFlavorDetail,
  type PizzaSize,
} from "@/lib/pizza-flavors";
import { toast } from "@/lib/toast";
import { ChevronLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const SIZE_OPTIONS: { key: PizzaSize; label: string; code: string }[] = [
  { key: "pequena", label: "Pequena", code: "P" },
  { key: "media", label: "Média", code: "M" },
  { key: "grande", label: "Grande", code: "G" },
];

const PIZZA_SIZE_TO_API: Record<PizzaSize, "P" | "M" | "G"> = {
  pequena: "P",
  media: "M",
  grande: "G",
};

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

export default function PizzaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [detail, setDetail] = useState<PizzaFlavorDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [size, setSize] = useState<PizzaSize>("media");
  const [tableNumber, setTableNumber] = useState("1");
  const [quantity, setQuantity] = useState("1");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>(`api/pizza-flavors/${id}`);
        const parsed = normalizePizzaFlavorDetail(data, id);
        if (!cancelled) {
          if (parsed) {
            setDetail(parsed);
            setSelectedExtras([]);
            setStatus("ready");
          } else {
            setStatus("error");
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          toast.error("Nao foi possivel carregar a pizza.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const total = useMemo(() => {
    if (!detail) return 0;
    const q = Math.max(1, Number.parseInt(quantity, 10) || 1);
    const unit = detail.prices[size];
    return unit * q;
  }, [detail, size, quantity]);

  function toggleExtra(name: string) {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  const handleConfirm = async () => {
    if (!detail) return;
    setSubmitting(true);
    try {
      const q = Math.max(1, Number.parseInt(quantity, 10) || 1);
      const mesa = Math.max(1, Number.parseInt(tableNumber, 10) || 1);
      const unitPrice = detail.prices[size];
      const totalValue = unitPrice * q;

      await createOrder({
        notes: `Mesa ${mesa}`,
        pizzas: [
          {
            productId: detail.id,
            name: detail.name,
            description: detail.description,
            availableOptions: selectedExtras,
            size: PIZZA_SIZE_TO_API[size],
            imageUrl: detail.image,
            quantity: q,
            unitPrice,
          },
        ],
      });

      saveOrder({
        id: `${detail.id}-${Date.now()}`,
        itemId: detail.id,
        itemName: detail.name,
        itemImage: detail.image,
        itemType: "pizza",
        size,
        quantity: q,
        tableNumber: mesa,
        extras: selectedExtras,
        total: totalValue,
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
        <p className="text-center text-[#6b5e5a]">Pizza nao encontrada.</p>
        <Button
          asChild
          className="rounded-xl bg-[#c93b44] px-6 py-3 font-medium text-white hover:bg-[#b3343c]"
        >
          <Link href="/dashboard">Voltar ao cardápio</Link>
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
                    href="/dashboard"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-white/20 text-white hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Voltar ao cardápio"
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
              src={detail.image}
              alt={detail.name}
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
            {detail.name}
          </h1>

          {detail.description ? (
            <p className="mt-2 text-sm leading-relaxed text-[#6b5e5a]">
              {detail.description}
            </p>
          ) : null}

          <Button
            asChild
            variant="outline"
            className="mt-4 w-full rounded-xl border-[#c93b44]/50 py-3 text-base font-semibold text-[#c93b44] hover:bg-[#fff8f8]"
          >
            <Link href={`/dashboard/pizza/${id}/edit`}>Alterar pizza</Link>
          </Button>

          <p className="mt-6 text-xs font-medium uppercase tracking-wide text-[#8a7d79]">
            Selecione um tamanho
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SIZE_OPTIONS.map(({ key, label, code }) => {
              const selected = size === key;
              const unitPrice = detail.prices[key];
              return (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  onClick={() => setSize(key)}
                  className={`h-auto min-h-[120px] w-full flex-col gap-1 rounded-xl border-2 px-2 py-3 text-center ${
                    selected
                      ? "border-[#2d8a54] bg-[#f0faf3]"
                      : "border-[#e8e4e2] bg-white hover:border-[#d4ccc8]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected
                        ? "border-[#2d8a54] bg-[#2d8a54]"
                        : "border-[#c4bbb6] bg-white"
                    }`}
                  >
                    {selected ? (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    ) : null}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      selected ? "text-[#2d8a54]" : "text-[#3d2c29]"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] font-medium text-[#8a7d79]">
                    ({code})
                  </span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      selected ? "text-[#2d8a54]" : "text-[#3d2c29]"
                    }`}
                  >
                    {formatBrl(unitPrice)}
                  </span>
                </Button>
              );
            })}
          </div>

          {detail.availableOptions.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#8a7d79]">
                Opcionais
              </p>
              <ul className="mt-2 space-y-2">
                {detail.availableOptions.map((opt) => {
                  const checked = selectedExtras.includes(opt);
                  return (
                    <li key={opt}>
                      <Label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e8e4e2] bg-[#faf9f9] px-3 py-2.5 transition hover:border-[#d4ccc8]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(opt)}
                          className="h-4 w-4 rounded border-[#c4bbb6] text-[#2d8a54] focus:ring-[#2d8a54]"
                        />
                        <span className="text-sm font-medium text-[#3d2c29]">
                          {opt}
                        </span>
                      </Label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

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
                className="w-full rounded-lg border border-[#e8e4e2] bg-white px-3 py-2.5 text-[#3d2c29] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] h-auto"
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
                className="w-full rounded-lg border border-[#e8e4e2] bg-white px-3 py-2.5 text-[#3d2c29] outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] h-auto"
              />
            </div>
          </div>

          <p className="mt-6 text-right font-serif text-lg font-semibold text-[#3d2c29]">
            Total: {formatBrl(total)}
          </p>

          <Button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="mt-6 h-auto min-h-14 w-full rounded-xl bg-[#2d8a54] py-4 text-base font-semibold text-white hover:bg-[#257347] disabled:opacity-60"
          >
            {submitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>

          {(detail.createdAt || detail.updatedAt) && (
            <div className="mt-6 border-t border-[#ecebea] pt-4 text-xs text-[#8a7d79]">
              <p className="font-medium text-[#6b5e5a]">Registro</p>
              {detail.createdAt ? (
                <p className="mt-1">
                  Criado em: {formatDateTime(detail.createdAt)}
                </p>
              ) : null}
              {detail.updatedAt ? (
                <p className="mt-1">
                  Atualizado em: {formatDateTime(detail.updatedAt)}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
