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

/** Se a API devolver path relativo, junta à base da API (mesmo host do axios). */
function resolveImageUrl(raw: string): string {
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

/**
 * Aceita lista direta ou envelope comum (`data`, `items`, `content`, etc.).
 */
export function normalizePizzaFlavorsResponse(data: unknown): PizzaFlavorCard[] {
  const rows = extractArray(data);
  const mapped: (PizzaFlavorCard | null)[] = rows.map((row, index) =>
    normalizeOne(row, index),
  );
  return mapped.filter((x): x is PizzaFlavorCard => x !== null);
}
