import { z } from "zod";

export const productCreateSchema = z.object({
  marca: z.string().trim().min(1, "Informe a marca"),
  titulo: z.string().trim().min(1, "Informe o titulo"),
  descricao: z.string().trim().min(1, "Informe a descricao"),
  conteudo: z.string().trim().min(1, "Informe o conteudo"),
});

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;
