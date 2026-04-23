import { z } from "zod";

function parseMoney(raw: string): number {
  const trimmed = raw.trim().replaceAll(/\s+/g, "").replaceAll(/^R\$\s*/gi, "");
  if (!trimmed) return Number.NaN;
  if (trimmed.includes(",")) {
    const noThousands = trimmed.replaceAll(".", "");
    return Number.parseFloat(noThousands.replace(",", "."));
  }
  return Number.parseFloat(trimmed.replaceAll(".", ""));
}

const priceField = z
  .string()
  .trim()
  .min(1, "Informe o valor")
  .refine((v) => {
    const n = parseMoney(v);
    return Number.isFinite(n) && n >= 0;
  }, {
    message: "Valor invalido",
  });

export const productCreateSchema = z.object({
  marca: z.string().trim().min(1, "Informe a marca"),
  titulo: z.string().trim().min(1, "Informe o titulo"),
  descricao: z.string().trim().min(1, "Informe a descricao"),
  conteudo: z.string().trim().min(1, "Informe o conteudo"),
  valor: priceField,
});

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;

export function toValueNumber(raw: string): number {
  return parseMoney(raw);
}
