import { z } from "zod";

function parseMoney(raw: string): number {
  return Number.parseFloat(raw.replace(",", "."));
}

const priceField = z
  .string()
  .trim()
  .min(1, "Informe o valor")
  .refine((v) => Number.isFinite(parseMoney(v)) && parseMoney(v) > 0, {
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
  return parseMoney(raw);
}
