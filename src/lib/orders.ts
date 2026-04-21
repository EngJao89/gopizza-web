export type SavedOrder = {
  id: string;
  pizzaId: string;
  pizzaName: string;
  pizzaImage: string;
  size: "pequena" | "media" | "grande";
  quantity: number;
  tableNumber: number;
  extras: string[];
  total: number;
  createdAt: string;
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
        typeof o.pizzaId === "string" &&
        typeof o.pizzaName === "string" &&
        typeof o.pizzaImage === "string" &&
        typeof o.size === "string" &&
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
