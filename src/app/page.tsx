"use client";

import Image from "next/image";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { toast } from "@/lib/toast";

type SignInFormData = {
  email: string;
  password: string;
};

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    try {
      await api.post("api/auth/login", data);
      toast.success("Login realizado com sucesso.");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? "Nao foi possivel realizar o login.";

      toast.error(message);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-rose-600 to-red-700 px-6 py-8 md:px-10 md:py-10">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur-sm md:grid-cols-2">
        <div className="relative min-h-[320px] border-b border-white/15 md:min-h-full md:border-b-0 md:border-r">
          <Image
            src="/bg-preview%20.png"
            alt="Pizza ingredients and brand preview"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-center p-6 md:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <h1 className="mb-8 text-4xl font-semibold text-white">Login</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full rounded-xl border border-white/25 bg-white/5 px-4 py-4 text-white placeholder:text-white/70 outline-none transition focus:border-white/60"
                  {...register("email", {
                    required: "Informe seu e-mail",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Digite um e-mail valido",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-amber-100">{errors.email.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Senha"
                  className="w-full rounded-xl border border-white/25 bg-white/5 px-4 py-4 text-white placeholder:text-white/70 outline-none transition focus:border-white/60"
                  {...register("password", {
                    required: "Informe sua senha",
                    minLength: {
                      value: 6,
                      message: "A senha deve ter no minimo 6 caracteres",
                    },
                  })}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-amber-100">{errors.password.message}</p>
                )}
              </div>

              <div className="pt-1 text-right">
                <button
                  type="button"
                  className="text-base text-white/90 transition hover:text-white"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 w-full rounded-xl bg-rose-500 px-4 py-4 text-lg font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
