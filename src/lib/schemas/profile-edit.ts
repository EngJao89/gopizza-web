import { z } from "zod";

import { isValidCPF } from "@/lib/validators/cpf";

export function onlyDigits(value: string): string {
  return value.replaceAll(/\D/g, "");
}

export const profileEditSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  email: z.string().trim().email("Digite um e-mail valido"),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => {
        const d = onlyDigits(v);
        return d.length >= 10 && d.length <= 11;
      },
      { message: "Telefone deve ter 10 ou 11 digitos" },
    ),
  cpf: z
    .string()
    .trim()
    .refine((v) => isValidCPF(v), { message: "CPF invalido" }),
  birthday: z
    .string()
    .min(1, "Informe sua data de nascimento")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida"),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
