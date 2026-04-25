import api from "@/lib/axios";

export type SavedOrder = {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  itemType: "pizza" | "bebida";
  size?: "pequena" | "media" | "grande";
  quantity: number;
  tableNumber: number;
  extras: string[];
  total: number;
  createdAt: string;
};

export type OrderItemPayload = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type CreateOrderPayload = {
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  items: OrderItemPayload[];
  pizzas?: OrderItemPayload[];
  products?: OrderItemPayload[];
};

type CreateOrderApiPayload = {
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  itens: OrderItemPayload[];
  pizzas?: OrderItemPayload[];
  products?: OrderItemPayload[];
};

const ORDERS_KEY = "gopizza_orders";

function canUseStorage(): boolean {
  return globalThis.window !== undefined;
}

export function getSavedOrders(): SavedOrder[] {
  if (!canUseStorage()) return [];

  try {
    const raw = globalThis.window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedOrder => {
      if (!item || typeof item !== "object") return false;
      const o = item as Record<string, unknown>;
      return (
        typeof o.id === "string" &&
        typeof o.itemId === "string" &&
        typeof o.itemName === "string" &&
        typeof o.itemImage === "string" &&
        (o.itemType === "pizza" || o.itemType === "bebida") &&
        typeof o.quantity === "number" &&
        typeof o.tableNumber === "number" &&
        Array.isArray(o.extras) &&
        typeof o.total === "number" &&
        typeof o.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function saveOrder(order: SavedOrder): void {
  if (!canUseStorage()) return;
  const current = getSavedOrders();
  const next = [order, ...current];
  globalThis.window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
}

export function clearSavedOrders(): void {
  if (!canUseStorage()) return;
  globalThis.window.localStorage.removeItem(ORDERS_KEY);
}

function formatPhoneForOrder(raw: string): string {
  const digits = raw.replaceAll(/\D/g, "");
  if (digits.length >= 11) {
    const normalized = digits.slice(0, 11);
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return "(11) 99999-9999";
}

function normalizeOrderPayload(payload: CreateOrderPayload): CreateOrderApiPayload {
  const customerPhone = formatPhoneForOrder(payload.customerPhone);
  const deliveryAddress = payload.deliveryAddress.trim() || "Retirada no balcao";
  const notes = payload.notes.trim() || "Pedido realizado pelo app";
  const items = payload.items.filter(
    (item) => item.productId && item.productName && item.quantity > 0,
  );
  return {
    customerPhone,
    deliveryAddress,
    notes,
    itens: items,
    pizzas: payload.pizzas,
    products: payload.products,
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<void> {
  const normalized = normalizeOrderPayload(payload);
  await api.post("api/orders", normalized);
}
