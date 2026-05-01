"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ChevronLeft, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import {
  normalizePizzaFlavorDetail,
  type PizzaFlavorDetail,
} from "@/lib/pizza-flavors";
import {
  formatPriceFieldBr,
  pizzaCreateSchema,
  toPriceNumber,
  type PizzaCreateFormValues,
} from "@/lib/schemas/pizza-create";
import { toast } from "@/lib/toast";

export default function EditPizzaPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<PizzaFlavorDetail | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    if (!id) {
      setLoadStatus("error");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<unknown>(`api/pizza-flavors/${id}`);
        const parsed = normalizePizzaFlavorDetail(data, id);
        if (!cancelled) {
          if (parsed) {
            setDetail(parsed);
            reset({
              name: parsed.name,
              description: parsed.description,
              priceP: formatPriceFieldBr(parsed.prices.pequena),
              priceM: formatPriceFieldBr(parsed.prices.media),
              priceG: formatPriceFieldBr(parsed.prices.grande),
            });
            setLoadStatus("ready");
          } else {
            setLoadStatus("error");
          }
        }
      } catch {
        if (!cancelled) {
          setLoadStatus("error");
          toast.error("Nao foi possivel carregar a pizza.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm(
      "Tem certeza que deseja excluir esta pizza? Esta acao nao pode ser desfeita.",
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await api.delete(`api/pizza-flavors/${id}`);
      toast.success("Pizza excluida.");
      router.replace("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        "Nao foi possivel excluir a pizza.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (data: PizzaCreateFormValues) => {
    if (!id) return;

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
        form.append("image", imageFile);
        form.append("photo", imageFile);

        await api.patch(`api/pizza-flavors/${id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.patch(`api/pizza-flavors/${id}`, basePayload);
      }

      toast.success("Pizza atualizada com sucesso.");
      router.push(`/dashboard/pizza/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        "Nao foi possivel atualizar a pizza.";
      toast.error(message);
    }
  };

  if (loadStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <Loader2 className="h-10 w-10 animate-spin text-[#c93b44]" aria-label="Carregando" />
      </div>
    );
  }

  if (loadStatus === "error" || !detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f8f8] px-4">
        <p className="text-center text-[#6b5e5a]">Pizza nao encontrada.</p>
        <Button asChild className="rounded-xl bg-[#c93b44] px-6 py-3 text-white hover:bg-[#b3343c]">
          <Link href="/dashboard">Voltar ao cardápio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-8">
      <header className="border-b border-[#e8e4e2] bg-white px-4 py-3 shadow-sm md:px-8">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <Link
            href={`/dashboard/pizza/${id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#e8e4e2] bg-[#faf9f9] text-[#3d2c29] transition hover:bg-[#f0eeed] focus-visible:ring-2 focus-visible:ring-[#c93b44]/30"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </Link>
          <h1 className="min-w-0 flex-1 text-center font-serif text-xl font-semibold leading-tight text-[#3d2c29] md:text-2xl">
            Editar pizza
          </h1>
          <Button
            type="button"
            variant="outline"
            disabled={deleting || isSubmitting}
            onClick={() => void handleDelete()}
            className="shrink-0 rounded-lg border-[#f5d3d6] text-[#a7404a] hover:bg-[#fff7f8]"
          >
            {deleting ? "Excluindo..." : "Deletar"}
          </Button>
        </div>
      </header>

      <main className="mx-auto mt-6 w-full max-w-2xl px-4 md:px-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <div className="relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#e2e2e8] bg-[#fcfbfb]">
              {imagePreviewUrl ? (
                <Image
                  src={imagePreviewUrl}
                  alt="Preview da pizza"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Image
                  src={detail.image}
                  alt={detail.name}
                  fill
                  className="object-cover"
                  sizes="176px"
                  unoptimized
                />
              )}
            </div>

            <div>
              <input
                id="pizza-edit-image-file"
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
                <label htmlFor="pizza-edit-image-file" className="cursor-pointer">
                  <Upload className="h-5 w-5" />
                  Carregar
                </label>
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="pizza-edit-name" className="mb-2 block text-2xl text-[#5a3a42]">
              Nome
            </Label>
            <Input
              id="pizza-edit-name"
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
              <Label htmlFor="pizza-edit-description" className="text-2xl text-[#5a3a42]">
                Descricao
              </Label>
              <span className="text-sm text-[#7c6b70]">Max 60 caracteres</span>
            </div>
            <textarea
              id="pizza-edit-description"
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
                  { key: "priceP", code: "P" },
                  { key: "priceM", code: "M" },
                  { key: "priceG", code: "G" },
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
            disabled={isSubmitting || deleting}
            className="h-auto w-full rounded-2xl bg-[#4f8f31] py-4 text-3xl font-semibold text-white hover:bg-[#447b2c]"
          >
            {isSubmitting ? "Salvando..." : "Atualizar pizza"}
          </Button>
        </form>
      </main>
    </div>
  );
}
