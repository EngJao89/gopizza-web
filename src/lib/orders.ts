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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function extractOrdersArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const root = asRecord(data);
  if (!root) return [];
  const nested = root.data ?? root.items ?? root.content ?? root.results ?? root.orders;
  return Array.isArray(nested) ? nested : [];
}

function parseOrderLines(order: Record<string, unknown>): OrderItemPayload[] {
  const lines =
    order.itens ?? order.items ?? order.products ?? order.pizzas ?? order.lines;
  if (!Array.isArray(lines)) return [];
  return lines
    .map((line) => {
      const o = asRecord(line);
      if (!o) return null;
      const productId = asString(o.productId ?? o.id);
      const productName = asString(o.productName ?? o.name ?? o.title);
      const quantity = Math.max(1, asNumber(o.quantity));
      const unitPrice = asNumber(o.unitPrice ?? o.price ?? o.valor);
      if (!productId && !productName) return null;
      return { productId, productName, quantity, unitPrice };
    })
    .filter((line): line is OrderItemPayload => line !== null);
}

export function normalizeOrdersResponse(data: unknown): SavedOrder[] {
  const rows = extractOrdersArray(data);
  return rows.flatMap((row, index) => {
      const order = asRecord(row);
      if (!order) return [];

      const orderId = asString(order.id ?? order.uuid) || `order-${index}`;
      const createdAt = asString(order.createdAt ?? order.created_at) || new Date().toISOString();
      const notes = asString(order.notes).toLowerCase();
      const tableMatch = /mesa\s*(\d+)/i.exec(notes);
      const tableNumber = tableMatch ? Number.parseInt(tableMatch[1] ?? "1", 10) : 1;
      const lines = parseOrderLines(order);
      if (lines.length === 0) return [];

      return lines.map((line, lineIndex): SavedOrder => {
        const itemType: SavedOrder["itemType"] =
          notes.includes("bebida") || !!(order.products && !order.pizzas)
            ? "bebida"
            : "pizza";
        return {
          id: `${orderId}-${lineIndex}`,
          itemId: line.productId || `${orderId}-item-${lineIndex}`,
          itemName: line.productName || "Item do pedido",
          itemImage: "",
          itemType,
          quantity: line.quantity,
          tableNumber,
          extras: [],
          total: line.unitPrice * line.quantity,
          createdAt,
        };
      });
    });
}

export async function fetchOrders(): Promise<SavedOrder[]> {
  const { data } = await api.get<unknown>("api/orders");
  return normalizeOrdersResponse(data);
}
