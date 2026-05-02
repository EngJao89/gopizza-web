"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useDashboardHeaderToolbar } from "@/components/dashboard/dashboard-header-toolbar-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import {
  pizzaCreateSchema,
  toPriceNumber,
  type PizzaCreateFormValues,
} from "@/lib/schemas/pizza-create";
import { toast } from "@/lib/toast";

export default function NewPizzaPage() {
  const { setConfig: setHeaderToolbar } = useDashboardHeaderToolbar();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PizzaCreateFormValues>({
    resolver: zodResolver(pizzaCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      priceP: "",
      priceM: "",
      priceG: "",
    },
  });

  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const descriptionCount = useMemo(
    () => descriptionValue.trim().length,
    [descriptionValue],
  );
  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleClear = useCallback(() => {
    reset();
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
  }, [reset]);

  useEffect(() => {
    setHeaderToolbar({ title: "Cadastrar pizza" });
    return () => setHeaderToolbar(null);
  }, [setHeaderToolbar]);

  const onSubmit = async (data: PizzaCreateFormValues) => {
    const basePayload = {
      name: data.name.trim(),
      description: data.description.trim(),
      sizesAndPrices: {
        P: toPriceNumber(data.priceP),
        M: toPriceNumber(data.priceM),
        G: toPriceNumber(data.priceG),
      },
    };

    try {
      if (imageFile) {
        const form = new FormData();
        form.append("name", basePayload.name);
        form.append("description", basePayload.description);
        form.append("sizesAndPrices", JSON.stringify(basePayload.sizesAndPrices));
        form.append("pricePequena", String(basePayload.sizesAndPrices.P));
        form.append("priceMedia", String(basePayload.sizesAndPrices.M));
        form.append("priceGrande", String(basePayload.sizesAndPrices.G));
        // Repetimos a chave para compatibilidade entre backends.
        form.append("image", imageFile);
        form.append("photo", imageFile);

        await api.post("api/pizza-flavors", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("api/pizza-flavors", basePayload);
      }

      toast.success("Pizza cadastrada com sucesso.");
      handleClear();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? "Nao foi possivel cadastrar a pizza.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-8">
      <main className="mx-auto mt-6 w-full max-w-2xl px-4 md:px-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="rounded-2xl border-[#e2e2e8] bg-white px-5 py-2.5 text-base font-medium text-[#5a3a42] hover:bg-[#faf9f9]"
            >
              Limpar
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#8b6f75] bg-[#fcfbfb] text-center">
              {imagePreviewUrl ? (
                <Image
                  src={imagePreviewUrl}
                  alt="Preview da pizza"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="px-4 text-lg text-[#6f4f58]">Nenhuma foto carregada</span>
              )}
            </div>

            <div>
              <input
                key={fileInputKey}
                id="pizza-image-file"
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
                <label htmlFor="pizza-image-file" className="cursor-pointer">
                  <Upload className="h-5 w-5" />
                  Carregar
                </label>
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="pizza-name" className="mb-2 block text-2xl text-[#5a3a42]">
              Nome
            </Label>
            <Input
              id="pizza-name"
              className="h-auto rounded-2xl border-[#e2e2e8] bg-white px-4 py-4 text-lg"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <Label htmlFor="pizza-description" className="text-2xl text-[#5a3a42]">
                Descricao
              </Label>
              <span className="text-sm text-[#7c6b70]">Max 60 caracteres</span>
            </div>
            <textarea
              id="pizza-description"
              maxLength={60}
              className="min-h-28 w-full rounded-2xl border border-[#e2e2e8] bg-white px-4 py-3 text-lg text-[#3d2c29] outline-none focus:border-[#c93b44] focus:ring-1 focus:ring-[#c93b44]"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-sm text-[#c93b44]">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-[#8a7d79]">{descriptionCount}/60</span>
            </div>
          </div>

          <div>
            <Label className="mb-3 block text-2xl text-[#5a3a42]">Tamanhos e precos</Label>
            <div className="space-y-3">
              {(
                [
                { key: "priceP", code: "P", label: "Pequena" },
                { key: "priceM", code: "M", label: "Media" },
                { key: "priceG", code: "G", label: "Grande" },
              ] as const
              ).map((size) => (
                <div
                  key={size.key}
                  className="grid grid-cols-[64px_64px_1fr] overflow-hidden rounded-2xl border border-[#e2e2e8]"
                >
                  <div className="flex items-center justify-center border-r border-[#e2e2e8] bg-white text-2xl text-[#5a3a42]">
                    {size.code}
                  </div>
                  <div className="flex items-center justify-center border-r border-[#e2e2e8] bg-white text-xl text-[#5a3a42]">
                    R$
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    className="h-auto rounded-none border-0 bg-white px-4 py-4 text-lg shadow-none focus-visible:ring-0"
                    aria-invalid={!!errors[size.key]}
                    {...register(size.key)}
                  />
                </div>
              ))}
            </div>
            {errors.priceP || errors.priceM || errors.priceG ? (
              <p className="mt-1.5 text-sm text-[#c93b44]">
                {errors.priceP?.message ??
                  errors.priceM?.message ??
                  errors.priceG?.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-2xl bg-[#4f8f31] py-4 text-3xl font-semibold text-white hover:bg-[#447b2c]"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar pizza"}
          </Button>
        </form>
      </main>
    </div>
  );
}
