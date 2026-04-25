"use client";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { Button } from "@/components/ui/button";
import { clearSavedOrders, getSavedOrders, type SavedOrder } from "@/lib/orders";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function PedidosPage() {
  const [orders, setOrders] = useState<SavedOrder[]>(() => getSavedOrders());

  const totalOrders = orders.length;
  const totalValue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders],
  );

  const formatBrl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value,
    );

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));

  return (
    <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col pb-24">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8 md:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[#3d2c29]">
            Pedidos
          </h1>
          {totalOrders > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearSavedOrders();
                setOrders([]);
              }}
              className="rounded-xl border-[#c93b44]/40 text-[#c93b44] hover:bg-[#fff7f8]"
            >
              Limpar pedidos
            </Button>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
            <p className="max-w-md text-center text-[#6b5e5a]">
              Nenhum pedido confirmado ainda. Selecione uma pizza ou bebida e
              confirme o pedido.
            </p>
            <Button
              asChild
              className="rounded-xl bg-[#c93b44] px-6 py-3 font-medium text-white hover:bg-[#b3343c]"
            >
              <Link href="/dashboard">Voltar ao cardápio</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#eee]"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#ecebea] bg-[#f5f3f2]">
                      <Image
                        src={order.itemImage}
                        alt={order.itemName}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg font-semibold text-[#3d2c29]">
                        {order.itemName}
                      </p>
                      <p className="text-sm text-[#6b5e5a]">
                        Mesa {order.tableNumber} • Qtd {order.quantity}
                        {order.itemType === "pizza" && order.size
                          ? ` • Tamanho ${order.size.toUpperCase()}`
                          : ""}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-[#8a7d79]">
                        {order.itemType === "pizza" ? "Pizza" : "Bebida"}
                      </p>
                      {order.extras.length > 0 ? (
                        <p className="mt-0.5 text-xs text-[#8a7d79]">
                          Opcionais: {order.extras.join(", ")}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[#8a7d79]">
                        Confirmado em {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <p className="font-semibold text-[#2d8a54]">
                      {formatBrl(order.total)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl bg-white p-4 text-right shadow-sm ring-1 ring-[#eee]">
              <p className="text-sm text-[#8a7d79]">
                {totalOrders} {totalOrders === 1 ? "pedido" : "pedidos"}
              </p>
              <p className="font-serif text-xl font-semibold text-[#3d2c29]">
                Total: {formatBrl(totalValue)}
              </p>
            </div>
          </>
        )}
      </div>
      <DashboardBottomNav active="none" />
    </div>
  );
}
