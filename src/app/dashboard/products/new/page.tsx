"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ChevronLeft, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import {
  productCreateSchema,
  toValueNumber,
  type ProductCreateFormValues,
} from "@/lib/schemas/product-create";
import { toast } from "@/lib/toast";

export default function NewProductPage() {
  const [fileInputKey, setFileInputKey] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreateFormValues>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      marca: "",
      titulo: "",
      descricao: "",
      conteudo: "",
      valor: "",
    },
  });

  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleClear = () => {
    reset();
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
  };

  const onSubmit = async (data: ProductCreateFormValues) => {
    if (!imageFile) {
      toast.error("Selecione uma imagem.");
      return;
    }

    const form = new FormData();
    form.append("marca", data.marca.trim());
    form.append("titulo", data.titulo.trim());
    form.append("descricao", data.descricao.trim());
    form.append("conteudo", data.conteudo.trim());
    const valor = toValueNumber(data.valor);
    form.append("valor", String(valor));
    form.append("value", String(valor));
    form.append("imagem", imageFile);

    try {
      await api.post("api/products/with-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Produto cadastrado com sucesso.");
      handleClear();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        "Nao foi possivel cadastrar o produto.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-8">
      <header className="border-b border-[#e8e4e2] bg-white px-4 py-3 shadow-sm md:px-8">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#e8e4e2] bg-[#faf9f9] text-[#3d2c29] transition hover:bg-[#f0eeed] focus-visible:ring-2 focus-visible:ring-[#c93b44]/30"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </Link>
          <h1 className="min-w-0 flex-1 text-center font-serif text-xl font-semibold leading-tight text-[#3d2c29] md:text-2xl">
            Cadastrar produto
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="shrink-0 rounded-lg border-[#e8e4e2] text-[#3d2c29] hover:bg-[#faf9f9]"
          >
            Limpar
          </Button>
        </div>
      </header>

      <main className="mx-auto mt-6 w-full max-w-2xl px-4 md:px-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#8b6f75] bg-[#fcfbfb] text-center">
              {imagePreviewUrl ? (
                <Image
                  src={imagePreviewUrl}
                  alt="Preview do produto"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="px-4 text-lg text-[#6f4f58]">
                  Nenhuma foto carregada
                </span>
              )}
            </div>

            <div>
              <input
                key={fileInputKey}
                id="product-image-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
              />
              <Button
                asChild
                className="h-auto rounded-2xl bg-[#d63d4c] px-8 py-4 text-2xl font-semibold text-white hover:bg-[#be3340]"
              >
                <label htmlFor="product-image-file" className="cursor-pointer">
                  <Upload className="h-5 w-5" />
                  Carregar imagem
                </label>
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="product-marca" className="mb-2 block text-2xl text-[#5a3a42]">
              Marca
            </Label>
            <Input
              id="product-marca"
              className="h-auto rounded-2xl border-[#e2e2e8] bg-white px-4 py-4 text-lg"
              placeholder="Ex.: Coca Cola"
              aria-invalid={!!errors.marca}
              {...register("marca")}
            />
            {errors.marca ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">{errors.marca.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="product-titulo" className="mb-2 block text-2xl text-[#5a3a42]">
              Titulo
            </Label>
            <Input
              id="product-titulo"
              className="h-auto rounded-2xl border-[#e2e2e8] bg-white px-4 py-4 text-lg"
              placeholder="Ex.: Refrigerante Coca Cola 2L"
              aria-invalid={!!errors.titulo}
              {...register("titulo")}
            />
            {errors.titulo ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">{errors.titulo.message}</p>
            ) : null}
          </div>

          <div>
            <Label
              htmlFor="product-descricao"
              className="mb-2 block text-2xl text-[#5a3a42]"
            >
              Descricao
            </Label>
            <textarea
              id="product-descricao"
              className="min-h-28 w-full rounded-2xl border border-[#e2e2e8] bg-white px-4 py-3 text-lg text-[#3d2c29] outline-none focus:border-[#c93b44] focus:ring-1 focus:ring-[#c93b44]"
              placeholder="Ex.: Coca cola 2 lt"
              aria-invalid={!!errors.descricao}
              {...register("descricao")}
            />
            {errors.descricao ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">
                {errors.descricao.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="product-valor" className="mb-2 block text-2xl text-[#5a3a42]">
              Valor
            </Label>
            <Input
              id="product-valor"
              type="text"
              inputMode="decimal"
              className="h-auto rounded-2xl border-[#e2e2e8] bg-white px-4 py-4 text-lg"
              placeholder="Ex.: 9,50"
              aria-invalid={!!errors.valor}
              {...register("valor")}
            />
            {errors.valor ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">{errors.valor.message}</p>
            ) : null}
          </div>

          <div>
            <Label
              htmlFor="product-conteudo"
              className="mb-2 block text-2xl text-[#5a3a42]"
            >
              Conteudo
            </Label>
            <textarea
              id="product-conteudo"
              className="min-h-28 w-full rounded-2xl border border-[#e2e2e8] bg-white px-4 py-3 text-lg text-[#3d2c29] outline-none focus:border-[#c93b44] focus:ring-1 focus:ring-[#c93b44]"
              placeholder="Ex.: Refrigerante sabor cola"
              aria-invalid={!!errors.conteudo}
              {...register("conteudo")}
            />
            {errors.conteudo ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">
                {errors.conteudo.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-2xl bg-[#4f8f31] py-4 text-3xl font-semibold text-white hover:bg-[#447b2c]"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar produto"}
          </Button>
        </form>
      </main>
    </div>
  );
}
