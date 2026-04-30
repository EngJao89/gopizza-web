import { isAxiosError } from "axios";

import api from "@/lib/axios";
import { normalizeMeProfile } from "@/lib/current-user";
import { resolveImageUrl } from "@/lib/pizza-flavors";
import { normalizeUserAddresses } from "@/lib/user-addresses";

export type SavedOrder = {
  id: string;
  orderId: string;
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

/** Linha normalizada ao ler pedidos da API (lista unificada). */
export type OrderItemPayload = {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
};

export type CreateOrderPizzaLine = {
  productId: string;
  name: string;
  description: string;
  availableOptions: string[];
  size: "P" | "M" | "G";
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
};

export type CreateOrderProductLine = {
  id: string;
  marca: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  valor: number;
  imagemUrl?: string;
  quantity: number;
};

export type CreateOrderPayload = {
  userId?: string;
  /** Texto operacional (mesa, etc.); é anexado ao `description` de cada linha na API. */
  notes?: string;
  pizzas?: CreateOrderPizzaLine[];
  products?: CreateOrderProductLine[];
};

/** Contrato POST api/orders (Insomnia / backend). */
type OrderLineApi = {
  productId: string;
  name: string;
  description: string;
  availableOptions: string[];
  size: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
};

type CreateOrderApiPayload = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryNumber: string;
  deliveryNeighborhood: string;
  pizzas?: OrderLineApi[];
  products?: CreateOrderProductLine[];
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

function digitsOnlyPhone(raw: string): string {
  return raw.replaceAll(/\D/g, "");
}

/** Caminho relativo da API para `imageUrl` no pedido (ex.: `/api/images/...`). */
function toOrderItemImageUrl(resolvedOrRaw: string): string {
  const trimmed = resolvedOrRaw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/api/")) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(
    /\/+$/,
    "",
  );
  if (trimmed.startsWith(base)) {
    const rest = trimmed.slice(base.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

async function resolveOrderUserId(explicit?: string): Promise<string> {
  if (explicit?.trim()) return explicit.trim();
  const { data } = await api.get<unknown>("api/auth/me");
  const profile = normalizeMeProfile(data);
  const id = profile?.id?.trim();
  if (!id) {
    throw new Error("Nao foi possivel identificar o usuario. Faca login novamente.");
  }
  return id;
}

function parseUserForOrder(data: unknown): { name: string; phone: string } {
  const root = asRecord(data);
  if (!root) {
    throw new Error("Resposta invalida ao carregar usuario.");
  }
  const flat = asRecord(root.data) ?? root;
  const name = asString(flat.name).trim();
  const phoneRaw = asString(flat.phone);
  if (!name) {
    throw new Error("Usuario sem nome cadastrado.");
  }
  const phone = digitsOnlyPhone(phoneRaw);
  if (phone.length < 10) {
    throw new Error(
      "Cadastre um telefone valido no perfil (minimo 10 digitos) para concluir o pedido.",
    );
  }
  return { name, phone };
}

async function fetchUserForOrder(userId: string): Promise<{
  name: string;
  phone: string;
}> {
  const { data } = await api.get<unknown>(`api/users/${userId}`);
  return parseUserForOrder(data);
}

async function fetchPrimaryAddressFields(userId: string): Promise<{
  deliveryAddress: string;
  deliveryNeighborhood: string;
  deliveryNumber: string;
}> {
  let data: unknown;
  try {
    ({ data } = await api.get<unknown>(`api/users/${userId}/addresses`));
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      ({ data } = await api.get<unknown>(`api/${userId}/addresses`));
    } else {
      throw err;
    }
  }
  const list = normalizeUserAddresses(data);
  const first = list[0];
  if (!first) {
    return {
      deliveryAddress: "Retirada no balcao",
      deliveryNeighborhood: "-",
      deliveryNumber: "-",
    };
  }
  const street = first.street || first.address;
  const neighborhood = first.neighborhood.trim();
  const number = first.number.trim();
  return {
    deliveryAddress: street.trim() || "Retirada no balcao",
    deliveryNeighborhood: neighborhood.length > 0 ? neighborhood : "-",
    deliveryNumber: number.length > 0 ? number : "-",
  };
}

const ORDER_ITEM_IMAGE_FALLBACK = "/api/images/placeholder.png";

function joinLineDescription(description: string, orderNotes?: string): string {
  const d = description.trim();
  const n = orderNotes?.trim();
  if (d && n) return `${d} | ${n}`;
  return d || n || "-";
}

function mapLineToApi(
  line: {
    productId: string;
    name: string;
    description: string;
    availableOptions: string[];
    size: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
  },
  orderNotes?: string,
): OrderLineApi {
  let imageUrl = toOrderItemImageUrl(line.imageUrl ?? "");
  if (!imageUrl) {
    imageUrl = ORDER_ITEM_IMAGE_FALLBACK;
  }
  return {
    productId: line.productId.trim(),
    name: line.name.trim(),
    description: joinLineDescription(line.description, orderNotes),
    availableOptions: [...line.availableOptions],
    size: line.size,
    imageUrl,
    quantity: Math.max(1, line.quantity),
    unitPrice: line.unitPrice,
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<void> {
  const pizzaLines = payload.pizzas?.filter((p) => p.name.trim() && p.quantity > 0) ?? [];
  const productLines =
    payload.products?.filter((p) => p.titulo.trim() && p.quantity > 0) ?? [];
  if (pizzaLines.length === 0 && productLines.length === 0) {
    throw new Error("Nenhum item valido no pedido.");
  }

  const userId = await resolveOrderUserId(payload.userId);
  const [user, address] = await Promise.all([
    fetchUserForOrder(userId),
    fetchPrimaryAddressFields(userId),
  ]);

  const orderNotes = payload.notes?.trim();

  const body: CreateOrderApiPayload = {
    customerName: user.name,
    customerPhone: user.phone,
    deliveryAddress: address.deliveryAddress,
    deliveryNumber: address.deliveryNumber,
    deliveryNeighborhood: address.deliveryNeighborhood,
  };

  if (pizzaLines.length > 0) {
    body.pizzas = pizzaLines.map((line) =>
      mapLineToApi(
        {
          productId: line.productId,
          name: line.name,
          description: line.description,
          availableOptions: line.availableOptions,
          size: line.size,
          imageUrl: line.imageUrl,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        },
        orderNotes,
      ),
    );
  }

  if (productLines.length > 0) {
    body.products = productLines.map((line) => {
      let imagemUrl = toOrderItemImageUrl(line.imagemUrl ?? "");
      if (!imagemUrl) {
        imagemUrl = ORDER_ITEM_IMAGE_FALLBACK;
      }
      return {
        id: line.id.trim(),
        marca: line.marca.trim(),
        titulo: line.titulo.trim(),
        descricao: joinLineDescription(line.descricao, orderNotes),
        conteudo: line.conteudo.trim(),
        valor: line.valor,
        imagemUrl,
        quantity: Math.max(1, line.quantity),
      };
    });
  }

  try {
    await api.post("api/orders", body);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 400) {
      const data = err.response.data;
      const detail = formatOrderApiValidationMessage(data);
      if (detail) {
        err.message = detail;
      }
    }
    throw err;
  }
}

function formatOrderApiValidationMessage(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const direct =
    o.message ?? o.error ?? o.detail ?? o.title ?? o.error_description;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const errors = o.errors;
  if (Array.isArray(errors)) {
    const parts = errors
      .map((e) => {
        if (typeof e === "string") return e;
        if (e && typeof e === "object") {
          const r = e as Record<string, unknown>;
          const dflt = r.defaultMessage ?? r.message;
          const field = r.field ?? r.property ?? r.path;
          if (typeof dflt === "string" && dflt.trim()) {
            return typeof field === "string" && field
              ? `${field}: ${dflt.trim()}`
              : dflt.trim();
          }
        }
        return null;
      })
      .filter((x): x is string => typeof x === "string" && x.length > 0);
    if (parts.length > 0) return parts.join("; ");
  }

  return null;
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
  return lines.flatMap((line): OrderItemPayload[] => {
    const o = asRecord(line);
    if (!o) return [];
    const idStr = asString(o.productId ?? o.id);
    const productId: string | null = idStr.length > 0 ? idStr : null;
    const productName = asString(o.productName ?? o.name ?? o.title);
    const quantity = Math.max(1, asNumber(o.quantity));
    const unitPrice = asNumber(o.unitPrice ?? o.price ?? o.valor);
    const imageUrl = asString(o.imageUrl ?? o.imagemUrl ?? o.image ?? o.photo);
    if (!productId && !productName) return [];
    return [{ productId, productName, quantity, unitPrice, imageUrl }];
  });
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
          orderId,
          itemId: line.productId || `${orderId}-item-${lineIndex}`,
          itemName: line.productName || "Item do pedido",
          itemImage: resolveImageUrl(line.imageUrl ?? ""),
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

export async function deleteOrder(orderId: string): Promise<void> {
  const normalized = orderId.trim();
  if (!normalized) {
    throw new Error("Pedido invalido para exclusao.");
  }
  await api.delete(`api/orders/${normalized}`);
}
