/**
 * Modelo usado na UI do cardápio (após normalizar a resposta da API).
 */
export type PizzaFlavorCard = {
  id: string;
  name: string;
  description: string;
  /** URL absoluta ou relativa da imagem; vazio usa placeholder */
  image: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const nested =
      o.data ?? o.items ?? o.content ?? o.flavors ?? o.pizzaFlavors ?? o.results;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function normalizeOne(item: unknown, index: number): PizzaFlavorCard | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;

  const id = asString(o.id ?? o.uuid, `idx-${index}`);
  const name = asString(o.name ?? o.title ?? o.flavorName).trim();
  const description = asString(
    o.description ?? o.ingredients ?? o.details,
  ).trim();

  const rawImage =
    (typeof o.image === "string" && o.image) ||
    (typeof o.imageUrl === "string" && o.imageUrl) ||
    (typeof o.photo === "string" && o.photo) ||
    (typeof o.picture === "string" && o.picture) ||
    "";

  const image = resolveImageUrl(rawImage);

  if (!name) return null;

  return {
    id,
    name,
    description,
    image: image || FALLBACK_IMAGE,
  };
}

export type PizzaSize = "pequena" | "media" | "grande";

export type PizzaFlavorDetail = {
  id: string;
  name: string;
  description: string;
  image: string;
  prices: Record<PizzaSize, number>;
  /** Ex.: "Borda Recheada", "Bacon Extra" — vindos de `availableOptions` */
  availableOptions: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

export function resolveImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
    "http://localhost:8080";
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

export function normalizePizzaFlavorsResponse(data: unknown): PizzaFlavorCard[] {
  const rows = extractArray(data);
  const mapped: (PizzaFlavorCard | null)[] = rows.map((row, index) =>
    normalizeOne(row, index),
  );
  return mapped.filter((x): x is PizzaFlavorCard => x !== null);
}

function unwrapRecord(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const inner =
    o.data ?? o.flavor ?? o.pizzaFlavor ?? o.item ?? o.result;
  if (inner && typeof inner === "object") {
    return inner as Record<string, unknown>;
  }
  return o;
}

function parseMoney(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(
      value.replaceAll(/\s/g, "").replace(",", "."),
    );
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseSizesAndPrices(
  raw: unknown,
): Partial<Record<PizzaSize, number>> | null {
  if (!raw || typeof raw !== "object") return null;
  const sp = raw as Record<string, unknown>;
  const p = parseMoney(sp.P ?? sp.p ?? sp.PP);
  const m = parseMoney(sp.M ?? sp.m);
  const g = parseMoney(sp.G ?? sp.g);
  const out: Partial<Record<PizzaSize, number>> = {};
  if (p !== null) out.pequena = p;
  if (m !== null) out.media = m;
  if (g !== null) out.grande = g;
  return Object.keys(out).length > 0 ? out : null;
}

function parseAvailableOptionsList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractPrices(o: Record<string, unknown>): Record<PizzaSize, number> {
  const fromSizes = parseSizesAndPrices(o.sizesAndPrices);
  const defaults = { pequena: 8, media: 10, grande: 12 };
  const single = parseMoney(o.price ?? o.unitPrice);

  if (fromSizes) {
    return {
      pequena: fromSizes.pequena ?? single ?? defaults.pequena,
      media: fromSizes.media ?? single ?? defaults.media,
      grande: fromSizes.grande ?? single ?? defaults.grande,
    };
  }

  const p =
    parseMoney(
      o.pricePequena ??
        o.smallPrice ??
        o.pequenaPrice ??
        o.priceSmall,
    ) ??
    parseMoney(
      (o.prices as Record<string, unknown> | undefined)?.pequena ??
        (o.prices as Record<string, unknown> | undefined)?.SMALL ??
        (o.prices as Record<string, unknown> | undefined)?.small,
    );
  const m =
    parseMoney(
      o.priceMedia ??
        o.mediumPrice ??
        o.mediaPrice ??
        o.priceMedium,
    ) ??
    parseMoney(
      (o.prices as Record<string, unknown> | undefined)?.media ??
        (o.prices as Record<string, unknown> | undefined)?.MEDIUM ??
        (o.prices as Record<string, unknown> | undefined)?.medium,
    );
  const g =
    parseMoney(
      o.priceGrande ??
        o.largePrice ??
        o.grandePrice ??
        o.priceLarge,
    ) ??
    parseMoney(
      (o.prices as Record<string, unknown> | undefined)?.grande ??
        (o.prices as Record<string, unknown> | undefined)?.LARGE ??
        (o.prices as Record<string, unknown> | undefined)?.large,
    );

  return {
    pequena: p ?? single ?? defaults.pequena,
    media: m ?? single ?? defaults.media,
    grande: g ?? single ?? defaults.grande,
  };
}

/**
 * Normaliza resposta de GET api/pizza-flavors/:id (objeto ou envelope `data`).
 */
export function normalizePizzaFlavorDetail(
  data: unknown,
  fallbackId: string,
): PizzaFlavorDetail | null {
  const o = unwrapRecord(data);
  if (!o) return null;

  const id = asString(o.id ?? o.uuid, fallbackId);
  const name = asString(o.name ?? o.title ?? o.flavorName).trim();
  const description = asString(
    o.description ?? o.ingredients ?? o.details,
  ).trim();

  const rawImage =
    (typeof o.image === "string" && o.image) ||
    (typeof o.imageUrl === "string" && o.imageUrl) ||
    (typeof o.photo === "string" && o.photo) ||
    (typeof o.picture === "string" && o.picture) ||
    "";

  const image = resolveImageUrl(rawImage) || FALLBACK_IMAGE;

  if (!name) return null;

  const availableOptions = parseAvailableOptionsList(o.availableOptions);
  const createdAt =
    typeof o.createdAt === "string" && o.createdAt.trim()
      ? o.createdAt.trim()
      : null;
  const updatedAt =
    typeof o.updatedAt === "string" && o.updatedAt.trim()
      ? o.updatedAt.trim()
      : null;

  return {
    id,
    name,
    description,
    image,
    prices: extractPrices(o),
    availableOptions,
    createdAt,
    updatedAt,
  };
}
