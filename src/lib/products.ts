import { resolveImageUrl } from "@/lib/pizza-flavors";

export type ProductCard = {
  id: string;
  marca: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  imagem: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&h=200&fit=crop";

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
    const nested = o.data ?? o.items ?? o.content ?? o.results ?? o.products;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

export function normalizeProductsResponse(data: unknown): ProductCard[] {
  const rows = extractArray(data);
  return rows
    .map((row, index) => {
      if (!row || typeof row !== "object") return null;
      const o = row as Record<string, unknown>;

      const id = asString(o.id ?? o.uuid, `idx-${index}`);
      const marca = asString(o.marca ?? o.brand).trim();
      const titulo = asString(o.titulo ?? o.title ?? o.name).trim();
      const descricao = asString(o.descricao ?? o.description).trim();
      const conteudo = asString(o.conteudo ?? o.content).trim();
      const rawImage = asString(
        o.imagemUrl ?? o.imageUrl ?? o.image ?? o.photo ?? o.picture,
      );
      const imagem = resolveImageUrl(rawImage) || FALLBACK_IMAGE;

      if (!titulo) return null;

      return {
        id,
        marca,
        titulo,
        descricao,
        conteudo,
        imagem,
      };
    })
    .filter((x): x is ProductCard => x !== null);
}
