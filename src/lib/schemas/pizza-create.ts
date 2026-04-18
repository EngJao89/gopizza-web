import { z } from "zod";

export function parseMoneyBr(raw: string): number {
  const trimmed = raw.trim().replace(/\s+/g, "").replace(/^R\$\s*/i, "");
  if (!trimmed) return Number.NaN;
  if (trimmed.includes(",")) {
    const noThousands = trimmed.replace(/\./g, "");
    const normalized = noThousands.replace(",", ".");
    return Number.parseFloat(normalized);
  }
  return Number.parseFloat(trimmed.replace(/\./g, ""));
}

export function formatPriceFieldBr(n: number): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const priceField = z
  .string()
  .trim()
  .min(1, "Informe o valor")
  .refine((v) => {
    const n = parseMoneyBr(v);
    return Number.isFinite(n) && n > 0;
  }, {
    message: "Valor invalido",
  });

export const pizzaCreateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da pizza"),
  description: z
    .string()
    .trim()
    .min(1, "Informe a descricao")
    .max(60, "Maximo de 60 caracteres"),
  priceP: priceField,
  priceM: priceField,
  priceG: priceField,
});

export type PizzaCreateFormValues = z.infer<typeof pizzaCreateSchema>;

export function toPriceNumber(raw: string): number {
  return parseMoneyBr(raw);
}
